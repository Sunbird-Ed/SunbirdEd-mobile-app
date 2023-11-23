import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-copy-trace-id-popover',
  templateUrl: './copy-trace-id-popup.component.html'
})
export class CopyTraceIdPopoverComponent {

  traceId: string;

  constructor(
    private popOverCtrl: PopoverController,
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
    await Share.share({title: this.traceId});
  }

}
