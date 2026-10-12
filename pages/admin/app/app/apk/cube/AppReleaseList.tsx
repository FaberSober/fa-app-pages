import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AuthDelBtn, BaseBizTable, BaseTableUtils, clearForm, type FaberTable, FaHref, FaUtils, fileSaveApi, useDelete, useTableQueryParams } from '@fa/ui';
import { Alert, Button, Form, Input, Modal, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { appReleaseApi as api, appReleasePackageApi } from '@/services';
import type { App } from '@/types';
import AppReleaseModal from '../modal/AppReleaseModal';
import WgtReleaseCreateModal from '../modal/WgtReleaseCreateModal';
import WgtUploadModal from '../modal/WgtUploadModal';

export default function AppReleaseList({ app }: { app: App.Apk }) {
  const [form] = Form.useForm();
  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<App.AppRelease>(api.page, { extraParams: { appId: app.id } }, '客户端更新发布');
  const [handleDelete] = useDelete<string>(api.remove, fetchPageList, 'APP 发布草稿');
  const [actionLoading, setActionLoading] = useState(false);
  const [packagesByRelease, setPackagesByRelease] = useState<Record<string, App.AppReleasePackage[] | null>>({});

  useEffect(() => {
    setExtraParams({ appId: app.id });
  }, [app.id]);

  useEffect(() => {
    let cancelled = false;
    setPackagesByRelease({});
    Promise.allSettled(list.map((release) => appReleasePackageApi.byRelease(release.id))).then((results) => {
      if (cancelled) return;
      const packages: Record<string, App.AppReleasePackage[] | null> = {};
      results.forEach((result, index) => {
        packages[list[index].id] = result.status === 'fulfilled' && result.value.code === 200 ? result.value.data : null;
      });
      setPackagesByRelease(packages);
    });
    return () => {
      cancelled = true;
    };
  }, [list]);

  function getWgtPackage(record: App.AppRelease) {
    return packagesByRelease[record.id]?.find((item) => item.packageType === 'WGT' && item.platform === record.platform);
  }

  function handlePublish(record: App.AppRelease) {
    appReleasePackageApi.byRelease(record.id).then((res) => {
      const packages = res.data;
      Modal.confirm({
        title: `发布 ${app.name} 资源版本 ${record.versionName}？`,
        content: (
          <div>
            <p>
              目标资源版本：{record.versionName}（{record.versionCode}）；渠道：{record.channel}；灰度比例：{record.rolloutPercent}%
            </p>
            <p>最低兼容 APK：{record.minSupportedVersionCode ? `≥ ${record.minSupportedVersionCode}` : '不限'}</p>
            <p>
              运行时：{record.runtimeType}；平台：{record.platform}
            </p>
            {record.nativeBaseReportFileId && <p>原生基座报告：{record.nativeBaseReportFileId}</p>}
            {packages.map((item) => (
              <p key={item.id}>
                {item.packageType === 'WGT' ? 'WGT 热更新' : item.packageType}
                {` · ${FaUtils.sizeToHuman(item.size)} · SHA-256 ${item.sha256}`}
              </p>
            ))}
            {packages.length === 0 && <p>尚未上传发布包，服务端将拒绝发布。</p>}
            {record.minSupportedVersionCode && <p>低于最低兼容 APK 版本的客户端不会收到此 WGT。</p>}
          </div>
        ),
        onOk: () => {
          setActionLoading(true);
          return api
            .publish(record.id)
            .then((result) => {
              FaUtils.showResponse(result, '发布 APP 版本');
              fetchPageList();
            })
            .finally(() => setActionLoading(false));
        },
      });
    });
  }

  function handleRevoke(record: App.AppRelease) {
    Modal.confirm({
      title: `撤回 ${app.name} ${record.versionName}？`,
      content: '撤回后客户端检查接口将不再下发此版本。',
      onOk: () => {
        setActionLoading(true);
        return api
          .revoke(record.id)
          .then((res) => {
            FaUtils.showResponse(res, '撤回 APP 版本');
            fetchPageList();
          })
          .finally(() => setActionLoading(false));
      },
    });
  }

  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 80, sorter),
      BaseTableUtils.genSimpleSorterColumn('目标资源编码', 'versionCode', 140, sorter),
      BaseTableUtils.genSimpleSorterColumn('目标资源名称', 'versionName', 140, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('最低兼容 APK', 'minSupportedVersionCode', 140, sorter),
        render: (value: string | null) => (value ? `≥ ${value}` : '不限'),
      },
      BaseTableUtils.genSimpleSorterColumn('渠道', 'channel', 100, sorter),
      BaseTableUtils.genSimpleSorterColumn('运行时', 'runtimeType', 160, sorter),
      BaseTableUtils.genSimpleSorterColumn('平台', 'platform', 100, sorter),
      {
        title: 'WGT 文件',
        dataIndex: 'wgtFile',
        width: 130,
        render: (_: unknown, record: App.AppRelease) => {
          const file = getWgtPackage(record);
          if (file) {
            return (
              <a href={fileSaveApi.genLocalGetFile(file.fileId)} target="_blank" rel="noreferrer">
                下载 WGT
              </a>
            );
          }
          if (packagesByRelease[record.id] === undefined) return '加载中…';
          if (packagesByRelease[record.id] === null) return <FaHref text="加载失败，重试" onClick={() => fetchPageList()} />;
          return '未上传';
        },
      },
      {
        title: '文件大小',
        dataIndex: 'wgtSize',
        width: 110,
        render: (_: unknown, record: App.AppRelease) => {
          const file = getWgtPackage(record);
          return file ? FaUtils.sizeToHuman(file.size) : '-';
        },
      },
      {
        title: 'SHA-256',
        dataIndex: 'wgtSha256',
        width: 210,
        render: (_: unknown, record: App.AppRelease) => {
          const sha256 = getWgtPackage(record)?.sha256;
          return sha256 ? (
            <Typography.Text title={sha256} copyable={{ text: sha256 }}>
              {sha256.slice(0, 16)}…
            </Typography.Text>
          ) : (
            '-'
          );
        },
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('状态', 'status', 100, sorter),
        render: (value: App.AppRelease['status']) => (
          <Tag color={value === 'PUBLISHED' ? 'green' : value === 'REVOKED' ? 'red' : 'default'}>
            {value === 'PUBLISHED' ? '已发布' : value === 'REVOKED' ? '已撤回' : '草稿'}
          </Tag>
        ),
      },
      BaseTableUtils.genTimeSorterColumn('发布时间', 'publishTime', 170, sorter),
      BaseTableUtils.genEllipsisSorterColumn('更新说明', 'releaseNote', 200, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_: unknown, record: App.AppRelease) => (
          <Space>
            {record.status === 'DRAFT' && packagesByRelease[record.id]?.length === 0 && <WgtUploadModal release={record} fetchFinish={fetchPageList} />}
            {record.status === 'DRAFT' && <AppReleaseModal editBtn title="编辑发布草稿" record={record} appId={app.id} fetchFinish={fetchPageList} />}
            {record.status === 'DRAFT' && <FaHref icon={<CheckCircleOutlined />} text="发布" disabled={actionLoading} onClick={() => handlePublish(record)} />}
            {record.status === 'PUBLISHED' && (
              <FaHref icon={<CloseCircleOutlined />} text="撤回" color="red" disabled={actionLoading} onClick={() => handleRevoke(record)} />
            )}
            {record.status === 'DRAFT' && <AuthDelBtn handleDelete={() => handleDelete(record.id)} />}
          </Space>
        ),
        width: 280,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<App.AppRelease>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}>
        <Space>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="versionName" label="资源版本">
              <Input placeholder="目标资源版本名称" />
            </Form.Item>
            <Form.Item name="channel" label="渠道">
              <Input placeholder="stable" />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 110 }}
                options={[
                  { label: '草稿', value: 'DRAFT' },
                  { label: '已发布', value: 'PUBLISHED' },
                  { label: '已撤回', value: 'REVOKED' },
                ]}
              />
            </Form.Item>
          </Form>
          <Button onClick={() => form.submit()}>查询</Button>
          <Button onClick={() => clearForm(form)}>重置</Button>
          <WgtReleaseCreateModal app={app} fetchFinish={fetchPageList} />
        </Space>
      </div>
      <Alert
        type="info"
        showIcon
        style={{ margin: '0 8px 8px' }}
        title="上传 WGT 后自动关联文件并读取资源版本，可在列表直接下载和查看摘要。APK 安装包历史在“APK 安装包”中管理。"
      />
      <BaseBizTable
        rowKey="id"
        biz="app_release"
        columns={genColumns()}
        pagination={paginationProps}
        loading={loading}
        dataSource={list}
        onChange={handleTableChange}
        refreshList={() => fetchPageList()}
        onSceneChange={(value) => setSceneId(value)}
        onConditionChange={(values) => setConditionList(values)}
      />
    </div>
  );
}
