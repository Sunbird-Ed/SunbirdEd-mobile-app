import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService, UtilsService } from '../core';
import { urlConstants } from '../core/constants/urlConstants';
import { AssessmentApiService } from '../core/services/assessment-api.service';
import { UpdateLocalSchoolDataService } from '../core/services/update-local-school-data.service';
import { storageKeys } from '../storageKeys';
//?info: Dont initialise in any modules, obsTraceObj will not work.
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
    observationId: '',
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
      if (await this.localStorage.hasKey(this.utils.getAssessmentLocalStorageKey(event.submission._id))) {
        resolve(event.submission._id);
        return;
      }
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
    const key = storageKeys.downloadedObservations;
    try {
      let downloadedObs: any = await this.localStorage.getLocalStorage(key);
      let currentObs = downloadedObs.filter(
        (d) => d.programId === this.obsTraceObj.programId && d.solutionId === this.obsTraceObj.solutionId
      )[0];

      if (currentObs) {
        currentObs.downloadedSubmission.push(submissionId);
        await this.localStorage.setLocalStorage(key, downloadedObs);
        return;
      }
      let obj = {
        programId: this.obsTraceObj.programId,
        programName: this.obsTraceObj.programName,
        solutionId: this.obsTraceObj.solutionId,
        name: this.obsTraceObj.name,
        _id: this.obsTraceObj.observationId,
        lastViewedAt: Date.now(),
        downloadedSubmission: [submissionId],
      };
      downloadedObs.push(obj);
      await this.localStorage.setLocalStorage(key, downloadedObs);
    } catch (error) {
      console.log('error while storing');
    }
  }

  async fetchDownloaded() {
    const key = storageKeys.downloadedObservations;
    let downloadedObs;
    try {
      downloadedObs = await this.localStorage.getLocalStorage(key);
    } catch (error) {
      this.localStorage.setLocalStorage(key, []);
    }
    try {
      let currentObs = downloadedObs.filter(
        (d) => d.programId === this.obsTraceObj.programId && d.solutionId === this.obsTraceObj.solutionId
      )[0];
      if (currentObs) {
        let downloadedSubmissionList = currentObs.downloadedSubmission;
        return downloadedSubmissionList;
      }
    } catch (error) {
      console.log('error while fetching local downloaded obs');
      return [];
    }
  }

  async updateLastViewed() {
    const key = storageKeys.downloadedObservations;
    let downloadedObs: any;
    try {
      downloadedObs = await this.localStorage.getLocalStorage(key);
    } catch {
      await this.localStorage.setLocalStorage(key, []);
      return;
    }
    try {
      let currentObs = downloadedObs.filter(
        (d) => d.programId === this.obsTraceObj.programId && d.solutionId === this.obsTraceObj.solutionId
      )[0];

      if (currentObs) {
        currentObs.lastViewedAt = Date.now();
        this.localStorage.setLocalStorage(key, downloadedObs);
        return;
      }
    } catch {
      console.log('error in last viewed');
    }
  }
}
