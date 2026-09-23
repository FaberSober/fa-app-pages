import { BaseApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.AppRelease, string> {
  publish = (id: string): Promise<Fa.Ret<App.AppRelease>> => this.post(`publish/${id}`, {});

  revoke = (id: string): Promise<Fa.Ret<App.AppRelease>> => this.post(`revoke/${id}`, {});
}

export default new Api(GATE_APP.app.app, 'release');
