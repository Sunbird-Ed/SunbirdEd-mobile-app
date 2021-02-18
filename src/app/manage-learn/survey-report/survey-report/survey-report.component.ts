import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { LoaderService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { QuestionListComponent } from '../../shared/components/question-list/question-list.component';

@Component({
  selector: 'app-survey-report',
  templateUrl: './survey-report.component.html',
  styleUrls: ['./survey-report.component.scss'],
})
export class SurveyReportComponent implements OnInit {
  submissionId: any;
  solutionId: any;
  reportObj: any;
  error: string;
  allQuestions: Array<Object> = [];
  filteredQuestions: Array<any> = [];
  constructor(
    public navCtrl: NavController,
    // public navParams: NavParams,
    // public apiService: ApiProvider,
    private modal: ModalController,
    private utils: UtilsService,
    private routerParam: ActivatedRoute,
    private loader: LoaderService,
    private httpClient: HttpClient,
    private router: Router,
    private dhiti: DhitiApiService,
    private headerService: AppHeaderService
  ) {}

  ngOnInit() {
    // this.submissionId = this.navParams.get('submissionId');
    // this.solutionId = this.navParams.get('solutionId');
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submissionId;
      this.solutionId = params.solutionId;
    });
    this.getObservationReports();
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
  }

  async getObservationReports() {
    let payload = {};
    payload['filter'] = {
      questionId: this.filteredQuestions,
    };
    let url;
    if (this.submissionId) {
      url = urlConstants.API_URLS.SURVEY_FEEDBACK.SUBMISSION_REPORT + this.submissionId;
    } else {
      url = urlConstants.API_URLS.SURVEY_FEEDBACK.SOLUTION_REPORT + this.solutionId;
    }
    payload = { ...(await this.utils.getProfileInfo()), ...payload };
    const config = {
      url: url,
      payload: payload,
    };
    this.loader.startLoader();

    this.dhiti.post(config).subscribe(
      (success) => {
        this.allQuestions =
          success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
        if (success.result == false) {
          this.error = success.message;
        } else {
          this.reportObj = success;
        }
        this.loader.stopLoader();
        !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
      },
      (error) => {
        this.error = 'No data found';
      }
    );
    // this.apiService.httpPost(
    //   url,
    //   payload,
    //   (success) => {
    //     this.allQuestions =
    //       success.allQuestions && !this.allQuestions.length ? success.allQuestions : this.allQuestions;
    //     if (success.result == false) {
    //       this.error = success.message;
    //     } else {
    //       this.reportObj = success;
    //     }
    //     // this.utils.stopLoader();
    //     this.loader.stopLoader();
    //     !this.filteredQuestions.length ? this.markAllQuestionSelected() : null;
    //   },
    //   (error) => {
    //     this.error = 'No data found';
    //   },
    //   {
    //     baseUrl: 'dhiti',
    //     version: 'v1',
    //   }
    // );
  }

  markAllQuestionSelected() {
    for (const question of this.allQuestions) {
      this.filteredQuestions.push(question['questionExternalId']);
    }
  }

  async openFilter() {
    const modal = await this.modal.create({
      component: QuestionListComponent,
      componentProps: {
        allQuestions: this.allQuestions,
        filteredQuestions: JSON.parse(JSON.stringify(this.filteredQuestions)),
      },
    });
    await modal.present();
    await modal.onDidDismiss().then((response: any) => {
      if (
        response.data &&
        response.data.action === 'updated' &&
        JSON.stringify(response.data.filter) !== JSON.stringify(this.filteredQuestions)
      ) {
        this.filteredQuestions = response.data.filter;
        this.getObservationReports();
      }
    });
  }

  allEvidence(index): void {
    // console.log(this.allQuestions[index]);
    // this.navCtrl.push(EvidenceAllListComponent, {
    //   submissionId: this.submissionId,
    //   solutionId: this.solutionId,
    //   questionExternalId: this.allQuestions[index]['questionExternalId'],
    //   surveyEvidence: true,
    // });

    this.router.navigate([RouterLinks.ALL_EVIDENCE], {
      queryParams: {
        submissionId: this.submissionId,
        solutionId: this.solutionId,
        questionExternalId: this.allQuestions[index]['questionExternalId'],
        surveyEvidence: true,
      },
    });
  }
}
