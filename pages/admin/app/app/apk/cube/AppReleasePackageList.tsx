import { AuthDelBtn, FaUtils, fileSaveApi, useApiLoading, useDelete } from '@fa/ui';
import { Button, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { appReleasePackageApi as api } from '@/services';
import type { App } from '@/types';
import WgtUploadModal from '../modal/WgtUploadModal';

export default function AppReleasePackageList({ release }: { release: App.AppRelease }) {
  const [list, setList] = useState<App.AppReleasePackage[]>([]);
  const loading = useApiLoading([api.getUrl(`byRelease/${release.id}`)]);

  function fetchList() {
    api.byRelease(release.id).then((res) => setList(res.data));
  }

  const [handleDelete] = useDelete<string>(api.remove, fetchList, 'WGT 发布包');

  useEffect(() => {
    fetchList();
  }, [release.id]);

  return (
    <div className="fa-full-content-p12 fa-flex-column fa-content">
      <Space style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        {release.status === 'DRAFT' && <WgtUploadModal release={release} fetchFinish={fetchList} />}
        <Button onClick={fetchList} loading={loading}>
          刷新
        </Button>
      </Space>
      <Table<App.AppReleasePackage>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        scroll={{ x: 900 }}
        columns={[
          { title: '平台', dataIndex: 'platform', width: 110, render: (value: string) => (value === 'APP_PLUS' ? 'APP-PLUS' : value) },
          { title: '包类型', dataIndex: 'packageType', width: 100, render: (value: string) => <Tag>{value}</Tag> },
          { title: '基准版本编码', dataIndex: 'baseVersionCode', width: 140, render: (value: string | null) => value || '-' },
          {
            title: '文件',
            dataIndex: 'fileId',
            width: 200,
            render: (value: string) => (
              <a href={fileSaveApi.genLocalGetFile(value)} target="_blank" rel="noreferrer">
                {value}
              </a>
            ),
          },
          { title: '大小', dataIndex: 'size', width: 120, render: (value: number) => FaUtils.sizeToHuman(value) },
          { title: 'SHA-256', dataIndex: 'sha256', width: 220, render: (value: string) => <span title={value}>{value?.slice(0, 20)}…</span> },
          {
            title: '操作',
            width: 90,
            render: (_, record) => (release.status === 'DRAFT' ? <AuthDelBtn handleDelete={() => handleDelete(record.id)} /> : null),
          },
        ]}
      />
    </div>
  );
}
