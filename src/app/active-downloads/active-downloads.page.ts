import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ActiveDownloadsInterface } from './active-downloads.interface';
import { Observable, Subscription } from 'rxjs';
import { InteractSubtype, Environment, PageId, InteractType } from '../../services/telemetry-constants';
import {
  ContentDownloadRequest,
  DownloadEventType,
  DownloadProgress,
  DownloadRequest,
  DownloadService,
  EventNamespace,
  EventsBusService,
  StorageService,
  StorageDestination
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { AppHeaderService, CommonUtilService, TelemetryGeneratorService } from '../../services/index';
import { SbNoNetworkPopupComponent } from '../components/popups/sb-no-network-popup/sb-no-network-popup.component';
import { SbPopoverComponent } from '../components/popups/sb-popover/sb-popover.component';
import { featureIdMap } from '@app/feature-id-map';
import { tap, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-active-downloads',
  templateUrl: './active-downloads.page.html',
  styleUrls: ['./active-downloads.page.scss'],
})
export class ActiveDownloadsPage implements OnInit, OnDestroy, ActiveDownloadsInterface {

  downloadProgressMap: { [key: string]: number };
  activeDownloadRequests$: Observable<ContentDownloadRequest[]>;
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');

  private _appHeaderSubscription?: Subscription;
  private _downloadProgressSubscription?: Subscription;
  private _networkSubscription?: Subscription;
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [] as string[]
  };
  private _toast: any;
  private storageDestination: any;
  networkFlag: boolean;

  constructor(
    private popoverCtrl: PopoverController,
    private changeDetectionRef: ChangeDetectorRef,
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService
  ) {
    this.downloadProgressMap = {};
    // @ts-ignore
    this.activeDownloadRequests$ = this.downloadService.getActiveDownloadRequests().pipe(
      tap(() => this.changeDetectionRef.detectChanges())
    );
  }

  ngOnInit() {
    this.initDownloadProgress();
    this.initAppHeader();
    this.initNetworkDetection();
    this.telemetryGeneratorService.generatePageViewTelemetry(
      PageId.ACTIVE_DOWNLOADS,
      Environment.DOWNLOADS, '');
  }

  ngOnDestroy() {
    if (this._downloadProgressSubscription) {
      this._downloadProgressSubscription.unsubscribe();
    }
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
    if (this._networkSubscription) {
      this._networkSubscription.unsubscribe();
      if (this._toast) {
        this._toast.dismiss();
        this._toast = undefined;
      }
    }
  }

  ionViewWillEnter() {
    this.fetchStorageDestination();
    this.checkAvailableSpace();
  }

  ionViewDidLoad() {
    this.telemetryGeneratorService.generatePageViewTelemetry(
      PageId.ACTIVE_DOWNLOADS,
      Environment.DOWNLOADS, '');
  }

  cancelAllDownloads(): void {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_CANCEL_ALL_CLICKED,
      Environment.DOWNLOADS,
      PageId.ACTIVE_DOWNLOADS,
      undefined,
      undefined,
      undefined,
      featureIdMap.downloadManager.ACTIVE_DOWNLOADS_CANCEL
    );
    this.showCancelPopUp();
  }

  cancelDownload(downloadRequest: DownloadRequest): void {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
      Environment.DOWNLOADS,
      PageId.ACTIVE_DOWNLOADS,
      undefined,
      undefined,
      undefined,
      featureIdMap.downloadManager.ACTIVE_DOWNLOADS_CANCEL
    );
    this.showCancelPopUp(downloadRequest);
  }

  getContentDownloadProgress(contentId: string): number {
    return this.downloadProgressMap[contentId] && (this.downloadProgressMap[contentId] > -1) ? this.downloadProgressMap[contentId] : 0;
  }

  private initDownloadProgress(): void {
    this._downloadProgressSubscription = this.eventsBusService.events(EventNamespace.DOWNLOADS).pipe(
      filter((event) => event.type === DownloadEventType.PROGRESS),
      tap((event) => {
        const downloadEvent = event as DownloadProgress;
        this.downloadProgressMap[downloadEvent.payload.identifier] = downloadEvent.payload.progress;
        this.changeDetectionRef.detectChanges();
      })
    ).subscribe();
  }

  private initAppHeader() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this._headerConfig);
  }

  private handleHeaderEvents(event: { name: string }) {
    if(event.name =='back') {
        this.location.back();
    }
  }

  private initNetworkDetection() {
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      if (this.networkFlag !== available) {
        if (this._toast) {
          await this._toast.dismiss();
          this._toast = undefined;
        }
        if (!available) {
          this.presentPopupForOffline();
        }
      }
      this.networkFlag = available;
    });
  }

  private async showCancelPopUp(downloadRequest?: DownloadRequest) {
    this.telemetryGeneratorService.generatePageViewTelemetry(
      downloadRequest ? PageId.SINGLE_CANCEL_CONFIRMATION_POPUP : PageId.BULK_CANCEL_CONFIRMATION_POPUP,
      Environment.DOWNLOADS);
    const popupMessage = downloadRequest ? 'CANCEL_DOWNLOAD_MESSAGE' : 'CANCEL_ALL_DOWNLOAD_MESSAGE';


    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('CANCEL_DOWNLOAD_TITLE'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage(popupMessage),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL_DOWNLOAD'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        // metaInfo: this.content.contentData.name,
      },
      cssClass: 'sb-popover danger dw-active-downloads-popover',
    });

    await confirm.present();

    const loader = await this.commonUtilService.getLoader();

    const response = await confirm.onDidDismiss();
    if (response.data) {
      let valuesMap;
      if (downloadRequest) {
        valuesMap = {
          count: 1
        };
      } else {
        valuesMap = {
          count: (await this.activeDownloadRequests$.pipe(
            take(1)).toPromise()).length
        };
      }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
        Environment.DOWNLOADS,
        PageId.ACTIVE_DOWNLOADS, undefined, valuesMap);
      loader.present().then(() => {
        return downloadRequest ?
          this.downloadService.cancel(downloadRequest).toPromise() :
          this.downloadService.cancelAll().toPromise();
      }).then(() => {
        return loader.dismiss();
      });
    }
  }

  private async presentPopupForOffline() {
    this._toast = await this.popoverCtrl.create({
      component: SbNoNetworkPopupComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('INTERNET_CONNECTIVITY_NEEDED'),
        sbPopoverMessage: this.commonUtilService.translateMessage('OFFLINE_DOWNLOAD_MESSAGE'),
      },
      cssClass: 'sb-popover no-network',
    });

    await this._toast.present();
  }
  private async fetchStorageDestination() {
    this.storageDestination = await this.storageService.getStorageDestination().toPromise();
  }

  private async presentPopupForLessStorageSpace() {
    this._toast = await this.popoverCtrl.create({
      component: SbNoNetworkPopupComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('INSUFFICIENT_STORAGE'),
        sbPopoverMessage: this.storageDestination === StorageDestination.INTERNAL_STORAGE ?
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION', this.commonUtilService.translateMessage('SD_CARD')) :
          this.commonUtilService.translateMessage('MOVE_FILES_TO_OTHER_DESTINATION',
            this.commonUtilService.translateMessage('INTERNAL_MEMORY')),
      },
      cssClass: 'sb-popover no-network',
    });

    await this._toast.present();
  }

  private checkAvailableSpace() {
    this.storageService.getStorageDestinationVolumeInfo().pipe(
      tap((volumeInfo) => {
        if (volumeInfo.info.availableSize < 209715200) {
          this.presentPopupForLessStorageSpace();
        }
      })
    ).subscribe();
  }

}
