import type { Fa } from '@fa/ui';

namespace App {
  export interface AppRelease extends Fa.BaseDelEntity {
    id: string;
    appId: number;
    versionName: string;
    versionCode: string;
    channel: string;
    status: 'DRAFT' | 'PUBLISHED' | 'REVOKED';
    forceUpdate: boolean;
    minSupportedVersionCode: string | null;
    rolloutPercent: number;
    targetDeviceIds: string | null;
    autoRollback: boolean;
    rollbackErrorThreshold: number;
    rollbackWindowMinutes: number;
    releaseNote: string | null;
    publishTime: string | null;
  }

  export interface AppReleasePackage extends Fa.BaseDelEntity {
    id: string;
    releaseId: string;
    platform: string;
    packageType: string;
    fileId: string;
    size: number;
    sha256: string;
  }

  /** Desktop 客户端应用 */
  export interface ClientApp extends Fa.BaseDelEntity {
    id: string;
    clientCode: string;
    name: string;
    identifier: string;
    enabled: boolean;
    remark: string;
  }

  /** Desktop 客户端版本发布记录 */
  export interface ClientRelease extends Fa.BaseDelEntity {
    id: string;
    clientId: string;
    versionName: string;
    versionCode: string;
    channel: string;
    status: string;
    releaseNotes: string;
    publishTime: string;
  }

  /** Desktop 客户端平台安装包 */
  export interface ClientReleaseArtifact extends Fa.BaseDelEntity {
    id: string;
    releaseId: string;
    platform: string;
    arch: string;
    fileId: string;
    fileName: string;
    size: number;
    sha256: string;
    signature: string;
  }

  /** APP-APK表 */
  export interface Apk extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 应用名称 */
    name: string;
    /** 应用包名 */
    applicationId: string;
    /** 当前版本号 */
    versionCode: string;
    /** 当前版本名称 */
    versionName: string;
    /** apk文件ID */
    fileId: string;
    /** 文件大小 */
    size: number;
    /** 下载次数 */
    downloadNum: number;
    /** 图标文件ID */
    iconId: string;
    /** 短链 */
    shortCode: string;
    /** 版本信息 */
    remark: string;
  }

  /** APP-APK版本表 */
  export interface ApkVersion extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 应用ID */
    appId: number;
    /** 应用名称 */
    name: string;
    /** 应用包名 */
    applicationId: string;
    /** 版本号 */
    versionCode: string;
    /** 版本名称 */
    versionName: string;
    /** 图标文件ID */
    iconId: string;
    /** APK文件ID */
    fileId: string;
    /** 文件大小 */
    size: number;
    /** 下载次数 */
    downloadNum: number;
    /** 强制更新 */
    forceUpdate: boolean;
    /** APK文件SHA-256摘要 */
    sha256: string | null;
    /** 版本信息 */
    remark: string;
  }

  /** APP-APK崩溃日志表 */
  export interface ApkCrash extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 应用ID */
    appId: number;
    /** 应用名称 */
    name: string;
    /** 应用包名 */
    applicationId: string;
    /** 版本号 */
    versionCode: number;
    /** 版本名称 */
    versionName: string;
    /** 错误日志 */
    message: string;
    /** 崩溃日志详情 */
    detail: string;
    /** 崩溃时间 */
    crashTime: string;
    /** rom信息 */
    romInfo: string;
    /** 设备厂商 */
    deviceManufacturer: string;
    /** 设备型号 */
    deviceModel: string;
    /** android版本 */
    androidVersion: number;
    /** sdk版本 */
    androidSdk: string;
  }
}

export default App;
