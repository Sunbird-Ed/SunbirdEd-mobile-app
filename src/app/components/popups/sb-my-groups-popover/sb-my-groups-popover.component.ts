import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { XwalkConstants } from '@app/app/app.constant';
import { UtilityService } from '@app/services/utility-service';
@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-my-groups-popover.component.html',
  styleUrls: ['./sb-my-groups-popover.component.scss'],
})
export class MyGroupsPopoverComponent {
  title: string;
  body: any;
  buttonText: string;
  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private utilityService: UtilityService
  ) { }

  ionViewWillEnter() {
    this.title = this.navParams.get('title');
    this.body = this.navParams.get('body');
    this.buttonText = this.navParams.get('buttonText');
  }

  close() {
    this.popOverCtrl.dismiss();
  }

  getStarted() {
    console.log('get started clicked');
    this.close();
  }
}
