import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { App } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<App.ApkVersion, number> {}

export default new Api(GATE_APP.app, 'apkVersion');
