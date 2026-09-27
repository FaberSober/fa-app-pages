import { DownloadOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popover, QRCode, Space } from 'antd';
import { AuthDelBtn, BaseBizTable, BaseDrawer, BaseTableUtils, clearForm, type FaberTable, FaHref, FaUtils, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { apkApi as api, fileSaveApi } from '@/services';
import type { App } from '@/types';
import ApkModal from './modal/ApkModal';
import ApkUploadModal from './modal/ApkUploadModal';
import ApkVersionList from "@features/fa-app-pages/pages/admin/app/app/apk/cube/ApkVersionList";
import AppReleaseList from './cube/AppReleaseList';


const serviceName = 'APP版本管理';
const biz = 'app_apk';

/**
 * APP-APK表表格查询
 */
export default function ApkList() {
  const [form] = Form.useForm();

  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.Apk>(api.minePage, {}, serviceName)

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
                  value={`${window.location.origin}/h5/app/${r.shortCode}`}
                  icon={fileSaveApi.genLocalGetFile(r.iconId)}
                />
                <a href={`${window.location.origin}/h5/app/${r.shortCode}`} target="_blank" rel="noreferrer">打开下载页面</a>
                {r.publishedFileId ? (
                  <a href={fileSaveApi.genLocalGetFile(r.publishedFileId)} target="_blank" rel="noreferrer">下载正式 APK</a>
                ) : (
                  <span>暂无正式 APK</span>
                )}
              </div>
            )}
          >
            <a>{r.name}</a>
          </Popover>
        )
      },
      BaseTableUtils.genSimpleSorterColumn('应用包名', 'applicationId', undefined, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('正式版本号', 'publishedVersionCode', 120, sorter),
        sorter: false,
        render: (value) => value ?? '暂无正式版本',
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('正式版本名称', 'publishedVersionName', 120, sorter),
        sorter: false,
        render: (value) => value ?? '-',
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('正式包大小', 'publishedSize', 120, sorter),
        sorter: false,
        render: (value) => value == null ? '-' : FaUtils.sizeToHuman(value),
      },
      BaseTableUtils.genSimpleSorterColumn('下载次数', 'downloadNum', 100, sorter),
      {
        ...BaseTableUtils.genEllipsisSorterColumn('版本信息', 'publishedRemark', undefined, sorter),
        sorter: false,
      },
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <BaseDrawer title="Android APK 安装包历史" triggerDom={<FaHref icon={<UnorderedListOutlined />} text="APK 安装包" />} size={1300}>
              <ApkVersionList appId={r.id} />
            </BaseDrawer>
            <BaseDrawer title={`${r.name} 客户端更新发布`} triggerDom={<FaHref icon={<UnorderedListOutlined />} text="客户端更新" />} size={1400}>
              <AppReleaseList app={r} />
            </BaseDrawer>
            <ApkModal editBtn title={`编辑${serviceName}信息`} record={r} fetchFinish={fetchPageList} />
            <AuthDelBtn handleDelete={() => handleDelete(r.id)} />
          </Space>
        ),
        width: 320,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.Apk>[];
  }

  return (
    <div className="fa-full-content-p12 fa-flex-column fa-content">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: 8 }}>
        <div className="fa-h3">{serviceName}</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="name" label="搜索">
              <Input placeholder="请输入应用名称" />
            </Form.Item>
          </Form>

          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>查询</Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
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
