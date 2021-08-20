import { Component } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { storageKeys } from '../../storageKeys';
import { SurveyProviderService } from '../../core/services/survey-provider.service';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { Router } from '@angular/router';
import { UpdateLocalSchoolDataService } from '../../core/services/update-local-school-data.service';
@Component({
  selector: 'app-survey-home',
  templateUrl: './survey-home.component.html',
  styleUrls: ['./survey-home.component.scss'],
})
export class SurveyHomeComponent {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  page = 1;
  limit = 10;
  link: any;
  surveyList: any;
  submissionArr: any;
  count: any;
  isReport: boolean = false;
  constructor(
    private headerService: AppHeaderService,
    private router: Router,
    private localStorage: LocalStorageService,
    private surveyProvider: SurveyProviderService,
    private loader: LoaderService,
    private utils: UtilsService,
    private kendra: KendraApiService,
    private toast: ToastService,
    private ulsdp: UpdateLocalSchoolDataService,
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.link = extrasState.data.survey_id;
      this.isReport = extrasState.data.report;
    }
  }


  ionViewDidLoad(): void {}

  ionViewWillEnter() {
    
    this.surveyList = [];
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
    this.utils.closeProfileAlert();
  }

  async getSurveyListing() {
    this.loader.startLoader();

    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.GET_TARGETED_SOLUTIONS + `?type=survey&page=${this.page}&limit=${this.limit}&surveyReportPage=${this.isReport}`,
      payload: payload,
    };
    this.kendra.post(config).subscribe(
      (success) => {
        if (success.result && success.result.data) {
          this.count = success.result.count;
          if (!this.isReport) {
            success.result.data.map(this.surveyProvider.createExpiryMsg.bind(this.surveyProvider))
          }
          this.surveyList = [...this.surveyList, ...success.result.data];
          this.getSubmissionArr();
          this.loader.stopLoader();
        }
      },
      (error) => {
        this.loader.stopLoader();
        console.log(error);
      }
    );
  }

  //check if suvey detail is present in local storage
  getSubmissionArr(): void {
    this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((allId) => {
        this.submissionArr = allId;
        this.applySubmission(); // make downloaded = true
      });
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
          this.surveyProvider.showMsg('surveyExpired', true);
          return;
        }
        if (data.result.status && data.result.status == 'completed') {
          this.surveyProvider.showMsg('surveyCompleted', true);
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
    if (!this.isReport) {

    if (survey.status == 'expired') {
      // its not added in samiksha but add here as , after expired also if its already downloaded then user is able to submit.(backend is not checking before making submission.)
      this.surveyProvider.showMsg('surveyExpired');
      return;
    }
      
    // surveyId changed to _id
    survey.downloaded
      ? this.redirect(survey.submissionId)
      : this.getSurveyById(survey._id, survey.solutionId, survey.isCreator);
      return;
    } 
      this.checkReport(survey);
  
  }

  redirect(submissionId: any): void {
    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      replaceUrl: this.link ? true : false,
      queryParams: {
        submisssionId: submissionId,
        evidenceIndex: 0,
        sectionIndex: 0,
      },
    });
  }

  storeRedirect(survey): void {
    this.surveyProvider
      .storeSurvey(survey.assessment.submissionId, survey)
      .then((survey) => this.redirect(survey.assessment.submissionId));
  }

  getSurveyById(surveyId, solutionId, isCreator?) {
    //passing solution id in v2
    if (!surveyId) {
      // return;
      // for auto targeted _id will be blank
      // so creator also no will be able to submit
    }

    this.surveyProvider
      .getDetailsById(surveyId, solutionId)
      .then((res) => {
        const survey = res.result;
        this.ulsdp.mapSubmissionDataToQuestion(survey,false,true);
        this.storeRedirect(survey);
      });
  }

  setStatusColor(status): string {
    switch (status) {
      case 'started':
        return 'orange';
        break;
      case 'completed':
        return 'lightgreen';
        break;
      case 'expired':
        return 'grey';
        break;

      default:
        break;
    }
  }

  checkReport(survey) {
    if (survey.submissionId) {
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          survey: true,
          submissionId: survey.submissionId,
        },
      });
      return;
    }

    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        survey: true,
        solutionId: survey.solutionId,
      },
    });
  }
  loadMore() {
    this.page = this.page + 1;
    this.getSurveyListing();
  }
}
