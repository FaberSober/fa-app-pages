import React from 'react';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popover, QRCode, Space } from 'antd';
import { AuthDelBtn, BaseBizTable, BaseTableUtils, clearForm, FaberTable, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { apkApi as api, fileSaveApi } from '@/services';
import { App } from '@/types';
import ApkModal from './modal/ApkModal';
import ApkUploadModal from './modal/ApkUploadModal';

const serviceName = 'APP-APK表';
const biz = 'app_apk';

/**
 * APP-APK表表格查询
 */
export default function Index() {
  const [form] = Form.useForm();

  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.Apk>(api.page, {}, serviceName)

  const [handleDelete] = useDelete<number>(api.remove, fetchPageList, serviceName)
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams)

  /** 生成表格字段List */
  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('图标', 'iconId', 100, sorter),
        sorter: false,
        render: (_, r) => <img style={{width: 30, height: 30}} src={fileSaveApi.genLocalGetFile(r.iconId)} />
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('应用名称', 'name', 150, sorter),
        render: (_, r) => (
          <Popover
            title="下载"
            content={(
              <div className="fa-flex-column-center">
                <QRCode
                  errorLevel="H"
                  value={`${window.location.origin}${fileSaveApi.genLocalGetFile(r.fileId)}`}
                  icon={fileSaveApi.genLocalGetFile(r.iconId)}
                />
                <a href={fileSaveApi.genLocalGetFile(r.fileId)} target="_blank">点击下载</a>
              </div>
            )}
          >
            <a>{r.name}</a>
          </Popover>
        )
      },
      BaseTableUtils.genSimpleSorterColumn('应用包名', 'applicationId', undefined, sorter),
      BaseTableUtils.genSimpleSorterColumn('当前版本号', 'versionCode', 120, sorter),
      BaseTableUtils.genSimpleSorterColumn('当前版本名称', 'versionName', 120, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <ApkModal editBtn title={`编辑${serviceName}信息`} record={r} fetchFinish={fetchPageList} />
            <AuthDelBtn handleDelete={() => handleDelete(r.id)} />
          </Space>
        ),
        width: 120,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.Apk>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: 8 }}>
        <strong style={{ fontSize: '18px' }}>{serviceName}</strong>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="search" label="搜索">
              <Input placeholder="请输入搜索内容" />
            </Form.Item>
          </Form>

          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={() => clearForm(form)} loading={loading}>重置</Button>
            <ApkUploadModal addBtn title="上传APK" fetchFinish={fetchPageList} />
            <Button loading={exporting} icon={<DownloadOutlined />} onClick={fetchExportExcel}>导出</Button>
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
        onConditionChange={(cL) => setConditionList(cL)}
      />
    </div>
  );
}
