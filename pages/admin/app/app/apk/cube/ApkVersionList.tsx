import { CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { BaseBizTable, BaseTableUtils, clearForm, type FaberTable, FaHref, FaUtils, useExport, useTableQueryParams } from '@fa/ui';
import { Button, Form, Input, Modal, Popover, QRCode, Space, Switch, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { apkVersionApi as api, fileSaveApi } from '@/services';
import type { App } from '@/types';
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

  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, setList, paginationProps } =
    useTableQueryParams<App.ApkVersion>(api.page, {extraParams:{appId}}, serviceName)

  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams)
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setExtraParams({appId})
  }, [appId])

  function handlePublish(record: App.ApkVersion) {
    Modal.confirm({
      title: `发布 APK ${record.versionName}？`,
      content: `发布后，${record.versionName}（版本号 ${record.versionCode}）将成为下载页和客户端更新检查使用的正式版本。`,
      onOk: () => {
        setActionLoading(true);
        return api.publish(record.id)
          .then((res) => {
            FaUtils.showResponse(res, '发布 APK');
            fetchPageList();
          })
          .finally(() => setActionLoading(false));
      },
    });
  }

  function handleRevoke(record: App.ApkVersion) {
    Modal.confirm({
      title: `撤回 APK ${record.versionName}？`,
      content: '撤回后，下载页和客户端更新检查将停止分发此版本；已安装该版本的用户需安装更高版本的修复 APK。',
      okButtonProps: { danger: true },
      onOk: () => {
        setActionLoading(true);
        return api.revoke(record.id)
          .then((res) => {
            FaUtils.showResponse(res, '撤回 APK');
            fetchPageList();
          })
          .finally(() => setActionLoading(false));
      },
    });
  }

  /** 生成表格字段List */
  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('图标', 'iconId', 45, sorter),
        sorter: false,
        render: (_, r) => (
          <div className="fa-flex-row-center">
            <img alt={r.name} style={{width: 20, height: 20}} src={fileSaveApi.genLocalGetFile(r.iconId)} />
          </div>
        )
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('应用名称', 'name', 120, sorter),
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
                <a href={fileSaveApi.genLocalGetFile(r.fileId)} target="_blank" rel="noreferrer">点击下载</a>
              </div>
            )}
          >
            <a>{r.name}</a>
          </Popover>
        )
      },
      BaseTableUtils.genSimpleSorterColumn('版本号', 'versionCode', 90, sorter),
      BaseTableUtils.genSimpleSorterColumn('版本名称', 'versionName', 90, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('状态', 'status', 90, sorter),
        render: (value: App.ApkVersion['status']) => (
          <Tag color={value === 'PUBLISHED' ? 'green' : value === 'REVOKED' ? 'red' : 'default'}>
            {value === 'PUBLISHED' ? '已发布' : value === 'REVOKED' ? '已撤回' : '草稿'}
          </Tag>
        ),
      },
      BaseTableUtils.genTimeSorterColumn('发布时间', 'publishTime', 150, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('文件大小', 'size', 90, sorter),
        render: (val) => FaUtils.sizeToHuman(val),
      },
      BaseTableUtils.genSimpleSorterColumn('下载次数', 'downloadNum', 90, sorter),
      {
        ...BaseTableUtils.genBoolSorterColumn('强制更新', 'forceUpdate', 90, sorter),
        render: (_v, r) => (
          <ForceUpdate
            item={r}
            onChange={() => {
              setList(list.map(i => i.id === r.id ? {...i, forceUpdate: !i.forceUpdate } : i))
            }}
          />
        )
      },
      BaseTableUtils.genEllipsisSorterColumn('版本信息', 'remark', undefined, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <ApkVersionModal editBtn title={`编辑${serviceName}信息`} record={r} fetchFinish={fetchPageList} />
            {r.status === 'DRAFT' && (
              <FaHref icon={<CheckCircleOutlined />} text="发布" disabled={actionLoading} onClick={() => handlePublish(r)} />
            )}
            {r.status === 'PUBLISHED' && (
              <FaHref icon={<CloseCircleOutlined />} text="撤回" color="red" disabled={actionLoading} onClick={() => handleRevoke(r)} />
            )}
          </Space>
        ),
        width: 190,
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
        onSceneChange={(v) => setSceneId(v)}
        onConditionChange={(cL) => setConditionList(cL)}
      />
    </div>
  );
}

function ForceUpdate({ item, onChange }: {item: App.ApkVersion, onChange: (i: App.ApkVersion) => void}) {
  const [loading, setLoading] = useState(false)

  function handleEnableUpdate(forceUpdate: boolean) {
    setLoading(true)
    api.update(item.id, { ...item, forceUpdate }).then(_res => {
      setLoading(false)
      onChange(item)
    }).catch(() => setLoading(false))
  }

  return (
    <Switch
      checkedChildren="强制"
      unCheckedChildren="否"
      checked={item.forceUpdate}
      onChange={e => handleEnableUpdate(e)}
      loading={loading}
    />
  )
}
