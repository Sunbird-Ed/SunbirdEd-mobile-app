import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo } from '@project-sunbird/sunbird-sdk';
import { ToastService, UtilsService } from '.';
import { urlConstants } from '../constants/urlConstants';
import { ApiUtilsService } from './api-utils.service';
import { ApiService } from './api.service';

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

    private utils: ApiUtilsService
  ) {
    super(http, toast, modalController, authService,deviceInfo, utils);
    this.baseUrl = this.utils.getBaseUrl('assessmentBaseUrl') + urlConstants.SERVICES.DHITI;
  }
}
