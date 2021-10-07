import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastService } from '.';
import { urlConstants } from '../constants/urlConstants';
import { ApiService } from './api.service';
import { AuthService, DeviceInfo,SharedPreferences } from 'sunbird-sdk';
import { ApiUtilsService } from './api-utils.service';
import { HTTP } from '@ionic-native/http/ngx';
import { UtilityService } from '@app/services/utility-service';

@Injectable({
  providedIn: 'root',
})
export class AssessmentApiService extends ApiService {
  baseUrl: string;
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences : SharedPreferences,
    private utils: ApiUtilsService,
    public ionicHttp:HTTP,
    private utilityService: UtilityService,
  ) {
    super(http, toast, modalController, authService, deviceInfo,preferences, utils,ionicHttp);
    !this.baseUrl ? this.utilityService.getBuildConfigValue('BASE_URL').then((url) => (this.baseUrl = url)) :'';
  }
}
