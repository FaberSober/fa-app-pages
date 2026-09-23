import { UploadOutlined } from '@ant-design/icons';
import { DragModal, FaUtils, useApiLoading } from '@fa/ui';
import { Button, message, Upload } from 'antd';
import { useState } from 'react';
import { appReleasePackageApi as api } from '@/services';
import type { App } from '@/types';

interface WgtUploadModalProps {
  release: App.AppRelease;
  fetchFinish: () => void;
}

export default function WgtUploadModal({ release, fetchFinish }: WgtUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const loading = useApiLoading([api.getUrl('uploadWgt')]);

  function upload() {
    if (!file) {
      message.error('请先选择 WGT 文件');
      return;
    }
    api.uploadWgt(release.id, file).then((res) => {
      FaUtils.showResponse(res, '上传 WGT 热更新包');
      if (!res.data?.id) return;
      setOpen(false);
      setFile(null);
      fetchFinish();
    });
  }

  return (
    <span>
      <Button type="primary" icon={<UploadOutlined />} onClick={() => setOpen(true)}>
        上传 WGT
      </Button>
      <DragModal
        title={`上传 WGT 热更新包：目标资源版本 ${release.versionName}（${release.versionCode}）`}
        open={open}
        okText="上传 WGT 热更新包"
        onOk={upload}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          setFile(null);
        }}
        width={650}
      >
        <div style={{ marginBottom: 12, color: 'var(--ant-color-text-secondary)' }}>最低兼容 APK 在发布草稿中维护，上传包只校验 WGT 清单中的资源版本。</div>
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
      </DragModal>
    </span>
  );
}
