import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService, } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Subscription, Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import {
  ContentService,
  DeviceInfo,
  EventNamespace,
  EventsBusService,
  StorageDestination,
  StorageEventType,
  StorageService,
  StorageTransferProgress,
  StorageVolume
} from 'sunbird-sdk';
import { SbPopoverComponent } from '@app/app/components/popups';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ImpressionType, Environment, PageId, InteractType, InteractSubtype, } from '@app/services/telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AndroidPermissionsService } from 'services/android-permissions/android-permissions.service';
import { AndroidPermission, AndroidPermissionsStatus } from 'services/android-permissions/android-permission';
import { Location } from '@angular/common';
import { featureIdMap } from '../feature-id-map';
import { mergeMap, map, filter , takeWhile, take, startWith, tap} from 'rxjs/operators';

@Component({
  selector: 'app-storage-settings',
  templateUrl: './storage-settings.page.html',
  styleUrls: ['./storage-settings.page.scss'],
})
export class StorageSettingsPage implements OnInit {
  // popovers
  private shouldTransferContentsPopup?: any;
  private transferringContentsPopup?: any;
  private cancellingTransferPopup?: any;
  private duplicateContentPopup?: any;
  private successTransferPopup?: any;
  // storage
  public StorageDestination = StorageDestination;
  public storageDestination?: StorageDestination;
  public spaceTakenBySunbird$: Observable<number>;

  private _storageVolumes: StorageVolume[] = [];
  // header
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [] as string[]
  };
  appName: any;
  _appHeaderSubscription: Subscription;

  get isExternalMemoryAvailable(): boolean {
    return !!this._storageVolumes.find((volume) => volume.storageDestination === StorageDestination.EXTERNAL_STORAGE);
  }

  get totalExternalMemorySize(): string {
    return this._storageVolumes
      .find((volume) => volume.storageDestination === StorageDestination.EXTERNAL_STORAGE)!
      .info.totalSize;
  }

  get totalInternalMemorySize(): string {
    const internalVolume = this._storageVolumes
      .find((volume) => volume.storageDestination === StorageDestination.INTERNAL_STORAGE);
    return internalVolume ? internalVolume.info.totalSize : '0 Kb';
  }

  get availableExternalMemorySize(): number {
    return this._storageVolumes
      .find((volume) => volume.storageDestination === StorageDestination.EXTERNAL_STORAGE)!
      .info.availableSize;
  }

  get availableInternalMemorySize(): number {
    const internalVolume = this._storageVolumes
      .find((volume) => volume.storageDestination === StorageDestination.INTERNAL_STORAGE);
    return internalVolume ? internalVolume.info.availableSize : 0;
  }

  constructor(
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private popoverCtrl: PopoverController,
    private fileSizePipe: FileSizePipe,
    private changeDetectionRef: ChangeDetectorRef,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private permissionsService: AndroidPermissionsService,
    private location: Location,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
  ) {
    this.spaceTakenBySunbird$ = this.storageService.getStorageDestinationVolumeInfo().pipe(
      mergeMap((storageVolume) => {
        return this.contentService
          .getContentSpaceUsageSummary({ paths: [storageVolume.info.contentStoragePath] });
      }),
      map((summary) => summary[0].sizeOnDevice) as any
    );
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
      });
  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.STORAGE_SETTINGS,
      Environment.DOWNLOADS);
    this.fetchStorageVolumes();
    this.fetchStorageDestination();
  }

  ionViewWillEnter() {
    this.initAppHeader();
  }

  public async attemptTransfer() {
    if (this.storageDestination === await this.storageService.getStorageDestination().toPromise()) {
      return;
    }

    const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.WRITE_EXTERNAL_STORAGE);

    if (permissionStatus.hasPermission) {
      this.showShouldTransferContentsPopup();
    } else if (permissionStatus.isPermissionAlwaysDenied) {
      this.revertSelectedStorageDestination();
      await this.commonUtilService.showSettingsPageToast
      ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.TRANSFERING_CONTENT_POPUP, false);
    } else {
      this.showStoragePermissionPopup();
    }
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
    switch (event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.STORAGE_SETTINGS, Environment.HOME,
          true);
        this.location.back();
        break;
    }
  }

  private fetchStorageVolumes() {
    this.deviceInfo.getStorageVolumes().subscribe((v) => {
      this._storageVolumes = v;
      this.changeDetectionRef.detectChanges();
    });
  }

  private revertSelectedStorageDestination() {
    this.storageDestination = this.storageDestination === StorageDestination.INTERNAL_STORAGE ?
      StorageDestination.EXTERNAL_STORAGE :
      StorageDestination.INTERNAL_STORAGE;
  }

  private async fetchStorageDestination() {
    this.storageDestination = await this.storageService.getStorageDestination().toPromise();
  }

  private getStorageDestinationDirectoryPath(storageDestination: StorageDestination): string {
    return this._storageVolumes
      .find((storageVolume) => storageVolume.storageDestination === storageDestination)
      .info.contentStoragePath;
  }

  private async showStoragePermissionPopup() {
    const confirm = await this.commonUtilService.buildPermissionPopover(
        async (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.NOT_NOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP);
            this.revertSelectedStorageDestination();
            await this.commonUtilService.showSettingsPageToast
            ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.TRANSFERING_CONTENT_POPUP, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.ALLOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP);
            this.permissionsService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE)
                .subscribe((status: AndroidPermissionsStatus) => {
                  if (status.hasPermission) {
                    this.showShouldTransferContentsPopup();
                  } else if (status.isPermissionAlwaysDenied) {
                    this.revertSelectedStorageDestination();
                    this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.TRANSFERING_CONTENT_POPUP, true);
                  } else {
                    this.revertSelectedStorageDestination();
                  }
                });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'),
        'FILE_MANAGER_PERMISSION_DESCRIPTION', PageId.TRANSFERING_CONTENT_POPUP, true
    );
    await confirm.present();

    confirm.onWillDismiss().then(({ data }) => {
      if (data.buttonClicked === null) {
        this.revertSelectedStorageDestination();
      }
    });
  }

  private async showShouldTransferContentsPopup(): Promise<void> {
    if (this.shouldTransferContentsPopup) {
      return;
    }

    const spaceTakenBySunbird = await this.spaceTakenBySunbird$.toPromise();

    this.shouldTransferContentsPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: (this.storageDestination === StorageDestination.INTERNAL_STORAGE) ?
          this.commonUtilService.translateMessage('TRANSFER_CONTENT_TO_PHONE') :
          this.commonUtilService.translateMessage('TRANSFER_CONTENT_TO_SDCARD'),
        sbPopoverMainTitle: (this.storageDestination === StorageDestination.INTERNAL_STORAGE) ?
          this.commonUtilService.translateMessage('SUCCESSFUL_CONTENT_TRANSFER_TO_PHONE') :
          this.commonUtilService.translateMessage('SUCCESSFUL_CONTENT_TRANSFER_TO_SDCARD'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('MOVE'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        metaInfo: this.commonUtilService.translateMessage('TOTAL_SIZE') + this.fileSizePipe.transform(spaceTakenBySunbird),
      },
      cssClass: 'sb-popover dw-active-downloads-popover',
    });

    await this.shouldTransferContentsPopup.present();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.TRANSFER_CONTENT_CONFIRMATION_POPUP,
      Environment.DOWNLOADS
    );
    this.shouldTransferContentsPopup.onDidDismiss().then(async ({ data }) => {
      this.shouldTransferContentsPopup = undefined;
      if (!data || data.closeDeletePopOver) {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.POPUP_DISMISSED,
          Environment.DOWNLOADS,
          PageId.TRANSFER_CONTENT_CONFIRMATION_POPUP,
          undefined, undefined, undefined,
          featureIdMap.downloadManager.STORAGE_SETTINGS_TRANSFER
        );

        this.revertSelectedStorageDestination();
        return;
      }

      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.START_CLICKED,
        Environment.DOWNLOADS,
        PageId.TRANSFER_CONTENT_CONFIRMATION_POPUP, undefined, undefined, undefined,
        featureIdMap.downloadManager.STORAGE_SETTINGS_TRANSFER
      );

      await this.showTransferringContentsPopup(this.shouldTransferContentsPopup, this.storageDestination);
    });
  }

  private async showTransferringContentsPopup(prevPopup: any, storageDestination: StorageDestination): Promise<undefined> {
    if (this.transferringContentsPopup) {
      return;
    }

    this.storageService.transferContents({
      contentIds: [],
      existingContentAction: undefined,
      destinationFolder: this.getStorageDestinationDirectoryPath(this.storageDestination),
      deleteDestination: false
    }).subscribe(null, (e) => { console.error(e); }, () => { console.log('complete'); });

    const totalTransferSize = await this.spaceTakenBySunbird$.toPromise();

    const transferCompleteSubscription = this.eventsBusService.events(EventNamespace.STORAGE).pipe(
      takeWhile(e => e.type !== StorageEventType.TRANSFER_COMPLETED),
      filter(e => e.type === StorageEventType.TRANSFER_FAILED_DUPLICATE_CONTENT ||
        e.type === StorageEventType.TRANSFER_FAILED_LOW_MEMORY),
      take(1)
    ).subscribe(async (e) => {
      if (e.type === StorageEventType.TRANSFER_FAILED_DUPLICATE_CONTENT) {
        this.showDuplicateContentPopup();
      } else if (e.type === StorageEventType.TRANSFER_FAILED_LOW_MEMORY) {
        setTimeout(async () => {
          if (this.transferringContentsPopup) {
            await this.transferringContentsPopup.dismiss();
          }
        }, 1000);
        this.showLowMemoryToast();
        this.revertSelectedStorageDestination();
      }
    });

    const transferProgress$ = this.eventsBusService.events(EventNamespace.STORAGE).pipe(
      takeWhile(e => e.type !== StorageEventType.TRANSFER_COMPLETED),
      filter(e => e.type === StorageEventType.TRANSFER_PROGRESS),
      map((e: StorageTransferProgress) => e.payload.progress)
    );

    const transferProgressSubscription = transferProgress$
      .subscribe(null, null, async () => {
        if (this.transferringContentsPopup) {
          await this.transferringContentsPopup.dismiss();
        }
        this.showSuccessTransferPopup(this.transferringContentsPopup, storageDestination);
      });

    this.transferringContentsPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('TRANSFERRING_FILES'),
        sbPopoverDynamicMainTitle: transferProgress$.pipe(
          startWith({
            transferredCount: 0,
            totalCount: 0
          }),
          map(({ transferredCount, totalCount }) => {
            if (transferredCount && totalCount) {
              return Math.round((transferredCount / totalCount) * 100) + '%';
            } else {
              return '0%';
            }
          })
        ),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'popover-color',
            btnDisabled$: transferProgress$.pipe(
              startWith({
                transferredCount: 0,
                totalCount: 0
              }),
              map(({ transferredCount, totalCount }) => {
                if (transferredCount && totalCount) {
                  if ((Math.round((transferredCount / totalCount) * 100)) === 100) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              }),
              tap((v) => {
              })
            )
          },
        ],
        icon: null,
        metaInfo: (this.storageDestination === StorageDestination.INTERNAL_STORAGE) ?
          this.commonUtilService.translateMessage('TRANSFERRING_CONTENT_TO_PHONE') :
          this.commonUtilService.translateMessage('TRANSFERRING_CONTENT_TO_SDCARD'),
        sbPopoverDynamicContent: transferProgress$.pipe(
          startWith({
            transferredCount: 0,
            totalCount: 0
          }),
          map(({ transferredCount, totalCount }) => {
            if (transferredCount && totalCount) {
              return this.fileSizePipe.transform(
                (transferredCount / totalCount) * totalTransferSize
              ) + '/'
                + this.fileSizePipe.transform(totalTransferSize);
            } else {
              return '0KB/0KB';
            }
          })
        )
      },
      backdropDismiss: false,
      cssClass: 'sb-popover dw-active-downloads-popover',
    });

    await this.transferringContentsPopup.present();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.TRANSFERING_CONTENT_POPUP,
      Environment.DOWNLOADS
    );

    this.transferringContentsPopup.onDidDismiss().then(async ({ data }) => {
      transferCompleteSubscription.unsubscribe();
      transferProgressSubscription.unsubscribe();

      this.transferringContentsPopup = undefined;
      if (data && data.canDelete) {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.CANCEL_CLICKED,
          Environment.DOWNLOADS,
          PageId.TRANSFERING_CONTENT_POPUP
        );
        this.showCancellingTransferPopup(this.transferringContentsPopup, storageDestination);
      }

      return;
    });

  }

  private async showLowMemoryToast() {
    this.commonUtilService.showToast('ERROR_LOW_MEMORY');
  }

  private async showCancellingTransferPopup(prevPopup: any, storageDestination): Promise<undefined> {
    if (this.cancellingTransferPopup) {
      return;
    }

    this.storageService.cancelTransfer().toPromise();

    this.eventsBusService.events(EventNamespace.STORAGE).pipe(
      filter(e =>
        e.type === StorageEventType.TRANSFER_REVERT_COMPLETED ||
        e.type === StorageEventType.TRANSFER_COMPLETED
      ),
      take(1)
    )
      .subscribe(async (e) => {
        if (e.type === StorageEventType.TRANSFER_REVERT_COMPLETED) {
          this.storageDestination = this.storageDestination === StorageDestination.INTERNAL_STORAGE ?
            StorageDestination.EXTERNAL_STORAGE :
            StorageDestination.INTERNAL_STORAGE;

          await this.cancellingTransferPopup.dismiss();
        } else if (e.type === StorageEventType.TRANSFER_COMPLETED) {
          await this.cancellingTransferPopup.dismiss();
          this.showSuccessTransferPopup(this.cancellingTransferPopup, storageDestination);
        }
      });

    this.cancellingTransferPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('TRANSFER_STOPPED'),
        actionsButtons: [],
        icon: null,
        metaInfo: this.commonUtilService.translateMessage('CANCELLING_IN_PROGRESS'),
      },
      backdropDismiss: false,
      cssClass: 'sb-popover dw-active-downloads-popover',
    });

    await this.cancellingTransferPopup.present();

    this.cancellingTransferPopup.onDidDismiss().then(() => {
      this.cancellingTransferPopup = undefined;
    });

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.CANCELLING_CONTENT_TRANSFER_POPUP,
      Environment.DOWNLOADS
    );
    return;
  }

  private async showDuplicateContentPopup(): Promise<undefined> {
    if (this.duplicateContentPopup) {
      return;
    }

    this.duplicateContentPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('TRANSFERRING_FILES'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('CONTENT_ALREADY_EXISTS'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CONTINUE'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
      },
      cssClass: 'sb-popover warning dw-active-downloads-popover',
    });

    await this.duplicateContentPopup.present();

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.SHOW_DUPLICATE_CONTENT_POPUP,
      Environment.DOWNLOADS
    );

    this.duplicateContentPopup.onDidDismiss().then(async ({ data }) => {
      this.duplicateContentPopup = undefined;

      if (data && data.canDelete) {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.CONTINUE_CLICKED,
          Environment.DOWNLOADS,
          PageId.SHOW_DUPLICATE_CONTENT_POPUP
        );

        return this.storageService.retryCurrentTransfer().toPromise();
      }

      if (this.transferringContentsPopup) {
        await this.transferringContentsPopup.dismiss();
      }

      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.POPUP_DISMISSED,
        Environment.DOWNLOADS,
        PageId.SHOW_DUPLICATE_CONTENT_POPUP
      );

      return undefined;
    });

  }
  private async showSuccessTransferPopup(prevPopup: any, storageDestination: StorageDestination): Promise<undefined> {
    if (this.successTransferPopup) {
      return;
    }

    const spaceTakenBySunbird = await this.spaceTakenBySunbird$.toPromise();
    this.successTransferPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: (storageDestination === StorageDestination.INTERNAL_STORAGE) ?
          this.commonUtilService.translateMessage('CONTENT_SUCCESSFULLY_TRANSFERRED_TO_PHONE') :
          this.commonUtilService.translateMessage('CONTENT_SUCCESSFULLY_TRANSFERRED_TO_SDCARD'),
        metaInfo: this.commonUtilService.translateMessage('SPACE_TAKEN_BY_APP', this.appName)
          + this.fileSizePipe.transform(spaceTakenBySunbird),
        sbPopoverContent: this.commonUtilService.translateMessage('SPACE_AVAILABLE_ON_SDCARD') +
          this.fileSizePipe.transform(this.availableExternalMemorySize),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OKAY'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
      },
      cssClass: 'sb-popover dw-active-downloads-popover',
    });

    await this.successTransferPopup.present();

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.CONTENT_TRANSFER_SUCCEED_POPUP,
      Environment.DOWNLOADS
    );

    this.successTransferPopup.onDidDismiss().then(({ data }) => {
      this.successTransferPopup = undefined;

      if (data && data.canDelete) {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.OK_CLICKED,
          Environment.DOWNLOADS,
          PageId.SHOW_DUPLICATE_CONTENT_POPUP,
          undefined,
          undefined,
          undefined,
          featureIdMap.downloadManager.STORAGE_SETTINGS_TRANSFER
        );
      }
      return undefined;
    });

  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }
}
