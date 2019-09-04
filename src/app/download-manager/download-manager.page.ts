import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Events, PopoverController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
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
  SortOrder,
  StorageService,
  StorageDestination
} from 'sunbird-sdk';

import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService, } from '@app/services/app-header.service';
import { CommonUtilService, } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppStorageInfo, DownloadManagerPageInterface, EmitedContents } from './download-manager.interface';
import { ContentType, RouterLinks, ContentFilterConfig } from '@app/app/app.constant';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PageId, InteractType, Environment, InteractSubtype } from '@app/services/telemetry-constants';
import { FormAndFrameworkUtilService } from '@app/services';
import { featureIdMap } from '../feature-id-map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SbInsufficientStoragePopupComponent } from '@app/app/components/popups/sb-insufficient-storage-popup/sb-insufficient-storage-popup';

@Component({
  selector: 'app-download-manager',
  templateUrl: './download-manager.page.html',
  styleUrls: ['./download-manager.page.scss'],
})
export class DownloadManagerPage implements DownloadManagerPageInterface, OnInit {
  headerObservable: any;
  _toast: any;
  storageInfo: AppStorageInfo;
  downloadedContents: Content[] = [];
  defaultImg = 'assets/imgs/ic_launcher.png';
  loader: any;
  deleteAllConfirm;
  appName: string;
  sortCriteria: ContentSortCriteria[];
  storageDestination: any;
  private deletedContentListTitle$?: BehaviorSubject<string>;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private ngZone: NgZone,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private events: Events,
    private popoverCtrl: PopoverController,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private router: Router,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.subscribeContentUpdateEvents();
    return Promise.all(
      [this.getDownloadedContents(true, true),
      this.getAppName()]
    );
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['download', 'settings']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.headerService.showHeaderWithHomeButton(['download', 'settings']);
    await this.getAppStorageInfo();
    this.getDownloadedContents();
    this.checkAvailableSpace();
    this.fetchStorageDestination();
  }

  private async getAppName() {
    return this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  private async getAppStorageInfo(): Promise<AppStorageInfo> {

    const req: ContentSpaceUsageSummaryRequest = { paths: [this.storageService.getStorageDestinationDirectoryPath()] };
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

  async getDownloadedContents(shouldGenerateTelemetry?, ignoreLoader?) {
    const profile: Profile = this.appGlobalService.getCurrentUser();
    if (ignoreLoader) {

    } else {
      // this.loader = await this.commonUtilService.getLoader();
      // await this.loader.present();
      // this.loader. dismiss().then(() => {
      //   this.loader = undefined;
      // });
    }


    const defaultSortCriteria: ContentSortCriteria[] = [{
      sortAttribute: 'sizeOnDevice',
      sortOrder: SortOrder.DESC
    }];
    const contentTypes = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_DOWNLOADS);
    const requestParams: ContentRequest = {
      uid: profile.uid,
      contentTypes: contentTypes,
      audience: [],
      sortCriteria: this.sortCriteria || defaultSortCriteria
    };
    if (shouldGenerateTelemetry) {
      await this.getAppStorageInfo();
    }
    await this.contentService.getContents(requestParams).toPromise()
      .then(async data => {
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
          // if (this.downloadedContents && this.downloadedContents.length && this.loader) {
          //   await this.loader.dismiss();
          //   this.loader = undefined;

          // }
        });
      })
      .catch((e) => {
        this.ngZone.run(async () => {
          // await this.loader.dismiss();
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
      await this.deleteAllContents(emitedContents);
      // await this.loader.dismiss();
      // this.loader = undefined;
    } else {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      // await this.loader.dismiss();
      // this.loader = undefined;


      this.contentService.deleteContent(contentDeleteRequest).toPromise()
        .then(async (data: ContentDeleteResponse[]) => {
          await this.loader.dismiss();
          this.loader = undefined;
          // this.getDownloadedContents();
          if (data && data[0].status === ContentDeleteStatus.NOT_FOUND) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('CONTENT_DELETE_FAILED'));
          } else {
            this.events.publish('savedResources:update', {
              update: true
            });
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('MSG_RESOURCE_DELETED'));
            // await this.getAppStorageInfo();
          }
        }).catch(async (error: any) => {
          await this.loader.dismiss();
          this.loader = undefined;
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
        metaInfo: this.commonUtilService.translateMessage('FILES_DELETED'),
        sbPopoverDynamicMainTitle: this.deletedContentListTitle$
        // sbPopoverContent: this.commonUtilService.translateMessage('FILES_DELETED')
      },
      cssClass: 'sb-popover danger sb-popover-cancel-delete',
    });
    await this.deleteAllConfirm.present();
    const response = await this.deleteAllConfirm.onDidDismiss();
    if (response) {
      this.contentService.clearContentDeleteQueue().toPromise();
    }
    this.contentService.enqueueContentDelete(contentDeleteRequest).toPromise();
    this.contentService.getContentDeleteQueue().skip(1).takeWhile((list) => !!list.length)
      .finally(async () => {
        this.deletedContentListTitle$
          .next(`${contentDeleteRequest.contentDeleteList.length}/${contentDeleteRequest.contentDeleteList.length}`);

        await this.deleteAllConfirm.dismiss();

        // await this.getAppStorageInfo();

        this.events.publish('savedResources:update', {
          update: true
        });
      })
      .subscribe((list) => {
        this.deletedContentListTitle$
          .next(`${contentDeleteRequest.contentDeleteList.length - list.length}/${contentDeleteRequest.contentDeleteList.length}`);
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
      PageId.DOWNLOADS,
      undefined,
      valuesMap,
      undefined,
      featureIdMap.downloadManager.DOWNLOADS_SORT
    );
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

  private subscribeContentUpdateEvents() {
    this.events.subscribe('savedResources:update', async (res) => {
      if (res && res.update) {
        this.getDownloadedContents(false, true);
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
  private async fetchStorageDestination() {
    this.storageDestination = await this.storageService.getStorageDestination().toPromise();
  }
  private async presentPopupForLessStorageSpace() {
    console.log('STORAGEDEST', this.storageDestination);
    this._toast = await this.popoverCtrl.create({
      component: SbInsufficientStoragePopupComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('INSUFFICIENT_STORAGE'),
        sbPopoverMessage: this.storageDestination === StorageDestination.INTERNAL_STORAGE ?
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION', this.commonUtilService.translateMessage('SD_CARD')) :
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION', this.commonUtilService.translateMessage(
            'INTERNAL_MEMORY'
          )),
      },
      cssClass: 'sb-popover no-network',
    });
    await this._toast.present();
  }

  private checkAvailableSpace() {
    this.storageService.getStorageDestinationVolumeInfo()
      .do((volumeInfo) => {
        if (volumeInfo.info.availableSize < 209715200) {
          this.presentPopupForLessStorageSpace();
        }
      })
      .subscribe();
  }

}

