import React from 'react';
import { App } from "@features/fa-app-pages/types";
import { Descriptions } from "antd";


export interface ApkCrashViewProps {
  apkCrash: App.ApkCrash
}

/**
 * @author xu.pengfei
 * @date 2023/1/20 15:59
 */
export default function ApkCrashView({apkCrash}: ApkCrashViewProps) {
  return (
    <Descriptions bordered column={1} labelStyle={{ width: 120 }}>
      <Descriptions.Item label="应用名称">{apkCrash.name}</Descriptions.Item>
      <Descriptions.Item label="崩溃日志详情">{apkCrash.detail}</Descriptions.Item>
    </Descriptions>
  )
}