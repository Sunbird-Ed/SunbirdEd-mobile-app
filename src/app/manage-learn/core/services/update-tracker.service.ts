import { Injectable } from '@angular/core';
import { LocalStorageService, UtilsService } from '.';

@Injectable({
  providedIn: 'root',
})
export class UpdateTrackerService {
  constructor(private localStorage: LocalStorageService, private utils: UtilsService) {}

  getLastModifiedInSection(assessmentDetails, selectedEvidenceIndex, submissionId, recentlyUpdatedEntity) {
    for (
      let currentSectionIndex = 0;
      currentSectionIndex < assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections.length;
      currentSectionIndex++
    ) {
      let lastUpdated = 0;
      for (
        var questionIndex = 0;
        questionIndex <
        assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions
          .length;
        questionIndex++
      ) {
        lastUpdated =
          lastUpdated <
          assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions[
            questionIndex
          ].endTime
            ? assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex]
                .questions[questionIndex].endTime
            : lastUpdated;
      }
      if (lastUpdated != 0) {
        assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[
          currentSectionIndex
        ].lastModified = lastUpdated;
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId), assessmentDetails);
      }
    }
    let success = recentlyUpdatedEntity
      ? this.getLastModifiedInEvidences(assessmentDetails['assessment']['evidences'], recentlyUpdatedEntity)
      : null;
    return assessmentDetails;
  }
  getLastModifiedInEvidences(evidences, recentlyUpdatedEntity?) {
    for (let currentEvidencesIndex = 0; currentEvidencesIndex < evidences.length; currentEvidencesIndex++) {
      let lastUpdated = evidences[currentEvidencesIndex].sections[0].lastModified
        ? evidences[currentEvidencesIndex].sections[0].lastModified
        : 0;
      for (var sectionIndex = 0; sectionIndex < evidences[currentEvidencesIndex].sections.length; sectionIndex++) {
        lastUpdated =
          lastUpdated < evidences[currentEvidencesIndex].sections[sectionIndex].lastModified
            ? evidences[currentEvidencesIndex].sections[sectionIndex].lastModified
            : lastUpdated;
      }
      if (lastUpdated != 0) {
        evidences[currentEvidencesIndex]['lastModified'] = lastUpdated;
      }
    }
    let success = recentlyUpdatedEntity ? this.getLastModifiedInEntity(evidences, recentlyUpdatedEntity) : null;
    return evidences;
  }
  getLastModifiedInEntity(evidences, recentlyUpdatedEntity) {
    console.log('recentlyUpdatedEntity');

    let lastUpdated = evidences[0].lastModified ? evidences[0].lastModified : 0;
    for (let currentEvidencesIndex = 0; currentEvidencesIndex < evidences.length; currentEvidencesIndex++) {
      lastUpdated =
        lastUpdated < evidences[currentEvidencesIndex].lastModified
          ? evidences[currentEvidencesIndex].lastModified
          : lastUpdated;
    }
    if (lastUpdated != 0) {
      recentlyUpdatedEntity.lastModified = lastUpdated;
      this.localStorage
        .getLocalStorage('recentlyModifiedAssessment')
        .then((updatedList) => {
          let successArray = [...updatedList];
          let isPresentFlag = true;

          for (let assessmentIndex = 0; assessmentIndex < updatedList.length; assessmentIndex++) {
            if (
              updatedList[assessmentIndex].ProgramId === recentlyUpdatedEntity.ProgramId &&
              updatedList[assessmentIndex].EntityId === recentlyUpdatedEntity.EntityId
            ) {
              isPresentFlag = false;

              if (updatedList[assessmentIndex].lastModified != recentlyUpdatedEntity.lastModified) {
                delete successArray[assessmentIndex];
                isPresentFlag = true;
              }
            }
          }
          isPresentFlag ? successArray.unshift(recentlyUpdatedEntity) : '';
          this.localStorage.setLocalStorage(
            'recentlyModifiedAssessment',
            successArray.filter((item) => item !== null).slice(0, 10)
          );
        })
        .catch(() => {
          this.localStorage.setLocalStorage('recentlyModifiedAssessment', [recentlyUpdatedEntity]);
        });
    }
    console.log('lastModifiedAssessment');
    return true;
  }
}
