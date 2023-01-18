import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { App } from '@/types';
import { Fa } from "@fa/ui/src";

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<App.Apk, number> {

  /** 解析APK信息 */
  getApkInfo = (fileId: string): Promise<Fa.Ret<App.Apk>> => this.get(`getApkInfo/${fileId}`);

}

export default new Api(GATE_APP.app.app, 'apk');
