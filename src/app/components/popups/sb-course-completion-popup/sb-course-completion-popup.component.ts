import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonUtilService } from '../../../../services/common-util.service';

@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-course-completion-popup.component.html'
})
export class CourseCompletionPopoverComponent {

  isCertified = false;
  isOnline = true;
  certificateDescription = '';
  course;

  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }

  ionViewWillEnter() {
    this.isCertified = this.navParams.get('isCertified');
    this.certificateDescription = this.navParams.get('certificateDescription');
    this.isOnline = this.commonUtilService.networkInfo.isNetworkAvailable;
    this.course = this.navParams.get('course');
  }

  async close() {
    await this.popOverCtrl.dismiss();
  }

}
