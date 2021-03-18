import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';
import { UtilsService, LocalStorageService } from '../../core';
import { EvidenceService } from '../../core/services/evidence.service';
import { UpdateTrackerService } from '../../core/services/update-tracker.service';

@Component({
  selector: 'app-domain-ecm-lsiting',
  templateUrl: './domain-ecm-lsiting.component.html',
  styleUrls: ['./domain-ecm-lsiting.component.scss'],
})
export class DomainEcmLsitingComponent implements OnInit {
  entityName: any;
  entityData: any;
  entityEvidences: any;
  generalQuestions: any;
  recentlyUpdatedEntity: any;
  selectedEvidenceIndex: any;
  currentEvidence: any;
  evidenceSections: any;
  allAnsweredForEvidence: boolean;
  submissionId: any;
  constructor(
    private updateTracker: UpdateTrackerService,
    private utils: UtilsService,
    private localStorage: LocalStorageService,
    private evdnsServ: EvidenceService,
    private platform: Platform,
    private routerParam: ActivatedRoute,
    private router: Router
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      // this.entityId = params.submisssionId;
      this.submissionId = params.submisssionId;
      this.entityName = params.schoolName;
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((successData) => {
        this.entityData = successData;
        this.entityEvidences = this.updateTracker.getLastModifiedInEvidences(
          this.entityData['assessment']['evidences'],
          this.recentlyUpdatedEntity
        );
        this.mapCompletedAndTotalQuestions();
        this.checkForProgressStatus();
        this.localStorage
          .getLocalStorage('generalQuestions_' + this.submissionId)
          .then((successData) => {
            this.generalQuestions = successData;
          })
          .catch((error) => {});
      })
      .catch((error) => {});
  }

  mapCompletedAndTotalQuestions() {
    for (const evidence of this.entityEvidences) {
      let totalQuestions = 0;
      let completedQuestions = 0;
      for (const section of evidence.sections) {
        totalQuestions = totalQuestions + section.totalQuestions;
        completedQuestions = completedQuestions + section.completedQuestions;
      }
      let percentage = totalQuestions ? (completedQuestions / totalQuestions) * 100 : 0;
      if (!completedQuestions) {
        percentage = 0;
      }
      evidence.completePercentage = Math.trunc(percentage);
    }
  }

  checkForProgressStatus() {
    for (const evidence of this.entityEvidences) {
      if (evidence.isSubmitted) {
        evidence.progressStatus = 'submitted';
      } else if (!evidence.startTime) {
        evidence.progressStatus = '';
      } else {
        evidence.progressStatus = 'completed';
        for (const section of evidence.sections) {
          if (section.progressStatus === 'inProgress' || !section.progressStatus) {
            evidence.progressStatus = 'inProgress';
          }
        }
      }
    }
  }

  navigateToEvidence(index): void {
    if (this.entityEvidences[index].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[index].externalId, this.submissionId);
      this.router.navigate([RouterLinks.SECTION_LISTING], {
        queryParams: {
          submisssionId: this.submissionId,
          evidenceIndex: index,
          schoolName: this.entityName,
        },
      });
    } else {
      const entity = { _id: this.submissionId, name: this.entityName };
      this.openAction(entity, index);
    }
  }

  async openAction(assessment, evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: this.entityData,
    };
    return await this.evdnsServ.openActionSheet(options);
  }

  async openEvidence(evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, this.submissionId);
    // this.selectedEvidenceIndex = evidenceIndex;
    this.currentEvidence = this.entityData['assessment']['evidences'][evidenceIndex];
    this.evidenceSections = this.currentEvidence['sections'];
    this.checkForEvidenceCompletion();
    if (this.entityEvidences[evidenceIndex].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, this.submissionId);

      this.selectedEvidenceIndex = evidenceIndex;
      this.currentEvidence = this.entityData['assessment']['evidences'][this.selectedEvidenceIndex];
      this.evidenceSections = this.currentEvidence['sections'];
      this.checkForEvidenceCompletion();
    } else {
      const entity = { _id: this.submissionId, name: this.entityName };
      let action = await this.openAction(entity, evidenceIndex);
      console.log(action)
      this.selectedEvidenceIndex = evidenceIndex;
      this.currentEvidence = this.entityData['assessment']['evidences'][this.selectedEvidenceIndex];
      this.evidenceSections = this.currentEvidence['sections'];
      this.checkForEvidenceCompletion();
    }
  }

  checkForEvidenceCompletion(): void {
    let allAnswered;
    for (const section of this.evidenceSections) {
      allAnswered = true;
      for (const question of section.questions) {
        if (!question.isCompleted) {
          allAnswered = false;
          break;
        }
      }
      if (this.currentEvidence.isSubmitted) {
        section.progressStatus = 'submitted';
      } else if (!this.currentEvidence.startTime) {
        section.progressStatus = '';
      } else if (allAnswered) {
        section.progressStatus = 'completed';
      } else if (!allAnswered && section.progressStatus) {
        section.progressStatus = 'inProgress';
      } else if (!section.progressStatus) {
        section.progressStatus = '';
      }
    }
    this.allAnsweredForEvidence = true;
    for (const section of this.evidenceSections) {
      if (section.progressStatus !== 'completed') {
        this.allAnsweredForEvidence = false;
        break;
      }
    }
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.entityData);
  }

  async goToQuestioner(selectedSection) {
    const params = {
      _id: this.submissionId,
      name: this.entityName,
      selectedEvidence: this.selectedEvidenceIndex,
      selectedSection: selectedSection,
    };
    // //
    // if (!this.entityEvidences[this.selectedEvidenceIndex].startTime) {
    //   const entity = { _id: this.submissionId, name: this.entityName };
    //   let action = await this.openAction(entity, this.selectedEvidenceIndex);
    // }

    // //
    if (!this.evidenceSections[selectedSection].progressStatus) {
      this.evidenceSections[selectedSection].progressStatus = this.currentEvidence.startTime ? 'inProgress' : '';
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.entityData);
    }

    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      queryParams: {
        submisssionId: this.submissionId,
        evidenceIndex: this.selectedEvidenceIndex,
        sectionIndex: selectedSection,
        schoolName: this.entityName,
      },
    });
  }
}
