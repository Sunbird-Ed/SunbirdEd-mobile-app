import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "underscore";
import { TranslateService } from "@ngx-translate/core";
import { AlertController } from "@ionic/angular";
import { Location } from "@angular/common";
import { statuses } from "../../core/constants/statuses.constant";
import { UtilsService } from "../../core/services/utils.service";
import { NetworkService } from "../../core/services/network.service";
import { AppHeaderService } from "@app/services";
import { DbService } from "../../core/services/db.service";
import { ToastService } from "../../core";

var environment = {
  db: {
    projects: "project.db",
    categories: "categories.db",
  },
  deepLinkAppsUrl: ''
};
@Component({
  selector: "app-task-view",
  templateUrl: "./task-view.page.html",
  styleUrls: ["./task-view.page.scss"],
})
export class TaskViewPage implements OnInit {
  parameters;
  @ViewChild("dateTime") sTime;
  editField;
  task;
  project;
  copyOfTaskDetails;
  attachments = [];
  showAttachments: boolean = false;
  enableMarkButton: boolean = false;
  subTaskCount: number = 0;
  newSubtask: any = {};
  currentYear = new Date().getFullYear();
  statuses = statuses;
  projectCopy;
  copyOfSelectEditField;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };

  constructor(
    private router: Router,
    private params: ActivatedRoute,
    private db: DbService,
    private utils: UtilsService,
    private toast: ToastService,
    private translate: TranslateService,
    private alert: AlertController,
    // private attachmentService: AttachementService,
    private location: Location,
    private networkService: NetworkService,
    private headerService: AppHeaderService, 
    // private openResourceSrvc: OpenResourcesService
  ) {
    this.saveChanges = _.debounce(this.saveChanges, 800);
    this.saveSubTaskChanges = _.debounce(this.saveSubTaskChanges, 800);
    // this.db.createPouchDB(environment.db.projects);
    params.params.subscribe((parameters) => {
      this.parameters = parameters;
      this.getTask();
      this.prepareSubTaskMeta();
    });
  }

  ngOnInit() { }

  
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  prepareSubTaskMeta() {
    this.newSubtask = JSON.parse(JSON.stringify(this.utils.getMetaData("subTask")));
  }

  getTask() {
    // this.db.query({ _id: this.parameters.projectId }).then(
    //   (success) => {
        this.project =  this.utils.getProjectData()//success.docs.length ? success.docs[0] : success.docs;
        this.projectCopy = JSON.parse(JSON.stringify(this.project));
        // this.copyOfProject = { ...this.project };
        let task = _.findIndex(this.utils.getProjectData().tasks, (item) => {
          console.log(item._id, this.parameters.taskId, item)
          return item._id == this.parameters.taskId;
        });
        task > -1 ? (this.task = this.project.tasks[task]) : '' //this.toast.showMessage("MESSAGES.NO_TASK_FOUND", "danger");
        this.enableMarkButton = this.task.status === 'completed' ? true : false;
        this.copyOfTaskDetails = JSON.stringify(this.task);
        this.attachments = [];
        this.getSubtasksCount(this.task).then((data: number) => {
          this.subTaskCount = data;
        });
    //   },
    //   (error) => { }
    // );
  }
  selectedStatus(event) {
    this.enableTaskMarkButton();
  }
  selectedTaskStatus(event) {
    this.task.status == 'completed' ? this.enableMarkButton = true : this.enableMarkButton = false;
    if (this.task.status == 'completed' && this.task.children && this.task.children.length) {
      this.task.children.forEach(element => {
        element.status = 'completed';
      });
    }
    this.enableTaskMarkButton();
  }

  setDate() {
    this.update();
  }
  setTaskEndDate() {
    this.sTime.open();
  }
  public addSubtask() {
    if (this.newSubtask.name) {
      !this.task.children ? (this.task.children = []) : "";
      this.task.children.push(this.newSubtask);
      this.enableTaskMarkButton();
    }
  }
  toEdit(type, copyOfString) {
    this.editField = type;
    this.copyOfSelectEditField = copyOfString;
  }

  saveChanges() {
    if (this.task.name) {
      this.editField = "";
      this.update();
    } else {
      this.task.name = this.copyOfSelectEditField;
      this.toast.openToast("MESSAGES.REQUIRED_FIELDS", "danger");
    }
  }

  saveSubTaskChanges(subtask, index) {
    debugger;
    if (subtask.name) {
      this.editField = ""; // removed as it closing the edit field as one letter is entered
      this.update();
    } else {
      this.task.children[index].name = this.copyOfSelectEditField;
      this.toast.openToast("MESSAGES.REQUIRED_FIELDS", "danger");
    }
  }

  update(goBack?) {
    if (this.task.name) {
      if (!this.task.isEdit) {
        this.task.isEdit = this.copyOfTaskDetails === JSON.stringify(this.task) ? false : true;
        this.project.isEdit = this.task.isEdit ? true : this.project.isEdit;
      }
      const isProjectEdit = _.filter(this.project.tasks, (eachTask) => {
        return eachTask.isEdit;
      });
      this.project.isEdit = isProjectEdit.length ? true : this.project.isEdit;
      this.project = this.utils.setStatusForProject(this.project);
      this.db
        .update(this.project)
        .then((success) => {
          this.project._rev = success.rev;
          this.prepareSubTaskMeta();
          this.attachments = [];
          this.toast.openToast('MESSAGES.YOUR_CHANGES_ARE_SAVED', 'success');
          goBack ? this.location.back() : "";
        })
        .catch((error) => { });
    } else {
      this.toast.openToast("MESSAGES.REQUIRED_FIELDS", "danger");
    }
  }

  openResources(task) {
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

  openBodh(link) {
    console.log(link, "link");
    // this.networkService.isNetworkAvailable
    //   ? this.openResourceSrvc.openBodh(link)
    //   : this.toast.showMessage("MESSAGES.OFFLINE", "danger");
  }

  delete(data) {
    data.isDeleted = true;
    this.enableTaskMarkButton();
  }

  // task and project delete permission.
  async askPermissionToDelete(subtask, type) {
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
            this.delete(subtask);
          },
        },
      ],
    });
    await alert.present();
  }

  getSubtasksCount(task) {
    return new Promise(function (resolve) {
      let count = 0;
      if (task.children && task.children.length) {
        task.children.forEach((subtask) => {
          if (!subtask.isDeleted) {
            count = count + 1;
          }
        });
        resolve(count);
      } else {
        resolve(null);
      }
    });
  }

  enableTaskMarkButton() {
    this.getSubtasksCount(this.task).then((count: number) => {
      this.subTaskCount = count;
      if (count) {
        let inProgress = 0;
        let completed = 0;
        if (this.task.children.length) {
          this.task.children.forEach((child) => {
            if (!child.isDeleted) {
              if (child.status == "inProgress") {
                inProgress = inProgress + 1;
              } else if (child.status == "completed") {
                completed = completed + 1;
              }
            }
          });
        }
        if (count === completed) {
          this.task.status = "completed";
        } else if (inProgress > 0) {
          this.task.status = "inProgress";
        }
        this.task.status == "completed" ? (this.enableMarkButton = true) : (this.enableMarkButton = false);
      } else {
        this.task.status == "completed" ? (this.enableMarkButton = true) : (this.enableMarkButton = false);
      }
      this.update();
    });
  }

  markTaskAsCompleted() {
    this.showAttachments = true;
  }
  insertAttachment() {
    this.showAttachments = false;
    !this.task.attachments ? (this.task.attachments = []) : "";
    if (this.attachments && this.attachments.length) {
      this.attachments.forEach((element) => {
        this.task.attachments.push(element);
      });
    }
    this.update("goBack");
  }
  openAction() {
    // this.attachmentService.selectImage().then((data) => {
    //   data.data ? this.attachments.push(data.data) : "";
    // });
  }

  async edit(what, placeholder = "", subtask?, subTaskIndex?) {
    let name;
    // what == "task" || what == "assignName" ? (name = "Edit Task") : (name = "Edit Subtask");
    switch (what) {
      case 'task':
        name = "Edit Task"
        break
      case 'assignName':
        name = " Edit Assignee’s Name"
        break
      default:
        name = "Edit Subtask"
    }
    const alert = await this.alert.create({
      cssClass: "my-custom-class",
      header: name,
      // message: "Message <strong>text</strong>!!!",
      inputs: [
        {
          name: "field",
          type: "text",
          value: placeholder
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Save",
          handler: (data) => {
            console.log(data);
            if (data.field == "" && what != "assignName") {
              this.toast.openToast("MESSAGES.REQUIRED_FIELDS", "danger");
              return;
            }

            if (what == "subtask") {
              subtask.name = data.field;
              this.saveSubTaskChanges(subtask, subTaskIndex);
            } else if (what == "assignName") {
              this.task.assignee = data.field;
              this.saveChanges()
            } else {
              this.task.name = data.field;
              this.update();
            }
          },
        },
      ],
    });

    await alert.present();
    alert.present().then(() => {
      const firstInput: any = document.querySelector("ion-alert input");
      firstInput.focus();
      return;
    });
  }

  checkDisabled() {
    if (this.task.type == "assessment" || this.task.type == "observation") {
      return this.subTaskCount == 0 || this.subTaskCount == undefined || this.subTaskCount > 0; // disabled all the time 
    } else {
      return this.subTaskCount > 0;
    }
  }
}
