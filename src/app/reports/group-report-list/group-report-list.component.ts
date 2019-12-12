import { AppGlobalService } from '@app/services/app-global-service.service';
import { UtilityService } from '@app/services/utility-service';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { GroupReportAlertComponent } from '../group-report-alert/group-report-alert.component';
import { TranslateService } from '@ngx-translate/core';
import { File } from '@ionic-native/file/ngx';
import { DatePipe } from '@angular/common';
import { DeviceInfo, Profile, ReportSummary, SummarizerService, SummaryRequest } from 'sunbird-sdk';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-group-report-list',
  templateUrl: './group-report-list.component.html',
  styleUrls: ['./group-report-list.component.scss'],
})
export class GroupReportListComponent implements OnInit {
  isFromUsers: boolean;
  isFromGroups: boolean;
  uids: Array<string>;
  users: Array<string>;
  reportType = 'users';
  expTime: any;
  deviceId: string;
  response: any;
  responseByUser: any;


  // Below variable stores group Report
  groupReport: any;
  profile: Profile;
  currentGroupId: string;
  fromUserColumns = [{
    name: this.commonUtilService.translateMessage('FIRST_NAME'),
    prop: 'userName'
  }, {
    name: this.commonUtilService.translateMessage('TIME'),
    prop: 'totalTimespent'
  }, {
    name: this.commonUtilService.translateMessage('SCORE'),
    prop: 'score'
  }];
  fromQuestionColumns = [{
    name: this.commonUtilService.translateMessage('QUESTIONS'),
    prop: 'index'
  }, {
    name: this.commonUtilService.translateMessage('MARKS'),
    prop: 'maxScore'
  }, {
    name: this.commonUtilService.translateMessage('ACCURACY'),
    prop: 'accuracy'
  }];

  fromUserAssessment: {};
  fromQuestionAssessment: {};
  contentName: string;
  listOfReports: Array<ReportSummary> = [];
  group: any;
  groupInfo: any;
  downloadDirectory: any;
  reportSummary: ReportSummary;
  report: ReportSummary;

  fileTransfer: FileTransferObject = this.transfer.create();
  private deviceBackButton: Subscription;

  constructor(
    private loading: LoadingController,
    private zone: NgZone,
    private transfer: FileTransfer,
    @Inject('SUMMARIZER_SERVICE') public summarizerService: SummarizerService,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private utilityService: UtilityService,
    private file: File,
    private datePipe: DatePipe,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
  ) {
    const state = this.router.getCurrentNavigation().extras.state;
    if (state) {
      this.groupInfo = this.router.getCurrentNavigation().extras.state.group;
      this.report = this.router.getCurrentNavigation().extras.state.report;
      this.uids = this.router.getCurrentNavigation().extras.state.uids;
      this.reportSummary = this.router.getCurrentNavigation().extras.state.report;
      this.users = this.router.getCurrentNavigation().extras.state.users;

    }
    this.downloadDirectory = this.file.dataDirectory;
    this.utilityService.getDownloadDirectoryPath()
      .then((response: any) => {
        this.downloadDirectory = response;
        console.log('download path', this.downloadDirectory);
      });
  }

  ngOnInit() {
    this.deviceId = this.deviceInfo.getDeviceID();
    this.profile = this.appGlobalService.getCurrentUser();
    this.headerService.hideHeader();
  }
  ionViewWillEnter() {
    this.fetchAssessment(this.reportType, false);
    this.deviceBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack();
      this.deviceBackButton.unsubscribe();
    });
  }

  async fetchAssessment(event: string, fromUserList: boolean) {
    const subType = (event === 'users') ? InteractSubtype.REPORTS_BY_USER_CLICKED : InteractSubtype.REPORTS_BY_QUESTION_CLICKED;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      subType,
      Environment.USER,
      PageId.REPORTS_GROUP_ASSESMENT_DETAILS
    );

    const loader = await this.commonUtilService.getLoader();
    this.reportSummary = this.report;
    this.contentName = this.reportSummary.name;
    const that = this;

    const summaryRequest: SummaryRequest = {
      qId: '',
      uids: this.uids,
      contentId: this.reportSummary.contentId,
      hierarchyData: null
    };
    if (fromUserList) {
      summaryRequest.uids = [this.reportSummary.uid];
    }
    if (event === 'users' && !this.fromUserAssessment) {
      this.reportType = event;
    //  await loader.present();
      this.summarizerService.getReportsByUser(summaryRequest).toPromise()
        .then((data: any) => {
          this.groupReport = data;
          let averageScore: any = 0;
          let averageTime = 0;
          data.forEach((report) => {
            averageTime += report.totalTimespent;
            averageScore += report.score;
            report.totalTimespent = that.formatTime(report.totalTimespent);
            report.name = this.reportSummary.name;
            that.summarizerService.getLearnerAssessmentDetails(summaryRequest).toPromise()
              .then(reportsMap => {
                const data1 = reportsMap.get(report.uid);
                const rows = data1.reportDetailsList.map(row => {
                  return {
                    index: 'Q' + (('00' + row.qindex).slice(-3)),
                    result: row.score + '/' + row.maxScore,
                    timespent: this.formatTime(row.timespent),
                    qdesc: row.qdesc,
                    score: row.score,
                    maxScore: row.maxScore,
                    qtitle: row.qtitle,
                    qid: row.qid,
                    name: report.userName,
                    timestamp: report.createdAt,
                  };
                });
                report.assessmentData = rows;
              })
              .catch(async (error: any) => {
                console.log('error', error);
                loader.present().then(() => {
                  loader.dismiss();
                });
              });
          });
          this.response = data;
          this.responseByUser = data;
          averageScore = (averageScore / data.length).toFixed(2);
          averageTime = averageTime / data.length;
          this.appGlobalService.setAverageTime(averageTime);
          this.appGlobalService.setAverageScore(averageScore);
          const details = {
            uiRows: data,
            totalScore: averageScore,
            uiTotalTime: that.formatTime(averageTime),
            fromGroup: true,
            fromUser: false,
            questionsScore: this.reportSummary.totalQuestionsScore
          };
          that.zone.run(async () => {
            loader.present().then(() => {
              loader.dismiss();
            });
            that.fromUserAssessment = details;
          });

        })
        .catch(async () => {
          loader.present().then(() => {
            loader.dismiss();
          });
        });
    } else
      if (event === 'questions') {
        this.reportType = event;
       // await loader.present();
        this.summarizerService.getReportByQuestions(summaryRequest).toPromise()
          .then((data: any) => {
            this.response = data;
            let averageTime = 0;
            let averageScore: any = 0;
            data.forEach((question) => {
              question.index = 'Q' + (('00' + question.qindex).slice(-3));
              averageTime += question.time_spent;
              averageScore += question.maxScore;
              question.accuracy = (question.correct_users_count || '0') + '/' + question.occurenceCount;
              question.users = this.users;
              question.uids = this.uids;
            });
            averageScore = (averageScore / data.length).toFixed(2);
            averageTime = averageTime / data.length;
            const details = {
              uiRows: data,
              totalScore: that.appGlobalService.getAverageScore(),
              uiTotalTime: that.formatTime(that.appGlobalService.getAverageTime()),
              showPopup: true,
              popupCallback: GroupReportAlertComponent,
              fromGroup: true,
              fromUser: false
            };
            that.zone.run(async () => {
              loader.present().then(() => {
                loader.dismiss();
              });
              that.fromQuestionAssessment = details;
            });
          })
          .catch(async (error: any) => {
            console.log('error in 2nd one', error);
            loader.present().then(() => {
              loader.dismiss();
            });
          });
      }
  }

  showQuestionFromUser() {
    this.fetchAssessment('questions', true);
  }


  goToReportList() {
    this.router.navigate(['user-report'], {
      state: {
        report: this.reportSummary
      }
    });
  }

  formatTime(time: number): string {
    const mm = Math.floor(time / 60);
    const ss = Math.floor(time % 60);
    return (mm > 9 ? mm : ('0' + mm)) + ':' + (ss > 9 ? ss : ('0' + ss));
  }
  convertToCSV() {
    let csv: any = '';
    let line: any = '';
    const values = this.responseByUser;
    const valuesLength = values.length;
    const fileExpTime = this.datePipe.transform(new Date(this.expTime), 'dd-MM-yyyy hh:mm:ss a');
    // if (this.response && this.response[0].hasOwnProperty('assessmentData')) {
    const contentStartTime = this.datePipe.transform(new Date(), 'dd-MM-yyyy hh:mm:ss a');
    // Header
    for (let m = 0; m < valuesLength; m++) {
      line += 'Device ID' + ',' + this.deviceId + '\n';
      line += 'Group name (Group ID)' + ',' + this.groupInfo.name + '(' + this.groupInfo.gid + ')' + '\n';
      line += 'Content name (Content ID)' + ',' + values[m].name + '(' + values[m].contentId + ')' + '\n';
      line += 'Content started time' + ',' + contentStartTime + '\n';
      line += 'Average Time' + ',' + this.formatTime(this.appGlobalService.getAverageTime()) + '\n';
      line += 'Average Score' + ',' + this.appGlobalService.getAverageScore() + '\n';
      line += 'File export time' + ',' + fileExpTime + '\n';
      line += '\n\n';
      line += 'Name' + ',';
      line += 'Time' + ',';
      line += 'Score' + '\n';


      for (let i = 0; i < this.groupReport.length; i++) {
        line += '\"' + this.groupReport[i].userName + '\"' + ',';
        line += '\"' + this.groupReport[i].totalTimespent + '\"' + ',';
        line += '\"' + this.groupReport[i].score + '\"' + '\n';
      }
      line += '\n\n';
      line += 'User name' + ',';
      line += 'UserID' + ',';
      line += 'Question#' + ',';
      line += 'QuestionId' + ',';
      line += 'Score' + ',';
      line += 'Time' + '\n';
      break;

    }
    line += '\n';
    // Group Report

    // Teams
    for (let k = 0; k < values.length; k++) {
      for (let j = 0; j < values[k].assessmentData.length; j++) {
        line += '\"' + values[k].userName + '\"' + ',';
        line += '\"' + values[k].uid + '\"' + ',';
        line += '\"' + values[k].assessmentData[j].qtitle + '\"' + ',';
        line += '\"' + values[k].assessmentData[j].qid + '\"' + ',';
        line += '\"' + ' ' + values[k].assessmentData[j].score + '/' + values[k].assessmentData[j].maxScore + '\"' + ',';
        line += '\"' + values[k].assessmentData[j].timespent + '\"' + '\n';
      }
      line += '\n\n';
    }
    csv += line + '\n';
    return csv;
  }

  importcsv() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_REPORT_CLICKED,
      Environment.USER,
      PageId.REPORTS_GROUP_ASSESMENT_DETAILS, undefined,
    );
    this.expTime = new Date().getTime();
    const csv: any = this.convertToCSV();
    const combineFilename = this.deviceId + '_' + this.groupInfo.gid + '_' + this.reportSummary.contentId + '_' + this.expTime + '.csv';
    this.file.writeFile(this.downloadDirectory, combineFilename, csv)
      .then(
        _ => {
          this.commonUtilService.showToast(
              this.commonUtilService.translateMessage('CSV_DOWNLOAD_SUCCESS', combineFilename), false, 'custom-toast');
        }
      )
      .catch(
        () => {
          this.file.writeExistingFile(this.downloadDirectory, combineFilename, csv)
            .then(_ => {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('CSV_DOWNLOAD_SUCCESS', combineFilename),
                false, 'custom-toast');
            })
            .catch();
        }
      );
  }

  goBack() {
    this.location.back();
  }

  ionViewWillLeave() {
   if (this.deviceBackButton) {
     this.deviceBackButton.unsubscribe();
   }
  }

}
