import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { XwalkConstants } from '@app/app/app.constant';
import { UtilityService } from '@app/services/utility-service';
import { CommonUtilService } from '@app/services';
@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-my-groups-popover.component.html',
  styleUrls: ['./sb-my-groups-popover.component.scss'],
})
export class MyGroupsPopoverComponent {
  title: string;
  body: any;
  buttonText: string;
  isFromAddMember = false;
  appName: string;
  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }

  ionViewWillEnter() {
    this.title = this.navParams.get('title');
    this.body = this.navParams.get('body');
    this.buttonText = this.navParams.get('buttonText');
    this.isFromAddMember = this.navParams.get('isFromAddMember');
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  close() {
    this.popOverCtrl.dismiss();
  }

  getStarted() {
    console.log('get started clicked');
    this.close();
  }
}
