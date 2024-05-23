import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '../../../../services/app-header.service';
import { DbService } from '../../core/services/db.service';
import { AlertController, Platform } from "@ionic/angular";
import { File } from "@awesome-cordova-plugins/file/ngx";
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { FileOpener,FileOpenerOptions } from '@capacitor-community/file-opener';
import { ActivatedRoute } from '@angular/router';
import { statusType, ToastService, UtilsService } from '../../core';
import * as _ from "underscore";

@Component({
  selector: 'app-attachment-listing',
  templateUrl: './attachment-listing.page.html',
  styleUrls: ['./attachment-listing.page.scss'],
})
export class AttachmentListingPage implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: []
  };
  private win: any = window;
  attachments: any;
  projectId;
  path;
  type = "image/jpeg";
  tabs;
  project;
  projectcopy;
  tabsLength;
  statuses = statusType;
  viewOnly: boolean = false;
  selectedTab;
  constructor(
    private db: DbService,
    private platform: Platform,
    private file: File,
    private location: Location,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    public transfer: FileTransfer,
    private routeParam: ActivatedRoute,
    private util: UtilsService,
    private alert: AlertController,
    private toast: ToastService
  ) {
    this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
    routeParam.params.subscribe(parameters => {
      this.projectId = parameters.id;
      this.tabs = this.util.getTabs();
      this.tabsLength = this.tabs.length;
      this.selectedTab = this.tabs[0].value;
      this.attachments = {
        project: {},
        tasks: []
      };
      this.getProject();
    })
  }

  ngOnInit() { }
  ionViewWillEnter() {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_ATTACHMENTS"]).subscribe((text) => {
      data = text;
    });
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = data["FRMELEMNTS_LBL_ATTACHMENTS"];
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
  segmentChanged(event) {
    this.type = event.detail.value;
    this.tabs.find(tab => {
      if (tab.type == this.type) {
        this.selectedTab = tab.value;
      }
    })
    this.getAttachments();
  }
  getAttachments() {
    this.attachments = {
      project: {},
      tasks: []
    };
    if (this.project.remarks || (this.project.attachments && this.project.attachments.length)) {
      let evidence = {
        title: this.project.title,
        remarks: this.project.remarks ? this.project.remarks : '',
        attachments: []
      }
        this.getEvidences(this.project.attachments, evidence);
      if ((this.type && evidence.remarks) || evidence.attachments.length) {
        this.attachments.project=evidence;
      }
    }
    if (this.project.tasks && this.project.tasks.length) {
      this.project.tasks.forEach(task => {
        if(!task.isDeleted){
          let evidence = {
            title: task.name,
            remarks: task.remarks ? task.remarks : '',
            attachments: []
          }
          if (task.attachments && task.attachments.length) {
            this.getEvidences(task.attachments, evidence);
          }
          if ((this.type  && evidence.remarks) || evidence.attachments.length) {
            this.attachments.tasks.push(evidence);
          }
        }
      });
    }
  }

  getEvidences(attachments, evidence) {
    attachments.forEach(attachment => {
      if (attachment.type == this.type) {
        if(attachment.type != 'link'){
          attachment.localUrl = !attachment.url ? this.win.Ionic.WebView.convertFileSrc(
            this.path + attachment.name
          ) : '';
        }
        evidence.attachments.push(attachment);
      }
    });
  }

  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        if (success?.docs.length) {
          this.project = success.docs[0];
          this.viewOnly = this.project.status == statusType.submitted ? true : false;
          this.type=this.tabs[0].type;
          this.getAttachments();
        }
      },
      (error) => { }
    );
  }

  viewDocument(attachment) {
    if(attachment.type == 'link'){
      const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
    (window as any).cordova.InAppBrowser.open(attachment.name, '_blank', options)
    }else if (attachment.url) {
      this.downloadFile(attachment);
    } else {
      this.openFile(attachment);
    }
  }
  downloadFile(attachment) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(attachment.url, this.path + '/' + attachment.name).then(success => {
      this.openFile(attachment)
    })
  }
  openFile(attachment) {
      const fileOpenerOptions: FileOpenerOptions = {
      filePath: this.path + '+' + attachment.name,
      contentType:  attachment.type,
    }
    FileOpener.open(fileOpenerOptions);
  }
  async deleteConfirmation(attachment) {
    let data;
    this.translate.get(['FRMELEMNTS_LBL_ATTACHMENT_DELETE_CONFIRMATION', 'YES', 'NO']).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      message: data['FRMELEMNTS_LBL_ATTACHMENT_DELETE_CONFIRMATION'] + ' ' + this.selectedTab + '?',
      buttons: [
        {
          text: data['YES'],
          handler: () => {
            this.deleteAttachment(attachment);
          },
        }, {
          text: data['NO'],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {

          },
        },
      ],
    });
    await alert.present();
  }
  deleteImage(event) {
    this.deleteConfirmation(event.data);
  }
  deleteAttachment(attachment) {
    let ProjectLoopAgain : boolean = true;
    if(this.project.attachments &&this.project.attachments.length ){
        let i = _.findIndex( this.project.attachments, (item) => {
          if(item.type == this.type){
              return item.name == attachment.name;
          }
          });
          if(i >= 0){
            this.project.attachments.splice(i, 1);
            ProjectLoopAgain = false;
          }
    }
    if (this.project.tasks && this.project.tasks.length) {
      let loopAgain : boolean = true;
      this.project.tasks.forEach(task => {
        if(loopAgain && task.attachments && task.attachments.length){
          let i = _.findIndex(task.attachments, (item) => {
          if(item.type == this.type){
              return item.name == attachment.name;
          }
          });
          if(i >= 0){
            task.attachments.splice(i, 1);
            task.isEdit = true;
           loopAgain = false;
          }
        }
      });
    }
    this.updateLocalDb();
    this.getAttachments();
  }
  attachmentAction(event) {
    console.log(event,"event");
    if (event.action == 'delete') {
      this.deleteConfirmation(event.attachment);
    } else if (event.action == 'view') {
      this.viewDocument(event.attachment)
    }
  }
  updateLocalDb() {
    this.project.isEdit = true;
    this.db.update(this.project).then(success => {
      this.project._rev = success.rev;
    })
  }
}