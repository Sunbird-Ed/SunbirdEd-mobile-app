import { ChangeDetectorRef, Component, OnDestroy, Inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, AlertController, Platform, ModalController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '@app/app/manage-learn/core/constants/statuses.constant';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import * as moment from "moment";
import { AppHeaderService , CommonUtilService} from '@app/services';
import { menuConstants } from '../../core/constants/menuConstants';
import { PopoverComponent } from '../../shared/components/popover/popover.component';
import { Subscription } from 'rxjs';
import { DbService } from '../../core/services/db.service';
import { LoaderService, ToastService, NetworkService } from '../../core';
import { SyncService } from '../../core/services/sync.service';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { RouterLinks } from '@app/app/app.constant';
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
import { CreateTaskFormComponent } from '../../shared';
import { SharingFeatureService } from '../../core/services/sharing-feature.service';
import { Location } from '@angular/common';

@Component({
  selector: "app-project-detail",
  templateUrl: "./project-detail.page.html",
  styleUrls: ["./project-detail.page.scss"],
})
export class ProjectDetailPage implements OnDestroy {
  showDetails: boolean = true;
  statuses = statuses;
  project: any;
  projectId;
  projectType = '';
  categories = [];
  taskCount: number = 0;
  filters: any = {};
  schedules = [
    {
      title: "FRMELEMNTS_LBL_PAST",
      value: "past"
    },
    {
      title: "FRMELEMNTS_LBL_TODAY",
      value: "today"
    },
    {
      title: "FRMELEMNTS_LBL_THIS_WEEK",
      value: "thisWeek"
    },
    {
      title: "FRMELEMNTS_LBL_THIS_MONTH",
      value: "thisMonth"
    },
    {
      title: "FRMELEMNTS_LBL_THIS_QUARTER",
      value: "thisQuarter"
    },
    {
      title: "FRMELEMNTS_LBL_UPCOMING",
      value: "upcoming"
    },
  ];
  sortedTasks;
  programId;
  solutionId;
  private backButtonFunc: Subscription;

  // header
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [] as string[]
  };
  isNotSynced: boolean;
  locationChangeTriggered: boolean = false;
  allStrings;
  private _appHeaderSubscription?: Subscription;
  viewOnlyMode: boolean = false;
  templateId;
  templateDetailsPayload;
  importProjectClicked: boolean = false;
  fromImportProject: boolean = false;
  shareTaskId;
  networkFlag: boolean;
  private _networkSubscription: Subscription;


  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private headerService: AppHeaderService,
    private db: DbService,
    private loader: LoaderService,
    private router: Router,
    private utils: UtilsService,
    private alert: AlertController,
    private share: SharingFeatureService,
    private syncServ: SyncService,
    private toast: ToastService,
    private translate: TranslateService,
    private modal: ModalController,
    private unnatiService: UnnatiDataService,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    private navigateService: NavigationService,
    private alertController: AlertController,
    private network: NetworkService,
    private location: Location,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
  ) {
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      this.networkFlag = available;
    })
    params.queryParams.subscribe((parameters) => {
      this.projectId = parameters.projectId;
      this.solutionId = parameters.solutionId;
      this.programId = parameters.programId;
      this.projectType = parameters.type ? parameters.type : '';
      this.viewOnlyMode = parameters.viewOnlyMode;
      this.templateId = parameters.templateId;
      this.viewOnlyMode ? this.getTemplateDetails() : this.getProject();
      this.templateDetailsPayload = this.router.getCurrentNavigation().extras.state;
      this.fromImportProject = (parameters.fromImportPage && parameters.fromImportPage == 'true') ? true : false;
    });
    this.translate
      .get([
        "FRMELEMNTS_MSG_SOMETHING_WENT_WRONG",
        "FRMELEMNTS_MSG_NO_ENTITY_MAPPED",
        "FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS",
        "FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE",
        "YES",
        "NO",
        "FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS"
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });

    this.platform.resume.subscribe((result) => {
      this.getProjectTaskStatus();
    });
  }

  getTemplateDetails() {
    this.loader.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROJECT_TEMPLATE_DETAILS + this.templateId,
      // payload:  {}
    }

    this.unnatiService.get(config).subscribe(success => {
      this.loader.stopLoader();
      this.project = success.result;
      this._headerConfig.actionButtons = []
      this.headerService.updatePageConfig(this._headerConfig);
      this.sortTasks();
      this.programId = (success.result && success.result.programInformation) ? success.result.programInformation.programId : null;

    }, error => {
      this.loader.stopLoader();

    })
  }

  getProject() {
    if (this.projectId) {
      this.db.query({ _id: this.projectId }).then(
        (success) => {
          if (success.docs.length) {
            this.categories = [];
            this.project = success.docs.length ? success.docs[0] : {};
            this.isNotSynced = this.project ? (this.project.isNew || this.project.isEdit) : false;
            !this.viewOnlyMode ? this._headerConfig.actionButtons.push('more') : null;
            this._headerConfig.actionButtons.push(this.isNotSynced ? 'sync-offline' : 'sync-done');
            this.headerService.updatePageConfig(this._headerConfig);
            this.project.categories.forEach((category: any) => {
              category.label ? this.categories.push(category.label) : this.categories.push(category.name);
            });
            this.project.tasks && this.project.tasks.length ? this.sortTasks() : "";
            this.getProjectTaskStatus();
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

  async getProjectsApi() {
    this.loader.startLoader();
    let payload = this.projectType == 'assignedToMe' ? await this.utils.getProfileInfo() : '';
    const url = `${this.projectId ? '/' + this.projectId : ''}?${this.templateId ? 'templateId=' + this.templateId : ''}${this.solutionId ? ('&&solutionId=' + this.solutionId) : ''}`;
    const config = {
      url: urlConstants.API_URLS.GET_PROJECT + url,
      payload: this.projectType == 'assignedToMe' ? payload : {}
    }
    this.templateDetailsPayload ? config.payload = this.templateDetailsPayload : null;
    this.unnatiService.post(config).subscribe(success => {
      this.loader.stopLoader();
      if (this.templateId) {
        this.toast.openToast(this.allStrings['FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS'])
      }
      let data = success.result;
      let newCategories = []
      for (const category of data.categories) {
        if (category._id || category.name) {
          const obj = {
            label: category.name || category.label,
            value: category._id
          }
          newCategories.push(obj)
        }
      }
      data.categories = newCategories.length ? newCategories : data.categories;
      if (data.tasks) {

        data.tasks.map(t => {
          if ((t.type == 'observation' || t.type == 'assessment') && t.submissionDetails && t.submissionDetails.status) {
            if (t.submissionDetails.status != t.status) {
              t.status = t.submissionDetails.status
              t.isEdit = true;
              data.isEdit = true
            }
          }
        })

      }
      this.db.create(success.result).then(successData => {
        this.projectId ? this.getProject() :
          this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
            queryParams: {
              projectId: success.result._id,
              programId: this.programId,
              solutionId: this.solutionId,
              fromImportPage: this.importProjectClicked
            }, replaceUrl: true
          });
      }).catch(error => {
        if (error.status === 409) {
          this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
            queryParams: {
              projectId: success.result._id,
              programId: this.programId,
              solutionId: this.solutionId,
              fromImportPage: this.importProjectClicked
            }, replaceUrl: true
          })
        }
      })
    }, error => {

      this.loader.stopLoader();
    })
  }


  ionViewWillEnter() {
    this.initApp();
    this.getDateFilters();
    this.handleBackButton();
  }

  initApp() {
    this.zone.run(() => {
      this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
        if (eventName.name === 'more') {
          this.openPopover(eventName.event);
        } else if (eventName.name === 'sync') {
          this.action(eventName.name);
        } else if (eventName.name === 'back') {
          if (this.fromImportProject) {
            setTimeout(() => {
              this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.SOLUTIONS}`, this.programId]);
            }, 0)
            this.router.navigate([`/${RouterLinks.TABS}/${RouterLinks.HOME}/${RouterLinks.HOME_ADMIN}`]);
          } else {
            this.location.back();
          }
        }
      });
    })

    let data;
    this.translate.get(["FRMELEMNTS_LBL_PROJECT_VIEW"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data["FRMELEMNTS_LBL_PROJECT_VIEW"];
    this.headerService.updatePageConfig(this._headerConfig);
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
    if(this._networkSubscription){
      this._networkSubscription.unsubscribe();
    }
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  getDateFilters() {
    let currentDate = moment();
    this.filters.today = moment(currentDate).format("YYYY-MM-DD");
    this.filters.thisWeek = currentDate.endOf("week").format("YYYY-MM-DD");
    this.filters.thisMonth = currentDate.endOf("month").format("YYYY-MM-DD");
    const quarter = Math.floor((new Date().getMonth() / 3));
    let startFullQuarter: any = new Date(new Date().getFullYear(), quarter * 3, 1);
    let endFullQuarter: any = new Date(startFullQuarter.getFullYear(), startFullQuarter.getMonth() + 3, 0);
    this.filters.thisQuarter = moment(endFullQuarter).format("YYYY-MM-DD");
  }
  sortTasks() {
    this.taskCount = 0;
    let completed = 0;
    let inProgress = 0;
    this.sortedTasks = JSON.parse(JSON.stringify(this.utils.getTaskSortMeta()));
    this.project.tasks.forEach((task: any) => {

      if (!task.isDeleted && task.endDate) {
        this.taskCount = this.taskCount + 1;
        let ed = JSON.parse(JSON.stringify(task.endDate));
        ed = moment(ed).format("YYYY-MM-DD");

        if (ed < this.filters.today) {
          this.sortedTasks["past"].tasks.push(task);
        } else if (ed == this.filters.today) {
          this.sortedTasks["today"].tasks.push(task);
        } else if (ed > this.filters.today && ed <= this.filters.thisWeek) {
          this.sortedTasks["thisWeek"].tasks.push(task);
        } else if (ed > this.filters.thisWeek && ed <= this.filters.thisMonth) {
          this.sortedTasks["thisMonth"].tasks.push(task);
        } else if (ed > this.filters.thisMonth && ed <= this.filters.thisQuarter) {
          this.sortedTasks["thisQuarter"].tasks.push(task);
        }
        else {
          this.sortedTasks["upcoming"].tasks.push(task);
        }
      } else if (!task.isDeleted && !task.endDate) {
        this.sortedTasks["upcoming"].tasks.push(task);
        this.taskCount = this.taskCount + 1;
      }
      if (!task.isDeleted) {
        if (task.status == this.statuses[1].title) {
          inProgress = inProgress + 1;
        } else if (task.status == this.statuses[2].title) {
          completed = completed + 1;
        }
      }
    });
    this.project = this.utils.setStatusForProject(this.project);
  }
  syn() { }

  toggle() {
    this.showDetails = !this.showDetails;
  }
  async openPopover(ev: any, task?) {
    let menu;
    if (task && task._id) {
      menu = JSON.parse(JSON.stringify(menuConstants.TASK));
      if (task.isDeletable) {
        let deleteOption = {
          TITLE: 'DELETE',
          VALUE: 'deleteTask',
          ICON: 'trash'
        }
        menu.push(deleteOption);
      }
    } else {
      menu = menuConstants.PROJECT;
    }
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: { menus: menu },
      event: ev,
      translucent: true,
    });
    popover.onDidDismiss().then((data) => {
      if (data.data) {
        this.action(data.data, task);
      }
    });
    return await popover.present();
  }

  action(event, task?) {
    switch (event) {
      case "sync": {
        if (this.network.isNetworkAvailable) {
          this.project.isNew
            ? this.createNewProject()
            : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
        } else {
          this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        }
        break;
      }
      case "editTask": {
        this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.project._id, task._id]);
        break;
      }
      case "deleteTask": {
        this.askPermissionToDelete("task", task._id);
        break;
      }
      case "fileProject": {
        this.router.navigate([`${RouterLinks.ATTACHMENTS_LIST}`, this.project._id]);
        break;
      }
      case "editProject": {
        this.router.navigate([`/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_EDIT}`, this.project._id]);
        break;
      }
      case "deleteProject": {
        this.askPermissionToDelete("Project");
        break;
      }
      case "shareTask": {
        this.network.isNetworkAvailable ? this.openSyncSharePopup("shareTask", task.name, task._id) : this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        break;
      }
      case "shareProject": {
        this.network.isNetworkAvailable
          ? this.openSyncSharePopup('shareProject', this.project.title)
          : this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        break;
      }
    }
  }

  async openSyncSharePopup(type, name, taskId?) {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_SHARE_MSG", "FRMELEMNTS_BTN_DNTSYNC", "FRMELEMNTS_BTN_SYNCANDSHARE"]).subscribe((text) => {
      data = text;
    });
    this.shareTaskId = taskId ? taskId : null;
    const alert = await this.alert.create({
      message: data["FRMELEMNTS_LBL_SHARE_MSG"],
      buttons: [
        {
          text: data["FRMELEMNTS_BTN_DNTSYNC"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            this.toast.showMessage("FRMELEMNTS_MSG_FILE_NOT_SHARED", "danger");
          },
        },
        {
          text: data["FRMELEMNTS_BTN_SYNCANDSHARE"],
          handler: () => {
            if (this.project.isEdit || this.project.isNew) {
              this.project.isNew
                ? this.createNewProject(true)
                : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId, taskId: taskId, share: true, fileName: name } });
            } else {
              type == 'shareTask' ? this.getPdfUrl(name, taskId) : this.getPdfUrl(this.project.title);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getPdfUrl(fileName, taskId?) {
    let task_id = taskId ? taskId : '';
    const config = {
      url: urlConstants.API_URLS.GET_SHARABLE_PDF + this.project._id + '?tasks=' + task_id,
    };
    this.share.getFileUrl(config, fileName);
  }
  // task and project delete permission.
  async askPermissionToDelete(type, id?) {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION", "CANCEL", "BTN_SUBMIT"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      message: data["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION"],
      buttons: [
        {
          text: data["CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: data["BTN_SUBMIT"],
          handler: () => {
            type == "task" ? this.deleteTask(id) : this.deleteProject();
          },
        },
      ],
    });
    await alert.present();
  }

  deleteTask(id) {
    let index = _.findIndex(this.project.tasks, (item) => {
      return item._id == id;
    });
    this.project.tasks[index].isDeleted = true;
    this.project.tasks[index].isEdit = true;
    this.update("taskDelete");
  }
  deleteProject() {
    // actions
    this.project.isDeleted = true;
    this.update("ProjectDelete");
  }
  openResources(task = null) {
    if (task && task.learningResources && task.learningResources.length === 1) {
      if(task.learningResources[0].id){
        this.openBodh(task.learningResources[0].id);
      }else{
        let identifier = task.learningResources[0].link.split("/").pop();
        this.openBodh(identifier);
      }
      return;
    }
    if (task) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.project._id, task._id]);
    } else {
      if( this.project.learningResources && this.project.learningResources.length == 1){
        if(this.project.learningResources[0].id){
          this.openBodh(this.project.learningResources[0].id);
        }else{
          let identifier = this.project.learningResources[0].link.split("/").pop();
          this.openBodh(identifier );
        }
      }else{
        this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.project._id]);
      }
    }
  }
  //open openBodh
  openBodh(link) {
    if(!this.networkFlag){
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
      return
    }
    this.loader.startLoader();
    let identifier = link.split("/").pop();
    const req: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: false,
      attachContentAccess: false,
      emitUpdateIfAny: false
    };

    this.contentService.getContentDetails(req).toPromise()
      .then(async (data: Content) => {
        this.loader.stopLoader();
        this.navigateService.navigateToDetailPage(data, { content: data });
      }, error => {
        this.loader.stopLoader();
      });
  }

  //Update the project
  update(type) {
    this.project.isEdit = true;
    this.project = this.utils.setStatusForProject(this.project);
    this.db
      .update(this.project)
      .then((success) => {
        this.project._rev = success.rev;
        this.isNotSynced = this.project ? this.project.isNew || this.project.isEdit : false;
        this._headerConfig.actionButtons.pop()
        this._headerConfig.actionButtons.push(this.isNotSynced ? 'sync-offline' : 'sync-done');
        this.headerService.updatePageConfig(this._headerConfig);
        this.ref.detectChanges();
        if (type == "newTask") {
          this.toast.showMessage("FRMELEMNTS_MSG_NEW_TASK_ADDED_SUCCESSFUL", "success");
        } else if (type == "ProjectDelete") {
          this.toast.showMessage("FRMELEMNTS_MSG_PROJECT_DELETED_SUCCESSFUL", "success");
        } else if (type == "taskDelete") {
          this.toast.showMessage("FRMELEMNTS_MSG_TASK_DELETED_SUCCESSFUL", "success");
        }
        this.sortTasks();
      })
  }
  createNewProject(isShare?) {
    this.loader.startLoader();
    const projectDetails = JSON.parse(JSON.stringify(this.project));
    this.syncServ
      .createNewProject(true, projectDetails)
      .then((success) => {
        const { _id, _rev } = this.project;
        this.project._id = success.result.projectId;
        this.project.programId = success.result.programId;
        this.project.lastDownloadedAt = success.result.lastDownloadedAt;
        this.projectId = this.project._id;
        this.project.isNew = false;
        delete this.project._rev;
        this.loader.stopLoader();
        this.db
          .create(this.project)
          .then((success) => {
            this.project._rev = success.rev;
            this.db
              .delete(_id, _rev)
              .then(res => {
                setTimeout(() => {
                  const queryParam =  {
                    projectId: this.projectId,
                    taskId: this.shareTaskId
                  }
                  if(isShare){
                    queryParam['share'] = true
                  }
                  this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], {
                    queryParams: queryParam
                  })
                }, 0)
                this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
                  queryParams: {
                    projectId: this.project._id,
                    programId: this.programId,
                    solutionId: this.solutionId,
                    fromImportPage: this.importProjectClicked
                  }, replaceUrl: true
                });
              })
          })
      })
      .catch((error) => {
        this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG"], "danger");
        this.loader.stopLoader();
      });
  }

  doDbActions(projectDetails) {
    const _rev = this.project._rev;
    delete projectDetails._rev;
    const newObj = this.syncServ.removeKeys(projectDetails, ["isNew"]);
    this.db
      .create(newObj)
      .then((success) => {
        this.db
          .delete(this.projectId, _rev)
          .then((deleteSuccess) => {
            this.loader.stopLoader();
            this.projectId = newObj._id;
            this.project = newObj;
            this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
              queryParams: {
                projectId: this.projectId,
              }, replaceUrl: true
            }
            );
            setTimeout(() => {
              this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
            }, 0);
          })
          .catch((deletError) => {
            this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG"], "danger");
            this.loader.stopLoader();
          });
      })
      .catch((error) => {
        this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG"], "danger");
        this.loader.stopLoader();
      });
  }

  async addTask() {
    const modal = await this.modal.create({
      component: CreateTaskFormComponent,
      cssClass: "create-task-modal",
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        !this.project.tasks ? (this.project.tasks = []) : "";
        this.project.tasks.push(data.data);
        this.update("newTask");
      }
    });
    return await modal.present();
  }

  startAssessment(task) {
     if (!this.networkFlag) {
       this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
       return;
     }
    if (this.project.entityId) {
      const config = {
        url: urlConstants.API_URLS.START_ASSESSMENT + `${this.project._id}?taskId=${task._id}`,
      };
      this.unnatiService.get(config).subscribe(
        (success) => {
          if (!success.result) {
            this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
            return;
          }
          let data = success.result;

          let params = `${data.programId}-${data.solutionId}-${data.entityId}`;
          this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
            queryParams: {
              programId: data.programId,
              solutionId: data.solutionId,
              observationId: data.observationId,
              entityId: data.entityId,
              entityName: data.entityName,
              disableObserveAgain: true
            },
          });
        },
        (error) => {
          this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
        }
      );
    } else {
      this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_NO_ENTITY_MAPPED"], "danger");
    }
  }

  getProjectTaskStatus() {
    if (!this.project.tasks && !this.project.tasks.length) {
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
      url: urlConstants.API_URLS.PROJCET_TASK_STATUS + `${this.project._id}`,
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
    this.project.tasks.map((t) => {
      data.map((d) => {
        if (d.type == 'assessment' || d.type == 'observation') {//check if type is observation or assessment 
          if (d._id == t._id && d.submissionDetails.status) {
            // check id matches and task details has submissionDetails
            if (!t.submissionDetails || t.submissionDetails.status != d.submissionDetails.status) {
              t.submissionDetails = d.submissionDetails;
              t.isEdit = true
              isChnaged = true;
              t.isEdit = true
              this.project.isEdit = true
            }
          }
        }

      });
    });
    isChnaged ? this.update('taskStatusUpdated') : null// if any assessment/observatiom task status is changed then only update 
    this.ref.detectChanges();
  }

  getAssessmentTypeTaskId() {
    const assessmentTypeTaskIds = [];
    for (const task of this.project.tasks) {
      task.type === "assessment" || task.type === "observation" ? assessmentTypeTaskIds.push(task._id) : null;
    }
    return assessmentTypeTaskIds;
  }

  async checkReport(task) {
     if (!this.networkFlag) {
       this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
       return;
     }
    if (this.project.entityId) {
      let payload = await this.utils.getProfileInfo();
      const config = {
        url: urlConstants.API_URLS.START_ASSESSMENT + `${this.project._id}?taskId=${task._id}`,
        payload: payload

      };
      this.unnatiService.get(config).subscribe(
        (success) => {
          if (!success.result) {
            this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
            return;
          }
          let data = success.result;

          let state = {
            scores: false,
            observation: true,
            entityId: data.entityId,
            entityType: data.entityType,
            observationId: data.observationId,
          };
          if (data.solutionDetails && data.solutionDetails.isRubricDriven) {
            state.scores = true;
          }
          if (data.solutionDetails && !data.solutionDetails.criteriaLevelReport) {
            state['filter'] = { questionId: [] };
            state['criteriaWise'] = false;
          }
          this.router.navigate([RouterLinks.GENERIC_REPORT], {
            state: state,
          });

        },
        (error) => {
          this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
        }
      );
    } else {
      this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_NO_ENTITY_MAPPED"], "danger");
    }
  }

  importProject() {
    this.getProjectsApi();
  }

  async importProjectConfirm() {
    const alert = await this.alertController.create({
      subHeader: this.allStrings['FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE'],
      backdropDismiss: false,
      buttons: [
        {
          text: this.allStrings['YES'],
          cssClass: 'primary',
          handler: (blah) => {
            this.importProjectClicked = true
            this.importProject();
          }
        }, {
          text: this.allStrings['NO'],
          role: 'cancel',
          cssClass: "cancelBtn",
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }

  goToProjectDetails() {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: this.project.projectId,
        fromImportPage: true,
        programId: this.programId
      },
      replaceUrl: true
    });
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.fromImportProject) {
        setTimeout(() => {
          this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.SOLUTIONS}`, this.programId]);
        }, 0)
        this.router.navigate([`/${RouterLinks.TABS}/${RouterLinks.HOME}/${RouterLinks.HOME_ADMIN}`]);
      } else {
        this.location.back();
      }
      this.backButtonFunc.unsubscribe();
    });
  }
}