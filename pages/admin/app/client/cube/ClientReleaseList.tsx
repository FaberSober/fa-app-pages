import { DownloadOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { AuthDelBtn, BaseBizTable, BaseDrawer, BaseTableUtils, clearForm, type FaberTable, FaHref, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { Button, Form, Input, Space, Tag } from 'antd';
import React from 'react';
import { clientReleaseApi as api } from '@/services';
import type { App } from '@/types';
import ClientReleaseModal from '../modal/ClientReleaseModal';
import ClientReleaseArtifactList from './ClientReleaseArtifactList';

const serviceName = 'Desktop版本';
const biz = 'app_client_release';

export interface ClientReleaseListProps {
  clientId: string;
}

export default function ClientReleaseList({ clientId }: ClientReleaseListProps) {
  const [form] = Form.useForm();
  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.ClientRelease>(api.page, { extraParams: { clientId } }, serviceName);
  const [handleDelete] = useDelete<string>(api.remove, fetchPageList, serviceName);
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams);

  React.useEffect(() => {
    setExtraParams({ clientId });
  }, [clientId]);

  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本编码', 'versionCode', 110, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本名称', 'versionName', 110, sorter),
      BaseTableUtils.genSimpleSorterColumn('渠道', 'channel', 90, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('状态', 'status', 100, sorter),
        render: (value: string) => <Tag color={value === 'PUBLISHED' ? 'green' : value === 'RECALLED' ? 'red' : 'default'}>{value || 'DRAFT'}</Tag>,
      },
      BaseTableUtils.genTimeSorterColumn('发布时间', 'publishTime', 170, sorter),
      BaseTableUtils.genEllipsisSorterColumn('发布说明', 'releaseNotes', 240, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_: unknown, record: App.ClientRelease) => (
          <Space>
            <BaseDrawer title="平台安装包" triggerDom={<FaHref icon={<UnorderedListOutlined />} text="安装包" />} size={1300}>
              <ClientReleaseArtifactList releaseId={record.id} />
            </BaseDrawer>
            <ClientReleaseModal editBtn title={`编辑${serviceName}`} record={record} clientId={clientId} fetchFinish={fetchPageList} />
            <AuthDelBtn handleDelete={() => handleDelete(record.id)} />
          </Space>
        ),
        width: 210,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.ClientRelease>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="versionCode" label="搜索">
              <Input placeholder="请输入版本编码" />
            </Form.Item>
          </Form>
          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
            <ClientReleaseModal addBtn title={`新增${serviceName}`} clientId={clientId} fetchFinish={fetchPageList} />
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
