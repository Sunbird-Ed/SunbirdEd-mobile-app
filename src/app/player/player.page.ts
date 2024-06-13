import { AppOrientation } from './../app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CommonUtilService } from '../../services/common-util.service';
import { Component, OnInit, ViewChild, ElementRef, Inject, OnDestroy } from '@angular/core';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { PlayerActionHandlerDelegate, HierarchyInfo, User } from './player-action-handler-delegate';
import { StatusBar } from '@capacitor/status-bar';
import { EventTopics, ProfileConstants, RouterLinks, ShareItemType, PreferenceKey } from '../app.constant';
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
  ErrorType, SunbirdSdk, ProfileService, ContentService,
  PlayerService,
  SharedPreferences,
  ContentDetailRequest
} from '@project-sunbird/sunbird-sdk';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from '../../services/telemetry-constants';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { FileOpener } from '@capacitor-community/file-opener';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { ContentUtil } from '../../util/content-util';
import { PrintPdfService } from '../../services/print-pdf/print-pdf.service';
import { FormConstants } from '../form.constants';
import { File } from '@awesome-cordova-plugins/file/ngx';

declare const cordova;


@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
})

export class PlayerPage implements OnInit, OnDestroy, PlayerActionHandlerDelegate {

  config: any;
  backButtonSubscription: Subscription;
  course: Course;
  pauseSubscription: any;
  private navigateBackToContentDetails: boolean;
  private navigateBackToTrackableCollection: boolean;
  corRelationList;
  private isCourse = false;
  playerConfig: any;
  private isChildContent: boolean;
  private content: Content;
  public objRollup: Rollup;
  nextContentToBePlayed: Content;
  playerType: string;
  isExitPopupShown = false;
  questionData: any;
  cardData: any;

  @ViewChild('preview', { static: false }) previewElement: ElementRef;
  @ViewChild('video') video: ElementRef | undefined;
  @ViewChild('epub') epub: ElementRef;
  @ViewChild('pdf') pdf!: ElementRef;
  @ViewChild('qumlPlayer') qumlPlayer: ElementRef;
  
  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('PLAYER_SERVICE') private playerService: PlayerService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private canvasPlayerService: CanvasPlayerService,
    public platform: Platform,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private alertCtrl: AlertController,
    private commonUtilService: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private popoverCtrl: PopoverController,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private downloadPdfService: DownloadPdfService,
    private transfer: FileTransfer,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private printPdfService: PrintPdfService,
    private file: File
  ) {
    this.canvasPlayerService.handleAction();

    // Binding following methods to making it available to content player which is an iframe
    (window as any).onContentNotFound = this.onContentNotFound.bind(this);
    (window as any).onUserSwitch = this.onUserSwitch.bind(this);
    let extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.content = extras.contentToPlay;
      this.config = extras.config;
      this.course = extras.course;
      this.navigateBackToContentDetails = extras.navigateBackToContentDetails;
      this.corRelationList = extras.corRelation;
      this.isCourse = extras.isCourse;
      this.isChildContent = extras.childContent;
    }
  }


  async ngOnInit() {
    await StatusBar.hide();
    console.log('ngoninit ');
    this.playerConfig = await this.formAndFrameworkUtilService.getPdfPlayerConfiguration();
    if(this.config['metadata'].hierarchyInfo) {
      await this.getNextContent(this.config['metadata'].hierarchyInfo , this.config['metadata'].identifier)
    }
    if (this.config['metadata']['mimeType'] === 'application/pdf' && this.checkIsPlayerEnabled(this.playerConfig , 'pdfPlayer').name === "pdfPlayer") {
      await ScreenOrientation.lock({orientation: 'landscape'});
      this.config = await this.getNewPlayerConfiguration();
      this.playerType = 'sunbird-pdf-player';
      console.log('.........................', 128)
      this.playPdfContent();
    } else if (this.config['metadata']['mimeType'] === "application/epub" && this.checkIsPlayerEnabled(this.playerConfig , 'epubPlayer').name === "epubPlayer"){ 
      await ScreenOrientation.lock({orientation: 'landscape'});
      this.config = await this.getNewPlayerConfiguration();
      this.config['config'].sideMenu.showPrint = false;
      this.playerType = 'sunbird-epub-player'
      this.playepubContent();
    } else if(this.config['metadata']['mimeType'] === "application/vnd.sunbird.questionset" && this.checkIsPlayerEnabled(this.playerConfig , 'qumlPlayer').name === "qumlPlayer"){
      await ScreenOrientation.lock({orientation: 'landscape'});
      this.cardData = this.content || this.router.getCurrentNavigation().extras?.state?.content;
      this.config = await this.getNewPlayerConfiguration();
      this.config['config'].sideMenu.showDownload = false;
      this.config['config'].sideMenu.showPrint = false;
      this.config['config'].showDeviceOrientation = true
      if( (this.config['metadata'].isAvailableLocally)  ) {
        this.config['metadata'].children = await this.contentService.getQuestionSetChildren(this.config['metadata']['identifier']);
        this.playerType = 'sunbird-quml-player';
        this.playQumlContent();
      } else {
      const questionSetData = await this.contentService.getQuestionSetChildren(this.config['metadata']['identifier']);
       let questionId: string[] = [];
        questionSetData.forEach(item => {
          if (item.children) {
            item.children.forEach(child => {
              if (child.identifier) {
                questionId.push(child.identifier);
              }
            });
          } else {
            if (item.identifier) {
              questionId.push(item.identifier);
            }
          }
        });
      this.contentService.getQuestionList(questionId).subscribe((response) => {
        this.config['metadata']['children'] = response.questions; 
        this.playerType = 'sunbird-quml-player';
        this.playQumlContent();
      });
    }
    } else if(["video/mp4", "video/webm"].includes(this.config['metadata']['mimeType']) && this.checkIsPlayerEnabled(this.playerConfig , 'videoPlayer').name === "videoPlayer"){
      if(!this.platform.is('ios')){
        await ScreenOrientation.lock({orientation: 'landscape'});
      }
      this.config = await this.getNewPlayerConfiguration();
      this.config['config'].sideMenu.showPrint = false;
       this.playerType = 'sunbird-video-player';
       await this.playWebVideoContent();
    } else {
      this.playerType = 'sunbird-old-player';
    }
    if (this.playerType === 'sunbird-old-player') {
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
        iframes[0].contentWindow.postMessage('pause.youtube', window.parent.origin);
      }
    });

    this.isExitPopupShown = false;
  }
  async ionViewWillEnter() {
    const playerInterval = setInterval(async () => {
      if (this.playerType === 'sunbird-old-player') {
        await ScreenOrientation.lock({orientation: 'landscape'});
        this.config['uid'] = this.config['context'].actor.id;
        this.config['metadata'].basePath = '/_app_file_' + this.config['metadata'].basePath;

        if (this.config['metadata'].isAvailableLocally) {
          this.config['metadata'].contentData.streamingUrl = '/_app_file_' + this.config['metadata'].contentData.streamingUrl;
        }
        if (!this.config['config'].whiteListUrl || !this.config['config'].whiteListUrl.length) {
          const utilityConfigFields = await this.formAndFrameworkUtilService.getFormFields(FormConstants.UTILITY_CONFIG);
          if (utilityConfigFields && utilityConfigFields.length) {
            const utilityPlayerConfig = utilityConfigFields.find((config) => config.code === 'config')['config'];
            if (utilityPlayerConfig && utilityPlayerConfig.v1 && utilityPlayerConfig.v1.whitelistUrl
              && utilityPlayerConfig.v1.whitelistUrl.length) {
              this.config['config']['whiteListUrl'] = utilityPlayerConfig.v1.whitelistUrl;
            }
          }
        }
        if (this.previewElement?.nativeElement) {
          clearInterval(playerInterval);
          // This is to reload a iframe as iframes reload method not working on cross-origin.
          const src = this.previewElement.nativeElement.src;
          this.previewElement.nativeElement.src = '';
          this.previewElement.nativeElement.src = src;
          this.previewElement.nativeElement.onload = () => {
            setTimeout(() => {
              this.previewElement.nativeElement.contentWindow['Capacitor'] = window['Capacitor'];
              this.previewElement.nativeElement.contentWindow['Media'] = window['Media'];
              this.previewElement.nativeElement.contentWindow['initializePreview'](this.config);
              this.previewElement.nativeElement.contentWindow.addEventListener('message', async resp => {
                if (resp.data === 'renderer:question:submitscore') {
                  this.courseService.syncAssessmentEvents().subscribe();
                } else if (resp.data === 'renderer:question:reviewAssessment') {
                  this.courseService.clearAssessments().subscribe();
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
                      await this.openPDF(downloadUrl);
                    }
                  } else if (resp.data && resp.data.event === 'renderer:contentNotComaptible'
                    || resp.data && resp.data.data.event === 'renderer:contentNotComaptible') {
                    cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
                      () => { },
                      () => { }
                    );
                  } else if (resp.data && resp.data.event === 'renderer:maxLimitExceeded') {
                    await this.closeIframe();
                  }
                } else if (this.isJSON(resp.data)) {
                  const response = JSON.parse(resp.data);
                  if (response.event === 'renderer:navigate') {
                    this.navigateBackToTrackableCollection = true;
                    this.navigateBackToContentDetails = false;
                    await this.closeIframe({
                      identifier: response.data.identifier
                    });
                  }
                }
              });
            }, 1000);
          };
        }
      }
    }, 500);

    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, async () => {
      const activeAlert = await this.alertCtrl.getTop();
      if (!activeAlert) {
        await this.showConfirm();
      }
    });

    this.events.subscribe('endGenieCanvas', async (res) => {
      if (res.showConfirmBox) {
        await this.showConfirm();
      } else {
        await this.closeIframe();
      }
    });
  }

  async toggleDeviceOrientation() {
    if ((await ScreenOrientation.orientation()).type.includes(AppOrientation.LANDSCAPE.toLocaleLowerCase())) {
        await ScreenOrientation.unlock();
        await ScreenOrientation.lock({orientation: 'portrait'});
      } else {
        await ScreenOrientation.unlock();
        await ScreenOrientation.lock({orientation: 'landscape'});
    }
  }

  async ionViewWillLeave() {
    await StatusBar.show();
    const currentOrientation = await this.preferences.getString(PreferenceKey.ORIENTATION).toPromise();
    if (currentOrientation === AppOrientation.LANDSCAPE) {
      await ScreenOrientation.lock({orientation: 'landscape'});
    } else {
      await ScreenOrientation.unlock();
      await ScreenOrientation.lock({orientation: 'portrait'});
    }

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

  async handleNavBackButton() {
    await this.showConfirm();
  }

  async playerEvents(event) {
    if (event.edata) {
      const userId: string = this.appGlobalService.getCurrentUser().uid;
      const parentId: string = this.content?.rollup?.l1 ? this.content.rollup.l1 : this.content.identifier;
      const contentId: string = this.content.identifier;
      if (event.edata['type'] === 'END') {
        const saveState: string = JSON.stringify(event.metaData);
        this.playerService.savePlayerState(userId, parentId, contentId, saveState);
      }
      if (event.edata['type'] === 'END' && this.config['metadata']['mimeType'] === "application/vnd.sunbird.questionset") {
        this.courseService.syncAssessmentEvents().subscribe();
      } else if (event.edata['type'] === 'EXIT') {
        this.playerService.deletePlayerSaveState(userId, parentId, contentId);
        if (this.config['metadata']['mimeType'] === "application/vnd.sunbird.questionset") {
          if (!this.isExitPopupShown) {
            await this.showConfirm();
          }
        } else {
          this.location.back();
        }
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
      } else if (event.edata['type'] === 'DOWNLOAD') {
        this.handleDownload();
      } else if (event.edata['type'] === 'PRINT') {
        await this.printPdfService.printPdf(this.config['metadata'].streamingUrl);
      } else if(event.edata.type === 'NEXT_CONTENT_PLAY') {
           this.playNextContent();
      } else if (event.edata.type === 'compatibility-error') {
        cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
          () => {},
          () => {}
        );
      } else if (event.edata.type === 'exdata') {
        if (event.edata.currentattempt) {
          const attemptInfo = {
            isContentDisabled: event.edata.maxLimitExceeded,
            isLastAttempt: event.edata.isLastAttempt
          };
          await this.commonUtilService.handleAssessmentStatus(attemptInfo);
        }
      } else if (event.edata.type === 'DEVICE_ROTATION_CLICKED') {
        await this.toggleDeviceOrientation();
      }
    }
  }

  async handleDownload() {
    if (this.content.contentData.downloadUrl) {
      if (this.platform.is('ios')) {
        this.file.checkDir(this.file.documentsDirectory, 'downloads')
        .then(() => {
          this.file.checkFile(this.file.documentsDirectory, 'downloads/' + this.content.name + '.pdf')
          .then(_ => {this.commonUtilService.showToast("A file with the same name already exists!")})
          .catch(() => {
            this.downloadFileIos(this.content);
          })
        }) 
        .catch(() => {
          this.file.createDir(this.file.documentsDirectory, 'downloads', false)
          .then(response => {
            this.downloadFileIos(this.content);
          })
          .catch((err) => {
            this.commonUtilService.showToast('Error saving file:  ' + err.message, false, 'redErrorToast');
          })
        })
      } else { // android
        await this.downloadPdfService.downloadPdf(this.content).then((res) => {
          this.commonUtilService.showToast('CONTENT_DOWNLOADED');
        }).catch((error) => {
          if (error.reason === 'device-permission-denied') {
            this.commonUtilService.showToast('DEVICE_NEEDS_PERMISSION');
          } else if (error.reason === 'user-permission-denied') {
            this.commonUtilService.showToast('DEVICE_NEEDS_PERMISSION');
          } else if (error.reason === 'download-failed') {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
          }
        });
      }
    } else {
      this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
    }
  }

  downloadFileIos(content) {
    const path = this.file.documentsDirectory;
    const fileUri = content.contentData.downloadUrl;
    const fileName = content.name;
    setTimeout(() => {
      const transfer = this.transfer.create();
      transfer.download(fileUri, path + 'downloads/' + fileName + '.pdf').then(entry => {
        this.commonUtilService.showToast('CONTENT_DOWNLOADED');
      }).catch(err => {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      });
    },500)
  }

  async getNewPlayerConfiguration() {
      const nextContent = this.config['metadata'].hierarchyInfo && this.nextContentToBePlayed ? { name: this.nextContentToBePlayed.contentData.name, identifier: this.nextContentToBePlayed.contentData.identifier } : undefined;
      this.config['context']['pdata']['pid'] = 'sunbird.app.contentplayer';
      if (this.config['metadata'].isAvailableLocally) {
        this.config['metadata'].contentData.streamingUrl = '/_app_file_' + this.config['metadata'].contentData.streamingUrl;
      }
      this.config['metadata']['contentData']['basePath'] = '/_app_file_' + this.config['metadata'].basePath;
      this.config['metadata']['contentData']['isAvailableLocally'] = this.config['metadata'].isAvailableLocally;
      this.config['metadata'] = this.config['metadata'].contentData;
      this.config['data'] = {};
      this.config['config'] = {
        ...this.config['config'],
        nextContent,
        sideMenu: {
          showShare: true,
          showDownload: true,
          showReplay: false,
          showExit: true,
          showPrint: true
        }
      };
      
       
      if(this.config['metadata']['mimeType'] === "application/vnd.sunbird.questionset"){
        let questionSet;
        try{
          questionSet = await this.contentService.getQuestionSetRead(this.content.identifier, {fields:'instructions,outcomeDeclaration'}).toPromise();
          this.config['metadata']['instructions'] = questionSet && questionSet.questionset.instructions ? questionSet.questionset.instructions : undefined;
          this.config['metadata']['outcomeDeclaration'] = questionSet && questionSet.questionset.outcomeDeclaration ? questionSet.questionset.outcomeDeclaration : undefined;
        } catch(e){
          console.log(e);
          questionSet = await this.setContentDetails(this.content.identifier, true);
          this.config['metadata']['instructions'] = questionSet && questionSet.contentData.instructions ? questionSet.contentData.instructions : undefined;
          this.config['metadata']['outcomeDeclaration'] = questionSet && questionSet.contentData.outcomeDeclaration ? questionSet.contentData.outcomeDeclaration : undefined;
        }
      }
      const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      this.config['context'].userData = {
        firstName:  profile && profile.serverProfile && profile.serverProfile.firstName ? profile.serverProfile.firstName : profile.handle,
        lastName: ''
      };
      return this.config;
  }

  async setContentDetails(identifier, refreshContentDetails: boolean) {
    try {
        const option: ContentDetailRequest = {
            contentId: identifier,
            objectType: this.cardData.objectType,
            attachFeedback: true,
            attachContentAccess: true,
            emitUpdateIfAny: refreshContentDetails
        };

        const data: Content | any = await this.contentService.getContentDetails(option).toPromise();

        if (data) {
            console.log(data, 'data');
            return data;
        }
    } catch (error) {
        console.log('error while loading content details', error);
        this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        this.location.back();
    }
}
  getNextContent(hierarchyInfo, identifier) {
    return new Promise((resolve) => {
      this.contentService.nextContent(hierarchyInfo, identifier).subscribe((res) => {
        this.nextContentToBePlayed = res;
        resolve(res);
      })
    })
  }

  playNextContent(){
    const content = this.nextContentToBePlayed;
    this.events.publish(EventTopics.NEXT_CONTENT, {
      content,
      course: this.course
    });
    this.location.back();
  }

  /**
   * This will trigger from player/ iframe when it unable to find consecutive content
   * @param identifier Content Identifier
   * @param hierarchyInfo Object of content hierarchy
   */
  onContentNotFound(identifier: string, hierarchyInfo: Array<HierarchyInfo>) {
    const content = { identifier, hierarchyInfo };

    setTimeout(async () => {
      await this.closeIframe(content);
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
  async closeIframe(content?: any) {
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
      window.history.go(-1);
      await this.router.navigate([RouterLinks.CONTENT_DETAILS], {
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
      await this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
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
    this.isExitPopupShown = true;
    let type, stageId;
    if (this.playerType === 'sunbird-old-player') {
      type = (this.previewElement.nativeElement.contentWindow['Renderer']
        && !this.previewElement.nativeElement.contentWindow['Renderer'].running) ? 'EXIT_APP' : 'EXIT_CONTENT';
      stageId = this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].getCurrentStageId();
      this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
        'TOUCH', 'DEVICE_BACK_BTN', 'EXIT', { type, stageId });
    } else {
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(true, Environment.PLAYER, PageId.PLAYER);
    }

    const alert = await this.alertCtrl.create({
      header: this.commonUtilService.translateMessage('CONFIRM'),
      message: this.commonUtilService.translateMessage('CONTENT_PLAYER_EXIT_PERMISSION'),
      buttons: [
        {
          text: this.commonUtilService.translateMessage('CANCEL'),
          role: 'cancel',
          handler: () => {
            this.isExitPopupShown = false;
            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, 
              InteractSubtype.CANCEL_CLICKED, 
              Environment.PLAYER,
              PageId.PLAYER_PAGE);
            this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
              'TOUCH', 'ALERT_CANCEL', 'EXIT', { type, stageId });
          }
        },
        {
          text: this.commonUtilService.translateMessage('OKAY'),
          handler: async() => {
            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, 
              InteractSubtype.OK_CLICKED, 
              Environment.PLAYER,
              PageId.PLAYER_PAGE);
            if (this.playerType === 'sunbird-old-player') {
              this.previewElement.nativeElement.contentWindow['TelemetryService'].interact(
                'END', 'ALERT_OK', 'EXIT', { type, stageId });
              this.previewElement.nativeElement.contentWindow['TelemetryService'].interrupt('OTHER', stageId);
              this.previewElement.nativeElement.contentWindow['EkstepRendererAPI'].dispatchEvent('renderer:telemetry:end');
              this.closeIframe();
            }
            else{
              this.location.back();
            }
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
      FileOpener.open({
        filePath: localUrl,
        contentType: 'application/pdf'
      }).then(() => console.log('File is opened'))
        .catch((e) => {
          console.log('Error opening file', e);
          this.commonUtilService.showToast('CERTIFICATE_ALREADY_DOWNLOADED');
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

  playerTelemetryEvents(event) {
    if (event) {
      SunbirdSdk.instance.telemetryService.saveTelemetry(JSON.stringify(event)).subscribe(
        (res) => console.log('response after telemetry', res),
        );
    }
  }

  private isJSON(input): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkIsPlayerEnabled(config , playerType) {
    return config.fields.find(ele =>   ele.name === playerType && ele.values[0].isEnabled);
  }

  playWebVideoContent() {
    if (this.playerType === 'sunbird-video-player' && this.config) {
      const playerConfig: any = {
        context: this.config.context,
        config: this.config.config,
        metadata: this.config.metadata
      };  
      setTimeout(() => {
        const videoElement = document.createElement('sunbird-video-player');

        videoElement.setAttribute('player-config', JSON.stringify(playerConfig));
        videoElement.addEventListener('playerEvent', (event: any) => {
          if (event?.detail) {
            this.playerEvents(event.detail);
          }
        });
        videoElement.addEventListener('telemetryEvent', (event: any) => {
          this.playerTelemetryEvents(event.detail);
        });
  
        this.video?.nativeElement.append(videoElement);
      }, 100);
    }
  }

  playepubContent() {
    if (this.playerType === 'sunbird-epub-player' && this.config) {
      const playerConfig: any = {
        context: this.config.context,
        config: this.config.config,
        metadata: this.config.metadata
      }; 
      setTimeout(() => {
        const epubElement = document.createElement('sunbird-epub-player');
        epubElement.setAttribute('player-config', JSON.stringify(playerConfig));

        epubElement.addEventListener('playerEvent', (event: any) => {
          console.log("On playerEvent", event);
          if (event?.detail) {
            this.playerEvents(event.detail);
           }
        });
  
        epubElement.addEventListener('telemetryEvent', (event: any) => {
          console.log("On telemetryEvent", event);
          this.playerTelemetryEvents(event.detail);
        });
        if(this.epub?.nativeElement) {
          this.epub.nativeElement.append(epubElement);
        } else {
          console.error("epub player or its native element is not available.");
        }
      }, 500);
    } else {
      console.error("Invalid player type or missing config.");
    }
  }

  playPdfContent() {
    const playerConfig: any = {
      context: this.config.context,
      config: this.config.config,
      metadata: this.config.metadata
    };  
    setTimeout(() => {
      const pdfElement = document.createElement('sunbird-pdf-player');
        pdfElement.setAttribute('player-config', JSON.stringify(playerConfig));
        pdfElement.addEventListener('playerEvent', (event: any) => {
          if (event?.detail) {
           this.playerEvents(event.detail);
          }
        });
        pdfElement.addEventListener('telemetryEvent', (event: any) => {
          this.playerTelemetryEvents(event.detail);
        });
        this.pdf.nativeElement.append(pdfElement);
    }, 100);
  }

   async playQumlContent() {
    if (this.playerType === 'sunbird-quml-player' && this.config) {
      const playerConfig: any = {
        context: this.config.context,
        config: this.config.config,
        metadata: this.config.metadata
      };  
      setTimeout(() => {
        const qumlElement = document.createElement('sunbird-quml-player');
        qumlElement.setAttribute('player-config', JSON.stringify(playerConfig));
        qumlElement.addEventListener('playerEvent', (event: any) => {
          console.log("On playerEvent", event);
          if(event?.detail) {
            this.playerEvents(event.detail);
          }
        });
        qumlElement.addEventListener('telemetryEvent', (event: any) => {
          console.log("On telemetryEvent", event);
          this.playerTelemetryEvents(event.detail);
        });
        if (this.qumlPlayer?.nativeElement) {
          this.qumlPlayer.nativeElement.append(qumlElement);
        } else {
          console.error("qumlPlayer or its native element is not available.");
        }
      }, 500);
    } else {
      console.error("Invalid player type or missing config.");
    }
  }
}
