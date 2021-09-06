import { Injectable } from '@angular/core';
import { CommonUtilService, UtilityService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class ApiUtilsService {
  public assessmentBaseUrl: string;
  public projectsBaseUrl: string;
  public appVersion;
  public appName;

  constructor(
    private utility: UtilityService,
    private commonUtilService: CommonUtilService,

  ) { }

  async initilizeML() {
    this.projectsBaseUrl = !this.projectsBaseUrl ? await this.utility.getBuildConfigValue('PROJECTS_BASE_URL') : this.projectsBaseUrl;
    this.appName = !this.appName ? await this.commonUtilService.getAppName() : this.appName
  }

  getBaseUrl(key) {
    return this[key]
  }
}
