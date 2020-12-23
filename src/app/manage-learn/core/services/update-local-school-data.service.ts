import { Injectable } from '@angular/core';
import { LocalStorageService } from '.';
import { storageKeys } from '../../storageKeys';

@Injectable({
  providedIn: 'root',
})
export class UpdateLocalSchoolDataService {
  constructor(private localStorage: LocalStorageService) {}

  async updateSubmissionIdArr(submissionId) {
    await this.localStorage
      .getLocalStorage(storageKeys.submissionIdArray)
      .then(async (arr) => {
        Array.isArray(submissionId) ? arr.concat(submissionId) : arr.push(submissionId);
        await this.localStorage.setLocalStorage(storageKeys.submissionIdArray, arr);
      })
      .catch((err) => {
        let arr;
        Array.isArray(submissionId) ? (arr = submissionId) : (arr = [submissionId]);
        this.localStorage.setLocalStorage(storageKeys.submissionIdArray, arr);
      });
  }

  storeObsevationSubmissionId(obsevationSubmissionId) {
    // obsevationSubmissionId can be array(only when migration is run) or string (single value)
    this.localStorage
      .getLocalStorage(storageKeys.observationSubmissionIdArr)
      .then((arr) => {
        Array.isArray(obsevationSubmissionId) ? arr.concat(obsevationSubmissionId) : arr.push(obsevationSubmissionId);
        this.localStorage.setLocalStorage(storageKeys.observationSubmissionIdArr, arr);
      })
      .catch((err) => {
        let arr;
        Array.isArray(obsevationSubmissionId) ? (arr = obsevationSubmissionId) : (arr = [obsevationSubmissionId]);
        this.localStorage.setLocalStorage(storageKeys.observationSubmissionIdArr, arr);
      });
  }
}
