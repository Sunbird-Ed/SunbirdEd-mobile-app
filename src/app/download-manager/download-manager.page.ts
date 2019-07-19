import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppGlobalService, AppHeaderService, CommonUtilService, TelemetryGeneratorService } from '../../services/index';
import { AppStorageInfo, DownloadManagerPageInterface, EmitedContents } from './download-manager.interface';
import { AudienceFilter, ContentType, RouterLinks } from './../../app/app.constant';
// import { ViewController } from 'ionic-angular/navigation/view-controller';
import { NavController, NavParams, PopoverController } from '@ionic/angular';
import { Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  Content,
  ContentDeleteRequest,
  ContentDeleteResponse,
  ContentDeleteStatus,
  ContentRequest,
  ContentService,
  ContentSortCriteria,
  ContentSpaceUsageSummaryRequest,
  ContentSpaceUsageSummaryResponse,
  DeviceInfo,
  Profile,
  ProfileType,
  SortOrder
} from 'sunbird-sdk';
import { SbPopoverComponent } from '../components/popups/sb-popover/sb-popover.component';
import { ActiveDownloadsPage } from '../active-downloads/active-downloads.page';
import {Router} from '@angular/router';
import { PageId, InteractType, Environment, InteractSubtype } from '../../services/telemetry-constants';

@Component({
  selector: 'app-download-manager',
  templateUrl: './download-manager.page.html',
  styleUrls: ['./download-manager.page.scss'],
})
export class DownloadManagerPage implements DownloadManagerPageInterface, OnInit {

  headerObservable: any;

  storageInfo: AppStorageInfo;
  downloadedContents: Content[] = [];
  defaultImg = 'assets/imgs/ic_launcher.png';
  loader: any;
  deleteAllConfirm;
  appName: string;
  sortCriteria: ContentSortCriteria[];

  constructor(
    private ngZone: NgZone,
    // private popoverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
    private headerServie: AppHeaderService,
    private events: Events,
    private popoverCtrl: PopoverController,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private router: Router,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
  }

  async ngOnInit() {
    this.subscribeContentUpdateEvents();
    return Promise.all(
      [this.getDownloadedContents(true),
      this.getAppName()]
    );
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerServie.showHeaderWithHomeButton(['download', 'settings']);
    });
    this.headerObservable = this.headerServie.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.headerServie.showHeaderWithHomeButton(['download', 'settings']);
    await this.getAppStorageInfo();
    this.getDownloadedContents();
  }

  private async getAppName() {
    return this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  private async getAppStorageInfo(): Promise<AppStorageInfo> {

    const req: ContentSpaceUsageSummaryRequest = { paths: [cordova['file']['externalDataDirectory']] };
    return this.contentService.getContentSpaceUsageSummary(req).toPromise()
      .then((res: ContentSpaceUsageSummaryResponse[]) => {
        return this.deviceInfo.getAvailableInternalMemorySize().toPromise()
          .then((size) => {
            this.storageInfo = {
              usedSpace: res[0].sizeOnDevice,
              availableSpace: parseInt(size, 10)
            };
            return this.storageInfo;
          });
      });

  }

  async getDownloadedContents(shouldGenerateTelemetry?) {
    const profile: Profile = await this.appGlobalService.getCurrentUser();
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    await this.loader.dismiss(() => {
      this.loader = undefined;
    });
    const defaultSortCriteria: ContentSortCriteria[] = [{
      sortAttribute: 'sizeOnDevice',
      sortOrder: SortOrder.DESC
    }];
    const requestParams: ContentRequest = {
      uid: profile.uid,
      contentTypes: ContentType.FOR_LIBRARY_TAB,
      audience: [],
      sortCriteria: this.sortCriteria || defaultSortCriteria
    };
    if (shouldGenerateTelemetry) {
      await this.getAppStorageInfo();
    }
    await this.contentService.getContents(requestParams).toPromise()
      .then(data => {
        if (shouldGenerateTelemetry) {
          this.generateInteractTelemetry(data.length, this.storageInfo.usedSpace, this.storageInfo.availableSpace);
        }
        data.forEach((value) => {
          value.contentData['lastUpdatedOn'] = value.lastUpdatedTime;
          if (value.contentData.appIcon) {
            if (value.contentData.appIcon.startsWith('http:') || value.contentData.appIcon.startsWith('https:')) {
              if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                value.contentData.appIcon = value.contentData.appIcon;
              } else {
                value.contentData.appIcon = this.defaultImg;
              }
            } else if (value.basePath) {
              value.contentData.appIcon = value.basePath + '/' + value.contentData.appIcon;
            }
          }
        });
        this.ngZone.run(async () => {
          this.downloadedContents = data;
          if (this.downloadedContents && this.downloadedContents.length) {
            await this.loader.dismiss();
          }
        });
      })
      .catch((e) => {
        this.ngZone.run(async () => {
          await this.loader.dismiss();
        });
      });
  }

  private generateInteractTelemetry(contentCount: number, usedSpace: number, availableSpace: number) {
    const valuesMap = {};
    valuesMap['count'] = contentCount;
    valuesMap['spaceTakenByApp'] = this.commonUtilService.fileSizeInMB(usedSpace);
    valuesMap['freeSpace'] = this.commonUtilService.fileSizeInMB(availableSpace);
    this.telemetryGeneratorService.generateExtraInfoTelemetry(valuesMap, PageId.DOWNLOADS);
  }

  async deleteContents(emitedContents: EmitedContents) {
    const contentDeleteRequest: ContentDeleteRequest = {
      contentDeleteList: emitedContents.selectedContents
    };
    if (emitedContents.selectedContents.length > 1) {
      this.deleteAllContents(emitedContents);
    } else {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      await this.loader.dismiss(() => {
        this.loader = undefined;
      });

      this.contentService.deleteContent(contentDeleteRequest).toPromise()
        .then(async (data: ContentDeleteResponse[]) => {
          await this.loader.dismiss();
          this.getDownloadedContents();
          if (data && data[0].status === ContentDeleteStatus.NOT_FOUND) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
          } else {
            this.events.publish('savedResources:update', {
              update: true
            });
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('MSG_RESOURCE_DELETED'));
            await this.getAppStorageInfo();
          }
        }).catch(async (error: any) => {
          await this.loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
        });
    }
  }
   private async deleteAllContents(emitedContents) {
    const valuesMap = {};
    valuesMap['size'] = this.commonUtilService.fileSizeInMB(emitedContents.selectedContentsInfo.totalSize);
    valuesMap['count'] = emitedContents.selectedContentsInfo.count;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_CLICKED,
      Environment.DOWNLOADS,
      PageId.BULK_DELETE_CONFIRMATION_POPUP, undefined, valuesMap);
    const contentDeleteRequest: ContentDeleteRequest = {
      contentDeleteList: emitedContents.selectedContents
    };
    // migration-TODO
    this.deleteAllConfirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DELETE_PROGRESS'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm sb-btn-outline-info cancel-delete'
          },
        ],
        icon: null,
        sbPopoverMainTitle: '0/' + contentDeleteRequest.contentDeleteList.length,
        metaInfo: this.commonUtilService.translateMessage('FILES_DELETED'),
        // sbPopoverContent: this.commonUtilService.translateMessage('FILES_DELETED')
      },
      cssClass: 'sb-popover danger sb-popover-cancel-delete',
    });
    await this.deleteAllConfirm.present();
    const response = await this.deleteAllConfirm.dismiss();
    if (response.data) {
      this.contentService.clearContentDeleteQueue().toPromise();
    }
    this.contentService.enqueueContentDelete(contentDeleteRequest).toPromise();
    this.contentService.getContentDeleteQueue().skip(1).takeWhile((list) => !!list.length)
      .finally(async () => {
        this.events.publish('deletedContentList:changed', {
          deletedContentsInfo: {
            totalCount: contentDeleteRequest.contentDeleteList.length,
            deletedCount: contentDeleteRequest.contentDeleteList.length
          }
        });

        await this.deleteAllConfirm.dismiss();

        await this.getAppStorageInfo();

        this.events.publish('savedResources:update', {
          update: true
        });
      })
      .subscribe((list) => {
        this.events.publish('deletedContentList:changed', {
          deletedContentsInfo: {
            totalCount: contentDeleteRequest.contentDeleteList.length,
            deletedCount: contentDeleteRequest.contentDeleteList.length - list.length
          }
        });
      });
  }

  onSortCriteriaChange(sortAttribute): void {
    let sortAttr: string;
    if (sortAttribute.content === 'Content size') {
      sortAttr = 'sizeOnDevice';
    } else if (sortAttribute.content === 'Last viewed') {
      sortAttr = 'lastUsedOn';
    }
    const valuesMap = {};
    valuesMap['selectedOption'] = sortAttr;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SORT_OPTION_SELECTED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    this.sortCriteria = [{
      sortOrder: SortOrder.DESC,
      sortAttribute: sortAttr
    }];
    this.getDownloadedContents();
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    this.headerObservable.unsubscribe();
    // this.events.unsubscribe('savedResources:update');
  }

   private  subscribeContentUpdateEvents() {
    this.events.subscribe('savedResources:update', async (res) => {
      if (res && res.update) {
        this.getDownloadedContents(false);
        await this.getAppStorageInfo();
      }
    });
  }

  private handleHeaderEvents($event) {
    console.log('inside handleHeaderEvents', $event);
    switch ($event.name) {
      case 'download':
        this.redirectToActivedownloads();
        break;
      case 'settings':
        this.redirectToSettings();
        break;
    }
  }

  private redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    // migration-TODO
    // this.navCtrl.push(ActiveDownloadsPage);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  private redirectToSettings() {
    this.router.navigate([RouterLinks.STORAGE_SETTINGS]);
  }

}

