import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LoaderService, LocalStorageService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { storageKeys } from '../../storageKeys';
import { SurveyProviderService } from '../survey-provider.service';

@Component({
  selector: 'app-survey-home',
  templateUrl: './survey-home.component.html',
  styleUrls: ['./survey-home.component.scss'],
})
export class SurveyHomeComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  link: any;
  surveyList: any;
  submissionArr: any;
  constructor(
    private httpClient: HttpClient,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private router: Router,
    // private observationService: ObservationService,
    private localStorage: LocalStorageService,
    private surveyProvider: SurveyProviderService,
    private loader: LoaderService,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService
  ) {}

  ngOnInit() {}

  ionViewDidLoad(): void {
    // this.link = this.navParams.get("surveyId");
  }

  ionViewWillEnter() {
    this.link ? this.deepLinkRedirect() : this.getSurveyListing();

    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async getSurveyListing() {
    this.loader.startLoader();

    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.SURVEY_FEEDBACK.SURVEY_LISTING,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        if (success.result) {
          this.surveyList = success.result;
          this.getSubmissionArr();
          this.loader.stopLoader();
        }
      },
      (error) => {
        this.loader.stopLoader();
        console.log(error);
      }
    );

    //   this.surveyProvider.getSurveyListing().then(
    //     (list) => {
    //       this.surveyList = list;
    //       console.log(list);
    //       this.getSubmissionArr();
    //       this.loader.stopLoader();
    //     },
    //     (err) => {
    //       this.loader.stopLoader();
    //       console.log(err);
    //     }
    //   );
    // }
  }
  //check if suvey detail is present in local storage
  getSubmissionArr(): void {
    this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((allId) => {
        this.submissionArr = allId;
        this.applySubmission(); // make downloaded = true
      })
      .catch((err) => {});
  }

  applySubmission(): void {
    this.surveyList.map((survey) => {
      console.log(this.submissionArr.includes(survey.submissionsId));
      this.submissionArr.includes(survey.submissionId) ? (survey.downloaded = true) : null;
    });
  }

  deepLinkRedirect(): void {
      let survey;
      this.surveyProvider
        .getDetailsByLink(this.link)
        .then((data) => {
          if (data.result == false) {
            // this.surveyProvider.showMsg("surveyExpired", true);//TODO
            return;
          }
          if (data.result.status && data.result.status == "completed") {
            // this.surveyProvider.showMsg("surveyCompleted", true);//TODO
            return;
          }
          survey = data.result;
          this.storeRedirect(survey);
        })
        .catch((err) => {
          this.loader.stopLoader();
          console.log(err);
        });
  }

  onSurveyClick(survey) {
    if (survey.status == 'completed') {
      // this.surveyProvider.showMsg("surveyCompleted");//TODO
      return;
    }
    survey.downloaded ? this.redirect(survey.submissionId) : this.getSurveyById(survey.surveyId);
  }

  redirect(submissionId: any): void {
    // const navParams = { _id: submissionId, selectedEvidence: 0, selectedSection: 0 };
    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      queryParams: {
        submisssionId: submissionId,
        evidenceIndex: 0,
        sectionIndex: 0,
        // schoolName: 'sample',
      },
    });

    // this.navCtrl.push(QuestionerPage, navParams).then(() => {
    //   this.link ? this.viewCtrl.dismiss() : null;
    // });
  }

  storeRedirect(survey): void {
    this.surveyProvider
      .storeSurvey(survey.assessment.submissionId, survey)
      .then((survey) => this.redirect(survey.assessment.submissionId));
  }

  getDetailsById(surveyId) {
    // const url = AppConfigs.surveyFeedback.getDetailsById + surveyId;
    // return new Promise((resolve, reject) => {
    //   this.apiProvider.httpGet(
    //     url,
    //     (success) => {
    //       resolve(success);
    //     },
    //     (err) => {
    //       reject(err);
    //     }
    //   );
    // });
  }
  getSurveyById(surveyId) {
    if (!surveyId) {
      return;
    }
    this.surveyProvider
      .getDetailsById(surveyId)
      .then((res) => {
        const survey = res.result;
        this.storeRedirect(survey);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  setStatusColor(status): string {
    switch (status) {
      case 'started':
        // this.color = "orange";
        return 'orange';
        break;
      case 'completed':
        // this.color = "lightgreen";
        return 'lightgreen';
        break;
      case 'expired':
        // this.color = "grey";
        return 'grey';
        break;

      default:
        break;
    }
  }

  checkReport(survey) {
    if (survey.submissionId) {
      // this.navCtrl.push(SurveyReportPage, { submissionId: survey.submissionId });
      this.router.navigate([RouterLinks.SURVEY_REPORTS], {
        queryParams: {
          submissionId: survey.submissionId,
        },
      });
      return;
    }
    // this.navCtrl.push(SurveyReportPage, { solutionId: survey.solutionId });
    this.router.navigate([RouterLinks.SURVEY_REPORTS], {
      queryParams: {
        solutionId: survey.solutionId,
      },
    });
  }
}
