import { Component, OnInit, NgZone, Inject } from '@angular/core';
import {
  TelemetrySyncStat,
  TelemetryStat,
  TelemetryService,
  SharedPreferences,
  TelemetryImpressionRequest,
  TelemetryExportResponse,
  TelemetryExportRequest
} from 'sunbird-sdk';
import { CommonUtilService } from 'services/common-util.service';
import { TelemetryGeneratorService } from 'services/telemetry-generator.service';
import { PreferenceKey } from 'app/app.constant';
import {
  PageId,
  Environment,
  ImpressionType,
  InteractType,
  InteractSubtype
} from 'services/telemetry-constants';
import { DataSyncType } from './data-sync-type.enum';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

declare const cordova;

@Component({
  selector: 'app-data-sync',
  templateUrl: './data-sync.component.html',
  styleUrls: ['./data-sync.component.scss'],
})

export class DataSyncComponent implements OnInit {

  dataSyncType: DataSyncType;
  lastSyncedTimeString = 'LAST_SYNC';
  latestSync = '';

  OPTIONS: typeof DataSyncType = DataSyncType;
  backButtonFunc: Subscription;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    public zone: NgZone,
    private social: SocialSharing,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform
  ) { }

  async init() {
    this.lastSyncedTimeString = this.commonUtilService.translateMessage('LAST_SYNC');
    this.getLastSyncTime();
    const syncType = await this.preferences.getString(PreferenceKey.KEY_DATA_SYNC_TYPE).toPromise();
    switch (syncType) {
      case 'OFF':
        this.dataSyncType = DataSyncType.off;
        break;
      case 'OVER_WIFI_ONLY':
        this.dataSyncType = DataSyncType.over_wifi;
        break;
      case 'ALWAYS_ON':
        this.dataSyncType = DataSyncType.always_on;
        break;
      default:
        this.dataSyncType = DataSyncType.off;
    }
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
    /*istanbul ignore else */
    if (this.dataSyncType !== undefined) {
      this.generateSyncTypeInteractTelemetry(this.dataSyncType);
      this.preferences.putString(PreferenceKey.KEY_DATA_SYNC_TYPE, this.dataSyncType).toPromise().then();
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
  getLastSyncTime() {
    this.telemetryService.getTelemetryStat().subscribe((syncStat: TelemetryStat) => {
      const that = this;
      that.zone.run(() => {
        if (syncStat.lastSyncTime !== 0) {
          const milliseconds = Number(syncStat.lastSyncTime);

          // get date
          const date: Date = new Date(milliseconds);
          const month: number = date.getMonth() + 1;

          // complete date and time
          const dateAndTime: string = date.getDate() + '/' + month +
            '/' + date.getFullYear() + ', ' + that.getTimeIn12HourFormat(date);
          that.latestSync = this.lastSyncedTimeString + ' ' + dateAndTime;
        }
      });
    }, (err) => {
    });
  }

  async shareTelemetry() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const telemetryExportRequest: TelemetryExportRequest = {
      destinationFolder: cordova.file.externalDataDirectory
    };
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SHARE_TELEMETRY_CLICKED,
      Environment.SETTINGS,
      PageId.SETTINGS_DATASYNC,
      undefined);
    this.telemetryService.exportTelemetry(telemetryExportRequest).subscribe(async (data: TelemetryExportResponse) => {
      await loader.dismiss();
      this.social.share('', '', 'file://' + data.exportedFilePath, '');
    }, async () => {
      await loader.dismiss();
      this.commonUtilService.showToast('SHARE_TELEMETRY_FAILED');
    });
  }

  async onSyncClick() {
    const that = this;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.generateInteractEvent(InteractType.TOUCH, InteractSubtype.MANUALSYNC_INITIATED, null);
    this.telemetryService.sync(true)
      .subscribe((syncStat: TelemetrySyncStat) => {

        that.zone.run(async () => {
          this.generateInteractEvent(InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, syncStat.syncedFileSize);
          const milliseconds = Number(syncStat.syncTime);

          // get date
          const date: Date = new Date(milliseconds);
          const month: number = date.getMonth() + 1;

          // complete date and time
          const dateAndTime: string = date.getDate() + '/' + month +
            '/' + date.getFullYear() + ', ' + that.getTimeIn12HourFormat(date);

          that.latestSync = this.lastSyncedTimeString + ' ' + dateAndTime;

          // store the latest sync time
          this.preferences.putString(PreferenceKey.KEY_DATA_SYNC_TIME, dateAndTime).toPromise().then();

          await loader.dismiss();
          this.commonUtilService.showToast('DATA_SYNC_SUCCESSFUL');
        });
      }, async (error) => {
        await loader.dismiss();
        this.commonUtilService.showToast('DATA_SYNC_FAILURE');
        console.error('Telemetry Data Sync Error: ' + error);
      });
  }




  getTimeIn12HourFormat(time: Date): string {
    const date = new Date(time);
    let hours = date.getHours();
    const minutes: number = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let newMinutes = minutes < 10 ? '0' + minutes : '' + minutes;
    const strTime = hours + ':' + newMinutes + ' ' + ampm;

    return strTime;
  }



  generateInteractEvent(interactType: string, subtype: string, size: number) {
    /*istanbul ignore else */
    if (size != null) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        interactType,
        subtype,
        Environment.SETTINGS,
        PageId.SETTINGS_DATASYNC,
        undefined,
        {
          SizeOfFileInKB: (size / 1000) + ''
        }
      );
    }
  }
  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SETTINGS_DATASYNC, Environment.SETTINGS, false);
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
}
