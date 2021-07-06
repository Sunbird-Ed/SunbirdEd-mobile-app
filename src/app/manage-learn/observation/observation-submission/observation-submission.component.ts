import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { ObservationService } from '../observation.service';
import { RouterLinks } from '@app/app/app.constant';
import { LoaderService, LocalStorageService, UtilsService,ToastService } from '../../core';
import { storageKeys } from '../../storageKeys';
import { EvidenceService } from '../../core/services/evidence.service';
import { ScroreReportMenusComponent } from '../../shared/components/scrore-report-menus/scrore-report-menus.component';
import { SubmissionActionsComponent } from '../../shared/components/submission-actions/submission-actions.component';
import { TranslateService } from '@ngx-translate/core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { ViewDetailComponent } from '../../shared/components/view-detail/view-detail.component';
import { Subscription } from "rxjs";
import { Storage } from '@ionic/storage';
import { GenericPopUpService } from '../../shared';

@Component({
  selector: 'app-observation-submission',
  templateUrl: './observation-submission.component.html',
  styleUrls: ['./observation-submission.component.scss'],
})
export class ObservationSubmissionComponent implements OnInit {
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  submissionList: any;
  inProgressObservations = [];
  completedObservations = [];
  submissions: any[];
  currentTab = 'all';
  showEntityActionsheet: boolean;
  showActionsheet: boolean;
  submissionIdArr: any;
  observationId: any;
  solutionId: any;
  programId: any;
  entityId: any;
  entityName: any;
  disableObserveAgain: boolean = false;
  private _networkSubscription?: Subscription;
  networkFlag;
  generatedKey;
  downloadedSubmissionList: any = [];
  constructor(
    private headerService: AppHeaderService,
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
    private assessmentService: AssessmentApiService,
    private modalCtrl: ModalController,
    public commonUtilService: CommonUtilService,
    public storage: Storage,
    public toast: ToastService,
    public genericPopup:GenericPopUpService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.programId = params.programId;
      this.entityId = params.entityId;
      this.entityName = params.entityName;
      this.disableObserveAgain = params.disableObserveAgain;
    });
  }

  ngOnInit() {
    let data = {
      observationId: this.observationId,
      entityId: this.entityId,
    };
    this.generatedKey = this.utils.getUniqueKey(data, storageKeys.submissionsList);
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      this.networkFlag = available;
      this.networkFlag ? this.getProgramFromStorage() : this.getLocalData();
    });
    this.fetchDownloaded();
  }
  getLocalData() {
    this.storage.get(this.generatedKey).then((data) => {
      this.submissionList = data;
      this.splitCompletedAndInprogressObservations();
      this.tabChange(this.currentTab ? this.currentTab : 'all');
    });
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this.networkFlag ? this.getProgramFromStorage() : this.getLocalData();
  }

  async getProgramFromStorage(isDeleted = false) {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.GET_OBSERVATION_SUBMISSIONS + `${this.observationId}?entityId=${this.entityId}`,
      payload: payload,
    };
    this.loader.startLoader();
    this.assessmentService.post(config).subscribe(
      async (success) => {
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
          await this.observationService.getAssessmentDetailsForObservation(event).then(
            (res) => {
              this.loader.stopLoader();
              this.getProgramFromStorage();
            },
            (err) => {
              this.loader.stopLoader();
            }
          );
        }
 
        this.loader.stopLoader();
        this.submissionList = success.result;
        this.storage.set(this.generatedKey, this.submissionList);
        this.splitCompletedAndInprogressObservations();
        this.tabChange(this.currentTab ? this.currentTab : 'all');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async fetchDownloaded() {
    this.downloadedSubmissionList=await this.observationService.fetchDownloaded()
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
    }
  }
  getAssessmentDetails(submission) {
    if (this.networkFlag) {
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
    } else {
      this.toast.showMessage('FRMELEMENTS_MSG_FEATURE_USING_OFFLINE', 'danger');
    }
  }

  getAssessmentDetailsApi(submission) {
    let event = {
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

  async pushToLocal(submission) {
    let args = {
      title: 'DOWNLOAD_FORM',
      yes: 'YES',
      no:'NO'
    }
    const confirmed = await this.genericPopup.confirmBox(args)
    if(!confirmed) return
    let event = {
      submission: submission,
      entityId: this.entityId,
      observationId: this.observationId,
    };
    this.observationService
      .getAssessmentDetailsForObservation(event)
      .then(async (submissionId) => {
        await this.observationService.pushToDownloads(submissionId);
        this.fetchDownloaded();
        let args = {
          title: 'FRMELEMENTS_MSG_SUCCESSFULLY DOWNLOADED',
          yes: 'OKAY',
          autoDissmiss:true
        };
        await this.genericPopup.confirmBox(args);
      })
      .catch((error) => {});
  }

  goToEcm(submission) {
    let submissionId = submission._id;
    let heading = this.entityName;

    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId))
      .then((successData) => {
        if (
          successData.assessment.evidences.length > 1 ||
          successData.assessment.evidences[0].sections.length > 1 ||
          (submission.criteriaLevelReport && submission.isRubricDriven)
        ) {
          this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], {
            queryParams: {
              submisssionId: submissionId,
              schoolName: heading,
            },
          });
        } else {
          if (successData.assessment.evidences[0].startTime) {
            this.utils.setCurrentimageFolderName(successData.assessment.evidences[0].externalId, submissionId);

            this.router.navigate([RouterLinks.QUESTIONNAIRE], {
              queryParams: {
                submisssionId: submissionId,
                evidenceIndex: 0,
                sectionIndex: 0,
                schoolName: this.entityName,
              },
            });
          } else {
            const assessment = { _id: submissionId, name: heading };
            this.openAction(assessment, successData, 0);
          }
        }
      })
      .catch((error) => {
        this.getAssessmentDetailsApi(submission);
      });
  }
  async openAction(assessment, aseessmemtData, evidenceIndex) {
    this.utils.setCurrentimageFolderName(aseessmemtData.assessment.evidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: aseessmemtData,
      // recentlyUpdatedEntity: this.recentlyUpdatedEntity, //TODO
    };
    let action = await this.evdnsServ.openActionSheet(options, 'FRMELEMNTS_LBL_OBSERVATION');
    if (action) {
      this.router.navigate([RouterLinks.QUESTIONNAIRE], {
        queryParams: {
          submisssionId: assessment._id,
          evidenceIndex: 0,
          sectionIndex: 0,
          schoolName: this.entityName,
        },
      });
    }
  }
  async openMenu(event, submission, index) {
    // if (submission.scoringSystem != 'pointsBasedScoring' && submission.isRubricDriven) {
    if (submission.criteriaLevelReport && submission.isRubricDriven) {
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          scores: true,
          observation: true,
          entityId: submission.entityId,
          entityType: submission.entityType,
          observationId: submission.observationId,
          submissionId: submission._id,
        },
      });
      return;
    }
    if (submission.ratingCompletedAt) {
      /* no need to show menu now directly show the score report */
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          scores: true,
          observation: true,
          criteriaWise: false,
          submissionId: submission._id,
          entityType: submission.entityType,
          filter: { questionId: [] },
        },
      });
    } else {
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          scores: false,
          observation: true,
          criteriaWise: false,
          submissionId: submission._id,
          entityType: submission.entityType,
          filter: { questionId: [] },
        },
      });
    }
  }
  //  entity actions
  entityActions(e) {
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMENTS_MSG_FEATURE_USING_OFFLINE', 'danger');
    } else {
      let submission = this.submissions[0];
      // if (submission.scoringSystem != 'pointsBasedScoring' && submission.isRubricDriven) {
      if (submission.criteriaLevelReport && submission.isRubricDriven) {
        this.router.navigate([RouterLinks.GENERIC_REPORT], {
          state: {
            scores: true,
            observation: true,
            entityId: submission.entityId,
            entityType: submission.entityType,
            observationId: submission.observationId,
          },
        });
        return;
      }
      let noScore: boolean = true;
      this.submissions.forEach((submission) => {
        submission.showActionsheet = false;
        if (submission.ratingCompletedAt) {
          noScore = false;
        }
      });
      if (noScore) {
        this.viewEntityReports();
      } else {
        this.openEntityReportMenu(e);
      }
    }
  }

  // Menu for Entity reports
  async openEntityReportMenu(event) {
    let submission = this.submissions[0];
    /* no need to show menu now directly show the score report */
    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        scores: true,
        observation: true,
        criteriaWise: false,
        entityId: submission.entityId,
        entityType: submission.entityType,
        observationId: submission.observationId,
        filter: { questionId: [] },
      },
    });
  }

  viewEntityReports() {
    let submission = this.submissions[0];
    this.showEntityActionsheet = false;
    this.showActionsheet = false;

    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        scores: false,
        observation: true,
        criteriaWise: false,
        entityId: submission.entityId,
        entityType: submission.entityType,
        observationId: submission.observationId,
        filter: { questionId: [] },
      },
    });
  }
  // Actions on submissions
  async openActionMenu(event, submission, index) {
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
              url: urlConstants.API_URLS.OBSERVATION_SUBMISSION_UPDATE + `${submissionId}`,
              payload: payload,
            };
            this.loader.startLoader();

            this.assessmentService.delete(config).subscribe(
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
      url: urlConstants.API_URLS.OBSERVATION_SUBMISSION_UPDATE + `${data.submissionId}`,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        if (success && success.status == 200) {
          this.getProgramFromStorage();
        }
      },
      (error) => {}
    );
  }

  async observeAgain() {
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMENTS_MSG_FEATURE_USING_OFFLINE', 'danger');
    } else {
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

          if (success && success.status == 200) {
            this.getProgramFromStorage();
          }
        },
        (error) => {
          this.loader.stopLoader();
        }
      );
    }
  }

  //open info menu
  async openInfo(submission) {
    submission.entityName = this.entityName;
    const modal = await this.modalCtrl.create({
      component: ViewDetailComponent,
      componentProps: {
        submission: submission,
      },
    });
    await modal.present();
  }

  ngOnDestroy() {
    if (this._networkSubscription) {
      this._networkSubscription.unsubscribe();
    }
  }
}
