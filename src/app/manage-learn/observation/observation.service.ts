import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService, UtilsService } from '../core';
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
    private utils: UtilsService
  ) {}

  public setIndex(programIndex = null, solutionIndex = null, entityIndex = null) {
    this.programIndex = programIndex;
    this.solutionIndex = solutionIndex;
    this.entityIndex = entityIndex;
  }


  public getProgramIndex() {
    return this.programIndex;
  }

  public getSolutionIndex() {
    return this.solutionIndex;
  }
  public getEntityIndex() {
    return this.entityIndex;
  }
 

  getAssessmentDetailsForObservation(event, programs) {
    return new Promise((resolve, reject) => {
      let programIndex = event.programIndex;
      let solutionIndex = event.solutionIndex;
      let entityIndex = event.entityIndex;
      let submissionNumber = event.submission.submissionNumber;
      let observationId = event.submission.observationId;
      this.httpClient.get('assets/dummy/obsAssessmentDetails.json').subscribe((success: any) => {
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
        //     this.localStorage.setLocalStorage(storageKeys.programList, programs);
        //     this.utils.stopLoader();
        resolve(programs);
      });

      // this.utils.startLoader();
      // const url =
      //   AppConfigs.cro.observationDetails +
      //   observationId +
      //   '?entityId=' +
      //   programs[programIndex].solutions[solutionIndex].entities[entityIndex]._id +
      //   '&submissionNumber=' +
      //   submissionNumber;
      // console.log(url);
      // this.apiService.httpGet(
      //   url,
      //   (success) => {
      //     this.ulsdp.mapSubmissionDataToQuestion(success.result, true);
      //     const generalQuestions = success.result['assessment']['generalQuestions']
      //       ? success.result['assessment']['generalQuestions']
      //       : null;
      //     this.localStorage.setLocalStorage(
      //       'generalQuestions_' + success.result['assessment']['submissionId'],
      //       generalQuestions
      //     );
      //     this.localStorage.setLocalStorage(
      //       'generalQuestionsCopy_' + success.result['assessment']['submissionId'],
      //       generalQuestions
      //     );

      //     this.ulsdp.storeObsevationSubmissionId(success.result['assessment']['submissionId']);

      //     this.localStorage.setLocalStorage(
      //       this.utils.getAssessmentLocalStorageKey(success.result.assessment.submissionId),
      //       success.result
      //     );
      //     this.localStorage.setLocalStorage(storageKeys.programList, programs);
      //     this.utils.stopLoader();
      //     resolve(programs);
      //   },
      //   (error) => {
      //     this.utils.stopLoader();
      //     reject();
      //   },
      //   { version: 'v2' }
      // );
    });
  }
}
