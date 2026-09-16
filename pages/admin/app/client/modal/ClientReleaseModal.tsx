import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { type CommonModalProps, DragModal, FaHref, FaUtils, useApiLoading } from '@fa/ui';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import { get } from 'lodash';
import { useState } from 'react';
import { clientReleaseApi as api } from '@/services';
import type { App } from '@/types';

interface ClientReleaseModalProps extends CommonModalProps<App.ClientRelease> {
  clientId: string;
}

export default function ClientReleaseModal({ clientId, children, title, record, fetchFinish, addBtn, editBtn, ...props }: ClientReleaseModalProps) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const loading = useApiLoading([api.getUrl('save'), api.getUrl('update')]);

  function onFinish(values: Partial<App.ClientRelease>) {
    const task = record ? api.update(record.id, { ...record, ...values, clientId }) : api.save({ ...values, clientId, status: 'DRAFT' });
    task.then((res) => {
      FaUtils.showResponse(res, record ? '更新Desktop客户端版本' : '新增Desktop客户端版本');
      setOpen(false);
      fetchFinish?.();
    });
  }

  function showModal() {
    setOpen(true);
    form.setFieldsValue({
      versionName: get(record, 'versionName'),
      versionCode: get(record, 'versionCode'),
      channel: get(record, 'channel', 'stable'),
      releaseNotes: get(record, 'releaseNotes'),
    });
  }

  return (
    <span>
      {children}
      {addBtn && (
        <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
          新增草稿
        </Button>
      )}
      {editBtn && (
        <FaHref
          icon={<EditOutlined />}
          text="编辑"
          onClick={(event) => {
            event.preventDefault();
            showModal();
          }}
        />
      )}
      <DragModal title={title} open={open} onOk={() => form.submit()} confirmLoading={loading} onCancel={() => setOpen(false)} width={700} {...props}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="versionName" label="版本名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="例如 1.2.0" />
          </Form.Item>
          <Form.Item name="versionCode" label="版本编码" rules={[{ required: true }, { type: 'number', min: 1 }]} {...FaUtils.formItemFullLayout}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="请输入递增版本编码" />
          </Form.Item>
          <Form.Item name="channel" label="发布渠道" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Select options={[{ label: '稳定版', value: 'stable' }]} />
          </Form.Item>
          <Form.Item name="releaseNotes" label="发布说明" {...FaUtils.formItemFullLayout}>
            <Input.TextArea rows={5} maxLength={4000} showCount placeholder="请输入本次版本更新说明" />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
