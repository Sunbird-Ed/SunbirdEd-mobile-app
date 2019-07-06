import { Component } from '@angular/core';
// migration-TODO
// import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'sb-no-network-popup',
  templateUrl: 'sb-no-network-popup.component.html'
})
export class SbNoNetworkPopupComponent {
  sbPopoverHeading = '';
  sbPopoverMessage = '';

  constructor(
    // migration-TODO
    // private navParams: NavParams,
    // private viewCtrl: ViewController
    ) {
    this.initParams();
  }

  private initParams() {
    // migration-TODO
    // this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    // this.sbPopoverMessage = this.navParams.get('sbPopoverMessage');
  }

  closePopover() {
    // migration-TODO
    // this.viewCtrl.dismiss();
  }

}
