import { UploadOutlined } from '@ant-design/icons';
import { DragModal, FaUtils, useApiLoading } from '@fa/ui';
import { Button, Form, Input, message, Upload } from 'antd';
import { useState } from 'react';
import { appReleaseApi as api } from '@/services';
import type { App } from '@/types';

interface WgtReleaseCreateModalProps {
  app: App.Apk;
  fetchFinish: () => void;
}

interface WgtReleaseCreateValues {
  releaseNote?: string;
}

export default function WgtReleaseCreateModal({ app, fetchFinish }: WgtReleaseCreateModalProps) {
  const [form] = Form.useForm<WgtReleaseCreateValues>();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const loading = useApiLoading([api.getUrl('createWgtDraft')]);

  function showModal() {
    setFile(null);
    form.resetFields();
    setOpen(true);
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

    api.createWgtDraft(app.id, undefined, values.releaseNote?.trim() || '', file).then((response) => {
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
          只需选择 WGT 包，系统自动识别 uni-app / uni-app X、目标平台及资源版本。
        </div>
        <Form form={form} onFinish={onFinish} initialValues={{ releaseNote: '' }}>
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
          <Form.Item name="releaseNote" label="更新说明" {...FaUtils.formItemFullLayout}>
            <Input.TextArea rows={4} maxLength={4000} showCount placeholder="选填；留空时自动使用资源版本生成说明" />
          </Form.Item>
        </Form>
      </DragModal>
    </>
  );
}
