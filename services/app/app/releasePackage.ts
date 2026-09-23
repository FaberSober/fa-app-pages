import { BaseApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';
import type { App } from '@/types';

class Api extends BaseApi<App.AppReleasePackage, string> {
  byRelease = (releaseId: string): Promise<Fa.Ret<App.AppReleasePackage[]>> => this.get(`byRelease/${releaseId}`);

  uploadWgt = (releaseId: string, file: File): Promise<Fa.Ret<App.AppReleasePackage>> => {
    const formData = new FormData();
    formData.append('releaseId', releaseId);
    formData.append('file', file);
    return this.postForm('uploadWgt', formData, { timeout: -1 });
  };
}

export default new Api(GATE_APP.app.app, 'releasePackage');
