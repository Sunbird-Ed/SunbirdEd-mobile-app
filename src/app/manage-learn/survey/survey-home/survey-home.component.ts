import { Component } from '@angular/core';
import { RouterLinks } from '../../../../app/app.constant';
import { AppHeaderService } from '../../../../services/app-header.service';
import { Subscription } from 'rxjs';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { storageKeys } from '../../storageKeys';
import { SurveyProviderService } from '../../core/services/survey-provider.service';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { Router } from '@angular/router';
import { UpdateLocalSchoolDataService } from '../../core/services/update-local-school-data.service';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
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
  surveyId
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
    private assessmentService: AssessmentApiService
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.link = extrasState.data.survey_id;
      this.isReport = extrasState.data.report;
    }
  }


  ionViewDidLoad(): void {}

  ionViewWillEnter() {
    this.page=1
    this.surveyList = [];
    this.link ? this.verifyLink(this.link) : this.getSurveyListing();

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

  async onSurveyClick(survey) {
    this.surveyId = survey._id
    if (!this.isReport) {

    if (survey.status == 'expired') {
      // its not added in samiksha but add here as , after expired also if its already downloaded then user is able to submit.(backend is not checking before making submission.)
      this.surveyProvider.showMsg('surveyExpired');
      return;
    }

    if(this.IsSurveyExpired(survey)){
      return
    }
    // surveyId changed to _id
    if(!survey.submissionId){
      this.getSurveyTemplateDetails(survey)
      return
    }

    survey.downloaded
      ? this.redirect(survey.submissionId)
      : this.getSurveyById(survey._id, survey.solutionId, survey.isCreator);
      return;
    } 
      this.checkReport(survey);
  
  }

  redirect(submissionId: any,data?): void {
    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      replaceUrl: this.link ? true : false,
      queryParams: {
        submisssionId: submissionId,
        evidenceIndex: 0,
        sectionIndex: 0,
        isSurvey:true,
        surveyId:this.surveyId
      },
      state:data?{...data,isSurvey:true}:null
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
        if (res.result == false) {
          this.surveyProvider.showMsg('surveyExpired');
          return;
        }
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

  async getSurveyTemplateDetails(data) {
    let payload = await this.utils.getProfileData();
    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + data.solutionId,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe((success) => {
      if (success.result) {
        if(success.result.hasOwnProperty('requestForPIIConsent') && !success.result.consentShared){
          this.redirect(success.result.assessment.submissionId,success.result);
        }else{
          data.downloaded
          ? this.redirect(data.submissionId)
          : this.getSurveyById(data._id, data.solutionId, data.isCreator);
        }
      }else{
      this.toast.showMessage('FRMELEMNTS_MSG_TEMPLATE_DETAILS_NOTFOUND','danger');
      }
    },error =>{
      this.toast.showMessage('FRMELEMNTS_MSG_TEMPLATE_DETAILS_NOTFOUND','danger');
    });
  }

  async verifyLink(link) {
    this.loader.startLoader();
    let payload = await this.utils.getProfileData('SERVER');
    const config = {
      url: urlConstants.API_URLS.DEEPLINK.VERIFY_LINK + link+'?createProject=false',
      payload: payload,
    };
    let resp = await this.kendra.post(config).toPromise();
    if (resp && resp.result) {
      this.loader.stopLoader();
      switch (resp.result.type) {
        case 'survey':
          let details = resp.result
          if(details.submissionStatus && details.submissionStatus == 'completed'){
            this.surveyProvider.showMsg('surveyCompleted', true);
            return
          }
          if(details?.submissionId){
          await this.localStorage
          .getLocalStorage(storageKeys.submissionIdArray)
          .then(async (allId) => {
            await allId.includes(details.submissionId) ? (details.downloaded = true) : null;
          });
        }
          resp.result.submissionId ? this.checkIsDownloaded(details) : this.getSurveyTemplateDetails(details);
        default:
          break;
      }
    }else{
      this.loader.stopLoader();
      if(resp && resp.status){
        this.toast.showMessage('FRMELEMNTS_MSG_INVALID_LINK','danger');
      }
    }
  }

  async checkIsDownloaded(details){
    if(details.downloaded){
      this.redirect(details.submissionId)
    }else{
      this.getSurveyById(details.surveyId, details.solutionId, details.isCreator)
    }
  }

  IsSurveyExpired(data){
    const lastDate:any = new Date(data.endDate)
    const timeDiff:any = lastDate - Date.now()
    const diff = Math.ceil(timeDiff/(1000*60*60*24))
    if(diff<=0){
      this.getSurveyById(data._id, data.solutionId, data.isCreator)
      return true
    }else{
      return false
    }
  }

}