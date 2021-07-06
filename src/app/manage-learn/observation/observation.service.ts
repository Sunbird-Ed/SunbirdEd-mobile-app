import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService, UtilsService } from '../core';
import { urlConstants } from '../core/constants/urlConstants';
import { AssessmentApiService } from '../core/services/assessment-api.service';
import { UpdateLocalSchoolDataService } from '../core/services/update-local-school-data.service';
import { storageKeys } from '../storageKeys';

@Injectable({
  providedIn: 'root',
})
export class ObservationService {
  private programIndex;
  private solutionIndex;
  private entityIndex;
  public obsTraceObj = {
    programId: '',
    programName: '',
    solutionId: '',
    name: '',
  };

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

      let payload = await this.utils.getProfileInfo();
      const config = {
        url:
          urlConstants.API_URLS.GET_OBSERVATION_DETAILS +
          `${observationId}?entityId=${entityId}&submissionNumber=${submissionNumber}`,
        payload: payload,
      };
      this.assessmentService.post(config).subscribe(
       async (success) => {
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

          await this.localStorage.setLocalStorage(
            this.utils.getAssessmentLocalStorageKey(success.result.assessment.submissionId),
            success.result
          );
          resolve(success.result.assessment.submissionId);
        },
        (error) => {}
      );
    });
  }

  async pushToDownloads(submissionId) {
    const key = storageKeys.downloadedObservations
    try {
      let downloadedObs: any = await this.localStorage.getLocalStorage(key);
      let currentObs = downloadedObs.filter(
        (d) => d.programId === this.obsTraceObj.programId && d.solutionId === this.obsTraceObj.solutionId
      )[0];

      if (currentObs) {
        currentObs.downloadedSubmission.push({ _id: submissionId, showDownloadedIcon: true });
      console.log(downloadedObs,"downloadedObs 83");
        await this.localStorage.setLocalStorage(key, downloadedObs);
        return
      }
      let obj = {
        programId: this.obsTraceObj.programId,
        programName: this.obsTraceObj.programName,
        solutionId: this.obsTraceObj.solutionId,
        name: this.obsTraceObj.name,
        downloadedSubmission: [{ _id: submissionId, showDownloadedIcon: true }],
      };
      downloadedObs.push(obj);
      console.log(downloadedObs,"downloadedObs");
      await this.localStorage.setLocalStorage(key, downloadedObs);
    } catch (error) {
      console.log('error while storing');
    }
  }
}
