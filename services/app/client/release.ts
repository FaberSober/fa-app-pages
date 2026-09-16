import { BaseApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.ClientRelease, string> {
  publish = (id: string): Promise<Fa.Ret<App.ClientRelease>> => this.post(`publish/${id}`, {});

  revoke = (id: string): Promise<Fa.Ret<App.ClientRelease>> => this.post(`revoke/${id}`, {});

  current = (clientId: string): Promise<Fa.Ret<App.ClientRelease | null>> => this.get(`current/${clientId}`);
}

export default new Api(GATE_APP.app.client, 'release');
