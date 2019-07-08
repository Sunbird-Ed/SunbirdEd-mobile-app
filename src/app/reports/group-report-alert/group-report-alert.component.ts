import { Component, OnInit, Inject } from '@angular/core';
import { NavParams, ModalController, Platform, NavController, LoadingController, PopoverController } from '@ionic/angular';
import { SummarizerService, SummaryRequest, ReportSummary } from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { CommonUtilService } from '@app/services';

export interface QRAlertCallBack {
  cancel(): any;
}


@Component({
  selector: 'app-group-report-alert',
  templateUrl: './group-report-alert.component.html',
  styleUrls: ['./group-report-alert.component.scss'],
})
export class GroupReportAlertComponent implements OnInit {

  callback: QRAlertCallBack;
  reportSummary: ReportSummary;
  report = 'users';
  fromUserColumns = [{
    name: this.commonUtilService.translateMessage('FIRST_NAME'),
    prop: 'name'
  }, {
    name: this.commonUtilService.translateMessage('TIME'),
    prop: 'time'
  }, {
    name: this.commonUtilService.translateMessage('RESULT'),
    prop: 'res'
  }];
  assessment: {};
  fromUserAssessment = { 'uiRows': [], showResult: false };
  constructor(
    navParams: NavParams,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private loading: LoadingController,
    private platform: Platform,
    @Inject('SUMMARIZER_SERVICE') public summarizerService: SummarizerService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private popOverCtrl: PopoverController
  ) {
    this.report = 'questions';
    this.callback = navParams.get('callback');
    this.assessment = this.callback['row'];
  }

  ngOnInit() { }

  async getAssessmentByUser(event) {
    if (event === 'users') {
      const loader = await this.commonUtilService.getLoader()
      const summaryRequest: SummaryRequest = {
        qId: this.assessment['qid'],
        uids: this.assessment['uids'],
        contentId: this.assessment['contentId'],
        hierarchyData: null
      };
      const that = this;
      this.summarizerService.getDetailsPerQuestion(summaryRequest).toPromise()
        .then((data: any) => {
          if (data.length > 0) {
            data.forEach(assessment => {
              assessment.time = that.convertTotalTime(assessment.time);
              assessment.name = that.assessment['users'].get(assessment.uid);
              assessment.res = assessment.result + '/' + assessment.max_score;
            });
            that.fromUserAssessment['uiRows'] = data;
          }
        }).catch(async (error) => {
          console.log('Error received', error);
          await loader.dismiss();
        });
    }
  }


  cancel() {
    this.modalCtrl.dismiss();
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(11, () => {
      this.dismissPopup();
    });
  }

  ionViewWillLeave() {
    this.platform.backButton.unsubscribe();
  }
  /**
   * It will Dismiss active popup
   */
  async dismissPopup() {
    const activePopover = await this.popOverCtrl.getTop();
    if (activePopover) {
      activePopover.dismiss();
    } else {
      // Migration todo
      // this.navCtrl.pop();
    }
  }

  convertTotalTime(time: number): string {
    const mm = Math.floor(time / 60);
    const ss = Math.floor(time % 60);
    return (mm > 9 ? mm : ('0' + mm)) + ':' + (ss > 9 ? ss : ('0' + ss));
  }

}
