import React, { useContext, useState } from 'react';
import { get } from 'lodash';
import { Button, Form, Input } from 'antd';
import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import { DragModal, FaHref, ApiEffectLayoutContext, FaUtils, CommonModalProps, UploadFileLocal } from '@fa/ui';
import { apkApi as api } from '@/services';
import { App } from '@/types';


/**
 * APP-APK表实体新增、编辑弹框
 */
export default function ApkModal({ children, title, record, fetchFinish, addBtn, editBtn, ...props }: CommonModalProps<App.Apk>) {
  const {loadingEffect} = useContext(ApiEffectLayoutContext)
  const [form] = Form.useForm();

  const [open, setOpen] = useState(false);

  /** 新增Item */
  function invokeInsertTask(params: any) {
    api.save(params).then((res) => {
      FaUtils.showResponse(res, '新增APK');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    })
  }

  /** 更新Item */
  function invokeUpdateTask(params: any) {
    api.update(params.id, params).then((res) => {
      FaUtils.showResponse(res, '更新APK');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    })
  }

  /** 提交表单 */
  function onFinish(fieldsValue: any) {
    const values = {
      ...fieldsValue,
      // birthday: getDateStr000(fieldsValue.birthday),
    };
    if (record) {
      invokeUpdateTask({ ...record, ...values });
    } else {
      invokeInsertTask({ ...values });
    }
  }

  function getInitialValues() {
    return {
      name: get(record, 'name'),
      applicationId: get(record, 'applicationId'),
      versionCode: get(record, 'versionCode'),
      versionName: get(record, 'versionName'),
      iconId: get(record, 'iconId'),
    }
  }

  function showModal() {
    setOpen(true)
    form.setFieldsValue(getInitialValues())
  }

  const loading = loadingEffect[api.getUrl('add')] || loadingEffect[api.getUrl('update')];
  return (
    <span>
      <span onClick={showModal}>
        {children}
        {addBtn && <Button icon={<PlusOutlined />} type="primary">新增</Button>}
        {editBtn && <FaHref icon={<EditOutlined />} text="编辑" />}
      </span>
      <DragModal
        title={title}
        open={open}
        onOk={() => form.submit()}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
        width={700}
        {...props}
      >
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={(cv) => {
            if (cv.apkFileId) {
              // 调用接口获取上传apk的文件信息
            }
          }}
        >
          <Form.Item name="apkFileId" label="选择APK" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <UploadFileLocal accept=".apk" />
          </Form.Item>
          <Form.Item name="name" label="应用名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="applicationId" label="应用包名" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="versionCode" label="当前版本号" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
          <Form.Item name="versionName" label="当前版本名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
          <Form.Item name="iconId" label="图标文件" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  )
}
