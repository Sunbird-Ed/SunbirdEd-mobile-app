import { Component, OnInit, OnDestroy } from '@angular/core';
// migration-TODO
// import { ViewController } from '@ionic/angular';
import { Platform, NavParams, PopoverController } from '@ionic/angular';

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
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
    this.popOverCtrl.dismiss();
    // this.backButtonFunc.unsubscribe();
    });
  }

  selectOption(canDownload: boolean = false) {
    this.popOverCtrl.dismiss(canDownload);
  }

  closePopover() {
    this.popOverCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
}
