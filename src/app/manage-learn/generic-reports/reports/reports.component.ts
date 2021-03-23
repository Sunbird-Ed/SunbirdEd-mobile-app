import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService, ToastService } from '../../core';
import * as _ from 'lodash-es';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DownloadAndPreviewService } from '../../core/services/download-and-preview.service';
import { File } from '@ionic-native/file/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  state: { [k: string]: any };
  data: any;
  submissionId: any;
  action;
  appFolderPath: any;
  fileName: any;
  isIos: boolean;
  filters: any;
  constructor(
    private router: Router,
    private toast: ToastService,
    private loader: LoaderService,
    private dhiti: DhitiApiService,
    private fileTransfer: FileTransfer,
    private dap: DownloadAndPreviewService,
    private file: File,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private datepipe: DatePipe
  ) {
    console.log(this.router.getCurrentNavigation().extras.state);
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    // remove null and undefined
    this.state = _.omitBy(this.state, _.isNil);
    this.getReport();
    this.isIos = this.platform.is('ios') ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + '/Download/'
      : cordova.file.externalRootDirectory + '/Download/';
  }
  getReport() {
    this.loader.startLoader();
    let payload = this.state;
    const config = {
      url: urlConstants.API_URLS.GENERIC_REPORTS,
      payload: payload,
    };

    // this.data = {
    //   result: true,
    //   programName: '',
    //   solutionName: '',
    //   filters: [
    //     {
    //       order: '',
    //       filter: {
    //         type: 'dropdown',
    //         title: '',
    //         keyToSend: 'submissionId',
    //         data: [
    //           {
    //             _id: '1',
    //             name: 'submission 1',
    //           },
    //         ],
    //       },
    //     },
    //   ],
    //   reportSections: [
    //     {
    //       order: 1,
    //       chart: {
    //         type: 'horizontalBar',
    //         title: '',
    //         submissionDateArray: ['26 September 2019', '26 September 2019', '26 September 2019'],
    //         data: {
    //           labels: [
    //             'Community Participation and EWS/DG Integration ',
    //             'Safety and Security',
    //             'Teaching and Learning',
    //           ],
    //           datasets: [
    //             {
    //               label: 'L1',
    //               data: [2, 2, 5],
    //             },
    //             {
    //               label: 'L2',
    //               data: [4, 3, 9],
    //             },
    //           ],
    //         },
    //       },
    //     },
    //     {
    //       order: 2,
    //       chart: {
    //         type: 'expansion',
    //         title: 'Descriptive view',
    //         heading: ['Assess. 1', 'Assess. 2'],
    //         domains: [
    //           {
    //             domainName: 'Community Participation and EWS/DG Integration',
    //             criterias: [
    //               {
    //                 criteriaName: 'Academic Integration',
    //                 levels: ['Level 4'],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // };
    const timeStamp = '_' + this.datepipe.transform(new Date(), 'yyyy-MMM-dd-HH-mm-ss a');
    this.fileName = timeStamp + '.pdf';

    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (success.result === true && success.reportSections) {
          this.data = success;

          if (this.data.filters) {
            this.filters = this.data.filters;
          }
        } else {
          this.toast.openToast(success.message);
          this.data = success;
        }
      },
      (error) => {
        this.toast.openToast(error.message);
        this.loader.stopLoader();
      }
    );
  }

  instanceReport(e) {
    this.state.submissionId = this.submissionId;
    this.getReport();
  }

  downloadSharePdf(action) {
    this.action = action;
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      .then((status) => {
        if (status.hasPermission) {
          this.getObservationReportUrl();
        } else {
          this.androidPermissions
            .requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            .then((success) => {
              if (success.hasPermission) {
                this.getObservationReportUrl();
              }
            })
            .catch((error) => {});
        }
      });
  }

  getObservationReportUrl() {
    this.loader.startLoader();
    let url = urlConstants.API_URLS.GENERIC_REPORTS;

    const config = {
      url: url,
      payload: this.state,
    };
    config.payload.pdf = true;
    this.dhiti.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        console.log(JSON.stringify(success));
        if (success.status === 'success' && success.pdfUrl) {
          this.downloadSubmissionDoc(success.pdfUrl);
        } else {
          this.toast.openToast(success.message);
        }
      },
      (error) => {
        this.toast.openToast(error.message);

        this.loader.stopLoader();
      }
    );
  }

  downloadSubmissionDoc(fileRemoteUrl) {
    // this.loader.startLoader();
    if (this.isIos) {
      this.checkForDowloadDirectory(fileRemoteUrl);
    } else {
      this.filedownload(fileRemoteUrl);
    }
  }

  checkForDowloadDirectory(fileRemoteUrl) {
    this.file
      .checkDir(this.file.documentsDirectory, 'Download')
      .then((success) => {
        this.filedownload(fileRemoteUrl);
      })
      .catch((err) => {
        this.file.createDir(cordova.file.documentsDirectory, 'Download', false).then(
          (success) => {
            this.filedownload(fileRemoteUrl);
          },
          (error) => {}
        );
      });
  }

  filedownload(fileRemoteUrl) {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + this.fileName)
      .then((success) => {
        this.action === 'share'
          ? this.dap.shareSubmissionDoc(this.appFolderPath + this.fileName)
          : this.dap.previewSubmissionDoc(this.appFolderPath + this.fileName);
        // this.loader.stopLoader();
      })
      .catch((error) => {
        // this.loader.stopLoader();
      });
  }
}
