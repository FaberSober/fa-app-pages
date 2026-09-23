import { BaseApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.AppRelease, string> {
  createWgtDraft = (appId: number, minSupportedVersionCode: string | undefined, releaseNote: string, file: File): Promise<Fa.Ret<App.AppRelease>> => {
    const formData = new FormData();
    formData.append('appId', String(appId));
    if (minSupportedVersionCode) formData.append('minSupportedVersionCode', minSupportedVersionCode);
    formData.append('releaseNote', releaseNote);
    formData.append('file', file);
    return this.postForm('createWgtDraft', formData, { timeout: -1 });
  };

  publish = (id: string): Promise<Fa.Ret<App.AppRelease>> => this.post(`publish/${id}`, {});

  revoke = (id: string): Promise<Fa.Ret<App.AppRelease>> => this.post(`revoke/${id}`, {});
}

export default new Api(GATE_APP.app.app, 'release');
