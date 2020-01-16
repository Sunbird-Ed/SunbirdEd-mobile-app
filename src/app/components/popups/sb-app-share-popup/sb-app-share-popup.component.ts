import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { UtilityService } from '../../../../services/utility-service';
import { CommonUtilService } from '../../../../services/common-util.service';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FileService } from 'sunbird-sdk/dist/util/file/def/file-service';
import { DeviceInfo } from 'sunbird-sdk';

@Component({
  selector: 'app-sb-share-popup',
  templateUrl: './sb-app-share-popup.component.html',
  styleUrls: ['./sb-app-share-popup.component.scss'],
})
export class SbAppSharePopupComponent implements OnInit, OnDestroy {

  backButtonFunc: Subscription;
  shareOptions = {
    link: {
      name: 'SHARE_LINK',
      value: 'link'
    },
    file: {
      name: 'SEND_FILE',
      value: 'file'
    },
    save: {
      name: 'SAVE_FILE_ON_DEVICE',
      value: 'save'
    }
  };
  shareType: string;
  shareUrl: string;
  filePath: string;
  fileSize = 0;

  constructor(
    @Inject('CONTENT_SERVICE') private fileService: FileService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    public popoverCtrl: PopoverController,
    private social: SocialSharing,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private utilityService: UtilityService,
    private appVersion: AppVersion) { }

  async ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    const packageName = await this.appVersion.getPackageName();
    const utmParams = `&referrer=utm_source%3D${this.deviceInfo.getDeviceID()}%26utm_campaign%3Dshareapp`;
    this.shareUrl = `https://play.google.com/store/apps/details?id=${packageName}${utmParams}`;
    this.utilityService.getApkSize().then(async (fileSize) => {
      this.fileSize = Number(fileSize);
    }).catch(async (err) => {
    });
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  shareLink() {
    this.social.share(null, null, null, this.shareUrl);
    this.popoverCtrl.dismiss();
  }

  shareFile() {
    const shareParams = {
      byFile: true,
    };
    this.exportApk(shareParams);
    this.popoverCtrl.dismiss();
  }

  saveFile() {
    const shareParams = {
      saveFile: true,
    };
    this.exportApk(shareParams);
    this.popoverCtrl.dismiss();
  }

  async exportApk(shareParams): Promise<void> {
    let destination = '';
    if (shareParams.saveFile) {
      destination = cordova.file.externalRootDirectory + 'Download/';
    }
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.utilityService.exportApk(destination).then(async (output) => {
      if (shareParams.byFile) {
        this.social.share('', '', 'file://' + output, '');
      } else {
        this.commonUtilService.showToast('FILE_SAVED', '', 'green-toast');
      }
      await loader.dismiss();
    }).catch(async (err) => {
      await loader.dismiss();
    });
  }
}
