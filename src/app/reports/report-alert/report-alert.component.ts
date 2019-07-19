import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, Platform, NavController, PopoverController } from '@ionic/angular';
import { Location } from '@angular/common';

export interface QRAlertCallBack {
  cancel(): any;
}

@Component({
  selector: 'app-report-alert',
  templateUrl: './report-alert.component.html',
  styleUrls: ['./report-alert.component.scss'],
})
export class ReportAlertComponent implements OnInit {

  callback: QRAlertCallBack;
  assessmentDetails: any;
  report = 'questions';

  constructor(
    navParams: NavParams,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private popOverCtrl: PopoverController,
    private location: Location
  ) {
    this.callback = navParams.get('callback');
    this.assessmentDetails = this.callback['row'];
  }

  ngOnInit() { }

  cancel() {
    this.modalCtrl.dismiss();
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(11, () => {
      this.dismissPopup();
    });
  }

  ionViewWillLeave() {
    this.platform.backButton.unsubscribe();
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
      // Migration todo
      // this.navCtrl.pop();
      this.location.back();

    }
  }

}