import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '../../../../services/app-header.service';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AttachmentService, DbService, NetworkService, ProjectService, statusType, ToastService, UtilsService } from '../../core';
import { actions } from '../../core/constants/actions.constants';
import * as _ from "underscore";
import { Location } from '@angular/common';
import { RouterLinks } from '../../../../app/app.constant';
import { GenericPopUpService } from '../../shared/generic.popup';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.page.html',
  styleUrls: ['./add-file.page.scss'],
})
export class AddFilePage implements OnInit {
  private backButtonFunc: Subscription;
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
  button: string;
  attachments: any = [];
  projectId;
  taskId;
  project;
  task;
  viewOnlyMode: boolean = false;
  projectCopy;
  taskIndex;
  unregisterBackButton: Subscription;
  canExit = false;
  constructor(
    private routerParams: ActivatedRoute,
    private router: Router,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private db: DbService,
    private attachmentService: AttachmentService,
    private projectService: ProjectService,
    private location: Location,
    private network: NetworkService,
    private projectServ: ProjectService,
    private toast: ToastService,
    private popupService: GenericPopUpService,
    private platform : Platform

  ) {
    routerParams.params.subscribe(urlParams => {
      this.projectId = urlParams.id;
      this.getProject();
    })
    routerParams.queryParams.subscribe(params => {
      this.description = params.taskId ? actions.TASK_FILE_DESCRIPTION.label : actions.PROJECT_FILE_DESCRIPTION.label;
      this.taskId = params.taskId;
    })
    this.updateRemarks = _.debounce(this.updateRemarks,1500);
  }

  ngOnInit() { }
  async ionViewWillEnter() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleBackButton();
  }

  handleHeaderEvents($event) {
    if ($event.name == 'back') {
    this.update('save');
    this.location.back();
    }
  }
  public handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
        this.location.back();
        this.update('save');
        this.backButtonFunc.unsubscribe();
    });
}
  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        if (success?.docs.length) {
          this.project = success.docs[0];
        }
        this.taskId ? this.getTask() : this.setHeaderConfig();
      },
      (error) => { }
    );
  }

  getTask() {
    this.taskIndex = _.findIndex(this.project.tasks, (item) => {
      return item._id == this.taskId;
    });
    this.task = this.project.tasks[this.taskIndex];
    this.setHeaderConfig();
  }

  updateRemarks() {
    if (this.taskId) {
      this.task.remarks = this.remarks;
    } else {
      this.project.remarks = this.remarks
    }
    this.update('save');
  }

  setHeaderConfig() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = this.taskId ? this.task.name : this.project.title;
    this.button = this.taskId ? 'FRMELEMNTS_LBL_ATTACH_FILES' : "FRMELEMNTS_LBL_SUBMIT_IMPROVEMENT";
    if (this.taskId) {
      this.task.attachments = this.task?.attachments ? this.task.attachments : [];
      this.attachments = this.task?.attachments ? this.task.attachments : [];
    } else {
      this.project.attachments = this.project?.attachments ? this.project.attachments : [];
      this.attachments = this.project?.attachments ? this.project?.attachments : [];
    }
    this.projectCopy = JSON.parse(JSON.stringify(this.project));
    this.remarks = this.taskId ? this.task.remarks : this.project?.remarks;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  async deleteConfirm(index) {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM", "NO", "FRMELEMNTS_LBL_YES"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      message: data['FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM'],
      buttons: [
        {
          text: data["FRMELEMNTS_LBL_YES"],
          handler: () => {
            this.delete(index);
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

  delete(index) {
    this.attachments.splice(index, 1);
    this.task.isEdit = true;
    this.update('delete');
  }

  async onAction(event) {
    if(!this.taskId){
      this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_TEXT', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_LABEL', 'FRMELEMNTS_LBL_UPLOAD_EVIDENCES', 'https://diksha.gov.in/term-of-use.html', 'contentPolicy').then(async (data: any) => {
        if (data.isClicked) {
          if(data.isChecked){
            if (event == 'openLink') {
              this.toggleLinkModal();
              return;
            }
            await this.attachmentService.openAttachmentSource(event, this.attachments);
          }else{
            this.toast.showMessage('FRMELEMNTS_MSG_EVIDENCES_CONTENT_POLICY_REJECT', 'danger');
          }
        }
      })
    }else{
      if (event == 'openLink') {
        this.toggleLinkModal();
        return;
      }
      this.attachmentService.openAttachmentSource(event, this.attachments);
    }
  }

  submit() {
    this.canExit = true;
    if (this.taskId) {
      this.task.attachments = this.attachments;
      this.task.remarks = this.remarks;
      if (JSON.stringify(this.projectCopy.tasks[this.taskIndex]) !== JSON.stringify(this.task)) {
        this.task.isEdit = true;
        this.project.isEdit = true;
        this.taskId ? this.update(): this.update('submit');
        this.toast.showMessage('FRMELEMNTS_LBL_FILES_ATTACHED', 'success')
      } else {
        this.location.back();
      }
    } else {
      if (this.network.isNetworkAvailable) {
        this.submitProjectConfirmation();
      } else {
        this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
      }
    }
  }

  linkEvent(event) {
    if (event) {
      this.attachments = this.attachments.concat(this.projectService.getLinks(event));
      if (this.taskId) {
        this.task.attachments =  this.task?.attachments.concat(this.projectService.getLinks(event));
      } else {
        this.project.attachments =  this.project?.attachments.concat(this.projectService.getLinks(event));
      }
      this.toast.showMessage('FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED', 'success');
      this.update('save')
     }
    this.toggleLinkModal();
  }

  toggleLinkModal() {
    this.isLinkModalOpen = !this.isLinkModalOpen;
  }

  update(type?) {
    this.project.isEdit = true;
    this.db
      .update(this.project)
      .then((success) => {
        this.project._rev = success.rev;
        this.projectCopy = JSON.parse(JSON.stringify(this.project));
        if (type == 'submit') {
          this.attachments = [];
          this.doSyncAction(type === 'submit');
        }else if(type !== 'save'){
            this.location.back()
          }
      })
  }
  doSyncAction(isSubmission:boolean = false) {
    if (this.network.isNetworkAvailable) {
      this.project.isNew
        ? this.projectServ.createNewProject(this.project)
        : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId,isSubmission: isSubmission },replaceUrl:true });
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
    }
  }

  async pageExitConfirm() {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM", "FRMELEMNTS_BTN_EXIT_PAGE", "FRMELEMNTS_BTN_YES_PAGE", "FRMELEMNTS_LBL_YES", "NO"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      header: data['FRMELEMNTS_BTN_EXIT_PAGE'],
      message: data['FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM'],
      buttons: [
        {
          text: this.taskId ? data["FRMELEMNTS_BTN_YES_PAGE"] : data["FRMELEMNTS_LBL_YES"],
          handler: () => { },
        }, {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
          },
        },
      ],
    });
    await alert.present();
    let resp = await alert.onDidDismiss();
    if (resp.role !== 'cancel') {
      this.location.back();
    }
  }

  async submitProjectConfirmation() {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_SUBMIT_PROJECT", "FRMELEMNTS_LBL_SUBMIT_IMPROVEMENT", "CANCEL", "FRMELEMNTS_BTN_SUBMIT"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      header: data['FRMELEMNTS_LBL_SUBMIT_IMPROVEMENT'],
      message: data["FRMELEMNTS_MSG_SUBMIT_PROJECT"],
      buttons: [
        {
          text: data["CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: data["FRMELEMNTS_BTN_SUBMIT"],
          handler: () => {
            this.submitProject();
          },
        },
      ],
    });
    await alert.present();
  }
  
  submitProject() {
    setTimeout(() => {
      this.project.attachments = this.attachments;
      this.project.remarks = this.remarks;
      this.attachments = [];
      this.update('submit');
      this.doSyncAction(true);
      // this.project.status = statusType.submitted;
    }, 0)
  }
}
