import { Injectable } from '@angular/core';
import { CommonUtilService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class ApiUtilsService {
  public assessmentBaseUrl: string;
  public projectsBaseUrl: string;
  public appVersion;
  public appName;

  constructor(
    private commonUtilService: CommonUtilService,

  ) { }

  async initilizeML() {
    this.appName = !this.appName ? await this.commonUtilService.getAppName() : this.appName
  }

  getBaseUrl(key) {
    return this[key]
  }
}
