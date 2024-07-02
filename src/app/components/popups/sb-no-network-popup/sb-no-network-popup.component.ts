import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'sb-no-network-popup',
  templateUrl: 'sb-no-network-popup.component.html'
})
export class SbNoNetworkPopupComponent {
  sbPopoverHeading = '';
  sbPopoverMessage = '';

  constructor(private popoverCtrl: PopoverController) {
  }

  async closePopover() {
    await this.popoverCtrl.dismiss();
  }

}
