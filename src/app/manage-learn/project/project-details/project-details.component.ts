import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { actions } from '../../core/constants/actions.constants';
import { DbService } from '../../core/services/db.service';
import { ToastService, NetworkService, ProjectService, statusType, UtilsService } from '../../core';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { urlConstants } from '../../core/constants/urlConstants';
import { SharingFeatureService } from '../../core/services/sharing-feature.service';
import { AlertController, ModalController } from '@ionic/angular';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { Location } from '@angular/common';
import * as _ from 'underscore';
import { CreateTaskFormComponent } from '../../shared';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  projectId;
  solutionId;
  programId
  templateId;
  projectType;
  _headerConfig;
  allStrings;
  projectDetails;
  categories = [];
  isNotSynced: boolean;
  cardMetaData;
  projectActions;
  segmentType = "details";
  networkFlag: boolean;
  private _networkSubscription: Subscription;
  shareTaskId
  _appHeaderSubscription: Subscription;
  projectCompletionPercent;
  allStatusTypes = statusType;
  taskCount = 0;
  projectDetailsCopy;
  taskNoDataFound="FRMELEMNTS_LBL_PLEASE_CREATE_AND_COMPLETE_TASKS"
  certificateCriteria:any =[];
  constructor(
    public params: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private db: DbService,
    private network: NetworkService,
    private toast: ToastService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private alert: AlertController,
    private ref: ChangeDetectorRef,
    private unnatiService: UnnatiDataService,
    private location: Location,
    private projectServ: ProjectService,
    private modal: ModalController,
    private utils: UtilsService,
    private ngZone: NgZone,
    private share: SharingFeatureService
  ) {
    params.queryParams.subscribe((parameters) => {
      this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
      this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
        this.networkFlag = available;
      })
      this.setHeaderConfig();
      this.projectId = parameters.projectId;
      this.solutionId = parameters.solutionId;
      this.programId = parameters.programId;
      this.projectType = parameters.type ? parameters.type : '';
      this.templateId = parameters.templateId;
      this.getProject()
    });
  }

  ngOnInit() {
    this.translate
      .get([
        "FRMELEMNTS_MSG_SOMETHING_WENT_WRONG",
        "FRMELEMNTS_MSG_NO_ENTITY_MAPPED",
        "FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS",
        "FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE",
        "YES",
        "NO"
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
  }
  ionViewWillEnter() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.location.back();
    });
  }
  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  setHeaderConfig() {
    this._headerConfig = {
      showHeader: true,
      showBurgerMenu: false,
      pageTitle: '',
      actionButtons: [],
    };
    this.headerService.updatePageConfig(this._headerConfig);
  }

  refreshTheActions() {
    this.setActionButtons();
    this.projectCompletionPercent = this.projectServ.getProjectCompletionPercentage(this.projectDetails);
    this.getAllActiveTasks();
  }

  getProject() {
    if (this.projectId) {
      this.db.query({ _id: this.projectId }).then(
        (success) => {
          if (success.docs.length) {
            this.categories = [];
            this.projectDetails = success.docs.length ? success.docs[0] : {};
            if(this.projectDetails.certificate){
              this.certificateCriteria =[];
              let criteria = Object.keys(this.projectDetails?.certificate?.criteria?.conditions);
              criteria.forEach(element => {
                let config ={
                  name:this.projectDetails?.certificate?.criteria?.conditions[element].validationText
                }
                this.certificateCriteria.push(config);
              })
            }
            this.setActionButtons();
            this.isNotSynced = this.projectDetails ? (this.projectDetails.isNew || this.projectDetails.isEdit) : false;
            this.projectDetails.categories.forEach((category: any) => {
              category.label ? this.categories.push(category.label) : this.categories.push(category.name);
            });
            this.setCardMetaData();
            this.projectCompletionPercent = this.projectServ.getProjectCompletionPercentage(this.projectDetails);
            this.getProjectTaskStatus();
            this.taskCount = this.utils.getTaskCount(this.projectDetails);
            this.getAllActiveTasks();
          } else {
            this.getProjectsApi();
          }

        },
        (error) => {
          this.getProjectsApi();
        }
      );
    } else {
      this.getProjectsApi();
    }

  }

  getAllActiveTasks() {
    const profileDetailsCopy = { ...this.projectDetails }
    let activeTask =    _.filter(this.projectDetails.tasks, function(el) {
      return !el.isDeleted;
   });
   profileDetailsCopy.tasks = activeTask;
   this.ngZone.run(() => {
    this.projectDetailsCopy = profileDetailsCopy;
   })
  }

  setCardMetaData() {
    this.cardMetaData = {
      title: this.projectDetails.title,
      subTitle: this.projectDetails.programName || null
    }
  }

  segmentChanged(event) {
    this.segmentType = event.detail.value;
  }

  setActionButtons() {
    let defaultOptions = actions.PROJECT_ACTIONS;
    if (this.projectDetails.isNew || this.projectDetails.isEdit) {
      const indexOfSync = defaultOptions.length - 1;
      defaultOptions[indexOfSync] = actions.SYNC_ACTION;
    } else {
      const indexOfSync = defaultOptions.length - 1;
      defaultOptions[indexOfSync] = actions.SYNCED_ACTION;
    }
    if (this.projectDetails.downloaded) {
      defaultOptions[0] = actions.DOWNLOADED_ACTION
    } else {
      defaultOptions[0] = actions.NOT_DOWNLOADED;
    }
    if (this.projectDetails.status === statusType.submitted) {
      if(this.projectDetails.certificate){
        defaultOptions = actions.SUBMITTED_PROJECT_ACTIONS.concat(actions.CERTIFICATE_ACTION);
      }else{
        defaultOptions = actions.SUBMITTED_PROJECT_ACTIONS
      }
    }
    this.projectActions = defaultOptions;
  }

  doSyncAction() {
    if (this.network.isNetworkAvailable) {
      this.projectDetails.isNew
        ? this.projectServ.createNewProject(this.projectDetails)
        : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
    }
  }

  onAction(event) {
    switch (event) {
      case 'download':
        if (this.network.isNetworkAvailable) {
          this.projectDetails.downloaded = true;
          this.updateLocalDb();
          this.toast.showMessage('FRMELEMNTS_MSG_DOWNLOADED_SUCCESSFULLY', 'success');
          this.setActionButtons();
        } else {
          this.toast.showMessage('FRMELEMNTS_LBL_PROJECT_DOWNLOAD_OFFLINE', 'danger');
        }
        break;
      case 'downloaded':
        break;
      case 'sync':
        this.doSyncAction();
        break;
      case 'synced':
        break;
      case 'share':
        this.network.isNetworkAvailable
          ? this.projectServ.openSyncSharePopup('shareProject', this.projectDetails.title, this.projectDetails)
          : this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        break;
      case 'files':
        this.router.navigate([`${RouterLinks.ATTACHMENTS_LIST}`, this.projectDetails._id]);
        break
      case 'edit':
        this.router.navigate([`/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_EDIT}`, this.projectDetails._id]);
        break;
      case 'certificate':
       this.getProjectsApi(true);
        break
    }
  }

  onTaskAction(event) {
    switch (event.type) {
      case 'deleteTask':
        let index = 0;
        for (const task of this.projectDetails.tasks) {
          if(event.taskId === task._id){
            break;
          }
          index++
        }
        this.projectDetails.tasks[index].isDeleted = true;
        this.projectDetails.tasks[index].isEdit = true;
        this.refreshTheActions();
        this.updateLocalDb(true);
        this.taskCount = this.utils.getTaskCount(this.projectDetails);
        break
    }
  }

  openResource(resource) {
    this.projectServ.openResources(resource);
  }

  updateLocalDb(setIsEditTrue = false) {
    this.projectDetails.isEdit = setIsEditTrue ? true : this.projectDetails.isEdit;
    this.db.update(this.projectDetails).then(success => {
      this.projectDetails._rev = success.rev;
      this.taskCount = this.utils.getTaskCount(this.projectDetails);
    })
  }

  getProjectsApi(certificate?) {
    const payload = {
      projectId: this.projectId,
      solutionId: this.solutionId,
      isProfileInfoRequired: false,
      programId: this.programId,
      templateId: this.templateId,
      certificate : certificate
    };
    this.projectServ.getProjectDetails(payload);
  }

  getProjectTaskStatus() {
    if (!this.projectDetails.tasks && !this.projectDetails.tasks.length) {
      return
    }
    let taskIdArr = this.getAssessmentTypeTaskId()

    if (!taskIdArr.length) {
      return
    }
    if (!this.networkFlag) {
      return;
    }
    const config = {
      url: urlConstants.API_URLS.PROJCET_TASK_STATUS + `${this.projectDetails._id}`,
      payload: {
        taskIds: taskIdArr,
      },
    };
    this.unnatiService.post(config).subscribe(
      (success) => {
        if (!success.result) {
          return;
        }
        this.updateAssessmentStatus(success.result);
      },
      (error) => {
      }
    );
  }

  updateAssessmentStatus(data) {
    // if task type is assessment or observation then check if it is submitted and change the status and update in db
    let isChnaged = false
    this.projectDetails.tasks.map((t) => {
      data.map((d) => {
        if (d.type == 'assessment' || d.type == 'observation') {//check if type is observation or assessment 
          if (d._id == t._id && d.submissionDetails.status) {
            // check id matches and task details has submissionDetails
            if (!t.submissionDetails || JSON.stringify(t.submissionDetails)  != JSON.stringify(d.submissionDetails) ) {
              t.submissionDetails = d.submissionDetails;
              t.status = d.submissionDetails.status;
              t.isEdit = true
              isChnaged = true;
              t.isEdit = true
              this.projectDetails.isEdit = true
              this.refreshTheActions();
            }
          }
        }

      });
    });
    isChnaged ? this.updateLocalDb(true) : null// if any assessment/observatiom task status is changed then only update 
    this.ref.detectChanges();
  }

  getAssessmentTypeTaskId() {
    const assessmentTypeTaskIds = [];
    for (const task of this.projectDetails.tasks) {
      task.type === "assessment" || task.type === "observation" ? assessmentTypeTaskIds.push(task._id) : null;
    }
    return assessmentTypeTaskIds;
  }

  submitImprovment() {
    if (!this.network.isNetworkAvailable) {
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
    }
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.ADD_FILE}`, this.projectDetails._id])
  }

  async addNewTask() {
    const modal = await this.modal.create({
      component: CreateTaskFormComponent,
      cssClass: "create-task-modal",
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        !this.projectDetails.tasks ? (this.projectDetails.tasks = []) : "";
        this.projectDetails.status = this.projectDetails.status ? this.projectDetails.status : statusType.notStarted;
        this.projectDetails.status = this.projectDetails.status == statusType.notStarted ? statusType.inProgress : this.projectDetails.status;
        this.projectDetails.tasks.push(data.data);
        this.toast.showMessage("FRMELEMNTS_MSG_NEW_TASK_ADDED_SUCCESSFUL", 'success');
        this.updateLocalDb(true);
        this.refreshTheActions();
      }
    });
    return await modal.present();
  }

}
