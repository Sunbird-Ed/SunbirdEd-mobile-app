import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo,SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ToastService } from '.';
import { urlConstants } from '../constants/urlConstants';
import { ApiUtilsService } from './api-utils.service';
import { ApiService } from './api.service';
import { UtilityService } from '@app/services/utility-service';

@Injectable({
  providedIn: 'root',
})
export class DhitiApiService extends ApiService {
  baseUrl: string;
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences : SharedPreferences,
    private utilityService: UtilityService,

    private utils: ApiUtilsService,
        public ionicHttp:HTTP

  ) {
    super(http, toast, modalController, authService,deviceInfo,preferences,utils,ionicHttp);
    !this.baseUrl ? this.utilityService.getBuildConfigValue('BASE_URL').then((url) => (this.baseUrl = url)) :'';
  }
}
