import { Component, Input } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-qrscanner-alert',
  templateUrl: './qrscanner-alert.page.html',
  styleUrls: ['./qrscanner-alert.page.scss'],
})
export class QRScannerAlert {

  skipKey = 'SKIP';
  unregisterBackButton = undefined;

  showOnlyPrimaryBtn = false;

  @Input("callback") callback: QRAlertCallBack;
  @Input("invalidContent") invalidContent = false;
  @Input("messageKey") messageKey = 'UNKNOWN_QR';
  @Input("tryAgainKey") tryAgainKey = 'TRY_AGAIN';
  @Input("icon") icon = './assets/imgs/ic_coming_soon.png';
  @Input("cancelKey") cancelKey = 'CANCEL';

  constructor(public platform: Platform) {

    if (this.cancelKey === 'hide') {
      this.showOnlyPrimaryBtn = true;
      this.cancelKey = undefined;
    }

  }  

  tryAgain() {
    if (this.callback) {
      this.callback.tryAgain();
    }
  }

  cancel() {
    if (this.callback) {
      this.callback.cancel();
    }
  }
}

export interface QRAlertCallBack {
  tryAgain(): any;
  cancel(): any;
}
