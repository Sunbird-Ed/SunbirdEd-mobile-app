import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonUtilService } from '@app/services';
@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-course-completion-popup.component.html',
  styleUrls: ['./sb-course-completion-popup.component.scss'],
})
export class CourseCompletionPopoverComponent {
  isCertified = false;
  isOnline = true;
  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }

  ionViewWillEnter() {
    this.isCertified = this.navParams.get('isCertified');
    this.isOnline = this.commonUtilService.networkInfo.isNetworkAvailable;
  }

  close() {
    this.popOverCtrl.dismiss();
  }

}
