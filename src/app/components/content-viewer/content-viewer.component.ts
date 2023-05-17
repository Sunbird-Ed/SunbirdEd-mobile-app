import { ModalController } from '@ionic/angular';
import {  Component, Input, OnInit } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

@Component({
    selector: "content-viewer",
    templateUrl: './content-viewer.component.html',
    styleUrls: ['./content-viewer.component.scss'],
})
export class ContentViewerComponent implements OnInit {
  @Input() playerConfig: any;

  constructor(
    private screenOrientation: ScreenOrientation,
    private statusBar: StatusBar,
    private modalCtrl: ModalController
  ) {
    
  }

  async ngOnInit() {
    await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    this.statusBar.hide();
  }

  async ionViewWillLeave() {
    this.statusBar.show();
    this.screenOrientation.unlock();
    await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  async eventHandler(event) {
    if ((event === 'EXIT') || (event.edata && event.edata.type === 'EXIT')) {
      await this.modalCtrl.dismiss();
    }
  }
}