import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ObservationService } from '../observation.service';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-observation-submission',
  templateUrl: './observation-submission.component.html',
  styleUrls: ['./observation-submission.component.scss'],
})
export class ObservationSubmissionComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  programIndex: any;
  solutionIndex: any;
  entityIndex: any;
  submissionList: any;
  inProgressObservations = [];
  completedObservations = [];
  submissions: any[];
  currentTab = 'all';
  // height: number;
  selectedSolution: any;
  programList: any;
  showEntityActionsheet: boolean;
  showActionsheet: boolean;
  constructor(
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private httpClient: HttpClient,
    private observationService: ObservationService,
    private router: Router
  ) {}
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnInit() {
    this.programIndex = this.observationService.getProgramIndex();
    this.solutionIndex = this.observationService.getSolutionIndex(); //
    this.entityIndex = this.observationService.getEntityIndex(); //
    this.getProgramFromStorage();
  }

  async getProgramFromStorage(stopLoader?, noLoader?) {
    this.httpClient.get('assets/dummy/programs.json').subscribe((data: any) => {
      console.log(data);
      this.programList = data.result;
      this.selectedSolution = this.programList[this.programIndex].solutions[this.solutionIndex];
      this.submissionList = this.programList[this.programIndex].solutions[this.solutionIndex].entities[
        this.entityIndex
      ].submissions;
      this.splitCompletedAndInprogressObservations();
      this.tabChange(this.currentTab ? this.currentTab : 'all');
    });

    /* await this.localStorage
      .getLocalStorage(storageKeys.observationSubmissionIdArr)
      .then((ids) => {
        this.submissionIdArr = ids;
      })
      .catch((err) => {
        this.submissionIdArr = [];
      });

    stopLoader ? null : noLoader ? null : this.utils.startLoader();

    await this.localStorage
      .getLocalStorage(storageKeys.programList)
      .then((data) => {
        if (data) {
          this.programList = data;
          this.selectedSolution = this.programList[this.programIndex].solutions[this.solutionIndex];
          this.submissionList = this.programList[this.programIndex].solutions[this.solutionIndex].entities[
            this.entityIndex
          ].submissions;
          this.applyDownloadedflag();

          this.splitCompletedAndInprogressObservations();
          this.recentlyUpdatedEntityFn();

          this.tabChange(this.currentTab ? this.currentTab : "all");
        } else {
          this.submissionList = null;
        }
        noLoader ? null : this.utils.stopLoader();
      })
      .catch((error) => {
        noLoader ? null : this.utils.stopLoader();
        this.submissionList = null;
      }); */
  }
  splitCompletedAndInprogressObservations() {
    this.completedObservations = [];
    this.inProgressObservations = [];
    for (const submission of this.submissionList) {
      submission.status === 'completed'
        ? this.completedObservations.push(submission)
        : this.inProgressObservations.push(submission);
    }
  }

  tabChange(value) {
    // this.height = 100;
    this.submissions = [];
    this.currentTab = value;
    switch (value) {
      case 'inProgress':
        this.submissions = this.inProgressObservations;

        break;
      case 'completed':
        this.submissions = this.completedObservations;
        break;
      case 'all':
        this.submissions = this.submissions.concat(this.inProgressObservations, this.completedObservations);
        break;
      default:
        this.submissions = this.submissions.concat(this.inProgressObservations, this.completedObservations);
        console.log(this.submissions);
    }
  }
  getAssessmentDetails(submission) {
    // TODO: Remove
    this.getAssessmentDetailsApi(submission);
    //TODO : till here
    // this.showActionsheet = false;
    // this.showEntityActionsheet = false;

    // this.localStorage
    //   .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submission._id))
    //   .then((data) => {
    //     if (!data) {
    //       this.getAssessmentDetailsApi(submission);
    //     } else {
    //       this.goToEcm(submission);
    //     }
    //   })
    //   .catch((error) => {
    //     this.getAssessmentDetailsApi(submission);
    //   });
  }

  getAssessmentDetailsApi(submission) {
    // TODO: Remove
    this.goToEcm(submission);
    //TODO : till here
    //   let event = {
    //     programIndex: this.programIndex,
    //     solutionIndex: this.solutionIndex,
    //     entityIndex: this.entityIndex,
    //     submission: submission,
    //   };
    //   this.programService
    //     .getAssessmentDetailsForObservation(event, this.programList)
    //     .then(async (programList) => {
    //       await this.getProgramFromStorage();
    //       this.goToEcm(submission);
    //     })
    //     .catch((error) => {});
  }

  goToEcm(submission) {
    // TODO: Remove
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.SECTION_LISTING}`])
        // let heading = this.selectedSolution.entities[this.entityIndex].name;

    // this.localStorage
    //   .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
    //   .then((successData) => {
    //     if (successData.assessment.evidences.length > 1) {
    //       this.navCtrl.push('EvidenceListPage', {
    //         _id: submissionId,
    //         name: heading,
    //         recentlyUpdatedEntity: this.recentlyUpdatedEntity,
    //       });
    //     } else {
    //       if (successData.assessment.evidences[0].startTime) {
    //         this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);
    //         this.navCtrl.push('SectionListPage', {
    //           _id: submissionId,
    //           name: heading,
    //           selectedEvidence: 0,
    //           recentlyUpdatedEntity: this.recentlyUpdatedEntity,
    //         });
    //       } else {
    //         const assessment = { _id: submissionId, name: heading };
    //         this.openAction(assessment, successData, 0);
    //       }
    //     }
    //   })
    //   .catch((error) => {});
  }
}
