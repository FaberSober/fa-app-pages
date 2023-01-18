import { Fa } from '@fa/ui';

namespace App {
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
    /** 图标文件ID */
    iconId: string;
  }

  /** APP-APK版本表 */
  export interface ApkVersion extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 应用ID */
    appId: number;
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
  }
}

export default App;
