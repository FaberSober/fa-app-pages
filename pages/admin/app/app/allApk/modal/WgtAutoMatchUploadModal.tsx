import { UploadOutlined } from '@ant-design/icons';
import { DragModal, FaUtils, UploadFileLocal, useApiLoading } from '@fa/ui';
import { Alert, Button, Form, Input, message, Select } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { appReleaseApi as api, apkVersionApi } from '@/services';
import type { App } from '@/types';

interface WgtAutoMatchUploadValues {
  fileId?: string;
  minSupportedVersionCode?: string;
  channel: string;
  releaseNote: string;
}

interface WgtAutoMatchUploadModalProps {
  fetchFinish: () => void;
}

export default function WgtAutoMatchUploadModal({ fetchFinish }: WgtAutoMatchUploadModalProps) {
  const [form] = Form.useForm<WgtAutoMatchUploadValues>();
  const [open, setOpen] = useState(false);
  const [matchedApp, setMatchedApp] = useState<App.AppReleaseAutoMatchPreview>();
  const [history, setHistory] = useState<App.ApkVersion[]>([]);
  const [matching, setMatching] = useState(false);
  const matchRequestId = useRef(0);
  const [uploadKey, setUploadKey] = useState(0);
  const loading = useApiLoading([api.getUrl('createWgtDraftFromFile')]);

  const minApkVersionOptions = useMemo(() => {
    if (!matchedApp) return [];

    const versions = new Map<string, { value: string; label: string }>();
    const addVersion = (versionCode?: string | null, versionName?: string | null, current = false) => {
      if (!versionCode || !/^[1-9]\d*$/.test(versionCode) || versions.has(versionCode)) return;
      versions.set(versionCode, {
        value: versionCode,
        label: `${current ? '当前 APK' : 'APK'} ${versionName || '未命名'}（版本号 ${versionCode}）`,
      });
    };

    addVersion(matchedApp.currentApkVersionCode, matchedApp.currentApkVersionName, true);
    history.forEach((version) => {
      addVersion(version.versionCode, version.versionName);
    });
    return [...versions.values()].sort((left, right) => {
      const leftCode = BigInt(left.value);
      const rightCode = BigInt(right.value);
      return leftCode === rightCode ? 0 : leftCode > rightCode ? -1 : 1;
    });
  }, [history, matchedApp]);

  function clearMatchedApp() {
    matchRequestId.current += 1;
    setMatchedApp(undefined);
    setHistory([]);
    setMatching(false);
    form.setFieldsValue({ minSupportedVersionCode: undefined });
  }

  function showModal() {
    clearMatchedApp();
    form.resetFields();
    form.setFieldsValue({ channel: 'stable', releaseNote: '' });
    setUploadKey((key) => key + 1);
    setOpen(true);
  }

  function closeModal() {
    clearMatchedApp();
    setOpen(false);
    form.resetFields();
  }

  async function matchWgtFile(fileId: string, requestId: number) {
    try {
      const response = await api.matchWgtAppByFileId({ fileId });
      if (requestId !== matchRequestId.current) return;
      if (response.status !== 200 || !response.data) {
        message.error(response.message || 'WGT 解析或 APK 应用匹配失败');
        return;
      }

      setMatchedApp(response.data);
      try {
        const versionsResponse = await apkVersionApi.listByAppId({ appId: response.data.appId });
        if (requestId !== matchRequestId.current) return;
        if (versionsResponse.status === 200) {
          setHistory(versionsResponse.data || []);
        } else {
          message.error(versionsResponse.message || '读取 APK 历史版本失败');
        }
      } catch {
        if (requestId === matchRequestId.current) message.error('读取 APK 历史版本失败');
      }
    } catch {
      if (requestId === matchRequestId.current) message.error('WGT 解析或 APK 应用匹配失败');
    } finally {
      if (requestId === matchRequestId.current) setMatching(false);
    }
  }

  function handleValuesChange(changedValues: Partial<WgtAutoMatchUploadValues>) {
    if (!('fileId' in changedValues)) return;

    clearMatchedApp();
    const fileId = changedValues.fileId;
    if (!fileId) return;

    const requestId = ++matchRequestId.current;
    setMatching(true);
    void matchWgtFile(fileId, requestId);
  }

  function handleUploadChange(info: { file: { status?: string } }) {
    if (info.file.status !== 'uploading') return;
    form.setFieldsValue({ fileId: undefined });
    clearMatchedApp();
  }

  async function onFinish(values: WgtAutoMatchUploadValues) {
    if (!values.fileId) {
      message.error('请先上传 WGT 文件');
      return;
    }
    if (!matchedApp) {
      message.error('请等待 WGT 匹配到 APK 应用后再创建草稿');
      return;
    }

    try {
      const response = await api.createWgtDraftFromFile({
        fileId: values.fileId,
        minSupportedVersionCode: values.minSupportedVersionCode || undefined,
        channel: values.channel.trim(),
        releaseNote: values.releaseNote.trim(),
      });
      const result = response.data;
      if (response.status !== 200 || !result?.release?.id) {
        message.error(response.message || '创建 WGT 草稿失败');
        return;
      }
      message.success(
        `已匹配应用 ${result.appName}（${result.applicationId}），创建资源版本 ${result.release.versionName}（${result.release.versionCode}）草稿`,
      );
      closeModal();
      fetchFinish();
    } catch {
      message.error('创建 WGT 草稿失败');
    }
  }

  return (
    <>
      <Button type="primary" icon={<UploadOutlined />} onClick={showModal}>
        上传WGT
      </Button>
      <DragModal
        title="上传 WGT 并自动匹配应用"
        open={open}
        okText="上传并创建草稿"
        confirmLoading={loading || matching}
        onOk={() => {
          if (!matching) form.submit();
        }}
        onCancel={closeModal}
        width={720}
      >
        <div style={{ marginBottom: 16, color: 'var(--ant-color-text-secondary)' }}>
          上传后系统会读取 WGT 清单中的 DCloud AppID 并匹配 APK 应用。匹配成功后可选择最低支持 APK 版本；留空表示不限。
        </div>
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{ channel: 'stable', releaseNote: '' }}
        >
          <Form.Item
            name="fileId"
            label="WGT 文件"
            rules={[{ required: true, message: '请选择 WGT 文件' }]}
            {...FaUtils.formItemFullLayout}
          >
            <UploadFileLocal
              key={uploadKey}
              accept=".wgt"
              onFileChange={handleUploadChange}
              beforeUpload={(file) => {
                if (!file.name.toLowerCase().endsWith('.wgt')) {
                  message.error('请选择 .wgt 文件');
                  return false;
                }
                return true;
              }}
            >
              <Button icon={<UploadOutlined />}>选择 .wgt 文件</Button>
            </UploadFileLocal>
          </Form.Item>
          {matching && <Alert type="info" showIcon title="正在解析 WGT 并匹配 APK 应用及版本…" style={{ marginBottom: 16 }} />}
          {matchedApp && (
            <Alert
              type="success"
              showIcon
              title={`已匹配应用：${matchedApp.appName}（${matchedApp.applicationId}）`}
              description={`DCloud AppID：${matchedApp.dcloudAppId}；当前 APK：${matchedApp.currentApkVersionName || '未命名'}（版本号 ${matchedApp.currentApkVersionCode || '未知'}）；WGT 资源版本：${matchedApp.wgtVersionName}（${matchedApp.wgtVersionCode}）`}
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item
            name="minSupportedVersionCode"
            label="最低支持 APK 版本"
            {...FaUtils.formItemFullLayout}
            extra="留空表示不限制 APK 版本；选择后仅向该版本及更高版本下发。"
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={matchedApp ? '不限制' : '请先上传 WGT 并完成应用匹配'}
              options={minApkVersionOptions}
              notFoundContent="暂无 APK 版本"
              disabled={!matchedApp || matching}
              loading={matching}
            />
          </Form.Item>
          <Form.Item
            name="channel"
            label="发布渠道"
            rules={[{ required: true, whitespace: true }]}
            {...FaUtils.formItemFullLayout}
          >
            <Input placeholder="stable" />
          </Form.Item>
          <Form.Item
            name="releaseNote"
            label="更新说明"
            rules={[{ required: true, whitespace: true, message: '请填写更新说明' }]}
            {...FaUtils.formItemFullLayout}
          >
            <Input.TextArea rows={4} maxLength={4000} showCount placeholder="简要说明本次更新内容" />
          </Form.Item>
        </Form>
      </DragModal>
    </>
  );
}
