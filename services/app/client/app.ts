import { BaseApi } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.ClientApp, string> {}

export default new Api(GATE_APP.app.client, 'app');
