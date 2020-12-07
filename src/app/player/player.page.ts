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
import {
  CourseService,
  Course,
  Content,
  Rollup,
  InteractType,
  UpdateContentStateTarget,
  UpdateContentStateRequest,
  TelemetryErrorCode,
  ErrorType, SunbirdSdk
} from 'sunbird-sdk';
import { Environment, FormAndFrameworkUtilService, InteractSubtype, PageId, TelemetryGeneratorService } from '@app/services';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
import { DownloadPdfService } from '@app/services/download-pdf/download-pdf.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { ContentUtil } from '@app/util/content-util';
declare const cordova;

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
  private navigateBackToTrackableCollection: boolean;
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
    private downloadPdfService: DownloadPdfService,
    private fileOpener: FileOpener,
    private transfer: FileTransfer,
    private telemetryGeneratorService: TelemetryGeneratorService
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
    if (this.config['metadata']['mimeType'] === 'application/pdf' && this.playerConfig &&
      this.config['context']['objectRollup']['l1'] === this.config['metadata']['identifier']) {
      this.loadPdfPlayer = true;
      this.config['context']['pdata']['pid'] = 'sunbird.app.contentplayer';
      if (this.config['metadata'].isAvailableLocally) {
        this.config['metadata'].contentData.streamingUrl = '/_app_file_' + this.config['metadata'].contentData.streamingUrl;
      }
      this.config['metadata']['contentData']['basePath'] = '/_app_file_' + this.config['metadata'].basePath;
      this.config['metadata']['contentData']['isAvailableLocally'] = this.config['metadata'].isAvailableLocally;
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
      this.config['context'].dispatcher = {
        dispatch: function (event) {
          SunbirdSdk.instance.telemetryService.saveTelemetry(JSON.stringify(event)).subscribe(
            (res) => console.log('response after telemetry', res),
          );
        }
      };
    }
    this.pauseSubscription = this.platform.pause.subscribe(() => {
      const iframes = window.document.getElementsByTagName('iframe');
      if (iframes.length > 0) {
        iframes[0].contentWindow.postMessage('pause.youtube', '*');
      }
    });
  }
  async ionViewWillEnter() {
    if (!this.loadPdfPlayer) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.statusBar.hide();
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
            } else if (resp.data && typeof resp.data === 'object') {
              if (resp.data['player.pdf-renderer.error']) {
                const pdfError = resp.data['player.pdf-renderer.error'];
                if (pdfError.name === 'MissingPDFException') {
                  const downloadUrl = this.config['metadata']['contentData']['streamingUrl'] ||
                    this.config['metadata']['contentData']['artifactUrl'];
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_PDF_CLICKED,
                    Environment.PLAYER,
                    PageId.PLAYER,
                    ContentUtil.getTelemetryObject(this.config['metadata']['contentData']),
                    undefined,
                    ContentUtil.generateRollUp(this.config['metadata']['hierarchyInfo'], this.config['metadata']['identifier']));
                  this.openPDF(downloadUrl);
                }
              }
            } else if (this.isJSON(resp.data)) {
              const response = JSON.parse(resp.data);
              if (response.event === 'renderer:navigate') {
                this.navigateBackToTrackableCollection = true;
                this.navigateBackToContentDetails = false;
                this.closeIframe({
                  identifier: response.data.identifier
                });
              }
            }
          });
        }, 1000);
      };
    }

    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, async () => {
      const activeAlert = await this.alertCtrl.getTop();
      if (!activeAlert) {
        this.showConfirm();
      }
      if (this.loadPdfPlayer) {
        this.location.back();
      }
    });

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
    } else if (event.edata.type === 'compatibility-error') {
      cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
        () => {},
        () => {}
    );
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
    }  else if (this.navigateBackToTrackableCollection) {
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {
          content
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
      'TOUCH', 'DEVICE_BACK_BTN', 'EXIT', { type, stageId });

    const alert = await this.alertCtrl.create({
      header: this.commonUtilService.translateMessage('CONFIRM'),
      message: this.commonUtilService.translateMessage('CONTENT_PLAYER_EXIT_PERMISSION'),
      buttons: [
        {
          text: this.commonUtilService.translateMessage('CANCEL'),
          role: 'cancel',
          handler: () => {
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
              'TOUCH', 'ALERT_CANCEL', 'EXIT', { type, stageId });
          }
        },
        {
          text: this.commonUtilService.translateMessage('OKAY'),
          handler: () => {
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
              'END', 'ALERT_OK', 'EXIT', { type, stageId });
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

  async openPDF(url) {
    if (this.course) {
      setTimeout(() => {
        this.updateContentState();
      }, 1000);
    }
    const loader = await this.commonUtilService.getLoader(undefined, this.commonUtilService.translateMessage('DOWNLOADING_2'));
    await loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();
    const entry = await fileTransfer
      .download(url, cordova.file.cacheDirectory + url.substring(url.lastIndexOf('/') + 1))
      .catch((e) => {
        this.telemetryGeneratorService.generateErrorTelemetry(Environment.PLAYER,
          TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
          ErrorType.SYSTEM,
          PageId.PLAYER,
          JSON.stringify(e),
        );
      });
    loader.dismiss();
    const stageId = this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].getCurrentStageId();
    try {
      this.previewElement.nativeElement.contentWindow['TelemetryService'].exit(stageId);
    } catch (err) {
      console.error('End telemetry error:', err.message);
    }

    if (entry) {
      const localUrl = entry.toURL();
      this.fileOpener
        .open(localUrl, 'application/pdf')
        .catch((e) => {
          console.log('Error opening file', e);
          this.commonUtilService.showToast('ERROR_TECHNICAL_PROBLEM');
        });
    }
    this.location.back();

  }

  private updateContentState() {
    const updateContentStateRequest: UpdateContentStateRequest = {
      userId: this.config['context']['actor']['id'],
      contentId: this.config['metadata']['identifier'],
      courseId: this.course['identifier'] || this.course['courseId'],
      batchId: this.course['batchId'],
      status: 2,
      progress: 100,
      target: [UpdateContentStateTarget.LOCAL, UpdateContentStateTarget.SERVER]
    };

    this.courseService.updateContentState(updateContentStateRequest).subscribe();
  }

  pdfTelemetryEvents(event) {}

  private isJSON(input): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  }
}
