import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { LocalStorageService, UtilsService } from '@app/app/manage-learn/core';
import { UpdateTrackerService } from '@app/app/manage-learn/core/services/update-tracker.service';
// import { ObservationService } from '@app/app/manage-learn/observation/observation.service';

@Component({
  selector: 'app-section-listing',
  templateUrl: './section-listing.page.html',
  styleUrls: ['./section-listing.page.scss'],
})
export class SectionListingPage implements OnInit {

  sectionData: any;
  currentEvidence: any;
  evidenceSections: any;
  selectedEvidenceName: any;
  data;
  submissionId: any;
  entityName: any;
  selectedEvidenceIndex: any;
  recentlyUpdatedEntity: any;
  allAnsweredForEvidence: boolean;
  constructor(
    // private observationSrvc: ObservationService,
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private updateTracker: UpdateTrackerService,
    private router: Router,
    private routerParam: ActivatedRoute
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submisssionId;
      this.selectedEvidenceIndex = params.evidenceIndex;
      this.entityName = params.schoolName;
    })
  }


  ngOnInit() {
  
  }

  ionViewWillEnter() {
    
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((data) => {
        this.sectionData = data;
        let assessmentDetails = this.updateTracker.getLastModifiedInSection(
          data,
          this.selectedEvidenceIndex,
          this.submissionId,
          this.recentlyUpdatedEntity
        );
        this.currentEvidence = assessmentDetails['assessment']['evidences'][this.selectedEvidenceIndex];
        this.evidenceSections = this.currentEvidence['sections'];
        this.selectedEvidenceName = this.currentEvidence['name'];
        this.checkForEvidenceCompletion();
      })
      .catch((error) => {
      });
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
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.sectionData);
  }

  goToQuestioner(selectedSection): void {
    const params = {
      _id: this.submissionId,
      name: this.entityName,
      selectedEvidence: this.selectedEvidenceIndex,
      selectedSection: selectedSection,
    };
    if (!this.evidenceSections[selectedSection].progressStatus) {
      this.evidenceSections[selectedSection].progressStatus = this.currentEvidence.startTime ? 'inProgress' : '';
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.sectionData);
    }

    this.router.navigate([RouterLinks.QUESTIONNAIRE],
      {
        queryParams: {
          submisssionId: this.submissionId,
          evidenceIndex: this.selectedEvidenceIndex,
          sectionIndex: selectedSection,
          schoolName: this.entityName
        }
      })
  }

}
