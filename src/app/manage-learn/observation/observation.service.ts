import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService, UtilsService } from '../core';
import { urlConstants } from '../core/constants/urlConstants';
import { AssessmentApiService } from '../core/services/assessment-api.service';
import { UpdateLocalSchoolDataService } from '../core/services/update-local-school-data.service';

@Injectable({
  providedIn: 'root',
})
export class ObservationService {
  private programIndex;
  private solutionIndex;
  private entityIndex;

  constructor(
    private httpClient: HttpClient,
    private localStorage: LocalStorageService,
    private ulsdp: UpdateLocalSchoolDataService,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService
  ) {}


 
  getAssessmentDetailsForObservation(event) {
    return new Promise(async (resolve, reject) => {
      let entityId = event.entityId;
      let submissionNumber = event.submission.submissionNumber;
      let observationId = event.observationId;

      // this.utils.startLoader();
      // TODO:---------------------
      let payload = await this.utils.getProfileInfo();
      const config = {
        url:
          urlConstants.API_URLS.GET_OBSERVATION_DETAILS +
          `${observationId}?entityId=${entityId}&submissionNumber=${submissionNumber}`,
        payload: payload,
      };
      this.assessmentService.post(config).subscribe(
        (success) => {
          console.log(success);
          this.ulsdp.mapSubmissionDataToQuestion(success.result, true);
          const generalQuestions = success.result['assessment']['generalQuestions']
            ? success.result['assessment']['generalQuestions']
            : null;
          this.localStorage.setLocalStorage(
            'generalQuestions_' + success.result['assessment']['submissionId'],
            generalQuestions
          );
          this.localStorage.setLocalStorage(
            'generalQuestionsCopy_' + success.result['assessment']['submissionId'],
            generalQuestions
          );

          this.ulsdp.storeObsevationSubmissionId(success.result['assessment']['submissionId']);

          this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(success.result.assessment.submissionId),
            success.result
          );
          resolve(true);
        },
        (error) => {
          // this.utils.stopLoader();
        }
      );
    });
  }
}
