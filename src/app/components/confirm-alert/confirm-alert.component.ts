import { Component, OnDestroy } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-alert',
  templateUrl: './confirm-alert.component.html',
  styleUrls: ['./confirm-alert.component.scss'],
})
export class ConfirmAlertComponent implements OnDestroy {
  sbPopoverHeading: any;
  sbPopoverMainTitle: any;
  sbPopoverContent: any;
  actionsButtons: any;
  icon: any;
  metaInfo: any;
  isUpdateAvail: any;
  contentSize: any;
  backButtonFunc: any;
  constructor(
    public platform: Platform,
    public navParams: NavParams,
    public popOverCtrl: PopoverController) {
    this.actionsButtons = this.navParams.get('actionsButtons');
    this.icon = this.navParams.get('icon');
    this.metaInfo = this.navParams.get('metaInfo');
    this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');
    this.isUpdateAvail = this.navParams.get('isUpdateAvail');
    this.contentSize = this.navParams.get('contentSize');
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popOverCtrl.dismiss();
    });
  }

  async selectOption(canDownload: boolean = false) {
    await this.popOverCtrl.dismiss(canDownload);
  }

  async closePopover() {
    await this.popOverCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
}
