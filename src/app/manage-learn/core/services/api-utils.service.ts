import { Injectable } from '@angular/core';
import { UtilityService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class ApiUtilsService {
  public assessmentBaseUrl: string;
  public projectsBaseUrl: string;

  constructor(
    private utility: UtilityService
  ) { }

  async initilizeML() {
    this.assessmentBaseUrl = !this.assessmentBaseUrl ? await this.utility.getBuildConfigValue("SURVEY_BASE_URL") : this.assessmentBaseUrl;
    this.projectsBaseUrl = !this.projectsBaseUrl ? await this.utility.getBuildConfigValue('PROJECTS_BASE_URL') : this.projectsBaseUrl;
  }

  getBaseUrl(key) {
    return this[key]
  }
}
