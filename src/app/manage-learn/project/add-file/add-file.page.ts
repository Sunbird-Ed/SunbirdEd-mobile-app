import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AttachmentService, DbService } from '../../core';
import { actions } from '../../core/constants/actions.constants';
import * as _ from "underscore";

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.page.html',
  styleUrls: ['./add-file.page.scss'],
})
export class AddFilePage implements OnInit {
  description: string;
  parameters;
  actionItems = actions.FILE_UPLOAD_OPTIONS;
  _appHeaderSubscription: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
    pageTitle: ''
  };
  attachments= [
    {
      "type": "link",
      "url": "https://youtu.be/55l-aZ7_F24"
    },
    {
      "type": "link",
      "url": "https://youtu.be/55l-aZ7_F24"
    },
    {
      "type": "image",
      "name": "image.png"
    },
    {
      "type": "pdf",
      "name": "pdf.pdf"
    }
  ]
  projectId;
  taskId;
  project;
  task;
  viewOnlyMode: boolean = false;
  projectCopy;
  copyOfTaskDetails;
  constructor(
    private routerParams: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private db: DbService,
    private attachmentService : AttachmentService
  ) {
    
    routerParams.params.subscribe(urlParams => {
      this.projectId = urlParams.id;
      console.log(this.projectId,"urlParams",urlParams);

    })
    routerParams.queryParams.subscribe(params => {
      this.description = params.taskId ? actions.TASK_FILE_DESCRIPTION.label : actions.PROJECT_FILE_DESCRIPTION.label;
      this.taskId = params.taskId;
      this.viewOnlyMode = params.viewOnlyMode;
      console.log(params,"params",this.taskId );
    })
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      console.log(eventName,"eventName");
      this.handleHeaderEvents(eventName);
    });
  }

  ngOnInit() {

  }
  getProject() {
    this.db.query({ _id: this.parameters.id }).then(
      (success) => {
        if (success?.docs.length) {
          this.project = success.docs[0]
        }
        // this.project = success.docs.length ? success.docs[0] : success.docs;
        this.projectCopy = JSON.parse(JSON.stringify(this.project));
        this.taskId ? this.getTask() : this.setHeaderConfig();
      },
      (error) => { }
    );
  }

  getTask() {
    let task = _.findIndex(this.projectCopy.tasks, (item) => {
      return item._id == this.parameters.taskId;
    });
    console.log(task,"index of task");
    this.task = this.project.tasks[task];
    console.log(this.task,"this.task of task");

    this.copyOfTaskDetails = JSON.stringify(this.task);
    this.attachments = [];
    this.setHeaderConfig();
  }
  setHeaderConfig(){
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = this.taskId? this.task.name : this.project.title;
    this.headerService.updatePageConfig(this.headerConfig);
  }
  private handleHeaderEvents(event: { name: string }) {
    if (event.name == 'back') {
      alert('want to close?');
    }
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
      header: data['FRMELEMNTS_BTN_IMPORT_PROJECT'] + `<ion-button>Default</ion-button>`,
      message: data["FRMELEMNTS_LBL_WANT_TO_START"],
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

  }
  onAction(event){
    this.attachmentService.openAttachmentSource(event).then(resp =>{
      console.log(resp,"resp");
    },error =>{
      console.log(error,"error");
    })
  }
}
