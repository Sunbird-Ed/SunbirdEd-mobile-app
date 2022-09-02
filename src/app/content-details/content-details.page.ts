import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Component, Inject, NgZone, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import {
  Platform,
  PopoverController
} from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription, Observable } from 'rxjs';
import {
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentImport,
  ContentImportRequest,
  ContentImportResponse,
  ContentService,
  CorrelationData,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  GetAllProfileRequest,
  ProfileService,
  Rollup,
  StorageService,
  TelemetryObject,
  Course,
  DownloadService,
  ObjectType,
  SharedPreferences,
  EventNamespace,
  ContentUpdate,
  CourseService,
  SunbirdSdk,
  PlayerService,
  ContentAccess,
  ContentAccessStatus,
  ContentMarkerRequest,
  MarkerType,
  Profile
} from 'sunbird-sdk';

import { Map } from '@app/app/telemetryutil';
import { ConfirmAlertComponent } from '@app/app/components';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import {
  ContentConstants, EventTopics, XwalkConstants, RouterLinks, ContentFilterConfig,
  ShareItemType, PreferenceKey, MaxAttempt, ProfileConstants
} from '@app/app/app.constant';
import {
  CourseUtilService,
  LocalCourseService,
  UtilityService,
  TelemetryGeneratorService,
  CommonUtilService, FormAndFrameworkUtilService,
} from '@app/services';
import { ContentInfo } from '@app/services/content/content-info';
import { DialogPopupComponent } from '@app/app/components/popups/dialog-popup/dialog-popup.component';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
  CorReleationDataType,
} from '@app/services/telemetry-constants';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { RatingHandler } from '@app/services/rating/rating-handler';
import { ProfileSwitchHandler } from '@app/services/user-groups/profile-switch-handler';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ChildContentHandler } from '@app/services/content/child-content-handler';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import { ContentUtil } from '@app/util/content-util';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { map, filter, take, tap } from 'rxjs/operators';
import { SbPopoverComponent } from '../components/popups/sb-popover/sb-popover.component';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Components } from '@ionic/core/dist/types/components';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { CourseCompletionPopoverComponent } from '../components/popups/sb-course-completion-popup/sb-course-completion-popup.component';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import {ShowVendorAppsComponent} from '@app/app/components/show-vendor-apps/show-vendor-apps.component';
import {FormConstants} from '@app/app/form.constants';
import { TagPrefixConstants } from '@app/services/segmentation-tag/segmentation-tag.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DownloadTranscriptPopupComponent } from '../components/popups/download-transcript-popup/download-transcript-popup.component';


declare const cordova;
declare const window;
@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContentDetailsPage implements OnInit, OnDestroy {
  appName: any;
  shouldOpenPlayAsPopup = false;
  apiLevel: number;
  appAvailability: string;
  content: Content | any;
  playingContent: Content;
  isChildContent = false;
  contentDetails: any;
  identifier: string;
  headerObservable: any;

  cardData: any;

  depth: string;
  isDownloadStarted = false;
  downloadProgress: any;
  cancelDownloading = false;
  loader: any;
  userId = '';
  public objRollup: Rollup;
  isContentPlayed = false;
  /**
   * Used to handle update content workflow
   */
  isUpdateAvail = false;
  streamingUrl?: any;
  contentDownloadable: {
    [contentId: string]: boolean;
  } = {};
  /**
   * currently used to identify that its routed from QR code results page
   * Can be sent from any page, where after landing on details page should download or play content automatically
   */
  downloadAndPlay: boolean;
  /**
   * This flag helps in knowing when the content player is closed and the user is back on content details page.
   */
  public isPlayerLaunched = false;
  launchPlayer: boolean;
  isResumedCourse: boolean;
  didViewLoad: boolean;
  contentDetail: any;
  backButtonFunc: Subscription;
  shouldGenerateEndTelemetry = false;
  source = '';
  userCount = 0;
  shouldGenerateTelemetry = true;
  playOnlineSpinner: boolean;
  defaultAppIcon: string;
  showMessage: any;
  localImage: any;
  isUsrGrpAlrtOpen = false;
  private corRelationList: Array<CorrelationData>;
  private eventSubscription: Subscription;
  defaultLicense: string;
  showChildrenLoader: any;
  showLoading: any;
  hierarchyInfo: any;
  showDownload: boolean;
  contentPath: Array<any>[];
  FileSizePipe: any;
  childPaths: Array<string> = [];
  breadCrumbData: any;
  telemetryObject: TelemetryObject;
  contentDeleteObservable: any;
  isSingleContent: boolean;
  resultLength: any;
  course: Course;
  fileTransfer: FileTransferObject;
  contentSize: any;
  // Newly Added
  licenseDetails;
  resumedCourseCardData: any;
  limitedShareContentFlag = false;
  private isLoginPromptOpen = false;
  private autoPlayQuizContent = false;
  shouldNavigateBack = false;
  isContentDownloading$: Observable<boolean>;
  onboarding = false;
  showCourseCompletePopup = false;
  courseContext: any;
  private contentProgressSubscription: Subscription;
  private playerEndEventTriggered: boolean;
  isCourseCertificateShown: boolean;
  pageId = PageId.CONTENT_DETAIL;
  maxAttemptAssessment: any;
  isCompatibleWithVendorApps = false;
  appLists: any;
  isIOS = false;
  playerType: any = null;
  config: any;
  nextContentToBePlayed: any;
  isPlayerPlaying = false;
  // displayTranscripts = false;
  // transcriptList = [];

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('PLAYER_SERVICE') private playerService: PlayerService,
    private zone: NgZone,
    private events: Events,
    private popoverCtrl: PopoverController,
    private platform: Platform,
    public appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private courseUtilService: CourseUtilService,
    private utilityService: UtilityService,
    private network: Network,
    private fileSizePipe: FileSizePipe,
    private headerService: AppHeaderService,
    private appVersion: AppVersion,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private profileSwitchHandler: ProfileSwitchHandler,
    private ratingHandler: RatingHandler,
    private contentPlayerHandler: ContentPlayerHandler,
    private childContentHandler: ChildContentHandler,
    private contentDeleteHandler: ContentDeleteHandler,
    private fileOpener: FileOpener,
    private transfer: FileTransfer,
    private sbProgressLoader: SbProgressLoader,
    private localCourseService: LocalCourseService,
    private formFrameworkUtilService: FormAndFrameworkUtilService,
    private sanitizer: DomSanitizer,
    private screenOrientation: ScreenOrientation
  ) {
    this.subscribePlayEvent();
    this.checkDeviceAPILevel();
    this.checkappAvailability();
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
    this.defaultLicense = ContentConstants.DEFAULT_LICENSE;
    this.ratingHandler.resetRating();
    this.route.queryParams.subscribe(async(params) => {
      await this.getNavParams();
    });
  }

  async getNavParams() {
    const extras = this.content || this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.course = this.course || extras.course;
      this.cardData = this.content || extras.content;
      this.isChildContent = extras.isChildContent;
      this.cardData.depth = extras.depth === undefined ? '' : extras.depth;
      this.corRelationList = extras.corRelation;
      this.identifier = this.cardData.contentId || this.cardData.identifier;
      this.isResumedCourse = Boolean(extras.isResumedCourse);
      this.source = extras.source || this.source;
      this.shouldGenerateEndTelemetry = extras.shouldGenerateEndTelemetry;
      this.downloadAndPlay = extras.downloadAndPlay;
      this.playOnlineSpinner = true;
      this.contentPath = extras.paths;
      this.breadCrumbData = extras.breadCrumb;
      this.launchPlayer = extras.launchplayer;
      this.resumedCourseCardData = extras.resumedCourseCardData;
      this.isSingleContent = extras.isSingleContent || this.isSingleContent;
      this.resultLength = extras.resultsSize;
      this.autoPlayQuizContent = extras.autoPlayQuizContent || false;
      this.shouldOpenPlayAsPopup = extras.isCourse;
      this.shouldNavigateBack = extras.shouldNavigateBack;
      this.nextContentToBePlayed = extras.content;
      this.checkLimitedContentSharingFlag(extras.content);
      if (this.content && this.content.mimeType === 'application/vnd.sunbird.questionset' && !extras.content) {
        await this.getContentState();
      }
      this.onboarding = extras.onboarding || this.onboarding;
      this.setContentDetails(this.identifier, false, false);
    }
    this.isIOS = (this.platform.is('ios'))
      this.isContentDownloading$ = this.downloadService.getActiveDownloadRequests().pipe(
        map((requests) => !!requests.find((request) => request.identifier === this.identifier))
      );

  }

  iosCheck() {
    if (this.platform.is('ios') && this.content.mimeType === 'application/vnd.sunbird.questionset') {
      return true;
    } else {
      return false;
    }
  }

  async ngOnInit() {
    this.subscribeEvents();
    this.appLists = await this.formFrameworkUtilService.getFormFields(FormConstants.VENDOR_APPS_CONFIG);
    this.appLists = this.appLists.filter((appData) => {
      if (appData.target.mimeType &&
          appData.target.mimeType.indexOf(this.cardData.mimeType) !== -1 &&
          appData.target.primaryCategory &&
          appData.target.primaryCategory.indexOf(this.cardData.primaryCategory)) {
        return true;
      }
    });
    if (this.appLists.length) {
      this.isCompatibleWithVendorApps = true;
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

  subscribeEvents() {
    // DEEPLINK_CONTENT_PAGE_OPEN is used to refresh the contend details on external deeplink clicked
    this.events.subscribe(EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, (data) => {
      if (data && data.content) {
        this.ratingHandler.resetRating();
        this.autoPlayQuizContent = data.autoPlayQuizContent || false;
        this.checkLimitedContentSharingFlag(data.content);
      }
    });
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });

    if (!AppGlobalService.isPlayerLaunched) {
      this.calculateAvailableUserCount();
    }

    this.events.subscribe(EventTopics.PLAYER_CLOSED, (data) => {
      if (data.selectedUser) {
        if (!data.selectedUser['profileType']) {
          console.log('data', !data.selectedUser['profileType']);
          this.profileService.getActiveProfileSession().toPromise()
            .then((profile) => {
              this.profileSwitchHandler.switchUser(profile);
            });
        } else {
          this.profileSwitchHandler.switchUser(data.selectedUser);
        }
      }
    });
    this.events.subscribe(EventTopics.NEXT_CONTENT, async (data) => {
      this.generateEndEvent();
      this.content = data.content;
      this.course = data.course;
      await this.getNavParams();
      setTimeout(() => {
        this.contentPlayerHandler.setLastPlayedContentId('');
        this.generateTelemetry(true);
      }, 1000);
    });
  }

  ngOnDestroy() {
    this.events.unsubscribe(EventTopics.PLAYER_CLOSED);
    this.events.unsubscribe(EventTopics.NEXT_CONTENT);
    this.events.unsubscribe(EventTopics.DEEPLINK_CONTENT_PAGE_OPEN);

    if (this.contentProgressSubscription) {
      this.contentProgressSubscription.unsubscribe();
    }
  }

  /**
   * Ionic life cycle hook
   */
  async ionViewWillEnter() {
    this.headerService.hideStatusBar();
    this.headerService.hideHeader();

    if (this.isResumedCourse && !this.contentPlayerHandler.isContentPlayerLaunched()) {
      if (this.isUsrGrpAlrtOpen) {
        this.isUsrGrpAlrtOpen = false;
      }
    } else {
      this.generateTelemetry();
    }
    this.isPlayedFromCourse();
    if (this.shouldOpenPlayAsPopup) {
      await this.getContentState();
    }
    this.setContentDetails(
      this.identifier, true,
      this.contentPlayerHandler.getLastPlayedContentId() === this.identifier);
    this.subscribeSdkEvent();
    this.findHierarchyOfContent();
    this.handleDeviceBackButton();
  }

  ionViewDidEnter() {
    this.sbProgressLoader.hide({ id: 'login' });
    this.sbProgressLoader.hide({ id: this.identifier });
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.contentDeleteObservable) {
      this.contentDeleteObservable.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleNavBackButton() {
    if (this.platform.is('ios') && this.screenOrientation.type === 'landscape-secondary') {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      return false;
    }
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CONTENT_DETAIL, Environment.HOME,
      true, this.cardData.identifier, this.corRelationList, this.objRollup, this.telemetryObject);
    this.didViewLoad = false;
    this.generateEndEvent();
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
    }
    this.popToPreviousPage(true);
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.platform.is('ios') && this.screenOrientation.type === 'landscape-secondary') {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      } else {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CONTENT_DETAIL, Environment.HOME,
          false, this.cardData.identifier, this.corRelationList, this.objRollup, this.telemetryObject);
        this.didViewLoad = false;
        this.popToPreviousPage(false);
        this.generateEndEvent();
        if (this.shouldGenerateEndTelemetry) {
          this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
        }
      }
    });
  }

  subscribePlayEvent() {
    this.events.subscribe('playConfig', (config) => {
      this.appGlobalService.setSelectedUser(config['selectedUser']);
      this.playContent(config.streaming);
    });
  }

  calculateAvailableUserCount() {
    const profileRequest: GetAllProfileRequest = {
      local: true,
      server: false
    };
    this.profileService.getAllProfiles(profileRequest).pipe(
      map((profiles) => profiles.filter((profile) => !!profile.handle))
    )
      .toPromise()
      .then((profiles) => {
        if (profiles) {
          this.userCount = profiles.length;
        }
        if (this.appGlobalService.isUserLoggedIn()) {
          this.userCount += 1;
        }
      }).catch((error) => {
        console.error('Error occurred= ', error);
      });
  }

  /**
   * To set content details in local variable
   * @param identifier identifier of content / course
   */

  async setContentDetails(identifier, refreshContentDetails: boolean, showRating: boolean) {
    let loader;
    if (!showRating) {
      loader = await this.commonUtilService.getLoader();
      await loader.present();
    }
    const req: ContentDetailRequest = {
      contentId: identifier,
      objectType: this.cardData.objectType,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };

    this.contentService.getContentDetails(req).toPromise()
      .then(async (data: Content) => {
        if (data) {
          if (data.contentData.size) {
            this.contentSize = data.contentData.size;
          }
          if(this.cardData && this.cardData.hierachyInfo) {
            await this.getNextContent(this.cardData.hierachyInfo, this.cardData.identifier);
          }
          this.extractApiResponse(data);
          if (!showRating) {
            await loader.dismiss();
          }
          if (data.contentData.status === 'Retired') {
            this.showRetiredContentPopup();
          }
        } else {
          if (!showRating) {
            await loader.dismiss();
          }
        }
        if (showRating) {
          this.contentPlayerHandler.setContentPlayerLaunchStatus(false);
          this.ratingHandler.showRatingPopup(
            this.isContentPlayed,
            data,
            'automatic',
            this.corRelationList,
            this.objRollup,
            this.shouldNavigateBack,
            () => { this.openCourseCompletionPopup(); });
          this.contentPlayerHandler.setLastPlayedContentId('');
        }
      })
      .catch(async (error: any) => {
        await loader.dismiss();
        if (this.isDownloadStarted) {
          this.contentDownloadable[this.content.identifier] = false;
          this.isDownloadStarted = false;
        }
        if (error.hasOwnProperty('CONNECTION_ERROR')) {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else if (error.hasOwnProperty('SERVER_ERROR') || error.hasOwnProperty('SERVER_AUTH_ERROR')) {
          this.commonUtilService.showToast('ERROR_FETCHING_DATA');
        } else {
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
        this.location.back();
      });
  }

  rateContent(popUpType: string) {
    this.ratingHandler.showRatingPopup(this.isContentPlayed, this.content, popUpType, this.corRelationList, this.objRollup);
  }

  extractApiResponse(data: Content) {
    this.checkLimitedContentSharingFlag(data);

    if (this.isResumedCourse) {
      const parentIdentifier = this.resumedCourseCardData && this.resumedCourseCardData.contentId ?
        this.resumedCourseCardData.contentId : this.resumedCourseCardData.identifier;
      this.childContentHandler.setChildContents(parentIdentifier, 0, this.identifier);
    }

    this.content = data;
    this.playerType = this.content.mimeType === 'video/mp4' ? 'sunbird-video-player' : undefined;
    if (data.contentData.licenseDetails && Object.keys(data.contentData.licenseDetails).length) {
      this.licenseDetails = data.contentData.licenseDetails;
    }
    this.contentDownloadable[this.content.identifier] = data.isAvailableLocally;
    if (this.content.lastUpdatedTime !== 0) {
      this.playOnlineSpinner = false;
    }
    this.content.contentData.appIcon =
      this.commonUtilService.convertFileSrc(ContentUtil.getAppIcon(this.content.contentData.appIcon, data.basePath,
        this.commonUtilService.networkInfo.isNetworkAvailable));
    this.content.contentAccess = data.contentAccess ? data.contentAccess : [];
    this.content.contentMarker = data.contentMarker ? data.contentMarker : [];

    if (this.cardData && this.cardData.hierarchyInfo) {
      data.hierarchyInfo = this.cardData.hierarchyInfo;
      this.isChildContent = true;
    }
    if (this.content.contentData.streamingUrl &&
      (this.content.mimeType !== 'application/vnd.ekstep.h5p-archive')) {
      this.streamingUrl = this.content.contentData.streamingUrl;
    }
    if (this.content.contentData.attributions && this.content.contentData.attributions.length) {
      this.content.contentData.attributions = (this.content.contentData.attributions.sort()).join(', ');
    }

    if (!this.isChildContent && this.content.contentMarker.length
      && this.content.contentMarker[0].extraInfoMap
      && this.content.contentMarker[0].extraInfoMap.hierarchyInfo
      && this.content.contentMarker[0].extraInfoMap.hierarchyInfo.length) {
      this.isChildContent = true;
    }

    this.playingContent = data;
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
    this.markContent();

    // Check locally available
    if (Boolean(data.isAvailableLocally)) {
      this.isUpdateAvail = data.isUpdateAvailable && !this.isUpdateAvail;
    } else {
      this.content.contentData.size = this.content.contentData.size;
    }

    if (this.content.contentData.me_totalDownloads) {
      this.content.contentData.me_totalDownloads = parseInt(this.content.contentData.me_totalDownloads, 10) + '';
    }

    if (this.isResumedCourse) {
      this.cardData.contentData = this.content;
      this.cardData.pkgVersion = this.content.contentData.pkgVersion;
      this.generateTelemetry();
    }

    if (this.shouldGenerateTelemetry) {
      this.generateDetailsInteractEvent();
      this.shouldGenerateEndTelemetry = false;
    }

    if (this.contentPlayerHandler.isContentPlayerLaunched()) {
      this.downloadAndPlay = false;
    }
    if (this.downloadAndPlay) {
      if (!this.contentDownloadable[this.content.identifier] || this.content.isUpdateAvailable) {
        /**
         * Content is not downloaded then call the following method
         * It will download the content and play it
         */
        this.downloadContent();
      } else {
        /**
         * If the content is already downloaded then just play it
         */
        this.showSwitchUserAlert(false);
      }
    }
    if ( (this.content.mimeType === 'video/mp4' || this.content.mimeType === 'video/webm') &&
    !(typeof this.content.contentData['interceptionPoints'] === 'object' && this.content.contentData['interceptionPoints'] != null &&
     Object.keys(this.content.contentData['interceptionPoints']).length !== 0) ) {
      this.getNextContent(data.hierarchyInfo, data.identifier);
      this.playContent(true, true);
    }
  }

  getImageContent() {
    if(this.platform.is('ios')) {
      return this.sanitizer.bypassSecurityTrustUrl(this.content.contentData.appIcon);
    } else {
      return this.content.contentData.appIcon;
    }
  }

  generateTelemetry(forceGenerate?: boolean) {
    if (!this.didViewLoad && !this.isContentPlayed || forceGenerate) {
      this.objRollup = ContentUtil.generateRollUp(this.cardData.hierarchyInfo, this.identifier);
      this.telemetryObject = ContentUtil.getTelemetryObject(this.cardData);
      this.generateImpressionEvent(false, this.cardData.identifier, this.telemetryObject.type, this.cardData.pkgVersion);
      this.generateStartEvent();
    }
    this.didViewLoad = true;
  }

  generateDetailsInteractEvent() {
    const values = new Map();
    values['isUpdateAvailable'] = this.isUpdateAvail;
    values['isDownloaded'] = this.contentDownloadable[this.content.identifier];
    values['autoAfterDownload'] = this.downloadAndPlay ? true : false;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      ImpressionType.DETAIL,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      values,
      this.objRollup,
      this.corRelationList);
  }

  generateImpressionEvent(download, objectId?, objectType?, objectVersion?) {
    if (this.corRelationList && this.corRelationList.length) {
      this.corRelationList.push({
        id: PageId.CONTENT_DETAIL,
        type: CorReleationDataType.CHILD_UI
      });
    }
    if (this.downloadAndPlay || download) {
      this.telemetryGeneratorService.generateImpressionTelemetry(
        download ? InteractType.DOWNLOAD_COMPLETE : InteractSubtype.DOWNLOAD_REQUEST,
        download ? InteractType.DOWNLOAD_COMPLETE : InteractSubtype.DOWNLOAD_REQUEST,
        download ? PageId.QR_CONTENT_RESULT : PageId.CONTENT_DETAIL,
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
        undefined,
        undefined,
        undefined,
        undefined,
        this.corRelationList);
    }
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.DETAIL, '',
      PageId.CONTENT_DETAIL,
      Environment.HOME,
      objectId,
      objectType,
      objectVersion,
      this.objRollup,
      this.corRelationList);

    this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.PAGE_REQUEST, '',
        PageId.CONTENT_DETAIL,
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      );

    this.telemetryGeneratorService.generatePageLoadedTelemetry(
        PageId.CONTENT_DETAIL,
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
        undefined,
        undefined,
        undefined,
        undefined,
        this.corRelationList
      );
  }

  generateStartEvent() {
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      this.objRollup,
      this.corRelationList);
  }

  generateEndEvent() {
    this.telemetryGeneratorService.generateEndTelemetry(
      this.telemetryObject.type ? this.telemetryObject.type : CsPrimaryCategory.LEARNING_RESOURCE,
      Mode.PLAY,
      PageId.CONTENT_DETAIL,
      Environment.HOME,
      this.telemetryObject,
      this.objRollup,
      this.corRelationList);
  }

  generateQRSessionEndEvent(pageId: string, qrData: string) {
    if (pageId !== undefined) {
      const telemetryObject = new TelemetryObject(qrData, 'qr', '');
      this.telemetryGeneratorService.generateEndTelemetry(
        'qr',
        Mode.PLAY,
        pageId,
        Environment.HOME,
        telemetryObject,
        undefined,
        this.corRelationList);
    }
  }

  popToPreviousPage(isNavBack?) {
    this.appGlobalService.showCourseCompletePopup = false;
    if (this.screenOrientation.type === 'landscape-primary') {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    if (this.isSingleContent) {
      !this.onboarding ? this.router.navigate([`/${RouterLinks.TABS}`]) : window.history.go(-3);
    } else if (this.source === PageId.ONBOARDING_PROFILE_PREFERENCES) {
      if (this.appGlobalService.isOnBoardingCompleted) {
        this.router.navigate([`/${RouterLinks.TABS}`]);
      } else {
        this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], { state: { showFrameworkCategoriesMenu: true }, replaceUrl: true });
      }
    } else if (this.resultLength === 1) {
      window.history.go(-2);
    } else {
      this.location.back();
    }
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    const folderPath = this.platform.is('ios') ? cordova.file.documentsDirectory : this.storageService.getStorageDestinationDirectoryPath();
   
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: folderPath,
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : [],
        rollUp: isChild ? this.objRollup : undefined
      });
    });

    return requestParams;
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  importContent(identifiers: Array<string>, isChild: boolean) {
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    // Call content service
    this.contentService.importContent(contentImportRequest).toPromise()
      .then((data: ContentImportResponse[]) => {
        if (data && data[0].status === -1) {
          this.showDownload = false;
          this.isDownloadStarted = false;
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
      })
      .catch((error) => {
        console.log('error while loading content details', error);
        if (this.isDownloadStarted) {
          this.showDownload = false;
          this.contentDownloadable[this.content.identifier] = false;
          this.isDownloadStarted = false;
        }
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      });
  }

  openinBrowser(url) {
    this.commonUtilService.openUrlInBrowser(url);
  }

  /**
   * Subscribe Sunbird-SDK event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(() => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;
          if (downloadEvent.payload.identifier === this.content.identifier) {
            this.showDownload = true;
            this.isDownloadStarted = true;
            this.downloadProgress = downloadEvent.payload.progress === -1 ? '0' : downloadEvent.payload.progress;
            this.downloadProgress = Math.round(this.downloadProgress);
            if (isNaN(this.downloadProgress)) {
              this.downloadProgress = 0;
            }
            if (this.downloadProgress === 100) {
              this.showLoading = false;
              this.showDownload = false;
              this.content.isAvailableLocally = true;
            }
          }
        }


        // Get child content
        if (event.type === ContentEventType.IMPORT_COMPLETED) {
          if (this.isDownloadStarted) {
            this.isDownloadStarted = false;
            this.cancelDownloading = false;
            this.contentDownloadable[this.content.identifier] = true;
            this.generateImpressionEvent(true);
            this.setContentDetails(this.identifier, false, false);
            this.downloadProgress = '';
            this.events.publish('savedResources:update', {
              update: true
            });
          }
        }


        // For content update available
        if (event.payload && event.type === ContentEventType.UPDATE) {
          this.zone.run(() => {
            this.isUpdateAvail = true;
            if (event.payload.size) {
              this.content.contentData.size = event.payload.size;
            }
          });
        }

        if (event.payload && event.type === ContentEventType.SERVER_CONTENT_DATA) {
          this.zone.run(() => {
            const eventPayload = event.payload;
            if (this.content && eventPayload.contentId === this.content.identifier) {
              if (eventPayload.streamingUrl && (this.content.mimeType !== 'application/vnd.ekstep.h5p-archive')) {
                this.streamingUrl = eventPayload.streamingUrl;
                this.playingContent.contentData.streamingUrl = eventPayload.streamingUrl;
              } else {
                this.playOnlineSpinner = false;
              }
              if (eventPayload.licenseDetails && Object.keys(eventPayload.licenseDetails).length) {
                this.licenseDetails = eventPayload.licenseDetails;
              }
            }
          });
        }
      });
    }) as any;
  }

  /**
   * confirming popUp content
   */
  async openConfirmPopUp() {
    if (this.limitedShareContentFlag) {
      this.commonUtilService.showToast('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
      return;
    }

    if (!this.content.contentData.downloadUrl) {
      this.commonUtilService.showToast('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
      return;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      this.isUpdateAvail ? InteractSubtype.UPDATE_INITIATE : InteractSubtype.DOWNLOAD_INITIATE,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverMainTitle: this.content.contentData.name,
          icon: null,
          metaInfo:
            '1 item ' + '(' + this.fileSizePipe.transform(this.content.contentData.size || this.contentSize, 2) + ')',
          isUpdateAvail: this.contentDownloadable[this.content.identifier] && this.isUpdateAvail,
        },
        cssClass: 'sb-popover info',
      });
      await popover.present();
      const { data } = await popover.onDidDismiss();
      if (data) {
        this.downloadContent();
      } else {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.CLOSE_CLICKED,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          this.telemetryObject, undefined,
          this.objRollup,
          this.corRelationList);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  /**
   * Download content
   */
  downloadContent() {
    this.zone.run(() => {
      if (this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.showDownload = true;
        this.downloadProgress = '0';
        this.isDownloadStarted = true;
        const values = new Map();
        values['network-type'] = this.network.type;
        values['size'] = this.content.contentData.size;
        this.importContent([this.identifier], this.isChildContent);
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          this.isUpdateAvail ? InteractSubtype.UPDATE_INITIATE : InteractSubtype.DOWNLOAD_INITIATE,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          this.telemetryObject,
          values,
          this.objRollup,
          this.corRelationList);
      }
    });
  }

  cancelDownload() {
    const ObjectTelemetry = new TelemetryObject(this.cardData.identifier, ObjectType.CONTENT, '');
    const corRelationData: CorrelationData[] = [{
      id: InteractSubtype.DOWLOAD_POPUP,
      type: CorReleationDataType.CHILD_UI
    }];
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CLOSE,
      InteractSubtype.CANCEL,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      PageId.CONTENT_DETAIL,
      ObjectTelemetry,
      undefined,
      undefined,
      corRelationData
    );
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      this.isUpdateAvail ? InteractSubtype.DOWNLOAD_CANCEL_CLICKED : InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        this.zone.run(() => {
          this.telemetryGeneratorService.generateContentCancelClickedTelemetry(this.content, this.downloadProgress);
          this.isDownloadStarted = false;
          this.showDownload = false;
          this.downloadProgress = '';
          if (!this.isUpdateAvail) {
            this.contentDownloadable[this.content.identifier] = false;
          }
        });
      }).catch((error: any) => {
        this.zone.run(() => {
          console.log('Error: download error =>>>>>', error);
        });
      });
  }

  async handleContentPlay(isStreaming) {
    const maxAttempt: MaxAttempt = await this.commonUtilService.handleAssessmentStatus(this.maxAttemptAssessment);
    if (maxAttempt.isCloseButtonClicked || maxAttempt.limitExceeded) {
      return;
    }
    if (this.limitedShareContentFlag) {
      if (!this.content || !this.content.contentData || !this.content.contentData.streamingUrl) {
        return;
      }
      if (!this.appGlobalService.isUserLoggedIn()) {
        this.promptToLogin();
      } else {
        this.showSwitchUserAlert(true);
      }
    } else {
      this.showSwitchUserAlert(isStreaming);
    }
  }

  /**
   * alert for playing the content
   */
  async showSwitchUserAlert(isStreaming: boolean) {
    if (isStreaming && !this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
      return false;
    } else {
      const values = new Map();
      const subtype: string = isStreaming ? InteractSubtype.PLAY_ONLINE : InteractSubtype.PLAY_FROM_DEVICE;
      values['networkType'] = this.network.type;
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        subtype,
        Environment.HOME,
        PageId.CONTENT_DETAIL,
        this.telemetryObject,
        values,
        this.objRollup,
        this.corRelationList);
    }

    if (!AppGlobalService.isPlayerLaunched && this.userCount > 2 && this.network.type !== '2g' && !this.shouldOpenPlayAsPopup
      && !this.limitedShareContentFlag) {
      this.openPlayAsPopup(isStreaming);
    } else if (this.network.type === '2g' && !this.contentDownloadable[this.content.identifier]) {
      const popover = await this.popoverCtrl.create({
        component: SbGenericPopoverComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('LOW_BANDWIDTH'),
          sbPopoverMainTitle: this.commonUtilService.translateMessage('LOW_BANDWIDTH_DETECTED'),
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('PLAY_ONLINE'),
              btnClass: 'popover-color'
            },
            {
              btntext: this.commonUtilService.translateMessage('DOWNLOAD'),
              btnClass: 'sb-btn sb-btn-normal sb-btn-info'
            }
          ],
          icon: {
            md: 'sad',
            ios: 'sad',
            className: ''
          },
          metaInfo: '',
          sbPopoverContent: this.commonUtilService.translateMessage('CONSIDER_DOWNLOAD')
        },
        cssClass: 'sb-popover warning',
      });
      await popover.present();
      const { data } = await popover.onDidDismiss();
      if (data == null) {
        return;
      }
      if (data && data.isLeftButtonClicked) {
        if (!AppGlobalService.isPlayerLaunched && this.userCount > 2 && !this.shouldOpenPlayAsPopup && !this.limitedShareContentFlag) {
          this.openPlayAsPopup(isStreaming);
        } else {
          this.playContent(isStreaming);
        }
      } else {
        this.downloadContent();
      }
    } else {
      if (this.source === PageId.ONBOARDING_PROFILE_PREFERENCES) {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          InteractType.PLAY,
          InteractSubtype.DOWNLOAD,
          PageId.QR_CONTENT_RESULT,
          Environment.ONBOARDING
        );
      }
      this.playContent(isStreaming);
    }
  }

  async showRetiredContentPopup() {
    const popover = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('CONTENT_NOT_AVAILABLE'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('CONTENT_RETIRED_BY_AUTHOR'),
        actionsButtons: [
        ],
        icon: {
          md: 'warning',
          ios: 'warning',
          className: ''
        }
      },
      cssClass: 'sb-popover warning',
    });
    await popover.present();
    popover.onDidDismiss().then(() => {
      this.location.back();
    });
  }

  async openPlayAsPopup(isStreaming) {
    const profile = this.appGlobalService.getCurrentUser();
    this.isUsrGrpAlrtOpen = true;

    const confirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('PLAY_AS'),
        sbPopoverMainTitle: profile.handle,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data == null) {
      return;
    }
    if (data && data.isLeftButtonClicked) {
      this.playContent(isStreaming);
      // Incase of close button click data.isLeftButtonClicked = null so we have put the false condition check
    }
  }

  /**
   * Play content
   */
  private playContent(isStreaming: boolean, loadPlayer: boolean = false) {
    if (this.apiLevel < 21 && this.appAvailability === 'false' && !this.isIOS) {
      this.showPopupDialog();
    } else {
      const hierachyInfo = this.childContentHandler.contentHierarchyInfo || this.content.hierarchyInfo;
      const contentInfo: ContentInfo = {
        telemetryObject: this.telemetryObject,
        rollUp: this.objRollup,
        correlationList: this.corRelationList,
        hierachyInfo,
        course: this.course
      };
      if (this.isResumedCourse) {
        this.playingContent.hierarchyInfo = hierachyInfo;
      }
      this.contentPlayerHandler.launchContentPlayer(this.playingContent, isStreaming,
        this.downloadAndPlay, contentInfo, this.shouldOpenPlayAsPopup , true , this.isChildContent, this.maxAttemptAssessment, 
        loadPlayer ? (val) => this.handlePlayer(val) : undefined);
      this.downloadAndPlay = false;
    }
  }

  async handlePlayer(playerData) {
    this.config = playerData.state.config;
    let playerConfig = await this.formFrameworkUtilService.getPdfPlayerConfiguration();
    if (["video/mp4", "video/webm"].includes(playerData.state.config['metadata']['mimeType']) && this.checkIsPlayerEnabled(playerConfig , 'videoPlayer').name === "videoPlayer") {
      this.config = await this.getNewPlayerConfiguration();
      this.config['config'].sideMenu.showPrint = false;
      this.playerType = 'sunbird-video-player';
      this.isPlayerPlaying = true;
    }
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
        questionSet = await this.contentService.getQuestionSetRead(this.content.identifier, {fields:'instructions'}).toPromise();
      } catch(e){
        console.log(e);
      }
      this.config['metadata']['instructions'] = questionSet && questionSet.questionset.instructions ? questionSet.questionset.instructions : undefined;
    }
    const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    this.config['context'].userData = {
      firstName:  profile && profile.serverProfile && profile.serverProfile.firstName ? profile.serverProfile.firstName : profile.handle,
      lastName: ''
    };
    return this.config;
  }

  checkIsPlayerEnabled(config , playerType) {
    return config.fields.find(ele =>   ele.name === playerType && ele.values[0].isEnabled);
  }

  playerTelemetryEvents(event) {
    if (event) {
      SunbirdSdk.instance.telemetryService.saveTelemetry(JSON.stringify(event)).subscribe(
        (res) => console.log('response after telemetry', res),
        );
    }
  }

  async playerEvents(event) {
    if (event.edata) {
      const userId: string = this.appGlobalService.getCurrentUser().uid;
      const parentId: string = (this.content.rollup && this.content.rollup.l1) ? this.content.rollup.l1 : this.content.identifier;
      const contentId: string = this.content.identifier;
      if (event.edata['type'] === 'END') {
        const saveState: string = JSON.stringify(event.metaData);
        this.playerService.savePlayerState(userId, parentId, contentId, saveState);
        this.isPlayerPlaying = false;
      }
      if (event.edata['type'] === 'EXIT') {
        this.playerService.deletePlayerSaveState(userId, parentId, contentId);
        if (this.screenOrientation.type === 'landscape-primary') {
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }
      } else if(event.edata.type === 'NEXT_CONTENT_PLAY') {
        if (this.screenOrientation.type === 'landscape-primary') {
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }
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
          this.commonUtilService.handleAssessmentStatus(attemptInfo);
        }
      } else if (event.edata['type'] === 'FULLSCREEN') {
        if (this.screenOrientation.type === 'portrait-primary') {
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        } else if (this.screenOrientation.type === 'landscape-primary') {
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        }
      }
    } else if (event.type === 'ended') {
      this.isContentPlayed = true;
      this.rateContent('manual');
    } else if (event.type === 'REPLAY') {
      this.isPlayerPlaying = true;
    }
  }

  playNextContent() {
    const content = this.nextContentToBePlayed;
    this.config = undefined;
    this.events.publish(EventTopics.NEXT_CONTENT, {
      content,
      course: this.course
    });
  }

  checkappAvailability() {
    this.utilityService.checkAppAvailability(XwalkConstants.APP_ID)
      .then((response: any) => {
        this.appAvailability = response;
        console.log('check App availability', this.appAvailability);
      })
      .catch((error: any) => {
        console.error('Error ', error);
      });
  }

  checkDeviceAPILevel() {
    this.utilityService.getDeviceAPILevel()
      .then((res: any) => {
        this.apiLevel = res;
      }).catch((error: any) => {
        console.error('Error ', error);
      });
  }

  showDeletePopup() {
    this.contentDeleteObservable = this.contentDeleteHandler.contentDeleteCompleted$.subscribe(() => {
      this.content.contentData.streamingUrl = this.streamingUrl;
      this.contentDownloadable[this.content.identifier] = false;
      const playContent = this.playingContent;
      playContent.isAvailableLocally = false;
      this.isDownloadStarted = false;
    });
    const contentInfo: ContentInfo = {
      telemetryObject: this.telemetryObject,
      rollUp: this.objRollup,
      correlationList: this.corRelationList,
      hierachyInfo: undefined
    };
    // when content size and sizeOn device is undefined
    if (!this.content.contentData.size) {
      this.content.contentData.size = this.contentSize;
    }
    this.contentDeleteHandler.showContentDeletePopup(this.content, this.isChildContent, contentInfo, PageId.CONTENT_DETAIL);
  }

  /**
   * Shares content to external devices
   */
  async share() {
    // when content size and sizeOn device is undefined
    if (!this.content.contentData.size) {
      this.content.contentData.size = this.contentSize;
    }
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.content,
        corRelationList: this.corRelationList,
        objRollup: this.objRollup,
        pageId: PageId.CONTENT_DETAIL,
        shareItemType: this.isChildContent ? ShareItemType.LEAF_CONTENT : ShareItemType.ROOT_CONTENT
      },
      cssClass: 'sb-popover',
    });
    await popover.present();
  }

  /**
   * To View Credits popup
   * check if non of these properties exist, then return false
   * else show ViewCreditsComponent
   */
  viewCredits() {
    if (!this.content.contentData.creator && !this.content.contentData.creators) {
      if (!this.content.contentData.contributors && !this.content.contentData.owner) {
        if (!this.content.contentData.attributions) {
          return false;
        }
      }
    }
    this.courseUtilService.showCredits(this.content, PageId.CONTENT_DETAIL, this.objRollup, this.corRelationList);
  }

  /**
   * method generates telemetry on click Read less or Read more
   * @param param string as read less or read more
   * @param objRollup object roll up
   * @param corRelationList correlation List
   */
  readLessorReadMore(param, objRollup, corRelationList) {
    if(param === 'read-more-clicked'){
      this.appGlobalService.setAccessibilityFocus('read-more-content')
    } else {
      this.appGlobalService.setAccessibilityFocus('read-more-less-btn');
    }
    param = 'read-more-clicked' === param ? InteractSubtype.READ_MORE_CLICKED : InteractSubtype.READ_LESS_CLICKED;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      param,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      undefined,
      objRollup,
      corRelationList
    );
  }

  private async showPopupDialog() {
    const popover = await this.popoverCtrl.create({
      component: DialogPopupComponent,
      componentProps: {
        title: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED'),
        body: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED_DESC'),
        buttonText: this.commonUtilService.translateMessage('INSTALL_CROSSWALK')
      },
      cssClass: 'popover-alert'
    });
    await popover.present();
  }

  mergeProperties(mergeProp) {
    return ContentUtil.mergeProperties(this.content.contentData, mergeProp);
  }

  findHierarchyOfContent() {
    if (this.cardData && this.cardData.hierarchyInfo && this.breadCrumbData) {
      this.cardData.hierarchyInfo.forEach((element) => {
        const contentName = this.breadCrumbData.get(element.identifier);
        this.childPaths.push(contentName);
      });
      this.childPaths.push(this.breadCrumbData.get(this.cardData.identifier));
    }
  }

  isPlayedFromCourse() {
    if (this.cardData.hierarchyInfo && this.cardData.hierarchyInfo.length && this.cardData.hierarchyInfo[0].contentType === 'course') {
      this.shouldOpenPlayAsPopup = true;
    }
  }

  async promptToLogin() {
    if (this.appGlobalService.isUserLoggedIn()) {
      if (this.autoPlayQuizContent) {
        setTimeout(() => {
          this.handleContentPlay(true);
          this.autoPlayQuizContent = false;
        }, 1000);
      }
      return;
    }
    if (this.isLoginPromptOpen) {
      return;
    }

    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
      '', PageId.SIGNIN_POPUP,
      Environment.HOME,
      this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version,
      this.objRollup,
      this.corRelationList);

    this.isLoginPromptOpen = true;
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT'),
        metaInfo: this.commonUtilService.translateMessage('QUIZ_CONTENTS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();

    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.LOGIN_CLICKED,
        Environment.HOME,
        PageId.SIGNIN_POPUP,
        this.telemetryObject,
        undefined,
        this.objRollup,
        this.corRelationList
      );
      this.router.navigate([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
    }
    this.isLoginPromptOpen = false;
  }

  checkLimitedContentSharingFlag(content) {
    this.limitedShareContentFlag = (content && content.contentData &&
      content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED);
    if (this.limitedShareContentFlag) {
      this.content = content;
      this.playingContent = content;
      this.identifier = content.contentId || content.identifier;
      this.telemetryObject = ContentUtil.getTelemetryObject(content);
      this.promptToLogin();
      window['segmentation'].SBTagService.pushTag(
        window['segmentation'].SBTagService.getTags(TagPrefixConstants.CONTENT_ID) ? this.identifier : [this.identifier],
        TagPrefixConstants.CONTENT_ID,
        window['segmentation'].SBTagService.getTags(TagPrefixConstants.CONTENT_ID) ? false : true
      );
    }
  }

  async openPDFPreview(content: Content) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.PRINT_PDF_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );

    let url: string;
    const pdf = ContentUtil.resolvePDFPreview(content);

    const loader: Components.IonLoading = await this.commonUtilService.getLoader();
    await loader.present();

    try {
      if (!pdf.availableLocally) {
        this.fileTransfer = this.transfer.create();
        const entry = await this.fileTransfer
          .download(pdf.url, cordova.file.cacheDirectory + pdf.url.substring(pdf.url.lastIndexOf('/') + 1));
        url = entry.toURL();
      } else {
        url = 'file://' + pdf.url;
      }

      await new Promise<boolean>((resolve, reject) => {
        window.cordova.plugins.printer.canPrintItem(url, (canPrint: boolean) => {
          if (canPrint) {
            window.cordova.plugins.printer.print(url);
            return resolve();
          }

          return reject('Could not print item');
        });
      });
    } catch (e) {
      this.commonUtilService.showToast('ERROR_COULD_NOT_OPEN_FILE');
    } finally {
      await loader.dismiss();
    }
  }

  // pass coursecontext to ratinghandler if course is completed
  async getContentState() {
    return new Promise(async (resolve, reject) => {
      this.courseContext = await this.preferences.getString(PreferenceKey.CONTENT_CONTEXT).toPromise();
      if (this.courseContext) {
        this.courseContext = JSON.parse(this.courseContext);
        if (this.courseContext.courseId && this.courseContext.batchId && this.courseContext.leafNodeIds) {
          const courseDetails: any = await this.localCourseService.getCourseProgress(this.courseContext);
          const progress = courseDetails.progress;
          const contentStatusData = courseDetails.contentStatusData || {};
          if (progress !== 100) {
            this.appGlobalService.showCourseCompletePopup = true;
          }
          if (this.appGlobalService.showCourseCompletePopup && progress === 100) {
            this.appGlobalService.showCourseCompletePopup = false;
            this.showCourseCompletePopup = true;
          }
          this.maxAttemptAssessment = this.localCourseService.fetchAssessmentStatus(contentStatusData, this.cardData);
        }
      }
      resolve();
    });
  }

  async openCourseCompletionPopup() {
    if (this.isCourseCertificateShown) {
      return;
    }
    await this.getContentState();

    if (!this.showCourseCompletePopup) {
      if (this.contentProgressSubscription) {
        this.contentProgressSubscription.unsubscribe();
      }

      this.contentProgressSubscription = this.eventBusService.events(EventNamespace.CONTENT)
          .pipe(
              filter((event) =>
                  event.type === ContentEventType.COURSE_STATE_UPDATED && this.course &&
                  (event as ContentUpdate).payload.contentId === this.course.contentId && this.shouldOpenPlayAsPopup
              ),
              take(1),
              tap(() => this.openCourseCompletionPopup())
          )
          .subscribe();

      return;
    }
    const popUp = await this.popoverCtrl.create({
      component: CourseCompletionPopoverComponent,
      componentProps: {
        isCertified: this.courseContext['isCertified'],
        certificateDescription: await this.fetchCertificateDescription(this.courseContext && this.courseContext.batchId),
        course: this.course ? this.course.content : undefined
      },
      cssClass: 'sb-course-completion-popover',
    });
    this.isCourseCertificateShown = true;
    await popUp.present();
    const { data } = await popUp.onDidDismiss();
    if (data === undefined) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CLOSE_CLICKED,
        PageId.COURSE_COMPLETION_POPUP,
        Environment.HOME
      );
    }
  }

  async fetchCertificateDescription(batchId) {
    if (!batchId) {
      return '';
    }
    try {
      const batchDetails = await this.courseService.getBatchDetails({ batchId }).toPromise();
      for (var key in batchDetails.cert_templates) {
        return (batchDetails && batchDetails.cert_templates[key] &&
          batchDetails.cert_templates[key].description) || '';
      }
    } catch (e) {
      console.log(e);
      return '';
    }

  }

  async openWithVendorApps() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.OPEN_WITH_PLAYER_CLICKED,
        Environment.HOME,
        PageId.CONTENT_DETAIL,
    );
    const popoverElement = await this.popoverCtrl.create({
        component: ShowVendorAppsComponent,
        componentProps: {
          content: this.content,
          appLists: this.appLists
        },
        cssClass: 'sb-popover'
      });

    await popoverElement.present();
  }

  async showDownloadTranscript() {
      const newThemePopover = await this.popoverCtrl.create({
          component: DownloadTranscriptPopupComponent,
          componentProps: {
            contentData: this.content.contentData
          },
          backdropDismiss: false,
          showBackdrop: true,
          cssClass: 'download-transcript-popup'
      });
      newThemePopover.present();
  }

  markContent() {
    const addContentAccessRequest: ContentAccess = {
      status: ContentAccessStatus.PLAYED,
      contentId: this.identifier,
      contentType: this.content.contentType
    };
    const profile: Profile = this.appGlobalService.getCurrentUser();
    this.profileService.addContentAccess(addContentAccessRequest).toPromise().then((data) => {
      if (data) {
        this.events.publish(EventTopics.LAST_ACCESS_ON, true);
      }
    });
    const contentMarkerRequest: ContentMarkerRequest = {
      uid: profile.uid,
      contentId: this.identifier,
      data: JSON.stringify(this.content.contentData),
      marker: MarkerType.PREVIEWED,
      isMarked: true,
      extraInfo: {}
    };
    this.contentService.setContentMarker(contentMarkerRequest).toPromise().then();
  }
}
