import { BaseApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.AppRelease, string> {
  matchWgtAppByFileId = (request: App.AppReleaseAutoMatchRequest): Promise<Fa.Ret<App.AppReleaseAutoMatchPreview>> =>
    this.post('matchWgtAppByFileId', request);

  createWgtDraftFromFile = (request: App.AppReleaseAutoMatchRequest): Promise<Fa.Ret<App.AppReleaseAutoMatchRet>> =>
    this.post('createWgtDraftFromFile', request, { timeout: -1 });

  createWgtDraftByWgt = (channel: string, releaseNote: string, file: File): Promise<Fa.Ret<App.AppReleaseAutoMatchRet>> => {
    const formData = new FormData();
    formData.append('channel', channel);
    formData.append('releaseNote', releaseNote);
    formData.append('file', file);
    return this.postForm<App.AppReleaseAutoMatchRet>('createWgtDraftByWgt', formData, { timeout: -1 });
  };

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
