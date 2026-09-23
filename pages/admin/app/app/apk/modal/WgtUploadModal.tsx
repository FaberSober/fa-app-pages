import { UploadOutlined } from '@ant-design/icons';
import { DragModal, FaUtils, useApiLoading } from '@fa/ui';
import { Button, Form, Input, message, Upload } from 'antd';
import { useState } from 'react';
import { appReleasePackageApi as api } from '@/services';
import type { App } from '@/types';

interface WgtUploadModalProps {
  release: App.AppRelease;
  fetchFinish: () => void;
}

export default function WgtUploadModal({ release, fetchFinish }: WgtUploadModalProps) {
  const [form] = Form.useForm<{ baseVersionCode: string }>();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const loading = useApiLoading([api.getUrl('uploadWgt')]);

  function onFinish({ baseVersionCode }: { baseVersionCode: string }) {
    if (!file) {
      message.error('请先选择 WGT 文件');
      return;
    }
    if (BigInt(baseVersionCode) >= BigInt(release.versionCode)) {
      form.setFields([{ name: 'baseVersionCode', errors: ['基准版本必须小于目标版本'] }]);
      return;
    }
    api.uploadWgt(release.id, baseVersionCode, file).then((res) => {
      FaUtils.showResponse(res, '上传 WGT');
      setOpen(false);
      setFile(null);
      form.resetFields();
      fetchFinish();
    });
  }

  return (
    <span>
      <Button type="primary" icon={<UploadOutlined />} onClick={() => setOpen(true)}>
        上传 WGT
      </Button>
      <DragModal
        title={`上传 WGT 至 ${release.versionName}（${release.versionCode}）`}
        open={open}
        okText="上传 WGT"
        onOk={() => form.submit()}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          setFile(null);
          form.resetFields();
        }}
        width={650}
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            name="baseVersionCode"
            label="基准版本编码"
            rules={[{ required: true }, { pattern: /^[1-9]\d*$/, message: '请输入正整数' }]}
            {...FaUtils.formItemFullLayout}
          >
            <Input placeholder="当前客户端的 versionCode" />
          </Form.Item>
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
              fileList={file ? [{ uid: 'wgt', name: file.name }] : []}
              onRemove={() => {
                setFile(null);
                return true;
              }}
            >
              <Button icon={<UploadOutlined />}>选择 .wgt 文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
