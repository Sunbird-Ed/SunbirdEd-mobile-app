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
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../core';

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
  attachments:any = [];
  projectId;
  path;
  type = "images";
  tabs;
  project;
  projectcopy;
  tabsLength;
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
    private routeParam: ActivatedRoute,
    private util: UtilsService
  ) {
    routeParam.params.subscribe(parameters => {
      this.projectId = parameters.id;
      this.tabs = this.util.getTabs();
    })
  }

  ngOnInit() {
    this.getAttachments(this.tabs[0]);
    this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
    this.tabsLength = this.tabs.length;
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
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  segmentChanged(event) {
    this.type = event.detail.value;
    switch(this.type){
      case "images":{ 
        this.getAttachments(this.tabs[0]);
        break; 
      } 
      case "files":{ 
        this.getAttachments(this.tabs[1]);
        break; 
      } 
      case "links":{ 
        this.getAttachments(this.tabs[2]);
        break; 
      } 
    }
  }
  getAttachments(tab) {
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
    })
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