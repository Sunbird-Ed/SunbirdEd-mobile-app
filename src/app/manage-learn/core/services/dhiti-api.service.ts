import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastService } from '.';
import { urlConstants } from '../constants/urlConstants';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DhitiApiService extends ApiService {
   baseUrl: string;
  constructor(public http: HttpClient, public toast: ToastService, public modalController: ModalController) {
    super(http, toast, modalController);
    this.baseUrl = urlConstants.SERVICES.DHITI;
  }
}
