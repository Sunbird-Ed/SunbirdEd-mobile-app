import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-course-completion-popup.component.html',
  styleUrls: ['./sb-course-completion-popup.component.scss'],
})
export class CourseCompletionPopoverComponent {
  isCertified: false;
  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams
  ) { }

  ionViewWillEnter() {
    this.isCertified = this.navParams.get('isCertified');
  }

  close() {
    this.popOverCtrl.dismiss();
  }

}
