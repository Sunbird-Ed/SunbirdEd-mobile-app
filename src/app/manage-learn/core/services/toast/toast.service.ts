import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastCtrl: ToastController,
    private translate: TranslateService
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

  async showMessage(msg, color = 'success', icon?) {
    let text;
    this.translate.get([msg]).subscribe(data => {
      text = data;
    })
    const toast = await this.toastCtrl.create({
      message: text[msg],
      color: color,
      cssClass: 'custom-toast',
      duration: 5000,
      position: 'top',
      buttons: [
        {
          side: 'end',
          icon: icon,
          handler: () => {
          }
        }
      ]
    });
    toast.present();
  }
}
