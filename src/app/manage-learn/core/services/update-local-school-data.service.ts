import { Injectable } from '@angular/core';
import { LocalStorageService } from '.';
import { storageKeys } from '../../storageKeys';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateLocalSchoolDataService {
  constructor(private localStorage: LocalStorageService, private utils: UtilsService) {}

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

  mapSubmissionDataToQuestion(schoolDetails, isObservation?: boolean,isSurvey?:boolean): void {
    let mappedData;

    mappedData = this.updateSubmissionsOnLogin(schoolDetails);
    if (isObservation) {
      mappedData.observation = true;
    }
    
    if(isSurvey){
      mappedData.survey = true;
    }

    this.localStorage.setLocalStorage(
      this.utils.getAssessmentLocalStorageKey(schoolDetails.assessment.submissionId),
      mappedData
    );
    // this.storage.set('schoolsDetails', JSON.stringify(schoolObj));
    // this.events.publish("localDataUpdated");
  }
  updateSubmissionsOnLogin(schoolData) {
    const assessment = schoolData.assessment;

    for (const evidence of assessment.evidences) {
      const validSubmission = assessment.submissions[evidence.externalId];
      if (validSubmission) {
        evidence.notApplicable = validSubmission.notApplicable;
        if (evidence.notApplicable) {
          continue;
        }

        for (const section of evidence.sections) {
          for (const question of section.questions) {
            if (question.responseType === 'pageQuestions') {
              for (const questions of question.pageQuestions) {
                questions.value =
                  questions.responseType !== 'matrix'
                    ? validSubmission.answers[questions._id].value
                    : this.constructMatrixValue(validSubmission, questions, evidence.externalId);
                questions.remarks = validSubmission.answers[question._id]
                  ? validSubmission.answers[question._id].remarks
                  : '';
              }
            } else if (validSubmission.answers && validSubmission.answers[question._id]) {
              question.value =
                question.responseType !== 'matrix'
                  ? validSubmission.answers[question._id].value
                  : this.constructMatrixValue(validSubmission, question, evidence.externalId);
              question.remarks = validSubmission.answers[question._id]
                ? validSubmission.answers[question._id].remarks
                : '';
            }
          }
        }
      }
    }
    return schoolData;
  }

  constructMatrixValue(validSubmission, matrixQuestion, ecmId) {
    matrixQuestion.value = [];
    if (
      validSubmission.answers &&
      validSubmission.answers[matrixQuestion._id] &&
      validSubmission.answers[matrixQuestion._id].value
    ) {
      for (const answer of validSubmission.answers[matrixQuestion._id].value) {
        matrixQuestion.value.push(JSON.parse(JSON.stringify(matrixQuestion.instanceQuestions)));
      }
      matrixQuestion.value.forEach((instance, index) => {
        instance.forEach((question) => {
          if (
            validSubmission.answers[matrixQuestion._id] &&
            validSubmission.answers[matrixQuestion._id].value[index][question._id]
          ) {
            question.value = validSubmission.answers[matrixQuestion._id].value[index][question._id].value;
            question.remarks = validSubmission.answers[matrixQuestion._id].value[index][question._id].remarks;
          }
        });
      });
      return matrixQuestion.value;
    } else {
      return [];
    }
  }
}
