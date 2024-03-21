import { ModalController } from '@ionic/angular';
import {  Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

@Component({
    selector: "content-viewer",
    templateUrl: './content-viewer.component.html',
    styleUrls: ['./content-viewer.component.scss'],
})
export class ContentViewerComponent implements OnInit {
  @Input() playerConfig: any;
  @ViewChild('video') video: ElementRef | undefined;

  constructor(
    private modalCtrl: ModalController
  ) {
    
  }

  async ngOnInit() {
    await ScreenOrientation.lock({orientation: 'landscape'})
    StatusBar.hide()
  }

  async ionViewWillLeave() {
    StatusBar.show();
    await ScreenOrientation.unlock();
    await ScreenOrientation.lock({orientation: 'portrait'})
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