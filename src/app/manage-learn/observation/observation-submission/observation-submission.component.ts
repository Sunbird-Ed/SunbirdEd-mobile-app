import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ObservationService } from '../observation.service';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';
import { LoaderService, LocalStorageService, UtilsService } from '../../core';
import { storageKeys } from '../../storageKeys';
import { EvidenceService } from '../../core/services/evidence.service';
import { ScroreReportMenusComponent } from '../../shared/components/scrore-report-menus/scrore-report-menus.component';
import { ObservationReportsComponent } from '../../observation-report/observation-reports/observation-reports.component';
import { SubmissionActionsComponent } from '../../shared/components/submission-actions/submission-actions.component';
import { TranslateService } from '@ngx-translate/core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

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
  // programIndex: any;
  // solutionIndex: any;
  // entityIndex: any;
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
  submissionIdArr: any;
  observationId: any;
  solutionId: any;
  programId: any;
  entityId: any;
  entityName: any;
  programIndex: any;
  solutionIndex: any;
  entityIndex: any;
  constructor(
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private httpClient: HttpClient,
    private observationService: ObservationService,
    private router: Router,
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private evdnsServ: EvidenceService,
    private popoverCtrl: PopoverController,
    private loader: LoaderService,
    private translate: TranslateService,
    private alertCntrl: AlertController,
    private routerParam: ActivatedRoute,
    private assessmentService: AssessmentApiService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.programId = params.programId;
      this.entityId = params.entityId;
      this.entityName = params.entityName;
    });
  }
  // ionViewWillEnter() {
  //   this.headerConfig = this.headerService.getDefaultPageConfig();
  //   this.headerConfig.actionButtons = [];
  //   this.headerConfig.showHeader = true;
  //   this.headerConfig.showBurgerMenu = false;
  //   this.headerService.updatePageConfig(this.headerConfig);
  // }

  // ionViewWillLeave() {
  //   if (this.backButtonFunc) {
  //     this.backButtonFunc.unsubscribe();
  //   }
  // }

  ngOnInit() {
    // this.programIndex = this.observationService.getProgramIndex();
    // this.solutionIndex = this.observationService.getSolutionIndex(); //
    // this.entityIndex = this.observationService.getEntityIndex(); //
    this.getProgramFromStorage();
  }

  ionViewWillEnter() {
    this.getProgramFromStorage();
  }

  async getProgramFromStorage(isDeleted = false) {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.GET_OBSERVATION_SUBMISSIONS + `${this.observationId}?entityId=${this.entityId}`,
      payload: payload,
    };
    this.loader.startLoader();
    this.assessmentService.post(config).subscribe(
      (success) => {
        if (success.result && success.result.length == 0) {
          if (isDeleted) {
            this.loader.stopLoader();
            history.go(-1);
            return;
          }
          let event = {
            entityId: this.entityId,
            observationId: this.observationId,
            submission: {
              submissionNumber: 1,
            },
          };
          this.observationService.getAssessmentDetailsForObservation(event).then(
            (res) => {
              this.loader.stopLoader();

              this.getProgramFromStorage();
            },
            (err) => {
              this.loader.stopLoader();
            }
          );
        }
        this.localStorage
          .getLocalStorage(storageKeys.observationSubmissionIdArr)
          .then((ids) => {
            this.submissionIdArr = ids;
          })
          .catch((err) => {
            this.submissionIdArr = [];
          })
          .finally(() => {
            this.loader.stopLoader();
            this.submissionList = success.result;
            this.applyDownloadedflag();

            this.splitCompletedAndInprogressObservations();

            this.tabChange(this.currentTab ? this.currentTab : 'all');
          });
      },
      (error) => {
        // if (isDeleted) {
        //   this.loader.stopLoader();
        //   history.go(-1);
        //   return;
        // }
        // if (error.error.status === 400) {
        //   let event = {
        //     entityId: this.entityId,
        //     observationId: this.observationId,
        //     submission: {
        //       submissionNumber: 1,
        //     },
        //   };
        //   this.observationService.getAssessmentDetailsForObservation(event).then(
        //     (res) => {
        //       this.loader.stopLoader();

        //       this.getProgramFromStorage();
        //     },
        //     (err) => {
        //       this.loader.stopLoader();
        //     }
        //   );
        // }
        console.log(error);
      }
    );
    // this.localStorage
    //   .getLocalStorage(storageKeys.observationSubmissionIdArr)
    //   .then((ids) => {
    //     this.submissionIdArr = ids;
    //   })
    //   .catch((err) => {
    //     this.submissionIdArr = [];
    //   })
    //   .finally(() => {
    //     this.httpClient.get('assets/dummy/programs.json').subscribe((data: any) => {
    //       console.log(data);
    //       this.programList = data.result;
    //       this.selectedSolution = this.programList[this.programIndex].solutions[this.solutionIndex];
    //       this.submissionList = this.programList[this.programIndex].solutions[this.solutionIndex].entities[
    //         this.entityIndex
    //       ].submissions;
    //       this.applyDownloadedflag();
    //       this.splitCompletedAndInprogressObservations();
    //       this.tabChange(this.currentTab ? this.currentTab : 'all');
    //     });
    //   });

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

  applyDownloadedflag() {
    this.submissionList.map((s) => {
      this.submissionIdArr.includes(s._id) ? (s.downloaded = true) : null;
    });
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
    this.showActionsheet = false;
    this.showEntityActionsheet = false;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submission._id))
      .then((data) => {
        if (!data) {
          this.getAssessmentDetailsApi(submission);
        } else {
          this.goToEcm(submission);
        }
      })
      .catch((error) => {
        this.getAssessmentDetailsApi(submission);
      });
  }

  getAssessmentDetailsApi(submission) {
    let event = {
      // programIndex: this.programIndex,
      // solutionIndex: this.solutionIndex,
      // entityIndex: this.entityIndex,
      submission: submission,
      entityId: this.entityId,
      observationId: this.observationId,
    };
    this.observationService
      .getAssessmentDetailsForObservation(event)
      .then(async (programList) => {
        await this.getProgramFromStorage();
        this.goToEcm(submission);
      })
      .catch((error) => {});
  }

  goToEcm(submission) {
    // TODO: Remove
    // this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.SECTION_LISTING}`]);
    let submissionId = submission._id;
    // let heading = this.selectedSolution.entities[this.entityIndex].name;
    let heading = this.entityName;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        if (successData.assessment.evidences.length > 1) {
          this.router.navigate([RouterLinks.ECM_LISTING], {
            queryParams: {
              submisssionId: submissionId,
              schoolName: heading,
            },
          });

          // this.navCtrl.push('EvidenceListPage', {
          //   _id: submissionId,
          //   name: heading,
          //   recentlyUpdatedEntity: this.recentlyUpdatedEntity,
          // });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);
            this.router.navigate([RouterLinks.SECTION_LISTING], {
              queryParams: {
                submisssionId: submissionId,
                evidenceIndex: 0,
                schoolName: heading,
              },
            });
            // this.navCtrl.push('SectionListPage', {
            //   _id: submissionId,
            //   name: heading,
            //   selectedEvidence: 0,
            //   recentlyUpdatedEntity: this.recentlyUpdatedEntity,
            // });
          } else {
            const assessment = { _id: submissionId, name: heading };
            this.openAction(assessment, successData, 0);
          }
        }
      })
      .catch((error) => {});
  }
  openAction(assessment, aseessmemtData, evidenceIndex) {
    this.utils.setCurrentimageFolderName(aseessmemtData.assessment.evidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: aseessmemtData,
      // recentlyUpdatedEntity: this.recentlyUpdatedEntity, //TODO
    };
    console.log(JSON.stringify(options));
    this.evdnsServ.openActionSheet(options, 'Observation');
  }
  async openMenu(event, submission, index) {
    if (submission.ratingCompletedAt) {
      let popover = await this.popoverCtrl.create({
        component: ScroreReportMenusComponent,
        componentProps: {
          submission: submission,
          entityType: submission.entityType,
        },
        event: event,
      });
      popover.present();
    } else {
      this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
        queryParams: {
          submissionId: submission._id,
          entityType: submission.entityType,
        },
      });
      // this.navCtrl.push(ObservationReportsPage, {
      //   submissionId: submission._id,
      //   entityType: this.selectedSolution.entities[this.entityIndex].entityType,
      // });
    }
  }
  //  entity actions
  entityActions(e) {
    let noScore: boolean = true;
    this.submissions.forEach((submission) => {
      submission.showActionsheet = false;
      if (submission.ratingCompletedAt) {
        // this.showActionsheet = true;
        // this.showEntityActionsheet = true;
        noScore = false;
      }
    });
    if (noScore) {
      this.viewEntityReports();
    } else {
      this.openEntityReportMenu(e);
    }
  }

  // Menu for Entity reports
  async openEntityReportMenu(event) {
    let popover = await this.popoverCtrl.create({
      component: ScroreReportMenusComponent,
      componentProps: {
        observationId: this.observationId,
        entityId: this.entityId,
        entityType: this.submissionList[0].entityType,
        showEntityActionsheet: 'true',
        showSubmissionAction: 'false',
      },
      event: event,
    });
    popover.present();
  }

  viewEntityReports() {
    this.showEntityActionsheet = false;
    this.showActionsheet = false;
    // const payload = {
    //   entityId: this.selectedSolution.entities[this.entityIndex]._id,
    //   observationId: this.selectedSolution.entities[this.entityIndex].submissions[0].observationId,
    //   entityType: this.selectedSolution.entities[this.entityIndex].entityType,
    // };
    // this.navCtrl.push(ObservationReportsPage, payload);
    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        entityId: this.entityId,
        observationId: this.observationId,
        entityType: this.submissionList[0].entityType,
      },
    });
  }
  // Actions on submissions
  async openActionMenu(event, submission, index) {
    // submission.entityName = this.selectedSolution.entities[this.entityIndex].name;
    submission.entityName = this.entityName;
    let popover = await this.popoverCtrl.create({
      component: SubmissionActionsComponent,
      componentProps: {
        submission: submission,
      },
      event: event,
    });
    popover.onDidDismiss().then((data: any) => {
      if (data.data && data.data.action === 'update') {
        const payload = {
          submissionId: submission._id,
          title: data.data.name,
        };
        this.ediSubmissionName(payload, index);
      } else if (data.data && data.data.action === 'delete') {
        this.deleteSubmission(submission._id);
      }
    });
    await popover.present();
  }
  async deleteSubmission(submissionId) {
    let translateObject;
    this.translate
      .get(['FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_MSG_DELETE_SUBMISSION', 'FRMELEMNTS_LBL_YES', 'FRMELEMNTS_LBL_NO'])
      .subscribe((translations) => {
        translateObject = translations;
      });
    let alert = await this.alertCntrl.create({
      header: translateObject['FRMELEMNTS_LBL_CONFIRM'],
      message: translateObject['FRMELEMNTS_MSG_DELETE_SUBMISSION'],
      buttons: [
        {
          text: translateObject['FRMELEMNTS_LBL_NO'],
          role: 'cancel',
          handler: () => {},
        },
        {
          text: translateObject['FRMELEMNTS_LBL_YES'],
          handler: async () => {
            let payload = await this.utils.getProfileInfo();

            const config = {
              url: urlConstants.API_URLS.OBSERVATION_SUBMISSION_DELETE + `${submissionId}`,
              payload: payload,
            };
            this.loader.startLoader();

            this.assessmentService.post(config).subscribe(
              (success) => {
                this.loader.stopLoader();

                if (success && success.status == 200) {
                  this.getProgramFromStorage(true);
                }
              },
              (error) => {
                this.loader.stopLoader();
              }
            );
          },
        },
      ],
    });
    alert.present();
  }

  async ediSubmissionName(data, i) {
    let payload = await this.utils.getProfileInfo();
    payload.title = data.title;

    const config = {
      url: urlConstants.API_URLS.EDIT_OBSERVATION_NAME + `${data.submissionId}`,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        console.log(success);
        if (success && success.status == 200) {
          this.getProgramFromStorage();
        }
      },
      (error) => {}
    );
  }

  async observeAgain() {
    this.loader.startLoader('Creating an Observation');

    const entityId = this.entityId;
    const observationId = this.observationId;

    let payload = await this.utils.getProfileInfo();

    const config = {
      url: urlConstants.API_URLS.OBSERVATION_SUBMISSION_CREATE + `${observationId}?entityId=${entityId}`,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();

        console.log(success);
        if (success && success.status == 200) {
          this.getProgramFromStorage();
        }
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }

  refreshLocalObservationList(refreshEvent?, startLoader?) {
    let event = {
      programIndex: this.programIndex,
      solutionIndex: this.solutionIndex,
      entityIndex: this.entityIndex,
    };
    startLoader ? this.loader.startLoader() : null;
    // TODO:Implement
    // this.programService
    //   .refreshObservationList(this.programList, event)
    //   .then(async (data) => {
    //     await this.getProgramFromStorage("stopLoader");
    //     if (refreshEvent) refreshEvent.complete();
    //     this.selectedSolution.entities[this.entityIndex].submissions.length > 0 ? null : this.navCtrl.pop();

    //     this.pageTop.scrollToTop();
    //   })
    //   .catch((error) => {
    //     this.loader.stopLoader();
    //   });
  }
}
