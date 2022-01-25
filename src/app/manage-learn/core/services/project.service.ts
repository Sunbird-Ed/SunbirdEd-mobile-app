import { Injectable } from '@angular/core';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { UnnatiDataService } from './unnati-data.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  filterForReport: any;

  constructor(
      private kendra :KendraApiService,
      private utils :UtilsService,
      private unnatiService: UnnatiDataService,
  ) {}
  async getTemplateBySoluntionId(id){
    let payload = await this.utils.getProfileInfo();
    const config = {
        url: urlConstants.API_URLS.TEMPLATE_DETAILS + id,
        payload: payload,
      };
      return this.kendra.post(config).toPromise();
  }
   getTemplateData(payload, id, targeted) {
    const config = {
      url: urlConstants.API_URLS.IMPORT_LIBRARY_PROJECT + id + '?isATargetedSolution=' + targeted,
      payload: payload,
    };
    return this.unnatiService.post(config).toPromise();
  }
}