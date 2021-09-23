import { Component, OnDestroy, OnInit } from '@angular/core';
import { ShareItemType, ShareMode } from '@app/app/app.constant';
import { Environment, ID, ImpressionType, InteractSubtype, InteractType, PageId } from '@app/services';
import { AndroidPermission, AndroidPermissionsStatus } from '@app/services/android-permissions/android-permission';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AndroidPermissionsService } from '../../../../services/android-permissions/android-permissions.service';
import { UtilityService } from '../../../../services/utility-service';

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
  appName = '';

  constructor(
    public popoverCtrl: PopoverController,
    private social: SocialSharing,
    public platform: Platform,
    private utilityService: UtilityService,
    private appVersion: AppVersion,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private permissionService: AndroidPermissionsService,
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
    this.appName = await this.appVersion.getAppName();
    const utmParams = `&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app`;
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
    this.telemetryGeneratorService.generateInteractTelemetry(ShareItemType.APP,
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
      PageId.SHARE_APP_POPUP,
      Environment.SETTINGS
    );
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.CLOSE_CLICKED);
    this.popoverCtrl.dismiss();
  }

  async shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    const appName = await this.appVersion.getAppName();
    const url = this.commonUtilService.translateMessage('SHARE_APP_LINK', { app_name: appName, play_store_url: this.shareUrl });
    if(this.platform.is('ios')) {
      this.social.share(null, null, null, this.shareUrl);
    } else {
      this.social.share(null, null, null, url);
    }
    
    this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
  }

  async shareFile() {
    await this.checkForPermissions().then((result) => {
      if (result) {
        this.generateConfirmClickTelemetry(ShareMode.SEND);
        this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
        const shareParams = {
          byFile: true,
        };
        this.exportApk(shareParams);
        this.popoverCtrl.dismiss();
        this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
      } else {
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
      }
    });
  }

  async saveFile() {
    await this.checkForPermissions().then((result) => {
      if (result) {
        this.generateConfirmClickTelemetry(ShareMode.SAVE);
        this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
        const shareParams = {
          saveFile: true,
        };
        this.exportApk(shareParams);
        this.popoverCtrl.dismiss();
        this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
      } else {
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
      }
    });
  }

  async exportApk(shareParams): Promise<void> {
    let destination = '';
    if (shareParams.saveFile) {
      const folderPath = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.externalRootDirectory 
      destination = folderPath + 'Download/';
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

  private async checkForPermissions(): Promise<boolean | undefined> {
    if(this.platform.is('ios')) {
      return new Promise<boolean | undefined>(async (resolve, reject) => {
        resolve(true);
      });
    }
    return new Promise<boolean | undefined>(async (resolve, reject) => {
      const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.WRITE_EXTERNAL_STORAGE);

      if (permissionStatus.hasPermission) {
        resolve(true);
      } else if (permissionStatus.isPermissionAlwaysDenied) {
        await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
        resolve(false);
      } else {
        this.showStoragePermissionPopup().then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }
  private async showStoragePermissionPopup(): Promise<boolean | undefined> {
    await this.popoverCtrl.dismiss();
    return new Promise<boolean | undefined>(async (resolve, reject) => {
      const confirm = await this.commonUtilService.buildPermissionPopover(
        async (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.NOT_NOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.ALLOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE)
              .subscribe(async (status: AndroidPermissionsStatus) => {
                if (status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.APP_PERMISSION_POPUP
                  );
                  resolve(true);
                } else if (status.isPermissionAlwaysDenied) {
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
                  resolve(false);
                } else {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.DENY_CLICKED,
                    Environment.SETTINGS,
                    PageId.APP_PERMISSION_POPUP
                  );
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
                }
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', this.pageId, true
      );
      await confirm.present();
    });
  }
}
