import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { AuthDelBtn, BaseBizTable, BaseTableUtils, clearForm, type FaberTable, FaUtils, fileSaveApi, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { Button, Form, Input, Space } from 'antd';
import React from 'react';
import { clientReleaseArtifactApi as api } from '@/services';
import type { App } from '@/types';
import ClientReleaseArtifactModal from '../modal/ClientReleaseArtifactModal';

const serviceName = 'Desktop安装包';
const biz = 'app_client_release_artifact';

export interface ClientReleaseArtifactListProps {
  releaseId: string;
  readOnly?: boolean;
}

export default function ClientReleaseArtifactList({ releaseId, readOnly = false }: ClientReleaseArtifactListProps) {
  const [form] = Form.useForm();
  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.ClientReleaseArtifact>(api.page, { extraParams: { releaseId } }, serviceName);
  const [handleDelete] = useDelete<string>(api.remove, fetchPageList, serviceName);
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams);

  React.useEffect(() => {
    setExtraParams({ releaseId });
  }, [releaseId]);

  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      BaseTableUtils.genSimpleSorterColumn('平台', 'platform', 100, sorter),
      BaseTableUtils.genSimpleSorterColumn('架构', 'arch', 100, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('文件名', 'fileName', 220, sorter),
        render: (_: unknown, record: App.ClientReleaseArtifact) => (
          <a href={fileSaveApi.genLocalGetFile(record.fileId)} target="_blank" rel="noreferrer">
            {record.fileName || record.fileId}
          </a>
        ),
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('文件大小', 'size', 120, sorter),
        render: (value: number) => FaUtils.sizeToHuman(value),
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('SHA-256', 'sha256', 180, sorter),
        render: (value: string) => <span title={value}>{value?.slice(0, 16)}...</span>,
      },
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_: unknown, record: App.ClientReleaseArtifact) => (
          <Space>
            {!readOnly && <ClientReleaseArtifactModal editBtn title={`编辑${serviceName}`} record={record} releaseId={releaseId} fetchFinish={fetchPageList} />}
            {!readOnly && <AuthDelBtn handleDelete={() => handleDelete(record.id)} />}
          </Space>
        ),
        width: 125,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.ClientReleaseArtifact>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="platform" label="平台">
              <Input placeholder="请输入平台" />
            </Form.Item>
          </Form>
          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
            {!readOnly && <ClientReleaseArtifactModal addBtn title={`新增${serviceName}`} releaseId={releaseId} fetchFinish={fetchPageList} />}
            <Button loading={exporting} icon={<DownloadOutlined />} onClick={fetchExportExcel}>
              导出
            </Button>
          </Space>
        </div>
      </div>
      <BaseBizTable
        rowKey="id"
        biz={biz}
        columns={genColumns()}
        pagination={paginationProps}
        loading={loading}
        dataSource={list}
        onChange={handleTableChange}
        refreshList={() => fetchPageList()}
        batchDelete={(ids) => api.removeBatchByIds(ids)}
        onSceneChange={(v) => setSceneId(v)}
        onConditionChange={(values) => setConditionList(values)}
      />
    </div>
  );
}
