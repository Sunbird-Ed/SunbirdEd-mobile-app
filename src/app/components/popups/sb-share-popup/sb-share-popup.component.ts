import { UtilityService } from '@app/services/utility-service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {Platform, PopoverController, NavParams, ToastController} from '@ionic/angular';
import { Subscription } from 'rxjs';
import {AndroidPermissionsService, CommonUtilService, ContentShareHandlerService, TelemetryGeneratorService} from '@app/services';
import {
  Environment,
  ImpressionType,
  ID,
  PageId,
} from '@app/services/telemetry-constants';
import { TelemetryObject } from 'sunbird-sdk';
import {ShareUrl, ShareMode, ContentType, MimeType, RouterLinks} from '@app/app/app.constant';
import { ContentUtil } from '@app/util/content-util';
import {AndroidPermission, AndroidPermissionsStatus} from '@app/services/android-permissions/android-permission';
import {SbPopoverComponent} from '@app/app/components/popups';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sb-share-popup',
  templateUrl: './sb-share-popup.component.html',
  styleUrls: ['./sb-share-popup.component.scss'],
})
export class SbSharePopupComponent implements OnInit, OnDestroy {

  @Input() content: any;
  @Input() corRelationList: any;
  @Input() objRollup: any;
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
  shareItemType: string;
  pageId: string;
  telemetryObject: TelemetryObject;
  appName = '';

  constructor(
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private contentShareHandler: ContentShareHandlerService,
    private utilityService: UtilityService,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private commonUtilService: CommonUtilService,
    private permissionService: AndroidPermissionsService,
    private toastController: ToastController,
    private router: Router
  ) {
    this.content = this.navParams.get('content');
    this.corRelationList = this.navParams.get('corRelationList');
    this.objRollup = this.navParams.get('objRollup');
    this.shareItemType = this.navParams.get('shareItemType');
    this.pageId = this.navParams.get('pageId');
  }

  async ngOnInit() {
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
    this.generateShareClickTelemetry();
    this.generateImpressionTelemetry();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    const baseUrl = await this.utilityService.getBuildConfigValue('BASE_URL');
    this.shareUrl = baseUrl + this.getContentEndPoint(this.content) + this.content.identifier;
    this.appName = await this.appVersion.getAppName();
  }

  getContentEndPoint(content) {
    let endPoint = '';
    if (content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase()) {
      endPoint = ShareUrl.COURSE;
    } else if (content.mimeType === MimeType.COLLECTION) {
      endPoint = ShareUrl.COLLECTION;
    } else {
      endPoint = ShareUrl.CONTENT;
    }
    return endPoint;
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SHARE_CONTENT_POPUP,
      Environment.HOME,
      this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version,
      this.objRollup,
      this.corRelationList);
  }

  generateShareClickTelemetry() {
    this.telemetryGeneratorService.generateInteractTelemetry(this.shareItemType,
      '',
      Environment.HOME,
      this.pageId,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList,
      ID.SHARE);
  }

  generateConfirmClickTelemetry(shareMode) {
    this.telemetryGeneratorService.generateInteractTelemetry(shareMode,
      '',
      Environment.HOME,
      PageId.SHARE_CONTENT_POPUP,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList,
      ID.SHARE_CONFIRM);
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    const shareParams = {
      byLink: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }

  async shareFile() {
    await this.checkForPermissions().then((result) => {
      if (result) {
        this.generateConfirmClickTelemetry(ShareMode.SEND);
        const shareParams = {
          byFile: true,
          link: this.shareUrl
        };
        this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
        this.popoverCtrl.dismiss();
      } else {
        this.showSettingsPageToast();
      }
    });
  }

  async saveFile() {
    await this.checkForPermissions().then((result) => {
      if (result) {
        this.generateConfirmClickTelemetry(ShareMode.SAVE);
        const shareParams = {
          saveFile: true,
        };
        this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
        this.popoverCtrl.dismiss();
      } else {
        this.showSettingsPageToast();
      }
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
