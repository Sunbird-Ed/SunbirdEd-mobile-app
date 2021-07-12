import { UtilityService } from '@app/services/utility-service';
import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { Platform, PopoverController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AndroidPermissionsService, AppGlobalService, CommonUtilService,
  ContentShareHandlerService, TelemetryGeneratorService
} from '@app/services';
import {
  Environment,
  ImpressionType,
  ID,
  PageId,
  InteractType,
  InteractSubtype
} from '@app/services/telemetry-constants';
import {
  TelemetryObject, ContentDetailRequest,
  ContentService
} from 'sunbird-sdk';
import {
  ShareUrl, ShareMode, MimeType
} from '@app/app/app.constant';
import { ContentUtil } from '@app/util/content-util';
import {
  AndroidPermission,
  AndroidPermissionsStatus
} from '@app/services/android-permissions/android-permission';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';

@Component({
  selector: 'app-sb-share-popup',
  templateUrl: './sb-share-popup.component.html',
  styleUrls: ['./sb-share-popup.component.scss'],
})
export class SbSharePopupComponent implements OnInit, OnDestroy {

  @Input() content: any;
  @Input() corRelationList: any;
  @Input() objRollup: any;
  @Input() moduleId: string;
  @Input() subContentIds: Array<string> = [];
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
  shareFromPlayer = false;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private contentShareHandler: ContentShareHandlerService,
    private utilityService: UtilityService,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private commonUtilService: CommonUtilService,
    private permissionService: AndroidPermissionsService,
    private appGlobalService: AppGlobalService
  ) {
    this.content = this.navParams.get('content');
    this.corRelationList = this.navParams.get('corRelationList');
    this.objRollup = this.navParams.get('objRollup');
    this.shareItemType = this.navParams.get('shareItemType');
    this.pageId = this.navParams.get('pageId');
    this.moduleId = this.navParams.get('moduleId');
    this.subContentIds = this.navParams.get('subContentIds');
    this.shareFromPlayer = this.navParams.get('shareFromPlayer');
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

    let rootContentIdentifier = this.content.identifier;
    if (this.objRollup && this.objRollup.l1 && this.objRollup.l1 !== this.content.identifier) {
      rootContentIdentifier = this.objRollup.l1;
    }
    this.shareUrl = baseUrl + await this.getContentEndPoint(this.content, rootContentIdentifier) + rootContentIdentifier;

    this.appName = await this.appVersion.getAppName();
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  private async getContentEndPoint(content, rootContentIdentifier) {
    if (content.identifier !== rootContentIdentifier) {
      const contentDetailRequest: ContentDetailRequest = {
        contentId: rootContentIdentifier,
        objectType: this.content.objectType,
        attachFeedback: false,
        attachContentAccess: false,
        emitUpdateIfAny: false
      };
      await this.contentService.getContentDetails(contentDetailRequest).toPromise()
        .then((contentDetail) => {
          content = contentDetail;
        });
    }

    let endPoint = '';
    if (content.primaryCategory.toLowerCase() === CsPrimaryCategory.COURSE.toLowerCase()) {
      endPoint = ShareUrl.COURSE;
    } else if (content.mimeType === MimeType.COLLECTION) {
      endPoint = ShareUrl.COLLECTION;
    } else {
      endPoint = ShareUrl.CONTENT;
    }
    return endPoint;
  }

  private generateImpressionTelemetry() {
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

  private generateShareClickTelemetry() {
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

  private generateConfirmClickTelemetry(shareMode) {
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

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    const shareParams = {
      byLink: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.content, this.moduleId, this.subContentIds,
      this.corRelationList, this.objRollup,  this.pageId);
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
        this.contentShareHandler.shareContent(shareParams, this.content, this.moduleId, this.subContentIds,
          this.corRelationList, this.objRollup, this.pageId);
        this.popoverCtrl.dismiss();
      } else {
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
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
        this.contentShareHandler.shareContent(shareParams, this.content, this.moduleId, this.subContentIds,
          this.corRelationList, this.objRollup, this.pageId);
        this.popoverCtrl.dismiss();
      } else {
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
      }
    });
  }

  private async checkForPermissions(): Promise<boolean | undefined> {
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
              Environment.HOME,
              PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.ALLOW_CLICKED,
              Environment.HOME,
              PageId.PERMISSION_POPUP);
            this.appGlobalService.isNativePopupVisible = true;
            this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE)
              .subscribe(async (status: AndroidPermissionsStatus) => {
                if (status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.HOME,
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
                    Environment.HOME,
                    PageId.APP_PERMISSION_POPUP
                  );
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, this.pageId, true);
                }
                this.appGlobalService.setNativePopupVisible(false, 1000);
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', this.pageId, true
      );
      await confirm.present();
    });
  }
}
