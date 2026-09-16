import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { type CommonModalProps, DragModal, FaHref, FaUtils, useApiLoading } from '@fa/ui';
import { Button, Form, Input, Switch } from 'antd';
import { get } from 'lodash';
import { useState } from 'react';
import { clientAppApi as api } from '@/services';
import type { App } from '@/types';

export default function ClientAppModal({ children, title, record, fetchFinish, addBtn, editBtn, ...props }: CommonModalProps<App.ClientApp>) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const loading = useApiLoading([api.getUrl('save'), api.getUrl('update')]);

  function onFinish(values: Partial<App.ClientApp>) {
    const task = record ? api.update(record.id, { ...record, ...values }) : api.save(values);
    task.then((res) => {
      FaUtils.showResponse(res, record ? '更新Desktop客户端' : '新增Desktop客户端');
      setOpen(false);
      fetchFinish?.();
    });
  }

  function showModal() {
    setOpen(true);
    form.setFieldsValue({
      clientCode: get(record, 'clientCode'),
      name: get(record, 'name'),
      identifier: get(record, 'identifier'),
      enabled: get(record, 'enabled', true),
      remark: get(record, 'remark'),
    });
  }

  return (
    <span>
      {children}
      {addBtn && (
        <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
          新增客户端
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
          <Form.Item name="clientCode" label="客户端标识" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="例如 faber-desktop" disabled={Boolean(record)} />
          </Form.Item>
          <Form.Item name="name" label="客户端名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="请输入客户端名称" />
          </Form.Item>
          <Form.Item name="identifier" label="应用标识" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="例如 com.faber.desktop" />
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked" {...FaUtils.formItemFullLayout}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item name="remark" label="备注" {...FaUtils.formItemFullLayout}>
            <Input.TextArea autoSize placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
