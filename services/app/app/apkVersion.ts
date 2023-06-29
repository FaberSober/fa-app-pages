import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { App, Fa } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<App.ApkVersion, number> {

  /** 获取APP历史版本 */
  listByAppId = (params: { appId: number }): Promise<Fa.Ret<App.ApkVersion[]>> => this.post('listByAppId', params);

}

export default new Api(GATE_APP.app.app, 'apkVersion');
