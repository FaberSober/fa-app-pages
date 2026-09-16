import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { type CommonModalProps, DragModal, FaHref, FaUtils, UploadFileLocal, useApiLoading } from '@fa/ui';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import { get } from 'lodash';
import { useState } from 'react';
import { clientReleaseArtifactApi as api, fileSaveApi } from '@/services';
import type { App } from '@/types';

interface ClientReleaseArtifactModalProps extends CommonModalProps<App.ClientReleaseArtifact> {
  releaseId: string;
}

export default function ClientReleaseArtifactModal({
  releaseId,
  children,
  title,
  record,
  fetchFinish,
  addBtn,
  editBtn,
  ...props
}: ClientReleaseArtifactModalProps) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const loading = useApiLoading([api.getUrl('save'), api.getUrl('update')]);

  function onFinish(values: Partial<App.ClientReleaseArtifact>) {
    const task = record ? api.update(record.id, { ...record, ...values, releaseId }) : api.save({ ...values, releaseId });
    task.then((res) => {
      FaUtils.showResponse(res, record ? '更新Desktop安装包' : '新增Desktop安装包');
      setOpen(false);
      fetchFinish?.();
    });
  }

  function showModal() {
    setOpen(true);
    form.setFieldsValue({
      platform: get(record, 'platform'),
      arch: get(record, 'arch'),
      fileId: get(record, 'fileId'),
      fileName: get(record, 'fileName'),
      size: get(record, 'size'),
      sha256: get(record, 'sha256'),
      signature: get(record, 'signature'),
    });
  }

  function fillFileInfo(fileId: string | string[] | undefined) {
    if (!fileId || Array.isArray(fileId)) return;
    fileSaveApi.getById(fileId).then((res) => {
      form.setFieldsValue({ fileName: res.data.originalFilename, size: res.data.size });
    });
  }

  return (
    <span>
      {children}
      {addBtn && (
        <Button icon={<PlusOutlined />} type="primary" onClick={showModal}>
          新增安装包
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
      <DragModal title={title} open={open} onOk={() => form.submit()} confirmLoading={loading} onCancel={() => setOpen(false)} width={760} {...props}>
        <Form form={form} onFinish={onFinish} onValuesChange={(changedValues) => fillFileInfo(changedValues.fileId)}>
          <Form.Item name="platform" label="平台" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Select
              options={[
                { label: 'Windows', value: 'windows' },
                { label: 'macOS', value: 'darwin' },
                { label: 'Linux', value: 'linux' },
              ]}
            />
          </Form.Item>
          <Form.Item name="arch" label="架构" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Select
              options={[
                { label: 'x86_64', value: 'x86_64' },
                { label: 'aarch64', value: 'aarch64' },
              ]}
            />
          </Form.Item>
          <Form.Item name="fileId" label="安装包" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <UploadFileLocal accept=".exe,.msi,.dmg,.appimage,.deb,.rpm" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名" {...FaUtils.formItemFullLayout}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="size" label="文件大小（字节）" {...FaUtils.formItemFullLayout}>
            <InputNumber disabled style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sha256" label="SHA-256" rules={[{ required: true, len: 64 }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="请输入安装包 SHA-256" />
          </Form.Item>
          <Form.Item name="signature" label="Tauri 签名" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input.TextArea rows={5} placeholder="请输入对应安装包的 .sig 内容" />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
