import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { type CommonModalProps, DragModal, FaHref, FaUtils, useApiLoading } from '@fa/ui';
import { Alert, Button, Form, Input, InputNumber, Switch } from 'antd';
import { useState } from 'react';
import { appReleaseApi as api } from '@/services';
import type { App } from '@/types';

interface AppReleaseModalProps extends CommonModalProps<App.AppRelease> {
  appId: number;
}

interface ReleaseFormValues {
  versionName: string;
  versionCode: string;
  channel: string;
  releaseNote?: string;
  forceUpdate: boolean;
  minSupportedVersionCode?: string;
  rolloutPercent: number;
  targetDeviceIds?: string;
  autoRollback: boolean;
  rollbackErrorThreshold: number;
  rollbackWindowMinutes: number;
}

const positiveInteger = /^[1-9]\d*$/;

export default function AppReleaseModal({ appId, title, record, fetchFinish, addBtn, editBtn }: AppReleaseModalProps) {
  const [form] = Form.useForm<ReleaseFormValues>();
  const [open, setOpen] = useState(false);
  const loading = useApiLoading([api.getUrl('save'), api.getUrl('update')]);

  function showModal() {
    form.setFieldsValue({
      versionName: record?.versionName ?? '',
      versionCode: record?.versionCode ?? '',
      channel: record?.channel ?? 'stable',
      releaseNote: record?.releaseNote ?? '',
      forceUpdate: record?.forceUpdate ?? false,
      minSupportedVersionCode: record?.minSupportedVersionCode ?? '',
      rolloutPercent: record?.rolloutPercent ?? 100,
      targetDeviceIds: record?.targetDeviceIds ?? '',
      autoRollback: record?.autoRollback ?? false,
      rollbackErrorThreshold: record?.rollbackErrorThreshold ?? 10,
      rollbackWindowMinutes: record?.rollbackWindowMinutes ?? 15,
    });
    setOpen(true);
  }

  function onFinish(values: ReleaseFormValues) {
    const payload = {
      ...record,
      ...values,
      appId,
      versionCode: values.versionCode.trim(),
      minSupportedVersionCode: values.minSupportedVersionCode?.trim() || null,
      targetDeviceIds: values.targetDeviceIds?.trim() || null,
      releaseNote: values.releaseNote?.trim() || null,
    };
    const task = record ? api.update(record.id, payload) : api.save(payload);
    task.then((res) => {
      FaUtils.showResponse(res, record ? '更新发布草稿' : '创建发布草稿');
      setOpen(false);
      fetchFinish?.();
    });
  }

  return (
    <span>
      {addBtn && (
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          新增发布草稿
        </Button>
      )}
      {editBtn && <FaHref icon={<EditOutlined />} text="编辑" onClick={showModal} />}
      <DragModal title={title} open={open} onOk={() => form.submit()} confirmLoading={loading} onCancel={() => setOpen(false)} width={760}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="这里填写客户端更新的目标资源版本。通过 WGT 创建草稿时，版本名称和编码会从包内清单自动读取。"
        />
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="versionName" label="目标资源版本名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="例如 1.2.0" />
          </Form.Item>
          <Form.Item
            name="versionCode"
            label="目标资源版本编码"
            rules={[{ required: true }, { pattern: positiveInteger, message: '请输入正整数' }]}
            {...FaUtils.formItemFullLayout}
          >
            <Input placeholder="按字符串输入，避免大整数精度损失" />
          </Form.Item>
          <Form.Item name="channel" label="发布渠道" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="stable" />
          </Form.Item>
          <Form.Item name="releaseNote" label="更新说明" {...FaUtils.formItemFullLayout}>
            <Input.TextArea rows={3} maxLength={4000} showCount />
          </Form.Item>
          <Form.Item name="forceUpdate" label="强制更新" valuePropName="checked" {...FaUtils.formItemFullLayout}>
            <Switch />
          </Form.Item>
          <Form.Item
            name="minSupportedVersionCode"
            label="最低兼容 APK"
            rules={[{ pattern: positiveInteger, message: '请输入正整数' }]}
            {...FaUtils.formItemFullLayout}
            extra="留空表示不限制；低于此版本的客户端不会收到该 WGT。"
          >
            <Input placeholder="可留空" />
          </Form.Item>
          <Form.Item name="rolloutPercent" label="灰度比例（%）" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <InputNumber min={0} max={100} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetDeviceIds" label="设备白名单" {...FaUtils.formItemFullLayout}>
            <Input.TextArea rows={2} maxLength={4000} placeholder="可留空；逗号或换行分隔" />
          </Form.Item>
          <Form.Item name="autoRollback" label="自动撤回" valuePropName="checked" {...FaUtils.formItemFullLayout}>
            <Switch />
          </Form.Item>
          <Form.Item name="rollbackErrorThreshold" label="异常阈值" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <InputNumber min={1} max={1000000} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rollbackWindowMinutes" label="统计窗口（分钟）" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <InputNumber min={1} max={1440} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
