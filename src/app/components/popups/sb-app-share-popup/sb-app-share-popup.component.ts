import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { UtilityService } from '../../../../services/utility-service';
import { CommonUtilService } from '@app/services/common-util.service';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Platform, PopoverController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DeviceInfo } from 'sunbird-sdk';
import { ImpressionType, PageId, Environment, ID, InteractType, InteractSubtype } from '@app/services';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ShareMode, ShareItemType } from '@app/app/app.constant';

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
  pageId: string;

  constructor(
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    public popoverCtrl: PopoverController,
    private social: SocialSharing,
    private platform: Platform,
    private utilityService: UtilityService,
    private appVersion: AppVersion,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService) {
      this.pageId = this.navParams.get('pageId');
    }

  async ngOnInit() {
    this.generateShareClickTelemetry();
    this.generateImpressionTelemetry();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    const packageName = await this.appVersion.getPackageName();
    const utmParams = `&referrer=utm_source%3D${this.deviceInfo.getDeviceID()}%26utm_campaign%3Dshare_app`;
    this.shareUrl = `https://play.google.com/store/apps/details?id=${packageName}${utmParams}`;
    this.utilityService.getApkSize().then(async (fileSize) => {
      this.fileSize = Number(fileSize);
    }).catch(async (err) => {
    });
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SHARE_APP_POPUP,
      Environment.SETTINGS);
  }

  generateShareClickTelemetry() {
    this.telemetryGeneratorService.generateInteractTelemetry( ShareItemType.APP,
      '',
      Environment.SETTINGS,
      this.pageId,
      undefined, undefined, undefined, undefined,
      ID.SHARE);
  }

  generateConfirmClickTelemetry(shareMode) {
    this.telemetryGeneratorService.generateInteractTelemetry(shareMode,
      '',
      Environment.SETTINGS,
      PageId.SHARE_APP_POPUP,
      undefined, undefined, undefined, undefined,
      ID.SHARE_CONFIRM);
  }

  generateInteractTelemetry(interactionType, interactSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactionType, interactSubtype,
      PageId.SETTINGS,
      Environment.SETTINGS
    );
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  async shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    const appName = await this.appVersion.getAppName();
    const url = this.commonUtilService.translateMessage('SHARE_APP_LINK', {app_name: appName, play_store_url: this.shareUrl})
    this.social.share(null, null, null, url);
    this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
  }

  shareFile() {
    this.generateConfirmClickTelemetry(ShareMode.SEND);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    const shareParams = {
      byFile: true,
    };
    this.exportApk(shareParams);
    this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
  }

  saveFile() {
    this.generateConfirmClickTelemetry(ShareMode.SAVE);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    const shareParams = {
      saveFile: true,
    };
    this.exportApk(shareParams);
    this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
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
