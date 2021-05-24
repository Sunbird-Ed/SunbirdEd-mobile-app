import { ChangeDetectorRef, Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, AlertController, Platform, ModalController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '@app/app/manage-learn/core/constants/statuses.constant';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import * as moment from "moment";
import { AppHeaderService } from '@app/services';
import { NetworkService } from '../../core/services/network.service';
import { menuConstants } from '../../core/constants/menuConstants';
import { PopoverComponent } from '../../shared/components/popover/popover.component';
import { Subscription } from 'rxjs';
import { DbService } from '../../core/services/db.service';
import { LoaderService, ToastService } from '../../core';
import { SyncService } from '../../core/services/sync.service';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { RouterLinks } from '@app/app/app.constant';
import { HttpClient } from '@angular/common/http';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { Location } from '@angular/common';
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
import { CreateTaskFormComponent } from '../../shared';

// var environment = {
//   db: {
//     projects: "project.db",
//     categories: "categories.db",
//   },
//   deepLinkAppsUrl: ''
// };

@Component({
  selector: "app-project-detail",
  templateUrl: "./project-detail.page.html",
  styleUrls: ["./project-detail.page.scss"],
})
export class ProjectDetailPage implements OnInit, OnDestroy {
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

  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private headerService: AppHeaderService,
    private db: DbService,
    private loader: LoaderService,
    private router: Router,
    private utils: UtilsService,
    private alert: AlertController,
    // private location: Location,
    private syncServ: SyncService,
    private toast: ToastService,
    private translate: TranslateService,
    private networkService: NetworkService,
    // private openResourceSrvc: OpenResourcesService,
    private modal: ModalController,
    private unnatiService: UnnatiDataService,
    // private iab: InAppBrowser,
    private platform: Platform,
    private http: HttpClient,
    private kendraService: KendraApiService,
    private location: Location,
    private ref: ChangeDetectorRef,
    private navigateService: NavigationService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
  ) {
    params.queryParams.subscribe((parameters) => {
      console.log(parameters, "parameters");
      this.projectId = parameters.projectId;
      this.solutionId = parameters.solutionId;
      this.programId = parameters.programId;
      this.projectType = parameters.type ? parameters.type : '';
      this.getProject();
    });
    this.translate
      .get(["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG", "FRMELEMNTS_MSG_NO_ENTITY_MAPPED", "FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"])
      .subscribe((texts) => {
        this.allStrings = texts;
      });

    this.platform.resume.subscribe((result) => {
      this.getProjectTaskStatus();
    });
  }

  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        if (success.docs.length) {
          this.categories = [];
          this.project = success.docs.length ? success.docs[0] : {};
          this.isNotSynced = this.project ? (this.project.isNew || this.project.isEdit) : false;
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
  }

  async getProjectsApi() {
    this.loader.startLoader();
    let payload = this.projectType == 'assignedToMe' ? await this.utils.getProfileInfo() : '';
    console.log(this.projectType, "projectType");
      let id = this.projectId ? '/' + this.projectId : '';
      const config = {
        url: urlConstants.API_URLS.GET_PROJECT + id + '?solutionId=' + this.solutionId,
        payload: this.projectType == 'assignedToMe' ? payload : {}
      }
      console.log(config, "config");
      this.unnatiService.post(config).subscribe(success => {
        this.loader.stopLoader();
        // this.projectId = success.result._id;
        // TODO:remove after adding subtasks to observation and assement type tasks, logic will be changed
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
        // TODO:till here
        this.db.create(success.result).then(successData => {
          this.projectId ? this.getProject() :
            this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
              queryParams: {
                projectId: success.result._id,
                programId: this.programId,
                solutionId: this.solutionId
              }, replaceUrl: true
            });
        }).catch(error => {
          if (error.status === 409) {
            this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
              queryParams: {
                projectId: success.result._id,
                programId: this.programId,
                solutionId: this.solutionId
              }, replaceUrl: true
            })
          }
        })
      }, error => {

        this.loader.stopLoader();
      })
  }

  ngOnInit() { }
  ionViewWillEnter() {
    this.initApp();
    // this.getProject();
    this.getDateFilters();
  }

  initApp() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      if (eventName.name === 'more') {
        this.openPopover(eventName.event, null, false);
      } else if (eventName.name === 'sync') {
        this.action(eventName.name);
      }
    });
    let data;
    this.translate.get(["FRMELEMNTS_LBL_PROJECT_VIEW"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = ['more'];
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data["FRMELEMNTS_LBL_PROJECT_VIEW"];
    this.headerService.updatePageConfig(this._headerConfig);
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
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
  async openPopover(ev: any, taskId?, isDelete?) {
    let menu;
    if (taskId) {
      menu = JSON.parse(JSON.stringify(menuConstants.TASK));
      if (isDelete) {
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
        this.action(data.data, taskId);
      }
    });
    return await popover.present();
  }

  action(event, taskId?) {
    switch (event) {
      case "sync": {
        this.project.isNew
          ? this.createNewProject()
          : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
        break;
      }
      case "editTask": {
        this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.project._id, taskId]);
        break;
      }
      case "deleteTask": {
        this.askPermissionToDelete("task", taskId);
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
    }
  }

  // task and project delete permission.
  async askPermissionToDelete(type, id?) {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_DELETE_CONFIRMATION", "CANCEL", "BTN_SUBMIT"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      message: data["FRMELEMNTS_LBL_DELETE_CONFIRMATION"],
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
    this.update("taskDelete");
  }
  deleteProject() {
    // actions
    this.project.isDeleted = true;
    this.update("ProjectDelete");
  }
  openResources(task = null) {
    if (task && task.learningResources && task.learningResources.length === 1) {
      let link = task.learningResources[0].link;
      this.openBodh(link);
      return;
    }
    if (task) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.project._id, task._id]);
    } else {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.project._id]);
    }
  }
  //open openBodh
  openBodh(link) {
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
          //TODO: add location service
          // this.location.back();
        } else if (type == "taskDelete") {
          this.toast.showMessage("FRMELEMNTS_MSG_TASK_DELETED_SUCCESSFUL", "success");
        }
        this.sortTasks();
      })
      .catch((error) => { });
  }
  createNewProject() {
    this.loader.startLoader();
    const projectDetails = JSON.parse(JSON.stringify(this.project));
    this.syncServ
      .createNewProject()
      .then((success) => {
        projectDetails._id = success.result._id;
        projectDetails.lastDownloadedAt = success.result.lastDownloadedAt;
        this.doDbActions(projectDetails);
        this.loader.stopLoader();
      })
      .catch((error) => {
        this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG"], "danger");
        this.loader.stopLoader();
      });
  }

  doDbActions(projectDetails) {
    const _rev = projectDetails._rev;
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
          // let link = `${environment.deepLinkAppsUrl}/${task.type}/${params}`;
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
          // this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`], {
          //   queryParams: {
          //     programId: data.programId,
          //     solutionId: data.solutionId,
          //     observationId: data.observationId,
          //     solutionName: data.solutionName,
          //   },
          // });
          // this.iab.create(link, "_system");
        },
        (error) => {
          this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
          console.log(error);
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

        /*   if (d._id == t._id && d.submissionStatus != t.submissionDetails.submissionStatus) {
            t.status = d.status;
            isChnaged = true;
          } */
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
          let entityType = data.entityType
          let params = `${data.programId}-${data.solutionId}-${data.entityId}-${entityType}`;
          // let link = `${environment.deepLinkAppsUrl}/${task.type}/reports/${params}`;
          // this.iab.create(link, "_system");
          this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
            queryParams: {
              // entityId: data.entityId,
              entityType: entityType,
              // observationId: data.observationId,
              submissionId: data._id
            },
          });

          // this.router.navigate([RouterLinks.GENERIC_REPORT], {
          //   state: {
          //     scores: true,
          //     observation: true,
          //     pdf: false,
          //     entityId: data.entityId,
          //     entityType: data.entityType,
          //     observationId: data.observationId,
          //     submissionId: data._id,
          //   },
          // });
        },
        (error) => {
          this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS"], "danger");
          console.log(error);
        }
      );
    } else {
      this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_NO_ENTITY_MAPPED"], "danger");
    }
  }

}
