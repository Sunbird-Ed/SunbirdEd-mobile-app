import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Environment, ID, InteractType, PageId } from '../../../services/telemetry-constants';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { StoragePermissionHandlerService } from '../../../services/storage-permission/storage-permission-handler.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@capacitor-community/file-opener';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { FilePathService } from '../../../services/file-path/file.service';
import { FilePaths } from '../../../services/file-path/file';

import 'datatables.net-fixedcolumns';
@Component({
    selector: 'dashboard-component',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  @Input() dashletData: any;
  @Input() collectionName: string;
  DashletRowData = { values: [] };
  columnConfig = {
    columnConfig: [],
  };


  @ViewChild('lib', { static: false }) lib: any;

  constructor(
    private storagePermissionHandlerService: StoragePermissionHandlerService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private file: File,
    private filePathService: FilePathService,
    private platform: Platform
  ) {

  }

  ngOnInit() {
    this.DashletRowData.values = this.dashletData.rows;
    this.columnConfig.columnConfig = this.dashletData.columns;
  }


  async exportCsv() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.DOWNLOAD_CLICKED,
      undefined,
      Environment.GROUP,
      PageId.ACTIVITY_DASHBOARD,
      undefined,
      undefined,
      undefined,
      undefined,
      ID.DOWNLOAD_CLICKED
    );
    const appName = (await App.getInfo()).name;
    if(await this.commonUtilService.isAndroidVer13()) {
      this.handleExportCsv();
    } else {
      await this.storagePermissionHandlerService.checkForPermissions(PageId.ACTIVITY_DASHBOARD).then(async (result) => {
        if (result) {
          this.handleExportCsv();
        } else {
          await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', appName, PageId.ACTIVITY_DASHBOARD, true);
        }
      }).catch((err) => {
        console.log('checkForPermissions err', err);
      });
    }
  }

  async handleExportCsv() {
    const expTime = new Date().getTime();
    const filename = this.collectionName.trim() + '_' + expTime + '.csv';
    const filePath = this.platform.is('ios') ? FilePaths.DOCUMENTS : FilePaths.EXTERNAL_DATA;
    const folderPath = await this.filePathService.getFilePath(filePath);
    const downloadDirectory = this.platform.is('ios') ? `${folderPath}Download/` : folderPath
    this.lib.instance.exportCsv({ 'strict': true }).then((csvData) => {
      console.log('exportCSVdata', csvData);
      this.file.writeFile(downloadDirectory, filename, csvData, { replace: true })
        .then((res) => {
          console.log('rs write file', res);
          this.openCsv(res.nativeURL);
          this.commonUtilService.showToast(
            this.commonUtilService.translateMessage('DOWNLOAD_COMPLETED', filename), false, 'custom-toast');
        })
        .catch((err) => {
          this.writeFile(downloadDirectory, csvData);
          console.log('writeFile err', err);
        });
    }).catch((err) => {
      console.log('export csv err', err);
    });
  }

  openCsv(path) {
    FileOpener.open({filePath: path, contentType: 'text/csv'})
      .then(() => console.log('File is opened'))
      .catch((e) => {
        console.log('Error opening file', e);
        this.commonUtilService.showToast('CERTIFICATE_ALREADY_DOWNLOADED');
      });
  }

  writeFile(downloadDirectory: string, csvData: any) {
    const fileName = `course_${new Date().getTime()}`;
    this.file.writeFile(downloadDirectory, fileName, csvData, { replace: true })
      .then((res) => {
        console.log('rs write file', res);
        this.openCsv(res.nativeURL);
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('DOWNLOAD_COMPLETED', fileName), false, 'custom-toast');
      })
      .catch((err) => {
        console.log('writeFile err', err);
      });
  }

}
