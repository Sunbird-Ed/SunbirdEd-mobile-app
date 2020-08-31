import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-course-completion-popup.component.html'
})
export class CourseCompletionPopoverComponent {

  isCertified = false;
  isOnline = true;
  certificateDescription = '';

  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }

  ionViewWillEnter() {
    this.isCertified = this.navParams.get('isCertified');
    this.certificateDescription = this.navParams.get('certificateDescription');
    this.isOnline = this.commonUtilService.networkInfo.isNetworkAvailable;
  }

  close() {
    this.popOverCtrl.dismiss();
  }

}
