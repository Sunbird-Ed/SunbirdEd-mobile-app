import {  Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonUtilService, Environment, ID, InteractType, PageId, TelemetryGeneratorService } from '@app/services';
import { StoragePermissionHandlerService } from '@app/services/storage-permission/storage-permission-handler.service';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
@Component({
    selector: "dashboard-component",
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() dashletData: any;
  @Input() collectionName: string;
  DashletRowData = { values: [] };
  columnConfig = { columnConfig: [] };
  

  @ViewChild('lib') lib: any;

  constructor(
    private storagePermissionHandlerService: StoragePermissionHandlerService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private file: File,
    private fileOpener: FileOpener,
    private appVersion: AppVersion
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
    const appName = await this.appVersion.getAppName();
    await this.storagePermissionHandlerService.checkForPermissions(PageId.ACTIVITY_DASHBOARD).then(async (result) => {
      if (result) {
        // this.telemetryGeneratorService.generateInteractTelemetry(
        //   InteractType.TOUCH,
        //   InteractSubtype.DOWNLOAD_CLICKED,
        //   Environment.USER,
        //   PageId.ACTIVITY_DETAIL, undefined,
        // );
        const expTime = new Date().getTime();
        const filename = this.collectionName.trim() + '_' + expTime + '.csv';
        const downloadDirectory = `${cordova.file.externalRootDirectory}Download/`;
        
        this.lib.instance.exportCsv({'strict': true}).then((csvData) => {
          console.log('exportCSVdata', csvData)
          this.file.writeFile(downloadDirectory, filename, csvData, {replace: true})
            .then((res)=> {
              console.log('rs write file', res);
              this.openCsv(res.nativeURL)
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('DOWNLOAD_COMPLETED', filename), false, 'custom-toast');
            })
            .catch((err) => {
              console.log('writeFile err', err)
            });
        }).catch((err) => {
          console.log('checkForPermissions err', err);
        })
        
      } else{
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', appName, PageId.ACTIVITY_DASHBOARD, true);
      }
    });
  }

  openCsv(path) {
    this.fileOpener.open(path, 'text/csv')
      .then(() => console.log('File is opened'))
      .catch((e) => {
        console.log('Error opening file', e);
        this.commonUtilService.showToast('CERTIFICATE_ALREADY_DOWNLOADED');
      });
  }

}