import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-copy-trace-id-popover',
  templateUrl: './copy-trace-id-popup.component.html'
})
export class CopyTraceIdPopoverComponent {

  isOnline = true;

  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }

  ionViewWillEnter() {
    this.isOnline = this.commonUtilService.networkInfo.isNetworkAvailable;
  }

  close() {
    this.popOverCtrl.dismiss();
  }

}
