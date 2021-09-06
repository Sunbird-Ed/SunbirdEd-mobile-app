import { Injectable , Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ApiService } from './api.service';
import { urlConstants } from '../constants/urlConstants';
import { ToastService } from './toast/toast.service';
import { AuthService, DeviceInfo,SharedPreferences } from 'sunbird-sdk';
import { ApiUtilsService } from './api-utils.service';
import { HTTP } from '@ionic-native/http/ngx';
import { UtilityService } from '@app/services/utility-service';


@Injectable({
  providedIn: 'root',
})
export class SunbirdService extends ApiService {
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
    super(http, toast, modalController, authService,deviceInfo,preferences, utils,ionicHttp);
    // this.baseUrl = this.utils.getBaseUrl('assessmentBaseUrl') + urlConstants.SERVICES.SUNBIRD;
    !this.baseUrl ? this.utilityService.getBuildConfigValue('BASE_URL').then((url) => (this.baseUrl = url)) :'';
  }
}