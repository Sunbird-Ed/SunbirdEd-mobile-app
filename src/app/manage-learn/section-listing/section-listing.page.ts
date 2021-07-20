import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { LocalStorageService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { UpdateTrackerService } from '@app/app/manage-learn/core/services/update-tracker.service';
import { CommonUtilService } from '@app/services';
import { Network } from '@ionic-native/network/ngx';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-section-listing',
  templateUrl: './section-listing.page.html',
  styleUrls: ['./section-listing.page.scss'],
})
export class SectionListingPage {
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
  networkAvailable: boolean;
  constructor(
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private updateTracker: UpdateTrackerService,
    private router: Router,
    private routerParam: ActivatedRoute,
    private network: Network,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private commonUtils: CommonUtilService,
    private toast: ToastService
  ) {
    this.networkAvailable = this.commonUtils.networkInfo.isNetworkAvailable;

    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submisssionId;
      this.selectedEvidenceIndex = params.evidenceIndex;
      this.entityName = params.schoolName;
    });
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

    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      queryParams: {
        submisssionId: this.submissionId,
        evidenceIndex: this.selectedEvidenceIndex,
        sectionIndex: selectedSection,
        schoolName: this.entityName,
      },
    });
  }

  async checkForNetworkTypeAlert() {
    if (this.network.type !== ('3g' || '4g' || 'wifi')) {
      let translateObject;
      this.translate
        .get(['FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_LBL_YES', 'FRMELEMNTS_LBL_NO', 'FRMELEMNTS_MSG_SLOW_INTERNET'])
        .subscribe((translations) => {
          translateObject = translations;
          // console.log(JSON.stringify(translations))
        });
      let alert = await this.alertCtrl.create({
        header: translateObject['FRMELEMNTS_LBL_CONFIRM'],
        message: translateObject['FRMELEMNTS_MSG_SLOW_INTERNET'],
        buttons: [
          {
            text: translateObject['FRMELEMNTS_LBL_NO'],
            role: 'cancel',
            handler: () => {
            },
          },
          {
            text: translateObject['FRMELEMNTS_LBL_YES'],
            handler: () => {
              this.goToImageListing();
            },
          },
        ],
      });
      alert.present();
    }
  }

  goToImageListing() {
    if (this.networkAvailable) {
      const params = {
        // selectedEvidenceId: this.currentEvidence._id,
        submissionId: this.submissionId,
        name: this.entityName,
        selectedEvidenceIndex: this.selectedEvidenceIndex,
      };
      this.router.navigate([RouterLinks.IMAGE_LISTING], { queryParams: params });
    } else {
      this.translate.get('toastMessage.connectToInternet').subscribe((translations) => {
        this.toast.openToast(translations);
      });
    }
  }

  viewReport() {
    // this.navCtrl.push(ObservationReportsPage, { submissionId: this.submissionId })
    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        submissionId: this.submissionId,
      },
    });
  }

  previewSubmission() {

    this.router.navigate([RouterLinks.SUBMISSION_PREVIEW], {
      queryParams: {
        submissionId: this.submissionId,
        name: this.entityName,
        selectedEvidenceIndex: this.selectedEvidenceIndex,
        goBackNum :-1
      },
    });
  }
}
