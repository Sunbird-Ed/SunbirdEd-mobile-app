import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { XwalkConstants } from '../../../../app/app.constant';
import { UtilityService } from '../../../../services/utility-service';
@Component({
  selector: 'app-dialog-popup',
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.scss'],
})
export class DialogPopupComponent {
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

  async close() {
    await this.popOverCtrl.dismiss();
  }

  async redirectToPlaystore() {
    await this.utilityService.openPlayStore(XwalkConstants.APP_ID);
  }
}
