import {  Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonUtilService, PageId, TelemetryGeneratorService } from '@app/services';
import { StoragePermissionHandlerService } from '@app/services/storage-permission/storage-permission-handler.service';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
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
  

  @ViewChild('lib', { static: false }) lib: any;

  constructor(
    private storagePermissionHandlerService: StoragePermissionHandlerService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private file: File,
    private fileOpener: FileOpener
) {
   
}

  ngOnInit() {
    this.DashletRowData.values = this.dashletData.rows;
    this.columnConfig.columnConfig = this.dashletData.columns;
  }


  async exportCsv() {
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
        
        this.lib.instance.exportCsv().then((csvData) => {
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
    
        })
        
      } else{
        console.log('eeeeeeeee');
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.ACTIVITY_DETAIL, true);
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