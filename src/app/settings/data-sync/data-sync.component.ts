import { Component, OnInit, NgZone, Inject, ChangeDetectorRef } from '@angular/core';
import {
  TelemetrySyncStat,
  TelemetryService,
  TelemetryImpressionRequest,
  TelemetryAutoSyncModes,
  ArchiveService,
  ArchiveObjectType,
  ObjectNotFoundError
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { TelemetryGeneratorService } from '@app/services';

import {
  PageId,
  Environment,
  ImpressionType,
  InteractType,
  InteractSubtype
} from '@app/services';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Subscription, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

declare const cordova;

@Component({
  selector: 'app-data-sync',
  templateUrl: './data-sync.component.html',
  styleUrls: ['./data-sync.component.scss'],
})

export class DataSyncComponent implements OnInit {

  lastSyncDateTime?: Observable<string | undefined>;
  dataSyncType?: TelemetryAutoSyncModes;
  OPTIONS = TelemetryAutoSyncModes;
  backButtonFunc: Subscription;
  loader: any;

  constructor(
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('ARCHIVE_SERVICE') private archiveService: ArchiveService,
    public zone: NgZone,
    private changeDetectionRef: ChangeDetectorRef,
    private social: SocialSharing,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform
  ) {
    this.lastSyncDateTime = this.telemetryService.lastSyncedTimestamp().pipe(
      map((ts) => {
        if (ts) {
          return window.dayjs(ts).format('DD/MM/YYYY, hh:mm a');
        }

        return undefined;
      }),
      tap(() => {
        this.changeDetectionRef.detectChanges();
      })
    );
  }

  async init() {
    this.zone.run(async () => {
      this.dataSyncType = (
        await this.telemetryService.autoSync.getSyncMode().toPromise() as TelemetryAutoSyncModes | undefined
      ) || TelemetryAutoSyncModes.ALWAYS_ON;
    });
  }

  ngOnInit() {
    this.init();
    const telemetryImpressionRequest = new TelemetryImpressionRequest();
    telemetryImpressionRequest.type = ImpressionType.VIEW;
    telemetryImpressionRequest.pageId = PageId.SETTINGS_DATASYNC;
    telemetryImpressionRequest.env = Environment.SETTINGS;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SETTINGS_DATASYNC,
      Environment.SETTINGS, '', '', ''
    );
  }

  onSelected() {
    if (this.dataSyncType) {
      this.generateSyncTypeInteractTelemetry(this.dataSyncType);
      this.telemetryService.autoSync.setSyncMode(this.dataSyncType).toPromise();
    }
  }

  generateSyncTypeInteractTelemetry(dataSyncType: string) {
    const value = new Map();
    value['dataSyncType'] = dataSyncType;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DATA_SYNC_TYPE,
      Environment.SETTINGS,
      PageId.SETTINGS_DATASYNC,
      undefined,
      value
    );
  }

  async shareTelemetry() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SHARE_TELEMETRY_CLICKED,
      Environment.SETTINGS,
      PageId.SETTINGS_DATASYNC,
      undefined);

    try {
      await this.telemetryService.sync({
        ignoreAutoSyncMode: false,
        ignoreSyncThreshold: true
      }).toPromise();
    } catch (e) {
      console.error(e);
    }

    return this.archiveService.export(
      {
        objects: [{ type: ArchiveObjectType.TELEMETRY }],
        filePath: cordova.file.externalCacheDirectory + '/tmp'
      })
      .toPromise()
      .then(async (r) => {
        await loader.dismiss();
        return this.social.share('', '', r.filePath, '');
      })
      .catch(async (e) => {
        console.error(e);
        await loader.dismiss();

        if (e instanceof ObjectNotFoundError) {
          this.commonUtilService.showToast('SHARE_TELEMETRY_NO_DATA_FOUND');
        } else {
          this.commonUtilService.showToast('SHARE_TELEMETRY_FAILED');
        }
      });
  }

  async onSyncClick() {
    const that = this;
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    this.generateInteractEvent(InteractType.TOUCH, InteractSubtype.SYNC_NOW_CLICKED, null);
    this.telemetryService.sync({
      ignoreAutoSyncMode: true,
      ignoreSyncThreshold: true
    }).subscribe();

    sbsync.onSyncSucces(async (syncStat) => {
      if (syncStat.telemetry_error) {
        if (this.loader) {
          await this.loader.dismiss();
        }

        this.commonUtilService.showToast('DATA_SYNC_FAILURE');
        console.error('Telemetry Data Sync Error: ', syncStat);
        return;
      } else if (!syncStat.syncedEventCount) {
        if (this.loader) {
          await this.loader.dismiss();
        }
        this.commonUtilService.showToast('DATA_SYNC_NOTHING_TO_SYNC');
        console.error('Telemetry Data Sync Error: ', syncStat);
        return;
      }

      this.generateInteractEvent(InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, syncStat.syncedFileSize);
      if (this.loader) {
        await this.loader.dismiss();
      }
      this.commonUtilService.showToast('DATA_SYNC_SUCCESSFUL');
      console.log('Telemetry Data Sync Success: ', syncStat);
    }, async (error) => {
      if (this.loader) {
        await this.loader.dismiss();
      }
      this.commonUtilService.showToast('DATA_SYNC_FAILURE');
      console.error('Telemetry Data Sync Error: ', error);
    });
  }

  generateInteractEvent(interactType: string, subtype: string, size: number) {
    /*istanbul ignore else */
      this.telemetryGeneratorService.generateInteractTelemetry(
        interactType,
        subtype,
        Environment.SETTINGS,
        PageId.SETTINGS_DATASYNC,
        undefined,
        size ? { SizeOfFileInKB: (size / 1000) + '' } : undefined
      );
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SETTINGS_DATASYNC, Environment.SETTINGS, false);
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
}