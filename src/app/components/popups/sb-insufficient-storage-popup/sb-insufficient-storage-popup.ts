import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../../app/app.constant';

@Component({
  selector: 'sb-insufficient-storage-popup',
  templateUrl: 'sb-insufficient-storage-popup.html'
})
export class SbInsufficientStoragePopupComponent {
  sbPopoverHeading = '';
  sbPopoverMessage = '';

  constructor(private navParams: NavParams,
              private popoverCtrl: PopoverController,
              private router: Router) {
    this.initParams();
  }

   initParams() {
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMessage = this.navParams.get('sbPopoverMessage');
  }

  async closePopover() {
    await this.popoverCtrl.dismiss();
  }

  async navigateToStorageSettings() {
    await this.popoverCtrl.dismiss();
    await this.router.navigate([RouterLinks.STORAGE_SETTINGS]);
  }

}
