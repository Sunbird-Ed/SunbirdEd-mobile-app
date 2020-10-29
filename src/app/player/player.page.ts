import { ActivatedRoute, Router } from '@angular/router';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { Component, OnInit, ViewChild, ElementRef, Inject, OnDestroy } from '@angular/core';
import { Platform, AlertController, Events, PopoverController } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { PlayerActionHandlerDelegate, HierarchyInfo, User } from './player-action-handler-delegate';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { EventTopics, RouterLinks, ShareItemType } from '../app.constant';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { CourseService, Course, Content, Rollup } from 'sunbird-sdk';
import { FormAndFrameworkUtilService, PageId } from '@app/services';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
import { DownloadPdfService } from '@app/services/download-pdf/download-pdf.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
})
export class PlayerPage implements OnInit, OnDestroy, PlayerActionHandlerDelegate {

  config = {};
  backButtonSubscription: Subscription;
  course: Course;
  pauseSubscription: any;
  private navigateBackToContentDetails: boolean;
  corRelationList;
  private isCourse = false;
  loadPdfPlayer = false;
  playerConfig: any;
  private isChildContent: boolean;
  private content: Content;
  public objRollup: Rollup;


  @ViewChild('preview') previewElement: ElementRef;
  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private canvasPlayerService: CanvasPlayerService,
    private platform: Platform,
    private screenOrientation: ScreenOrientation,
    private appGlobalService: AppGlobalService,
    private statusBar: StatusBar,
    private events: Events,
    private alertCtrl: AlertController,
    private commonUtilService: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private popoverCtrl: PopoverController,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private downloadPdfService: DownloadPdfService
  ) {
    this.canvasPlayerService.handleAction();

    // Binding following methods to making it available to content player which is an iframe
    (window as any).onContentNotFound = this.onContentNotFound.bind(this);
    (window as any).onUserSwitch = this.onUserSwitch.bind(this);

    if (this.router.getCurrentNavigation().extras.state) {
      this.content = this.router.getCurrentNavigation().extras.state.contentToPlay;
      this.config = this.router.getCurrentNavigation().extras.state.config;
      this.course = this.router.getCurrentNavigation().extras.state.course;
      this.navigateBackToContentDetails = this.router.getCurrentNavigation().extras.state.navigateBackToContentDetails;
      this.corRelationList = this.router.getCurrentNavigation().extras.state.corRelation;
      this.isCourse = this.router.getCurrentNavigation().extras.state.isCourse;
      this.isChildContent = this.router.getCurrentNavigation().extras.state.childContent;
    }
  }

  async ngOnInit() {
    this.playerConfig = await this.formAndFrameworkUtilService.getPdfPlayerConfiguration();
    if (this.config['metadata']['mimeType'] === 'application/pdf' && this.playerConfig) {
      this.loadPdfPlayer = true;
      this.config['metadata'] = this.config['metadata'].contentData;
      this.config['data'] = {};
      this.config['config'] = {
        sideMenu: {
          showShare: true,
          showDownload: true,
          showReplay: false,
          showExit: true,
        }
      };
    }
    this.pauseSubscription = this.platform.pause.subscribe(() => {
      var iframes = window.document.getElementsByTagName('iframe');
      if (iframes.length > 0) {
        iframes[0].contentWindow.postMessage('pause.youtube', '*');
      }
    });
  }
  async ionViewWillEnter() {
    if (!this.loadPdfPlayer) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.statusBar.hide();

      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, async () => {
        const activeAlert = await this.alertCtrl.getTop();
        if (!activeAlert) {
          this.showConfirm();
        }
      });
      this.config['uid'] = this.config['context'].actor.id;
      this.config['metadata'].basePath = '/_app_file_' + this.config['metadata'].basePath;

      if (this.config['metadata'].isAvailableLocally) {
        this.config['metadata'].contentData.streamingUrl = '/_app_file_' + this.config['metadata'].contentData.streamingUrl;
      }

      // This is to reload a iframe as iframes reload method not working on cross-origin.
      const src = this.previewElement.nativeElement.src;
      this.previewElement.nativeElement.src = '';
      this.previewElement.nativeElement.src = src;
      this.previewElement.nativeElement.onload = () => {
        setTimeout(() => {
          this.previewElement.nativeElement.contentWindow['cordova'] = window['cordova'];
          this.previewElement.nativeElement.contentWindow['Media'] = window['Media'];
          this.previewElement.nativeElement.contentWindow['initializePreview'](this.config);
          this.previewElement.nativeElement.contentWindow.addEventListener('message', resp => {
            if (resp.data === 'renderer:question:submitscore') {
              this.courseService.syncAssessmentEvents().subscribe();
            }
          });
        }, 1000);
      };
    }

    this.events.subscribe('endGenieCanvas', (res) => {
      if (res.showConfirmBox) {
        this.showConfirm();
      } else {
        this.closeIframe();
      }
    });
  }

  ionViewWillLeave() {
    this.statusBar.show();
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

    if (this.events) {
      this.events.unsubscribe('endGenieCanvas');
    }

    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
    window.removeEventListener('renderer:question:submitscore', () => { });
  }

  ngOnDestroy() {
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }

  }

  async pdfPlayerEvents(event) {
    if (event.edata['type'] === 'EXIT') {
      this.loadPdfPlayer = false;
      this.location.back();
    } else if (event.edata['type'] === 'SHARE') {
      const popover = await this.popoverCtrl.create({
        component: SbSharePopupComponent,
        componentProps: {
          content: this.content,
          corRelationList: this.corRelationList,
          pageId: PageId.PLAYER_PAGE,
          shareFromPlayer: true,
          shareItemType: this.isChildContent ? ShareItemType.LEAF_CONTENT : ShareItemType.ROOT_CONTENT
        },
        cssClass: 'sb-popover',
      });
      await popover.present();
    } else if (event.edata['type']['type'] === 'DOWNLOAD') {
      if (this.content.contentData.downloadUrl) {
        this.downloadPdfService.downloadPdf(this.content).then((res) => {
          this.commonUtilService.showToast('PDF_DOWNLOADED');
        }).catch((error) => {
          if (error.reason === 'device-permission-denied') {
            this.commonUtilService.showToast('DEVICE_NEEDS_PERMISSION');
          } else if (error.reason === 'user-permission-denied') {
            this.commonUtilService.showToast('DEVICE_NEEDS_PERMISSION');
          } else if (error.reason === 'download-failed') {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
          }
        });
      } else {
        this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      }
    }
  }

  /**
   * This will trigger from player/ iframe when it unable to find consecutive content
   * @param identifier Content Identifier
   * @param hierarchyInfo Object of content hierarchy
   */
  onContentNotFound(identifier: string, hierarchyInfo: Array<HierarchyInfo>) {
    const content = { identifier, hierarchyInfo };

    // Migration todo
    /*     this.navCtrl.push(ContentDetailsPage, {
          content: content
        }).then(() => {
          // Hide player while going back
          this.navCtrl.remove(this.navCtrl.length() - 2);
        });
     */
    setTimeout(() => {
      this.closeIframe(content);
    }, 1000);
    this.events.publish(EventTopics.NEXT_CONTENT, {
      content,
      course: this.course
    });
  }

  /**
   * This is an callback to mobile when player switches user
   * @param selectedUser User id of the newly selected user by player
   */
  onUserSwitch(selectedUser: User) {
    this.appGlobalService.setSelectedUser(selectedUser);
  }

  /**
   * This will close the player page and will fire some end telemetry events from the player
   */
  closeIframe(content?: any) {
    const stageId = this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].getCurrentStageId();
    try {
      this.previewElement.nativeElement.contentWindow['TelemetryService'].exit(stageId);
    } catch (err) {
      console.error('End telemetry error:', err.message);
    }
    this.events.publish(EventTopics.PLAYER_CLOSED, {
      selectedUser: this.appGlobalService.getSelectedUser()
    });

    if (this.navigateBackToContentDetails) {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content: content ? content : this.config['metadata'],
          corRelation: this.corRelationList,
          shouldNavigateBack: true,
          isCourse: this.isCourse,
          course: this.course
        },
        replaceUrl: true
      });
    } else {
      this.location.back();
    }
  }


  /**
   * This will show confirmation box while leaving the player, it will fire some telemetry events from the player.
   */
  async showConfirm() {
    const type = (this.previewElement.nativeElement.contentWindow['Renderer']
      && !this.previewElement.nativeElement.contentWindow['Renderer'].running) ? 'EXIT_APP' : 'EXIT_CONTENT';
    const stageId = this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].getCurrentStageId();
    this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
      'TOUCH', 'DEVICE_BACK_BTN', 'EXIT', { type: type, stageId: stageId });

    const alert = await this.alertCtrl.create({
      header: this.commonUtilService.translateMessage('CONFIRM'),
      message: this.commonUtilService.translateMessage('CONTENT_PLAYER_EXIT_PERMISSION'),
      buttons: [
        {
          text: this.commonUtilService.translateMessage('CANCEL'),
          role: 'cancel',
          handler: () => {
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
              'TOUCH', 'ALERT_CANCEL', 'EXIT', { type: type, stageId: stageId });
          }
        },
        {
          text: this.commonUtilService.translateMessage('OKAY'),
          handler: () => {
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
              'END', 'ALERT_OK', 'EXIT', { type: type, stageId: stageId });
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interrupt('OTHER', stageId);
            this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].dispatchEvent('renderer:telemetry:end');

            this.closeIframe();
          }
        }
      ],
      cssClass: 'player-exit-popup'
    });
    await alert.present();
  }
}
