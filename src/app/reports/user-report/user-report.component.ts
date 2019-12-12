import { ReportAlertComponent } from './../report-alert/report-alert.component';
import { Component, OnInit, NgZone, Inject, ViewEncapsulation } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import {
  SummarizerService,
  SummaryRequest,
  ReportSummary,
  DeviceInfo,
  Profile
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { UtilityService } from '@app/services/utility-service';
import { AppHeaderService } from '@app/services/app-header.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  ImpressionType,
  PageId,
  Environment,
  InteractType,
  InteractSubtype,
} from '@app/services/telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserReportComponent implements OnInit {

  profile: Profile;
  downloadDirectory: string;
  reportSummaryRequest: Partial<ReportSummary>;
  totalScore;
  maxTotalScore;
  totalTime;
  assessmentData;
  columns = [
    {
      name: this.commonUtilService.translateMessage('QUESTION_MARKS'),
      prop: 'index'
    }, {
      name: this.commonUtilService.translateMessage('TIME'),
      prop: 'timespent'
    }, {
      name: this.commonUtilService.translateMessage('RESULT'),
      prop: 'result'
    }
  ];
  contentName: string;
  deviceId: string;
  version: string;
  fileUrl: string;
  expTime: any;
  response: any;
  handle: string;
  fileTransfer: FileTransferObject = this.transfer.create();
  private navData: any;
  backButtonFunc: Subscription;

  constructor(
    @Inject('SUMMARIZER_SERVICE') public summarizerService: SummarizerService,
    private transfer: FileTransfer,
    private translate: TranslateService,
    private file: File,
    private datePipe: DatePipe,
    private loading: LoadingController,
    private zone: NgZone,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private router: Router,
    private platform: Platform,
    private location: Location
  ) {
    this.getNavData();
    this.downloadDirectory = this.file.dataDirectory;
    this.utilityService.getDownloadDirectoryPath()
      .then((response: any) => {
        this.downloadDirectory = response;
      });
  }

  getNavData() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navData = navigation.extras.state;
    }
  }

  ngOnInit() {
    this.headerService.hideHeader();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.REPORTS_USER_ASSESMENT_DETAILS,
      Environment.USER
    );

    this.deviceId = this.deviceInfo.getDeviceID();

    this.appVersion.getAppName()
      .then((appName: any) => {
        return appName;
      });
    this.profile = this.appGlobalService.getCurrentUser();
  }

  async ionViewWillEnter() {

    const loader = await this.commonUtilService.getLoader();

    const that = this;

    this.reportSummaryRequest = this.navData.report;
    this.contentName = this.reportSummaryRequest.name;
    this.handle = this.navData.handle;
    const summaryRequest: SummaryRequest = {
      qId: '',
      uids: [this.reportSummaryRequest.uid],
      contentId: this.reportSummaryRequest.contentId,
      hierarchyData: null,
    };

    that.summarizerService.getLearnerAssessmentDetails(summaryRequest).toPromise()
      .then(reportList => {
        const data = reportList.get(this.reportSummaryRequest.uid);
        const rows = data.reportDetailsList.map(row => {
          this.response = data.reportDetailsList;
          return {
            'index': 'Q' + (('00' + row.qindex).slice(-3)),
            'result': row.score + '/' + row.maxScore,
            'timespent': that.formatTime(row.timespent),
            'qdesc': row.qdesc,
            'score': row.score,
            'maxScore': row.maxScore,
            'qtitle': row.qtitle,
            'qid': row.qid
          };
        });
        data['uiRows'] = rows;
        data['uiTotalTime'] = that.formatTime(data['totalTime']);
        data['fromUser'] = true;
        data['fromGroup'] = false;
        that.zone.run(async () => {
          loader.present().then(() => {
             loader.dismiss();
          });
          data['showResult'] = true;
          that.assessmentData = data;
          that.assessmentData['showPopup'] = true;
          that.assessmentData['popupCallback'] = ReportAlertComponent;
          that.assessmentData['totalQuestionsScore'] = that.reportSummaryRequest.totalQuestionsScore;
          this.totalScore = data.totalScore;
          this.maxTotalScore = data.maxTotalScore;
          this.totalTime = data.totalTime;
        });
      })
      .catch(async err => {
        loader.present().then(() => {
          loader.dismiss();
       });
      });

    this.handleDeviceBackButton();
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.goBack();
    });
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
      this.backButtonFunc = undefined;
    }
  }

  formatTime(time: number): string {
    const minutes: any = '0' + Math.floor(time / 60);
    const seconds: any = '0' + Math.round(time % 60);
    return minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  goBack() {
    this.location.back();
  }


  convertToCSV(teams) {
    let csv: any = '';
    let line: any = '';
    const that = this;
    const values = this.response;
    const valuesLength = values.length;
    const totalTimespent = values.totalTimespent;
    const fileExpTime = this.datePipe.transform(new Date(this.expTime), 'dd-MM-yyyy hh:mm:ss a');
    const contentStartTime = this.datePipe.transform(new Date(teams[0].timestamp), 'dd-MM-yyyy hh:mm:ss a');
    for (let m = 0; m < valuesLength; m++) {
      line += 'Device ID' + ',' + this.deviceId + '\n';
      line += 'User name (User ID)' + ',' + this.handle + '(' + this.reportSummaryRequest.uid + ')' + '\n';
      line += 'Content name (Content ID)' + ',' + this.reportSummaryRequest.name + '(' + this.reportSummaryRequest.contentId + ')' + '\n';
      line += 'Content started time' + ',' + contentStartTime + '\n';
      line += 'Total Time' + ',' + this.formatTime(this.totalTime) + '\n';
      line += 'Total Score' + ',' + ' ' + this.totalScore + '/' +
     (this.reportSummaryRequest.totalQuestionsScore || this.reportSummaryRequest.totalMaxScore) + '\n';
      line += 'File export time' + ',' + fileExpTime + '\n';
      line += '\n\n';
      line += 'Question#' + ',';
      line += 'QuestionId' + ',';
      line += 'Score' + ',';
      line += 'Time' + '\n';
      break;
    }
    line += '\n';
    for (let j = 0; j < valuesLength; j++) {
      line += '\"' + values[j].qtitle + '\"' + ',';
      line += '\"' + values[j].qid + '\"' + ',';
      line += '\"' + ' ' + values[j].score + '/' + values[j].maxScore + '\"' + ',';
      line += '\"' + this.formatTime(values[j].timespent) + '\"' + '\n';
    }
    csv += line + '\n';
    return csv;

  }

  importcsv() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_REPORT_CLICKED,
      Environment.USER,
      PageId.REPORTS_USER_ASSESMENT_DETAILS, undefined,
    );
    this.expTime = new Date().getTime();
    const csv: any = this.convertToCSV(this.response);
    const combineFilename = this.deviceId + '_' + this.response[0].uid + '_' + this.response[0].contentId + '_' + this.expTime + '.csv';

    this.file.writeFile(this.downloadDirectory, combineFilename, csv)
      .then(
        _ => {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('CSV_DOWNLOAD_SUCCESS', combineFilename), false, 'custom-toast');
        }
      )
      .catch(
        err => {
          this.file.writeExistingFile(this.downloadDirectory, combineFilename, csv)
            .then(
              _ => {
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('CSV_DOWNLOAD_SUCCESS', combineFilename), false, 'custom-toast');
              }
            )
            .catch();
        }
      );
  }

}
