import { Component, OnDestroy, OnInit } from '@angular/core';
import { ShareItemType, ShareMode } from '../../../../app/app.constant';
import { Environment, ID, ImpressionType, InteractSubtype, InteractType, PageId } from '../../../../services/telemetry-constants';
import { AndroidPermission, AndroidPermissionsStatus } from '../../../../services/android-permissions/android-permission';
import { CommonUtilService } from '../../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AndroidPermissionsService } from '../../../../services/android-permissions/android-permissions.service';
import { UtilityService } from '../../../../services/utility-service';
import { FilePathService } from '../../../../services/file-path/file.service';
import { FilePaths } from '../../../../services/file-path/file';
@Component({
    selector: 'app-sb-share-popup',
    templateUrl: './sb-app-share-popup.component.html',
    styleUrls: ['./sb-app-share-popup.component.scss'],
    standalone: false
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
    public platform: Platform,
    private utilityService: UtilityService,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private permissionService: AndroidPermissionsService,
    private filePathService: FilePathService,
    private commonUtilService: CommonUtilService) {
    this.pageId = this.navParams.get('pageId');
  }

  async ngOnInit() {
    this.generateShareClickTelemetry();
    this.generateImpressionTelemetry();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    const packageName = await (await App.getInfo()).id;
    this.appName = await (await App.getInfo()).name;
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

  async closePopover() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.CLOSE_CLICKED);
    await this.popoverCtrl.dismiss();
  }

  async shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    const appName = await (await App.getInfo()).name;
    const title = this.commonUtilService.translateMessage('SHARE_APP_LINK', { app_name: appName, play_store_url: this.shareUrl });
    if ((await Share.canShare()).value) {
      if (this.platform.is('ios')) {
        await Share.share({ url: this.shareUrl });
      } else {
        await Share.share({ title: title, url: this.shareUrl });
      }
    }

    await this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
  }

  async shareFile() {
    const shareParams = {
      byFile: true,
    };
    if (await this.commonUtilService.isAndroidVer13()) {
      await this.handleSaveShareFile(ShareMode.SEND, shareParams);
    } else {
      await this.checkForPermissions().then(async (result) => {
        if (result) {
          await this.handleSaveShareFile(ShareMode.SEND, shareParams);
        } else {
          await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
        }
      });
    }
  }

  async handleSaveShareFile(mode, shareParams) {
    this.generateConfirmClickTelemetry(mode);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);
    await this.exportApk(shareParams);
    await this.popoverCtrl.dismiss();
    this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
  }

  async saveFile() {
    const shareParams = {
      saveFile: true,
    };
    if (await this.commonUtilService.isAndroidVer13()) {
      await this.handleSaveShareFile(ShareMode.SAVE, shareParams);
    } else {
      await this.checkForPermissions().then(async (result) => {
        if (result) {
          await this.handleSaveShareFile(ShareMode.SAVE, shareParams);
        } else {
          await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
        }
      });
    }
  }

  async exportApk(shareParams): Promise<void> {
    let destination = '';
    if (shareParams.saveFile) {
      const filePath = this.platform.is('ios') ?FilePaths.DOCUMENTS:FilePaths.EXTERNAL_STORAGE
      const folderPath = await this.filePathService.getFilePath(filePath)
            destination = folderPath + 'Download/';
    }

    console.log('destination in sb-app-share-popup', destination);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.utilityService.exportApk(destination).then(async (output) => {
      if (shareParams.byFile) {
        if ((await Share.canShare()).value) {
          await Share.share({ files: ['file://' + output] })
          console.log('output in sb-app-share-popup', output);
        }
      } else {
        this.commonUtilService.showToast('FILE_SAVED', '', 'green-toast');
      }
      await loader.dismiss();
    }).catch(async (err) => {
      console.log('err export apk ', err);
      await loader.dismiss();
    });
  }

  private async checkForPermissions(): Promise<boolean | undefined> {
    if (this.platform.is('ios')) {
      return new Promise<boolean | undefined>((resolve, reject) => {
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
        }).catch(err => console.error(err));
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
