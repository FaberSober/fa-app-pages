import { BaseApi } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App, Fa } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<App.ApkVersion, number> {

  /** 获取APP历史版本 */
  listByAppId = (params: { appId: number }): Promise<Fa.Ret<App.ApkVersion[]>> => this.post('listByAppId', params);

  /** 下载数加一 */
  addDownloadNum = (params: { id: number }): Promise<Fa.Ret<App.ApkVersion[]>> => this.post('addDownloadNum', params);

  publish = (id: number): Promise<Fa.Ret<App.ApkVersion>> => this.post(`publish/${id}`, {});

  revoke = (id: number): Promise<Fa.Ret<App.ApkVersion>> => this.post(`revoke/${id}`, {});

}

export default new Api(GATE_APP.app.app, 'apkVersion');
