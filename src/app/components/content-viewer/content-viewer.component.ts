import { ModalController } from '@ionic/angular';
import {  Component, Input, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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

  ngOnInit() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    this.statusBar.hide();
  }

  ionViewWillLeave() {
    this.statusBar.show();
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  eventHandler(event) {
    if ((event === 'EXIT') || (event.edata && event.edata.type === 'EXIT')) {
      this.modalCtrl.dismiss();
    }
  }
}