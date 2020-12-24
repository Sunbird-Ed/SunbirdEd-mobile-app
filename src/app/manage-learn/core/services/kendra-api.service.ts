import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ApiService } from './api.service';
import { urlConstants } from '../constants/urlConstants';
import { ToastService } from './toast/toast.service';

@Injectable()
export class KendraApiService  extends ApiService {
  baseUrl: string;
  constructor(public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController

  ) {
    super(http, toast, modalController);
    this.baseUrl = urlConstants.SERVICES.KENDRA;
  }
}
