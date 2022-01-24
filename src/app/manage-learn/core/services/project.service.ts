import { Injectable } from '@angular/core';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  filterForReport: any;

  constructor(
      private kendra :KendraApiService,
      private utils :UtilsService
  ) {}
  async getTemplateBySoluntionId(id){
    let payload = await this.utils.getProfileInfo();
    const config = {
        url: urlConstants.API_URLS.TEMPLATE_DETAILS + id,
        payload: payload,
      };
      return this.kendra.post(config).toPromise();
  }
}