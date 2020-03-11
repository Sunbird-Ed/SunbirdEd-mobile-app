import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { UtilityService } from '../../../../services/utility-service';
import { CommonUtilService } from '@app/services/common-util.service';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {Platform, PopoverController, NavParams, ToastController} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DeviceInfo } from 'sunbird-sdk';
import { ImpressionType, PageId, Environment, ID, InteractType, InteractSubtype } from '@app/services';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {ShareMode, ShareItemType, RouterLinks} from '@app/app/app.constant';
import {AndroidPermissionsService} from '../../../../services/android-permissions/android-permissions.service';
import {SbPopoverComponent} from '@app/app/components/popups';
import {Router} from '@angular/router';
import {AndroidPermission, AndroidPermissionsStatus} from '@app/services/android-permissions/android-permission';

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
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    public popoverCtrl: PopoverController,
    private social: SocialSharing,
    private platform: Platform,
    private utilityService: UtilityService,
    private appVersion: AppVersion,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private permissionService: AndroidPermissionsService,
    private router: Router,
    private toastController: ToastController,
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
    this.appName = await this.appVersion.getAppName();
    const url = '\n' + `Get ${this.appName} from the Play Store:` + '\n' + this.shareUrl;
    this.social.share(null, null, null, url);
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
        this.showSettingsPageToast();
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
        this.showSettingsPageToast();
      }
    });
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

  private async checkForPermissions(): Promise<boolean | undefined> {
    return new Promise < boolean | undefined>(async (resolve, reject) => {
      const permissionStatus = await this.getStoragePermissionStatus();

      if (permissionStatus.hasPermission) {
        resolve(true);
      } else if (permissionStatus.isPermissionAlwaysDenied) {
        this.showSettingsPageToast();
        reject(false);
      } else {
        this.showStoragePermissionPopup().then((result) => {
          if (result) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      }
    });
  }

  private async getStoragePermissionStatus(): Promise<AndroidPermissionsStatus> {
    return (
        await this.permissionService.checkPermissions([AndroidPermission.WRITE_EXTERNAL_STORAGE]).toPromise()
    )[AndroidPermission.WRITE_EXTERNAL_STORAGE];
  }

  private async showSettingsPageToast() {
    const toast = await this.toastController.create({
      message: this.commonUtilService.translateMessage('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName),
      cssClass: 'permissionSettingToast',
      showCloseButton: true,
      closeButtonText: this.commonUtilService.translateMessage('SETTINGS'),
      position: 'bottom',
      duration: 3000
    });

    toast.present();

    toast.onWillDismiss().then((res) => {
      if (res.role === 'cancel') {
        this.router.navigate([`/${RouterLinks.SETTINGS}/${RouterLinks.PERMISSION}`], { state: { changePermissionAccess: true } });
      }
    });

  }

  private async showStoragePermissionPopup(): Promise<boolean | undefined> {
    await this.popoverCtrl.dismiss();
    return new Promise<boolean | undefined>(async (resolve, reject) => {
      const confirm = await this.popoverCtrl.create({
        component: SbPopoverComponent,
        componentProps: {
          isNotShowCloseIcon: false,
          sbPopoverHeading: this.commonUtilService.translateMessage('PERMISSION_REQUIRED'),
          sbPopoverMainTitle: this.commonUtilService.translateMessage('FILE_MANAGER'),
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('NOT_NOW'),
              btnClass: 'popover-button-cancel',
            },
            {
              btntext: this.commonUtilService.translateMessage('ALLOW'),
              btnClass: 'popover-button-allow',
            }
          ],
          handler: (selectedButton: string) => {
            if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
              this.showSettingsPageToast();
            } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
              this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE)
                  .subscribe(async (status: AndroidPermissionsStatus) => {
                    if (status.hasPermission) {
                      resolve(true);
                    } else if (status.isPermissionAlwaysDenied) {
                      this.showSettingsPageToast();
                      reject(false);
                    } else {
                      this.showSettingsPageToast();
                    }
                    reject(undefined);
                  });
            }
          },
          img: {
            path: './assets/imgs/ic_folder_open.png',
          },
          metaInfo: this.commonUtilService.translateMessage('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName),
        },
        cssClass: 'sb-popover sb-popover-permissions primary dw-active-downloads-popover',
      });
      await confirm.present();
    });
  }
}
