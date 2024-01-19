import React, { useEffect } from 'react';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popover, QRCode, Space } from 'antd';
import { AuthDelBtn, BaseBizTable, BaseTableUtils, clearForm, FaberTable, FaUtils, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { apkVersionApi as api, fileSaveApi } from '@/services';
import { App } from '@/types';
import ApkVersionModal from '../modal/ApkVersionModal';

const serviceName = 'APK历史版本';
const biz = 'app_apk_version';

export interface ApkVersionListProps {
  appId: number;
}

/**
 * APP-APK表表格查询
 */
export default function ApkVersionList({appId}:ApkVersionListProps) {
  const [form] = Form.useForm();

  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.ApkVersion>(api.page, {extraParams:{appId}}, serviceName)

  const [handleDelete] = useDelete<number>(api.remove, fetchPageList, serviceName)
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams)

  useEffect(() => {
    setExtraParams({appId})
  }, [appId])

  /** 生成表格字段List */
  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('图标', 'iconId', 60, sorter),
        sorter: false,
        render: (_, r) => (
          <div className="fa-flex-row-center">
            <img alt={r.name} style={{width: 20, height: 20}} src={fileSaveApi.genLocalGetFile(r.iconId)} />
          </div>
        )
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('应用名称', 'name', 100, sorter),
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
      BaseTableUtils.genSimpleSorterColumn('版本号', 'versionCode', 100, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本名称', 'versionName', 100, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('文件大小', 'size', 100, sorter),
        render: (val) => FaUtils.sizeToHuman(val),
      },
      BaseTableUtils.genSimpleSorterColumn('下载次数', 'downloadNum', 100, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('版本信息', 'remark', undefined, sorter),
        className: 'fa-break-word',
      },
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <ApkVersionModal editBtn title={`编辑${serviceName}信息`} record={r} fetchFinish={fetchPageList} />
            <AuthDelBtn handleDelete={() => handleDelete(r.id)} />
          </Space>
        ),
        width: 115,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.ApkVersion>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: 8 }}>
        {/*<div className="fa-h3">{serviceName}</div>*/}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="versionCode" label="搜索">
              <Input placeholder="请输入版本号" />
            </Form.Item>
          </Form>

          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
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
