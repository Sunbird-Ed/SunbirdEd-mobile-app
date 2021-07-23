import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { rejects } from 'assert';
import { LoaderService, LocalStorageService, UtilsService } from '..';
import { urlConstants } from '../constants/urlConstants';
import { AssessmentApiService } from './assessment-api.service';
import { UpdateLocalSchoolDataService } from './update-local-school-data.service';
import { SurveyMsgComponent } from '../../shared/components/survey-msg/survey-msg.component';
import { storageKeys } from '../../storageKeys';
import { DhitiApiService } from './dhiti-api.service';

@Injectable({
  providedIn: 'root',
})
export class SurveyProviderService {
  constructor(
    private localStorage: LocalStorageService,
    private ulsdp: UpdateLocalSchoolDataService,
    private utils: UtilsService,
    private httpClient: HttpClient,
    private loader: LoaderService,
    private assessmentService: AssessmentApiService,
    private router: Router,
    private modalCtrl: ModalController,
    private dhiti: DhitiApiService,
    private toast: ToastController
  ) {}

  // get all list
  // getSurveyListing(): Promise<any> {
  //   const url = AppConfigs.surveyFeedback.surveyListing;
  //   return new Promise((resolve, reject) => {
  //     this.apiProvider.httpGet(
  //       url,
  //       (success) => {
  //         resolve(success.result);
  //       },
  //       (err) => {
  //         reject(err);
  //       }
  //     );
  //   });
  // }

  // pass the link which is present in deeplink(deeplink last param)
  async getDetailsByLink(link): Promise<any> {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.SURVEY_FEEDBACK.GET_DETAILS_BY_ID + '/' + link,
      payload: payload,
    };

    return new Promise((resolve, reject) => {
      this.assessmentService.post(config).subscribe(
        (success) => {
          resolve(success);
        },
        (error) => {
          rejects(error);
        }
      );
    });
  }

  async getDetailsById(surveyId, solutionId): Promise<any> {
    let payload = await this.utils.getProfileInfo();
    let url = urlConstants.API_URLS.SURVEY_FEEDBACK.GET_DETAILS_BY_ID;
    if (surveyId) {
      url = `${url}/${surveyId}`;
    }
    url = url + `?solutionId=${solutionId}`;
    const config = {
      url: url,
      payload: payload,
    };

    return new Promise((resolve, reject) => {
      this.assessmentService.post(config).subscribe(
        (success) => {
          resolve(success);
        },
        (error) => {
          rejects(error);
        }
      );
    });

  }

  storeSurvey(submissionId, survey) {
    return this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then((submissionArr) => {
        const x = submissionArr.includes(submissionId);
        if (!x) {
          survey['assessment']['evidences'][0].startTime = Date.now();
          survey['survey'] = true;
          this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId), survey);
          this.ulsdp.updateSubmissionIdArr(submissionId);
          return survey;
        } else {
          return survey;
        }
      })
      .catch((err) => {
        survey['assessment']['evidences'][0].startTime = Date.now();
        survey['survey'] = true;
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId), survey);
        this.ulsdp.updateSubmissionIdArr(submissionId);
        return survey;
      });
  }

  async showMsg(option, popToRoot = false) {
    popToRoot ? this.router.navigate(['']) : null;
    const modal =await  this.modalCtrl.create({
      component: SurveyMsgComponent,
      componentProps: { option: option },
    });
    await modal.present();
  }

  viewAllAns(payload) {
    this.loader.startLoader()
    let url = urlConstants.API_URLS.SURVEY_FEEDBACK.GET_ALL_ANSWERS 
      const config = {
        url: url,
        payload: payload,
      };
    return new Promise((resolve, reject) => {
      this.dhiti.post(
       config).subscribe(
        (success) => {
          this.loader.stopLoader();
          resolve(success);
        },
        (error) => {
          this.toast.create(error.message);
          this.loader.stopLoader();
          reject();
        },
      );
    });
  }
}
