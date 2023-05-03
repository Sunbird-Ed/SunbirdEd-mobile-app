import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

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

  close() {
    this.popOverCtrl.dismiss();
  }

  copy(){
    this.popOverCtrl.dismiss();
    this.socialSharing.share(this.traceId);
  }

}
