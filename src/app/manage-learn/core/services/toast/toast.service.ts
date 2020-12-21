import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastCtrl: ToastController
  ) { }


  async openToast(msg, closeBtn?: string) {
    let toast = await this.toastCtrl.create({
      message: msg,
      duration: closeBtn ? 0 : 3000,
      position: 'bottom',
      closeButtonText: closeBtn,
      showCloseButton: closeBtn ? true : false
    });

    toast.present();
  }
}
