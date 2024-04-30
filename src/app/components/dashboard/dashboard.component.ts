import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Environment, ID, InteractType, PageId } from '../../../services/telemetry-constants';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { StoragePermissionHandlerService } from '../../../services/storage-permission/storage-permission-handler.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Platform } from '@ionic/angular';
import 'datatables.net-fixedcolumns';
@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
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
    private fileOpener: FileOpener,
    private appVersion: AppVersion,
    private platform: Platform
  ) {

  }

  ngOnInit() {
    this.DashletRowData.values = this.dashletData.rows;
    this.columnConfig.columnConfig = this.dashletData.columns;
  }

  ngAfterViewInit() {
    let ele = document.querySelectorAll('th')
    if(ele) {
      ele.forEach((th, i) => {
        th.className = ""
        if(i == 0) {
          th.className = "sorting_asc"
        } else {
          th.className = "sorting"
        }
      });
    } 
  }

  handleSort(i) {
    let sortClmn = this.columnConfig.columnConfig[i].data
    let ele = document.querySelectorAll('th')
    if(ele) {
      ele.forEach((th, indx) => {
        if(i == indx && th.className == "sorting") {
          this.sortAscDesc(sortClmn, "asc");
          th.className = ""
          th.className = "sorting_asc" 
        } else if(i == indx && th.className == "sorting_asc") {
          this.sortAscDesc(sortClmn, "desc");
          th.className = ""
          th.className = "sorting_desc" 
        } else if(i == indx && th.className == "sorting_desc") {
          this.sortAscDesc(sortClmn, "asc");
          th.className = ""
          th.className = "sorting_asc" 
        } else {
          th.className = ""
          th.className = "sorting"
        }
      });
    } 
  }

  sortAscDesc(sortClmn, type) {
    this.DashletRowData.values.sort((a, b) => {
      if (typeof(a[sortClmn]) == 'string') {
        const strA = a[sortClmn].toUpperCase();
        const strB = b[sortClmn].toUpperCase();
        if (strA < strB) {
          return type == "asc" ? -1 : 1;
        }
        if (strA > strB) {
          return type == "asc" ? 1 : -1;
        }
        return 0;
      } else { 
        return type == "asc" ? a[sortClmn] - b[sortClmn] : b[sortClmn] - a[sortClmn]
      }
    });
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
    if(this.commonUtilService.isAndroidVer13()) {
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

  handleExportCsv() {
    const expTime = new Date().getTime();
    const filename = this.collectionName.trim() + '_' + expTime + '.csv';
    const downloadDirectory = this.platform.is('ios') ? `${cordova.file.documentsDirectory}Download/` : cordova.file.externalDataDirectory

    let csvData = this.convertJsonToCsv()
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
  }

  convertJsonToCsv(): string {
    let oftionData = this.columnConfig?.columnConfig?.map(function (obj) {
      return obj.title;
    });;
    const header = oftionData ? (oftionData).join(",") + "\n" : Object.keys(this.DashletRowData?.values[0]).join(",") + "\n"; // TO Generate the CSV header
    let csvData = header;
    for (const row of this.DashletRowData?.values) {
      const values = Object.values(row).map((value: any) => {
        // Check if the value contains commas
        if (typeof value === 'string' && value.includes(',')) {
          // Escape the value by wrapping it in double quotes and replacing any double quotes within the value
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvData += values.join(",") + "\n";
    }
    return csvData;
  }

  openCsv(path) {
    this.fileOpener.open(path, 'text/csv')
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
