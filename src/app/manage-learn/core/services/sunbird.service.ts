import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ApiService } from './api.service';
import { urlConstants } from '../constants/urlConstants';

@Injectable()
export class SunbirdService 
// extends ApiService 
{
  baseUrl: string;
  constructor(public http: HttpClient,
    // public auth: AuthService,
    // public toast: ToastMessageService,
    public modalController: ModalController
  ) {
    // super(http, auth, toast, modalController);
    this.baseUrl = urlConstants.SERVICES.SUNBIRD;
  }
}