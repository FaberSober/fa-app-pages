import { UploadOutlined } from '@ant-design/icons';
import { DragModal, FaUtils, useApiLoading } from '@fa/ui';
import { Button, Form, Input, message, Select, Upload } from 'antd';
import { useMemo, useState } from 'react';
import { appReleaseApi as api, apkVersionApi } from '@/services';
import type { App } from '@/types';

interface WgtReleaseCreateModalProps {
  app: App.Apk;
  fetchFinish: () => void;
}

interface WgtReleaseCreateValues {
  minSupportedVersionCode?: string;
  releaseNote: string;
}

export default function WgtReleaseCreateModal({ app, fetchFinish }: WgtReleaseCreateModalProps) {
  const [form] = Form.useForm<WgtReleaseCreateValues>();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<App.ApkVersion[]>([]);
  const loading = useApiLoading([api.getUrl('createWgtDraft')]);

  const minApkVersionOptions = useMemo(() => {
    const versions = new Map<string, { value: string; label: string }>();
    const addVersion = (versionCode: string, versionName: string, current = false) => {
      if (!/^[1-9]\d*$/.test(versionCode) || versions.has(versionCode)) return;
      versions.set(versionCode, {
        value: versionCode,
        label: `${current ? '当前 APK' : 'APK'} ${versionName || '未命名'}（版本号 ${versionCode}）`,
      });
    };

    addVersion(app.versionCode, app.versionName, true);
    history.forEach((version) => {
      addVersion(version.versionCode, version.versionName);
    });
    return [...versions.values()].sort((left, right) => {
      const leftCode = BigInt(left.value);
      const rightCode = BigInt(right.value);
      return leftCode === rightCode ? 0 : leftCode > rightCode ? -1 : 1;
    });
  }, [app.versionCode, app.versionName, history]);

  function showModal() {
    setFile(null);
    form.resetFields();
    setOpen(true);
    apkVersionApi.listByAppId({ appId: app.id }).then((response) => setHistory(response.data || []));
  }

  function closeModal() {
    setOpen(false);
    setFile(null);
    form.resetFields();
  }

  function onFinish(values: WgtReleaseCreateValues) {
    if (!file) {
      message.error('请先选择 WGT 文件');
      return;
    }

    api.createWgtDraft(app.id, values.minSupportedVersionCode, values.releaseNote.trim(), file).then((response) => {
      FaUtils.showResponse(response, '创建 WGT 热更新草稿');
      if (!response.data?.id) return;
      message.success(`已从 WGT 清单识别目标资源版本 ${response.data.versionName}（${response.data.versionCode}）`);
      closeModal();
      fetchFinish();
    });
  }

  return (
    <>
      <Button type="primary" icon={<UploadOutlined />} onClick={showModal}>
        上传 WGT 并创建草稿
      </Button>
      <DragModal
        title="新建 WGT 热更新"
        open={open}
        okText="上传并创建草稿"
        confirmLoading={loading}
        onOk={() => form.submit()}
        onCancel={closeModal}
        width={720}
      >
        <div style={{ marginBottom: 16, color: 'var(--ant-color-text-secondary)' }}>
          系统会从 WGT 包内的 manifest.json 自动读取资源版本。最低兼容 APK 可留空，表示不限制原生 APK 版本。
        </div>
        <Form form={form} onFinish={onFinish} initialValues={{ minSupportedVersionCode: undefined, releaseNote: '' }}>
          <Form.Item label="WGT 文件" required {...FaUtils.formItemFullLayout}>
            <Upload
              accept=".wgt"
              maxCount={1}
              beforeUpload={(selected) => {
                if (!selected.name.toLowerCase().endsWith('.wgt')) {
                  message.error('请选择 .wgt 文件');
                  return Upload.LIST_IGNORE;
                }
                setFile(selected);
                return false;
              }}
              fileList={file ? [{ uid: file.name, name: file.name, size: file.size }] : []}
              onRemove={() => {
                setFile(null);
                return true;
              }}
            >
              <Button icon={<UploadOutlined />}>选择 .wgt 文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="minSupportedVersionCode"
            label="最低兼容 APK"
            {...FaUtils.formItemFullLayout}
            extra="留空表示适用于所有 APK 版本；选择后仅向该版本及更高版本下发。"
          >
            <Select allowClear showSearch optionFilterProp="label" placeholder="不限制" options={minApkVersionOptions} notFoundContent="暂无 APK 历史版本" />
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
