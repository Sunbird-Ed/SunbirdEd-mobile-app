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
import { CommonUtilService, TelemetryGeneratorService, AppHeaderService } from '../../../services';
import { PreferenceKey } from '../../app.constant';
import {
  PageId,
  Environment,
  ImpressionType,
  InteractType,
  InteractSubtype
} from '../../../services/telemetry-constants';
import { DataSyncType } from './data-sync-type.enum';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

declare const cordova;

@Component({
  selector: 'app-data-sync',
  templateUrl: './data-sync.component.html',
  styleUrls: ['./data-sync.component.scss'],
})

export class DataSyncComponent {

  dataSyncType: DataSyncType;
  lastSyncedTimeString = 'LAST_SYNC';
  latestSync = '';

  OPTIONS: typeof DataSyncType = DataSyncType;

  constructor(
    public zone: NgZone,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    private social: SocialSharing,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService
  ) { }

  init() {
    const that = this;
    this.lastSyncedTimeString = this.commonUtilService.translateMessage('LAST_SYNC');
    this.getLastSyncTime();

    // check what sync option is selected
    that.preferences.getString(PreferenceKey.KEY_DATA_SYNC_TYPE).toPromise()
      .then(val => {
        if (Boolean(val)) {
          if (val === 'OFF') {
            that.dataSyncType = DataSyncType.off;
          } else if (val === 'OVER_WIFI_ONLY') {
            that.dataSyncType = DataSyncType.over_wifi;
          } else if (val === 'ALWAYS_ON') {
            that.dataSyncType = DataSyncType.always_on;
          }
        } else {
          that.dataSyncType = DataSyncType.off;
        }
      });
  }

  ionViewDidLoad() {
    this.init();
    const telemetryImpressionRequest = new TelemetryImpressionRequest();
    telemetryImpressionRequest.type = ImpressionType.VIEW;
    telemetryImpressionRequest.pageId = PageId.SETTINGS_DATASYNC;
    telemetryImpressionRequest.env = Environment.SETTINGS;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SETTINGS_DATASYNC,
      Environment.SETTINGS, '', '', '',
      undefined,
      undefined
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
          const month: Number = date.getMonth() + 1;

          // complete date and time
          const dateAndTime: string = date.getDate() + '/' + month +
            '/' + date.getFullYear() + ', ' + that.getTimeIn12HourFormat(date);
          that.latestSync = this.lastSyncedTimeString + ' ' + dateAndTime;
        }
      });
    }, (err) => {
    });
  }

  shareTelemetry() {
    const loader = this.commonUtilService.getLoader();
    loader.present();
    const telemetryExportRequest: TelemetryExportRequest = {
      destinationFolder: cordova.file.externalDataDirectory
    };
    this.telemetryService.exportTelemetry(telemetryExportRequest).subscribe((data: TelemetryExportResponse) => {
      loader.dismiss();
      this.social.share('', '', 'file://' + data.exportedFilePath, '');
    }, () => {
      loader.dismiss();
      this.commonUtilService.showToast('SHARE_TELEMETRY_FAILED');
    });
  }

  onSyncClick() {
    const that = this;
    const loader = this.commonUtilService.getLoader();
    loader.present();
    this.generateInteractEvent(InteractType.TOUCH, InteractSubtype.MANUALSYNC_INITIATED, null);
    this.telemetryService.sync(true)
      .subscribe((syncStat: TelemetrySyncStat) => {

        that.zone.run(() => {
          this.generateInteractEvent(InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, syncStat.syncedFileSize);
          const milliseconds = Number(syncStat.syncTime);

          // get date
          const date: Date = new Date(milliseconds);
          const month: Number = date.getMonth() + 1;

          // complete date and time
          const dateAndTime: string = date.getDate() + '/' + month +
            '/' + date.getFullYear() + ', ' + that.getTimeIn12HourFormat(date);

          that.latestSync = this.lastSyncedTimeString + ' ' + dateAndTime;

          // store the latest sync time
          this.preferences.putString(PreferenceKey.KEY_DATA_SYNC_TIME, dateAndTime).toPromise().then();

          loader.dismiss();
          this.commonUtilService.showToast('DATA_SYNC_SUCCESSFUL');
        });
      }, (error) => {
        loader.dismiss();
        this.commonUtilService.showToast('DATA_SYNC_FAILURE');
        console.error('Telemetry Data Sync Error: ' + error);
      });
  }




  getTimeIn12HourFormat(time: Date): string {
    const date = new Date(time);
    let hours = date.getHours();
    const minutes: number = date.getMinutes();
    let newMinutes: string;
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    newMinutes = minutes < 10 ? '0' + minutes : '' + minutes;
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
        },
        undefined,
        undefined
      );
    }
  }
}
