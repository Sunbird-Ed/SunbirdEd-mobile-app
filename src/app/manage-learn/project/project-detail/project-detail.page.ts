import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, AlertController, Platform, Events } from '@ionic/angular';
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
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: "app-project-detail",
  templateUrl: "./project-detail.page.html",
  styleUrls: ["./project-detail.page.scss"],
})
export class ProjectDetailPage implements OnInit {
  showDetails: boolean = true;
  statuses = statuses;
  project: any = this.utils.getProjectData();
  projectId;
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
  // header
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [] as string[]
  };

  isSynced: boolean;
  locationChangeTriggered: boolean = false;
  allStrings;
  private _appHeaderSubscription?: Subscription;

  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private headerService: AppHeaderService,
    // private db: DbService,
    // private loader: LoaderService,
    private router: Router,
    private utils: UtilsService,
    private alert: AlertController,
    // private location: Location,
    // private syncServ: SyncService,
    // private toast: ToastMessageService,
    private translate: TranslateService,
    private networkService: NetworkService,
    // private openResourceSrvc: OpenResourcesService,
    // private modal: ModalController,
    // private unnatiService: UnnatiDataService,
    // private iab: InAppBrowser,
    private event: Events,
    private platform: Platform
  ) {
    // this.db.createPouchDB(environment.db.projects);
    params.params.subscribe((parameters) => {
      this.projectId = parameters.id;
    });
    this.translate
      .get(["MESSAGES.SOMETHING_WENT_WRONG", "MESSAGES.NO_ENTITY_MAPPED", ".MESSAGES.CANNOT_GET_PROJECT_DETAILS"])
      .subscribe((texts) => {
        this.allStrings = texts;
      });

    this.platform.resume.subscribe((result) => {
      console.log("Platform Resume Event");
      this.getProjectTaskStatus()
    });
  }

  getProject() {
    // this.db.query({ _id: this.projectId }).then(
    //   (success) => {
    // this.project = success.docs.length ? success.docs[0] : {};
    this.isSynced = this.project ? this.project.isNew || this.project.isEdit : true;
    this.project.categories.forEach((category: any) => {
      category.label ? this.categories.push(category.label) : this.categories.push(category.name);
    });
    this.project.tasks && this.project.tasks.length ? this.sortTasks() : "";
    this.getProjectTaskStatus();
    //   },
    //   (error) => { }
    // );
  }

  ngOnInit() { }
  ionViewDidEnter() {
    this.initApp();
    this.getProject();
    this.getDateFilters();
  }

  initApp() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      if (eventName.name === 'more') {
        this.openPopover(eventName.event);
      } else if (eventName.name === 'sync') {

      }
    });
    let data;
    this.translate.get(["FRMELEMNTS_LBL_PROJECT_VIEW"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = ['more', 'sync-done'];
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data["FRMELEMNTS_LBL_PROJECT_VIEW"];
    this.headerService.updatePageConfig(this._headerConfig);
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  getDateFilters() {
    let currentDate = moment();
    this.filters.today = moment();
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
    // if (inProgress > 0 || completed != this.taskCount) {
    //   this.project.status = this.statuses[1].title;
    // } else if (this.taskCount && this.taskCount == completed) {
    //   this.project.status = this.statuses[2].title;
    // } else {
    //   this.project.status = this.statuses[0].title;
    // }
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
          : this.router.navigate(["/menu/sync"], { queryParams: { projectId: this.projectId } });
        break;
      }
      case "editTask": {
        this.router.navigate(["/menu/task-view", this.project._id, taskId]);
        break;
      }
      case "deleteTask": {
        this.askPermissionToDelete("task", taskId);
        break;
      }
      case "fileProject": {
        this.openAttachments();
        break;
      }
      case "editProject": {
        this.router.navigate([`/${RouterLinks.PROJECT}/project-edit`, this.project._id]);
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
    this.translate.get(["FRMELEMNTS_LBL_DELETE_CONFIRMATION", "FRMELEMNTS_LBL_CANCEL", "FRMELEMNTS_LBL_SUBMIT"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      message: data["FRMELEMNTS_LBL_DELETE_CONFIRMATION"] + type + "?",
      buttons: [
        {
          text: data["FRMELEMNTS_LBL_CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: data["FRMELEMNTS_LBL_SUBMIT"],
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
      this.router.navigate(["/project/learning-resources", this.project._id, task._id]);
    } else {
      this.router.navigate(["/project/learning-resources", this.project._id]);
    }
  }
  //open openBodh
  openBodh(link) {
    // console.log(link, "link");
    // this.networkService.isNetworkAvailable
    //   ? this.openResourceSrvc.openBodh(link)
    //   : this.toast.showMessage("MESSAGES.OFFLINE", "danger");
  }

  //Update the project
  update(type) {
    // this.project.isEdit = true;
    // this.db.createPouchDB(environment.db.projects);
    // this.project = this.utils.setStatusForProject(this.project);
    // this.db
    //   .update(this.project)
    //   .then((success) => {
    //     this.project._rev = success.rev;
    //     this.isSynced = this.project ? this.project.isNew || this.project.isEdit : true;
    //     if (type == "newTask") {
    //       this.toast.showMessage("MESSAGES.NEW_TASK_ADDED_SUCCESSFUL", "success");
    //     } else if (type == "ProjectDelete") {
    //       this.toast.showMessage("MESSAGES.PROJECT_DELETED_SUCCESSFUL", "success");
    //       this.location.back();
    //     } else if (type == "taskDelete") {
    //       this.toast.showMessage("MESSAGES.TASK_DELETED_SUCCESSFUL", "success");
    //     }
    //     this.sortTasks();
    //   })
    //   .catch((error) => { });
  }
  createNewProject() {
    // this.loader.startLoader();
    // const projectDetails = JSON.parse(JSON.stringify(this.project));
    // this.syncServ
    //   .createNewProject()
    //   .then((success) => {
    //     projectDetails._id = success.result._id;
    //     projectDetails.lastDownloadedAt = success.result.lastDownloadedAt;
    //     this.doDbActions(projectDetails);
    //     this.loader.stopLoader();
    //   })
    //   .catch((error) => {
    //     this.toast.showMessage(this.allStrings["MESSAGES.SOMETHING_WENT_WRONG"], "danger");
    //     this.loader.stopLoader();
    //   });
  }

  doDbActions(projectDetails) {
    // const _rev = projectDetails._rev;
    // delete projectDetails._rev;
    // const newObj = this.syncServ.removeKeys(projectDetails, ["isNew"]);
    // this.db
    //   .create(newObj)
    //   .then((success) => {
    //     this.db
    //       .delete(this.projectId, _rev)
    //       .then((deleteSuccess) => {
    //         this.loader.stopLoader();
    //         this.projectId = newObj._id;
    //         this.project = newObj;
    //         this.router.navigate(["/menu/project-detail/" + this.projectId], { replaceUrl: true });
    //         setTimeout(() => {
    //           this.router.navigate(["/menu/sync"], { queryParams: { projectId: this.projectId } });
    //         }, 0);
    //       })
    //       .catch((deletError) => {
    //         this.toast.showMessage(this.allStrings["MESSAGES.SOMETHING_WENT_WRONG"], "danger");
    //         this.loader.stopLoader();
    //       });
    //   })
    //   .catch((error) => {
    //     this.toast.showMessage(this.allStrings["MESSAGES.SOMETHING_WENT_WRONG"], "danger");
    //     this.loader.stopLoader();
    //   });
  }

  async addTask() {
    // const modal = await this.modal.create({
    //   component: CreateTaskComponent,
    //   cssClass: "create-task-modal",
    // });
    // modal.onDidDismiss().then((data) => {
    //   if (data.data) {
    //     !this.project.tasks ? (this.project.tasks = []) : "";
    //     this.project.tasks.push(data.data);
    //     this.update("newTask");
    //   }
    // });
    // return await modal.present();
  }

  openAttachments() {
    console.log("openAttachments");
    this.router.navigate(["menu/attachment-list", this.project._id], { replaceUrl: true });
  }

  startAssessment(task) {
    // if (this.project.entityId) {
    //   const config = {
    //     url: urlConstants.API_URLS.START_ASSESSMENT + `${this.project._id}?taskId=${task._id}`,
    //   };
    //   this.unnatiService.get(config).subscribe(
    //     (success) => {
    //       if (!success.result) {
    //         this.toast.showMessage(this.allStrings["MESSAGES.CANNOT_GET_PROJECT_DETAILS"], "danger");
    //         return;
    //       }
    //       let data = success.result;

    //       let params = `${data.programId}-${data.solutionId}-${data.entityId}`;
    //       let link = `${environment.deepLinkAppsUrl}/${task.type}/${params}`;
    //       this.iab.create(link, "_system");
    //     },
    //     (error) => {
    //       this.toast.showMessage(this.allStrings["MESSAGES.CANNOT_GET_PROJECT_DETAILS"], "danger");
    //       console.log(error);
    //     }
    //   );
    // } else {
    //   this.toast.showMessage(this.allStrings["MESSAGES.NO_ENTITY_MAPPED"], "danger");
    // }
  }

  getProjectTaskStatus() {
    // if (!this.project.tasks && !this.project.tasks.length) {
    //   return
    // }
    // let taskIdArr = this.getAssessmentTypeTaskId()

    // if (!taskIdArr.length) {
    //   return
    // }
    // const config = {
    //   url: urlConstants.API_URLS.PROJCET_TASK_STATUS + `${this.project._id}`,
    //   payload: {
    //     taskIds: taskIdArr,
    //   },
    // };
    // this.unnatiService.post(config).subscribe(
    //   (success) => {
    //     console.log(success);
    //     if (!success.result) {
    //       return;
    //     }
    //     this.updateAssessmentStatus(success.result);
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );
  }

  updateAssessmentStatus(data) {
    // if task type is assessment or observation then check if it is submitted and change the status and update in db
    let isChnaged = false
    this.project.tasks.map((t) => {
      data.map((d) => {
        if (d._id == t._id && d.status != t.status) {
          t.status = d.status;
          isChnaged = true
        }
      });
    });
    isChnaged ? this.update('taskStatusUpdated') : null// if any assessment/observatiom task status is changed then only update 
    console.log(this.project);
  }

  getAssessmentTypeTaskId() {
    const assessmentTypeTaskIds = [];
    for (const task of this.project.tasks) {
      task.type === "assessment" || task.type === "observation" ? assessmentTypeTaskIds.push(task._id) : null;
    }
    return assessmentTypeTaskIds;
  }

  checkReport(task) {
    // if (this.project.entityId) {
    //   const config = {
    //     url: urlConstants.API_URLS.START_ASSESSMENT + `${this.project._id}?taskId=${task._id}`,
    //   };
    //   this.unnatiService.get(config).subscribe(
    //     (success) => {
    //       if (!success.result) {
    //         this.toast.showMessage(this.allStrings["MESSAGES.CANNOT_GET_PROJECT_DETAILS"], "danger");
    //         return;
    //       }
    //       let data = success.result;
    //       let entityType = data.entityType
    //       let params = `${data.programId}-${data.solutionId}-${data.entityId}-${entityType}`;
    //       let link = `${environment.deepLinkAppsUrl}/${task.type}/reports/${params}`;
    //       this.iab.create(link, "_system");
    //     },
    //     (error) => {
    //       this.toast.showMessage(this.allStrings["MESSAGES.CANNOT_GET_PROJECT_DETAILS"], "danger");
    //       console.log(error);
    //     }
    //   );
    // } else {
    //   this.toast.showMessage(this.allStrings["MESSAGES.NO_ENTITY_MAPPED"], "danger");
    // }
  }
}
