import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rejects } from 'assert';
import { LoaderService, LocalStorageService, UtilsService } from '../core';
import { urlConstants } from '../core/constants/urlConstants';
import { AssessmentApiService } from '../core/services/assessment-api.service';
import { UpdateLocalSchoolDataService } from '../core/services/update-local-school-data.service';
import { storageKeys } from '../storageKeys';

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
    private assessmentService: AssessmentApiService
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
      url: urlConstants.API_URLS.SURVEY_FEEDBACK.GET_DETAILS_BY_LINK + link,
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
    // TODO:Remove
    // const url = AppConfigs.surveyFeedback.getDetailsByLink + link;
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

  async getDetailsById(surveyId, solutionId): Promise<any> {
    let payload = await this.utils.getProfileInfo();
    let url = urlConstants.API_URLS.SURVEY_FEEDBACK.GET_DETAILS_BY_ID + surveyId + `?solutionId=${solutionId}`;
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

    // return this.httpClient.get('assets/dummy/surveydetails.json').toPromise();
    //  const url = AppConfigs.surveyFeedback.getDetailsById + surveyId;
    //  return new Promise((resolve, reject) => {
    //    this.apiProvider.httpGet(
    //      url,
    //      (success) => {
    //        resolve(success);
    //      },
    //      (err) => {
    //        reject(err);
    //      }
    //    );
    //  });
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

  //TODO
  // showMsg(option, popToRoot = false): void {
  //   popToRoot ? this.app.getRootNav().popToRoot() : null;
  //   const modal = this.modalCtrl.create(SurveyMsgComponent, { option: option });
  //   modal.present();
  // }

  //TODO
  // viewAllAns(payload) {
  //   let url = AppConfigs.surveyFeedback.getAllAnswers;

  //   return new Promise((resolve, reject) => {
  //     this.apiProvider.httpPost(
  //       url,
  //       payload,
  //       (success) => {
  //         this.utils.stopLoader();
  //         resolve(success);
  //       },
  //       (error) => {
  //         this.utils.openToast(error.message);
  //         this.utils.stopLoader();
  //         reject();
  //       },
  //       { baseUrl: "dhiti" }
  //     );
  //   });
  // }
}
