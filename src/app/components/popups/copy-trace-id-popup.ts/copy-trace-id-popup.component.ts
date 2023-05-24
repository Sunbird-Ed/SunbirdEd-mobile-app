import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

@Component({
  selector: 'app-copy-trace-id-popover',
  templateUrl: './copy-trace-id-popup.component.html'
})
export class CopyTraceIdPopoverComponent {

  traceId: string;

  constructor(
    private popOverCtrl: PopoverController,
    private socialSharing: SocialSharing,
    private navParams: NavParams
  ) { }

  ionViewWillEnter() {
    this.traceId = this.navParams.get('traceId');
  }

  async close() {
    await this.popOverCtrl.dismiss();
  }

  async copy(){
    await this.popOverCtrl.dismiss();
    await this.socialSharing.share(this.traceId);
  }

}
