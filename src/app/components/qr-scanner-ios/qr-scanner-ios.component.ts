import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qr-scanner-ios',
  templateUrl: './qr-scanner-ios.component.html',
  styleUrls: ['./qr-scanner-ios.component.scss'],
})
export class QrScannerIOSComponent {

  constructor(private modalCtrl: ModalController) { }

  ionViewWillEnter() {
    this.toggleQRScanner("add");
  }

  async closeModal() {
    await this.modalCtrl.dismiss();
  }

  private toggleQRScanner(action: "add" | "remove") {
    const mainContent = window.document.querySelector('ion-app>ion-split-pane');
    if (mainContent) {
      mainContent.classList[action]('hide');
    }
  }

  ionViewDidLeave() {
    this.toggleQRScanner("remove");
  }
}
