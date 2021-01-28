import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '@app/services';
import { DbService } from '../../core/services/db.service';
import { Platform } from "@ionic/angular";
import { File } from "@ionic-native/file/ngx";
import { DomSanitizer } from "@angular/platform-browser";
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
var environment = {
  db: {
    projects: "project.db",
    categories: "categories.db",
  },
  deepLinkAppsUrl: ''
};
@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.page.html',
  styleUrls: ['./attachment-list.page.scss'],
})
export class AttachmentListPage implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: []
  };
  private win: any = window;
  attachments = [];
  projectId;
  path;
  type = "images";
  tabs = [
    {
      name: "FRMELEMNTS_LBL_IMAGES",
      value: "images",
      type: 'image/jpeg'
    },
    {
      name: "FRMELEMNTS_LBL_FILES",
      value: "files",
      type: "application/pdf"
    }
  ];
  project;
  projectcopy;
  constructor(
    private db: DbService,
    private platform: Platform,
    private file: File,
    private sanitizer: DomSanitizer,
    private location: Location,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    public transfer: FileTransfer,
    public fileOpener: FileOpener,
    private photoViewer: PhotoViewer,

  ) { }

  ngOnInit() {
    this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
  }
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
    this.getAttachments(this.tabs[0]);
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  segmentChanged(event) {
    this.type = event.detail.value;
    this.getAttachments(this.type === 'images' ? this.tabs[0] : this.tabs[1])
  }
  getAttachments(tab) {
    this.attachments = [];
    this.db.createPouchDB(environment.db.projects)
    this.db.query({ _id: this.projectId }).then(success => {
      this.project = success.docs.length ? success.docs[0] : {};
      this.projectcopy = { ...this.project }
      if (this.project.tasks && this.project.tasks.length) {
        for (const task of this.project.tasks) {
          const attachments = []
          if (task.attachments && task.attachments.length) {
            for (const element of task.attachments) {
              // if (element.type === tab.type) {
              if (compare(element.type, tab.type)) {
                element.localUrl = this.win.Ionic.WebView.convertFileSrc(
                  this.platform.is("ios")
                    ? this.file.documentsDirectory
                    : this.file.externalDataDirectory + element.name
                );
                attachments.push(element);
              }
            }
            if (attachments.length) {
              let attachmentObj = {
                taskName: task.name,
                remarks: task.remarks,
                attachments: attachments
              }
              this.attachments.push({ ...attachmentObj });
            }

          }
        };
      }
      function compare(fileType,tabType): boolean{
        tabType = tabType.substr(0, tabType.indexOf("/")); 
        fileType = fileType.substr(0, fileType.indexOf("/"));
        return tabType == fileType;
      }
    }, error => {
    })
  }

  getImgContent(file) {
    return this.sanitizer.bypassSecurityTrustUrl(file);
  }

  viewDocument(attachment) {
    if (attachment.url) {
      this.downloadFile(attachment);
    } else {
      this.openFile(attachment);
    }
  }
  downloadFile(attachment) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(attachment.url, this.path + '/' + attachment.name).then(success => {
      this.openFile(attachment)
    }).catch(error => {
    });
  }
  openImage(attachment) {
    this.photoViewer.show(attachment)
  }
  openFile(attachment) {
    this.fileOpener.open(this.path + '/' + attachment.name, attachment.type)
      .then(() => { console.log('File is opened'); })
      .catch(e => console.log('Error opening file', e));
  }
}
