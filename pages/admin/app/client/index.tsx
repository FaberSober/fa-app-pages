import { DownloadOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { AuthDelBtn, BaseBizTable, BaseDrawer, BaseTableUtils, clearForm, type FaberTable, FaHref, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { Button, Form, Input, Space } from 'antd';
import { clientAppApi as api } from '@/services';
import type { App } from '@/types';
import ClientReleaseList from './cube/ClientReleaseList';
import ClientAppModal from './modal/ClientAppModal';

const serviceName = 'Desktop客户端版本维护';
const biz = 'app_client';

export default function ClientAppList() {
  const [form] = Form.useForm();
  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.ClientApp>(api.page, {}, serviceName);
  const [handleDelete] = useDelete<string>(api.remove, fetchPageList, serviceName);
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams);

  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      BaseTableUtils.genSimpleSorterColumn('客户端标识', 'clientCode', 180, sorter),
      BaseTableUtils.genSimpleSorterColumn('名称', 'name', 180, sorter),
      BaseTableUtils.genSimpleSorterColumn('应用标识', 'identifier', 220, sorter),
      {
        ...BaseTableUtils.genBoolSorterColumn('是否启用', 'enabled', 100, sorter),
        render: (value: boolean) => (value ? '启用' : '停用'),
      },
      BaseTableUtils.genEllipsisSorterColumn('备注', 'remark', undefined, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_: unknown, record: App.ClientApp) => (
          <Space>
            <BaseDrawer title="Desktop版本" triggerDom={<FaHref icon={<UnorderedListOutlined />} text="版本" />} size={1400}>
              <ClientReleaseList clientId={record.id} />
            </BaseDrawer>
            <ClientAppModal editBtn title={`编辑${serviceName}`} record={record} fetchFinish={fetchPageList} />
            <AuthDelBtn handleDelete={() => handleDelete(record.id)} />
          </Space>
        ),
        width: 180,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.ClientApp>[];
  }

  return (
    <div className="fa-full-content-p12 fa-flex-column fa-content">
      <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
        <div className="fa-h3">{serviceName}</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="clientCode" label="标识">
              <Input placeholder="请输入客户端标识" />
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input placeholder="请输入客户端名称" />
            </Form.Item>
          </Form>
          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
            <ClientAppModal addBtn title={`新增${serviceName}`} fetchFinish={fetchPageList} />
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
        onSceneChange={(value) => setSceneId(value)}
        onConditionChange={(values) => setConditionList(values)}
      />
    </div>
  );
}
