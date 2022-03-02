import { Component, OnInit,NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AttachmentService, DbService, ProjectService } from '../../core';
import { actions } from '../../core/constants/actions.constants';
import * as _ from "underscore";
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.page.html',
  styleUrls: ['./add-file.page.scss'],
})
export class AddFilePage implements OnInit {
  description: string;
  parameters;
  isLinkModalOpen: boolean = false;
  actionItems = actions.FILE_UPLOAD_OPTIONS;
  _appHeaderSubscription: Subscription;
  headerObservable: any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
    pageTitle: ''
  };
  remarks: '';
  button:string;
  attachments: any = [];
  projectId;
  taskId;
  project;
  task;
  viewOnlyMode: boolean = false;
  projectCopy;
  copyOfTaskDetails;
  unregisterBackButton: Subscription;
  constructor(
    private routerParams: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private db: DbService,
    private attachmentService: AttachmentService,
    private platform: Platform,
    private projectService: ProjectService,
    private location :Location,
    private zone : NgZone
  ) {
    routerParams.params.subscribe(urlParams => {
      this.projectId = urlParams.id;
      this.getProject();
    })
    routerParams.queryParams.subscribe(params => {
      this.description = params.taskId ? actions.TASK_FILE_DESCRIPTION.label : actions.PROJECT_FILE_DESCRIPTION.label;
      this.taskId = params.taskId;
    })
  }

  ngOnInit() {}
  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.handleDeviceBackButton();
    this.zone.run(() => {
      this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
        if (eventName.name === 'back') {
           this.pageExitConfirm();
        }
      });
    })
  }
  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        if (success?.docs.length) {
          this.project = success.docs[0];
        }
        this.projectCopy = { ... this.project};
        this.taskId ? this.getTask() : this.setHeaderConfig();
      },
      (error) => {}
    );
  }

  getTask() {
    let task = _.findIndex(this.projectCopy.tasks, (item) => {
      return item._id == this.taskId;
    });
    this.task = this.project.tasks[task];
    this.copyOfTaskDetails = { ... this.project};
    this.setHeaderConfig();
  }
  setHeaderConfig(){
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = this.taskId? this.task.name : this.project.title;
    this.button =this.taskId? 'FRMELEMNTS_LBL_ATTACH_FILES': "FRMELEMNTS_LBL_SUBMIT_PROJECT";
    this.attachments = this.taskId ? this.task?.attachments ? this.task.attachments : [] :  this.project?.attachments ? this.project?.attachments : [];
    this.remarks = this.taskId? this.taskId.remarks :  this.project?.remarks;
    this.headerService.updatePageConfig(this.headerConfig);
  }
  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.pageExitConfirm();
    });
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }
  async deleteConfirm(item) {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM", "CANCEL", "OK"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      message: data['FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM'],
      buttons: [
        {
          text: data["OK"],
          handler: () => {
            this.delete(item);
          },
        }, {
          text: data["CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
      ],
    });
    await alert.present();
  }

  delete(item) {
  this.task.attachments.splice(this.task.attachments.findIndex(attachment => attachment.name == item.name), 1);
  }
  onAction(event) {
    if (event == 'openLink') {
      this.toggleLinkModal();
      return;
    }
    this.attachmentService.openAttachmentSource(event,this.attachments);
  }

  submit() {
    if (this.taskId) {
      this.task.attachments = this.attachments;
      this.task.remarks = this.remarks;
      if (JSON.stringify(this.copyOfTaskDetails) !== JSON.stringify(this.task)) {
        this.task.isEdit = true;
        this.project.isEdit = true;
        this.update();
      }
    } else {
      this.project.remarks
      this.project.attachments = this.attachments;
      this.project.remarks = this.remarks;
      if (JSON.stringify(this.projectCopy) !== JSON.stringify(this.project)) {
        this.project.isEdit = true;
        this.update();
      }
    }
  }
  linkEvent(event) {
    if(event){
      this.attachments = this.attachments.concat(this.projectService.getLinks(event));
    }
    this.toggleLinkModal();
  }
  toggleLinkModal() {
    this.isLinkModalOpen = !this.isLinkModalOpen;
  }
  update() {
    this.db
      .update(this.project)
      .then((success) => {
        this.project._rev = success.rev;
        this.attachments = [];
        this.location.back();
      })
  }
  async pageExitConfirm(){
    let data;
    this.translate.get(["FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM", "FRMELEMNTS_BTN_EXIT_PAGE","FRMELEMNTS_BTN_YES_PAGE", "NO"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      header: data['FRMELEMNTS_BTN_EXIT_PAGE'],
      message:data['FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM'],
      buttons: [
        {
          text: data["FRMELEMNTS_BTN_YES_PAGE"],
          handler: () => {
           this.location.back();
          },
        }, {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
      ],
    });
    await alert.present();
  }
}
