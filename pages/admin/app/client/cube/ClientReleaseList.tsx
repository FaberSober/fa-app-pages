import { CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import {
  AuthDelBtn,
  BaseBizTable,
  BaseDrawer,
  BaseTableUtils,
  clearForm,
  type FaberTable,
  FaHref,
  FaUtils,
  useDelete,
  useExport,
  useTableQueryParams,
} from '@fa/ui';
import { Alert, Button, Form, Input, Modal, Space, Tag } from 'antd';
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
  const [currentRelease, setCurrentRelease] = React.useState<App.ClientRelease | null>(null);
  const [currentLoading, setCurrentLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  function fetchCurrentRelease() {
    setCurrentLoading(true);
    api
      .current(clientId)
      .then((res) => setCurrentRelease(res.data))
      .finally(() => setCurrentLoading(false));
  }

  React.useEffect(() => {
    setExtraParams({ clientId });
    fetchCurrentRelease();
  }, [clientId]);

  function handlePublish(record: App.ClientRelease) {
    Modal.confirm({
      title: '发布Desktop版本',
      content: '发布后版本和安装包将不能再编辑，确认发布吗？',
      onOk: () => {
        setActionLoading(true);
        return api
          .publish(record.id)
          .then((res) => {
            FaUtils.showResponse(res, '发布Desktop版本');
            fetchPageList();
            fetchCurrentRelease();
          })
          .finally(() => setActionLoading(false));
      },
    });
  }

  function handleRevoke(record: App.ClientRelease) {
    Modal.confirm({
      title: '撤回Desktop版本',
      content: '撤回后客户端将不再使用该版本作为当前版本，确认撤回吗？',
      onOk: () => {
        setActionLoading(true);
        return api
          .revoke(record.id)
          .then((res) => {
            FaUtils.showResponse(res, '撤回Desktop版本');
            fetchPageList();
            fetchCurrentRelease();
          })
          .finally(() => setActionLoading(false));
      },
    });
  }

  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本编码', 'versionCode', 110, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本名称', 'versionName', 110, sorter),
      BaseTableUtils.genSimpleSorterColumn('渠道', 'channel', 90, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('状态', 'status', 100, sorter),
        render: (value: string) => (
          <Tag color={value === 'PUBLISHED' ? 'green' : value === 'REVOKED' ? 'red' : 'default'}>
            {value === 'PUBLISHED' ? '已发布' : value === 'REVOKED' ? '已撤回' : '草稿'}
          </Tag>
        ),
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
              <ClientReleaseArtifactList releaseId={record.id} readOnly={record.status !== 'DRAFT'} />
            </BaseDrawer>
            {record.status === 'DRAFT' && (
              <ClientReleaseModal editBtn title={`编辑${serviceName}`} record={record} clientId={clientId} fetchFinish={fetchPageList} />
            )}
            {record.status === 'DRAFT' && <FaHref icon={<CheckCircleOutlined />} text="发布" disabled={actionLoading} onClick={() => handlePublish(record)} />}
            {record.status === 'PUBLISHED' && (
              <FaHref icon={<CloseCircleOutlined />} text="撤回" color="red" disabled={actionLoading} onClick={() => handleRevoke(record)} />
            )}
            {record.status === 'DRAFT' && <AuthDelBtn handleDelete={() => handleDelete(record.id)} />}
          </Space>
        ),
        width: 300,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.ClientRelease>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <Alert
        showIcon
        type={currentLoading ? 'info' : currentRelease ? 'success' : 'warning'}
        message={
          currentLoading
            ? '正在查询当前生效版本'
            : currentRelease
              ? `当前生效版本：${currentRelease.versionName}（${currentRelease.versionCode}）`
              : '当前没有已发布版本'
        }
        description={currentRelease ? `渠道：${currentRelease.channel}，发布时间：${currentRelease.publishTime || '-'}` : undefined}
        style={{ margin: 12, marginBottom: 0 }}
      />
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
