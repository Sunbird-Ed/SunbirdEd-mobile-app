import { ModalController } from '@ionic/angular';
import {  Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

@Component({
    selector: "content-viewer",
    templateUrl: './content-viewer.component.html',
    styleUrls: ['./content-viewer.component.scss'],
})
export class ContentViewerComponent implements OnInit {
  @Input() playerConfig: any;
  @ViewChild('video') video: ElementRef | undefined;

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


  playWebVideoContent() {
    if (this.playerConfig) {
      const playerConfigData: any = {
        context: this.playerConfig.context,
        config: this.playerConfig.config,
        metadata: this.playerConfig.metadata
      };

      const videoElement = document.createElement('sunbird-video-player');

      videoElement.setAttribute('player-config', JSON.stringify(playerConfigData));
      videoElement.addEventListener('playerEvent', (event: any) => {
        if (event && event.detail) {
          this.eventHandler(event.detail);
        }
      });
      videoElement.addEventListener('telemetryEvent', (event: any) => {
        console.log('video player telemetryEvent', event.detail);
      });

      this.video?.nativeElement.append(videoElement);
    }
  }
}