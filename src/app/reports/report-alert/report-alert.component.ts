import { Component, OnInit , ViewEncapsulation } from '@angular/core';
import { NavParams, Platform, NavController, PopoverController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

export interface QRAlertCallBack {
  cancel(): any;
}

@Component({
  selector: 'app-report-alert',
  templateUrl: './report-alert.component.html',
  styleUrls: ['./report-alert.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportAlertComponent implements OnInit {

  callback: QRAlertCallBack;
  assessmentDetails: any;
  report = 'questions';
  private backButtonFunc: Subscription;

  constructor(
    navParams: NavParams,
    private navCtrl: NavController,
    private platform: Platform,
    private popOverCtrl: PopoverController,
    private location: Location
  ) {
    this.assessmentDetails = navParams.get('callback');
  }

  ngOnInit() { }

  cancel() {
    this.popOverCtrl.dismiss();
  }

  ionViewWillEnter() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.dismissPopup();
    });
  }

  ionViewWillLeave() {
    this.backButtonFunc.unsubscribe();
  }

  /**
   * It will Dismiss active popup
   */
  async dismissPopup() {
    console.log('Fired ionViewWillLeave');
    const activePopover = await this.popOverCtrl.getTop();

    if (activePopover) {
      await activePopover.dismiss();
    } else {
      this.location.back();

    }
  }

}
