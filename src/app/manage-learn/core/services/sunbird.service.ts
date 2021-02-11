import { Injectable , Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ApiService } from './api.service';
import { urlConstants } from '../constants/urlConstants';
import { ToastService } from './toast/toast.service';
import { AuthService } from 'sunbird-sdk';
import { ApiUtilsService } from './api-utils.service';


@Injectable({
  providedIn: 'root'
})
export class SunbirdService extends ApiService {
  baseUrl: string;
  constructor(public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private utils: ApiUtilsService
  ) {
    super(http, toast, modalController, authService, utils);
    this.baseUrl = this.utils.getBaseUrl('assessmentBaseUrl')  + urlConstants.SERVICES.SUNBIRD;
  }
}