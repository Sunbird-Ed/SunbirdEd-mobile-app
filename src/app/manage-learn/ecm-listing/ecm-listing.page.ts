import { Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';
import { LocalStorageService, UtilsService } from '../core';
import { EvidenceService } from '../core/services/evidence.service';
import { UpdateTrackerService } from '../core/services/update-tracker.service';

@Component({
  selector: 'app-ecm-listing',
  templateUrl: './ecm-listing.page.html',
  styleUrls: ['./ecm-listing.page.scss'],
})
export class EcmListingPage {

  entityId: any;
  entityName: string;
  entityEvidences: any;
  entityData: any;
  currentEvidenceStatus: string;
  isIos: boolean = this.platform.is("ios");
  generalQuestions: any;
  submissionId: any;
  recentlyUpdatedEntity: any;
  canShowManualRating: boolean;

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
      this.entityId = params.submisssionId;
      this.entityName = params.schoolName;
    })
  }


  ionViewWillEnter() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.entityId))
      .then((successData) => {
        this.entityData = successData;
        this.entityEvidences = this.updateTracker.getLastModifiedInEvidences(
          this.entityData["assessment"]["evidences"],
          this.recentlyUpdatedEntity
        );
        this.mapCompletedAndTotalQuestions();
        this.checkForProgressStatus();
        this.localStorage
          .getLocalStorage("generalQuestions_" + this.entityId)
          .then((successData) => {
            this.generalQuestions = successData;
          })
      })
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

  goToGeneralQuestionList(): void {
  }

  checkForProgressStatus() {
    for (const evidence of this.entityEvidences) {
      if (evidence.isSubmitted) {
        evidence.progressStatus = "submitted";
      } else if (!evidence.startTime) {
        evidence.progressStatus = "";
      } else {
        evidence.progressStatus = "completed";
        for (const section of evidence.sections) {
          if (section.progressStatus === "inProgress" || !section.progressStatus) {
            evidence.progressStatus = "inProgress";
          }
        }
      }
    }
  }

  openAction(assessment, evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: this.entityData,
    };
    this.evdnsServ.openActionSheet(options);
  }

  navigateToEvidence(index): void {
    if (this.entityEvidences[index].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[index].externalId, this.entityId);
      this.router.navigate([RouterLinks.SECTION_LISTING],
        {
          queryParams: {
            submisssionId: this.entityId,
            evidenceIndex: index,
            schoolName: this.entityName
          }
        })

    } else {
      const entity = { _id: this.entityId, name: this.entityName };
      this.openAction(entity, index);
    }
  }

  // goToManualRating(): void {
  //   const navParams = {
  //     entityName: this.entityName,
  //     submissionId: this.entityData["assessment"].submissionId,
  //   };
  //   this.navCtrl.push(ManualRatingPage, { navParams });
  // }

  // checkAllEvidenceSubmitted(): null {
  //   if (!this.ngps.getNetworkStatus() || this.entityData.solution.scoringSystem != "manual") {
  //     console.log("No network");
  //     this.canShowManualRating = false;
  //     return;
  //   }
  //   const submissionId = this.entityData["assessment"].submissionId;
  //   this.manualRatingProvider
  //     .checkAllECMStatus(submissionId)
  //     .then((res) => {
  //       console.log(res);
  //       res.status == "ratingPending" ? (this.canShowManualRating = true) : (this.canShowManualRating = false);
  //     })
  //     .catch(() => (this.canShowManualRating = false));
  // }

}
