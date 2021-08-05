import { TextbookTocService } from './../collection-detail-etb/textbook-toc-service';
import { CommonUtilService } from './../../services/common-util.service';
import {
  Component, Inject, NgZone, OnDestroy,
  ViewChild, ElementRef
} from '@angular/core';
import {
  MimeType,
  RouterLinks, EventTopics
} from '../../app/app.constant';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService } from '../../services/app-global-service.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import find from 'lodash/find';
import each from 'lodash/each';
import { IonContent as iContent, Platform, NavController } from '@ionic/angular';
import {
  ChildContentRequest,
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentImport,
  ContentImportRequest,
  ContentImportResponse,
  ContentMarkerRequest,
  ContentService,
  CorrelationData,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  FrameworkService,
  FrameworkUtilService,
  GetAllProfileRequest,
  MarkerType,
  NetworkError,
  PlayerService,
  Profile,
  ProfileService,
  AuditState,
  TrackingEnabled
} from 'sunbird-sdk';
import { Subscription } from 'rxjs';
import {
  Environment, ImpressionType, InteractSubtype, InteractType,
  PageId, CorReleationDataType, Mode, ObjectType,
  AuditType, ImpressionSubtype
} from '../../services/telemetry-constants';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { File } from '@ionic-native/file/ngx';
import { AppHeaderService } from '../../services/app-header.service';
import { Location } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { Events } from '@app/util/events';
import { RatingHandler } from '@app/services/rating/rating-handler';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { map } from 'rxjs/operators';
import { ContentUtil } from '@app/util/content-util';
import { NavigationService } from '@app/services/navigation-handler.service';
import {ContentInfo} from '@app/services/content/content-info';
declare const cordova;

@Component({
  selector: 'app-qrcoderesult',
  templateUrl: './qrcoderesult.page.html',
  styleUrls: ['./qrcoderesult.page.scss'],
})
export class QrcoderesultPage implements OnDestroy {
  @ViewChild('stickyPillsRef', { static: false }) stickyPillsRef: ElementRef;
  unregisterBackButton: any;
  /**
   * To hold identifier
   */
  identifier: string;

  /**
   * To hold identifier
   */
  searchIdentifier: string;

  /**
   * Show loader while importing content
   */
  showChildrenLoader: boolean;

  /**
   * Contains card data of previous state
   */
  content: any;

  /**
   * Contains Parent Content Details
   */
  parentContent: any;

  /**
   * Contains
   */
  isParentContentAvailable = false;
  profile: Profile;

  corRelationList: Array<CorrelationData>;
  shouldGenerateEndTelemetry = false;
  source = '';
  results: Array<any> = [];
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
  parents: Array<any> = [];
  paths: Array<any> = [];
  categories: Array<any> = [];
  boardList: Array<any> = [];
  mediumList: Array<any> = [];
  gradeList: Array<any> = [];
  isSingleContent = false;
  showLoading: boolean;
  isDownloadStarted: boolean;
  userCount = 0;
  cardData: any;
  downloadProgress: any = 0;
  isUpdateAvailable: boolean;
  eventSubscription: Subscription;
  headerObservable: any;
  navData: any;
  backToPreviusPage = true;
  isProfileUpdated: boolean;
  isQrCodeLinkToContent: any;
  childrenData?: Array<any>;
  stckyUnitTitle?: string;
  stckyParent: any;
  latestParents: Array<any> = [];
  stckyindex: string;
  chapterFirstChildId: string;
  showSheenAnimation = true;
  @ViewChild(iContent, { static: false }) ionContent: iContent;
  onboarding = false;
  dialCode: string;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('PLAYER_SERVICE') private playerService: PlayerService,
    public zone: NgZone,
    public translate: TranslateService,
    public platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService,
    public appGlobalService: AppGlobalService,
    private events: Events,
    public commonUtilService: CommonUtilService,
    private canvasPlayerService: CanvasPlayerService,
    private location: Location,
    private file: File,
    private headerService: AppHeaderService,
    private navService: NavigationService,
    private router: Router,
    private navCtrl: NavController,
    private ratingHandler: RatingHandler,
    private contentPlayerHandler: ContentPlayerHandler,
    private textbookTocService: TextbookTocService
  ) {
    this.getNavData();
  }

  getNavData() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navData = navigation.extras.state;
    }
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillEnter(): void {
    if (this.textbookTocService.textbookIds.unit) {
      this.chapterFirstChildId = '';
      this.getFirstChildOfChapter(this.textbookTocService.textbookIds.unit);
      if (this.chapterFirstChildId) {
        setTimeout(() => {
          if (document.getElementById(this.chapterFirstChildId)) {
            this.ionContent.getScrollElement().then((v) => {
              v.scrollTo({
                top: document.getElementById(this.chapterFirstChildId).offsetTop - 50,
                left: 0,
                behavior: 'smooth'
              });
            });
            this.textbookTocService.resetTextbookIds();
          }
        }, 100);
      }
    }
    this.headerService.hideHeader();
    this.content = this.navData.content;
    this.corRelationList = this.navData.corRelation;
    this.shouldGenerateEndTelemetry = this.navData.shouldGenerateEndTelemetry;
    this.source = this.navData.source;
    this.isSingleContent = this.navData.isSingleContent;
    this.onboarding = this.navData.onboarding;
    this.dialCode = this.navData.dialCode;
    // check for parent content
    this.parentContent = this.navData.parentContent;
    this.isProfileUpdated = this.navData.isProfileUpdated;
    this.searchIdentifier = this.content.identifier;
    this.isQrCodeLinkToContent = this.navData.isQrCodeLinkToContent;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_REQUEST, '',
      PageId.QR_CONTENT_RESULT,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      '', '', '', undefined,
      this.corRelationList
    );

    if (this.parentContent) {
      this.isParentContentAvailable = true;
      this.identifier = this.parentContent.identifier;
    } else {
      this.isParentContentAvailable = false;
      this.identifier = this.content.identifier;
    }
    if (this.backToPreviusPage) {
      if (this.navData.isAvailableLocally) {
        this.getChildContents();
      } else {
        this.telemetryGeneratorService.generatefastLoadingTelemetry(
          InteractSubtype.FAST_LOADING_INITIATED,
          PageId.DIAL_CODE_SCAN_RESULT,
          undefined,
          undefined,
          undefined,
          this.corRelationList
        );
        const getContentHeirarchyRequest: ContentDetailRequest = {
          contentId: this.identifier
        };
        this.contentService.getContentHeirarchy(getContentHeirarchyRequest).toPromise()
          .then((content: Content) => {
            this.showSheenAnimation = false;
            this.childrenData = content.children;
            this.parents.splice(0, this.parents.length);
            this.parents.push(content);
            this.results = [];
            this.findContentNode(content);
            this.telemetryGeneratorService.generatefastLoadingTelemetry(
              InteractSubtype.FAST_LOADING_FINISHED,
              PageId.DIAL_CODE_SCAN_RESULT,
              undefined,
              undefined,
              undefined,
              this.corRelationList
            );
            if (this.results && this.results.length === 1 &&
              !(this.results[0].contentData.trackable && this.results[0].contentData.trackable.enabled === TrackingEnabled.YES)) {
              this.backToPreviusPage = false;
              this.events.unsubscribe(EventTopics.PLAYER_CLOSED);
              this.navCtrl.navigateForward([RouterLinks.CONTENT_DETAILS], {
                state: {
                  content: this.results[0],
                  isSingleContent: this.isSingleContent,
                  resultsSize: this.results.length,
                  corRelation: this.corRelationList,
                  onboarding: this.onboarding,
                  source: this.source
                }
              });
            }
          }).catch((err) => {
            this.showSheenAnimation = false;
          });
      }
      this.backToPreviusPage = false;
    }
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(InteractSubtype.DEVICE_BACK_CLICKED);
      this.unregisterBackButton.unsubscribe();
    });
    this.generateNewImpressionEvent(this.dialCode);
    this.subscribeSdkEvent();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  ionViewDidEnter() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
      PageId.DIAL_CODE_SCAN_RESULT,
      !this.appGlobalService.isProfileSettingsCompleted ? Environment.ONBOARDING : this.appGlobalService.getPageIdForTelemetry());

    if (this.corRelationList && this.corRelationList.length) {
      this.corRelationList.push({
        id: this.content.children ? this.content.children.length.toString() : '0',
        type: CorReleationDataType.COUNT_CONTENT
      });
    }
    this.telemetryGeneratorService.generatePageLoadedTelemetry(
      PageId.QR_CONTENT_RESULT,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      this.content.identifier,
      ObjectType.CONTENT,
      undefined, undefined,
      this.corRelationList
    );

    if (!AppGlobalService.isPlayerLaunched) {
      this.calculateAvailableUserCount();
    }
  }


  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
    this.downloadProgress = 0;
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.textbookTocService.resetTextbookIds();
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  async handleBackButton(clickSource?) {
    this.telemetryGeneratorService.generateBackClickedNewTelemetry(
      clickSource === InteractSubtype.DEVICE_BACK_CLICKED ? true : false,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      PageId.QR_CONTENT_RESULT
    );
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      clickSource || InteractSubtype.NAV_BACK_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT);
    if (this.source === PageId.LIBRARY || this.source === PageId.COURSES || !this.isSingleContent) {
      this.goBack();
    } else if (this.isSingleContent && this.appGlobalService.isProfileSettingsCompleted) {
      if (await this.commonUtilService.isDeviceLocationAvailable()) {
        this.navCtrl.pop();
        const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' }, replaceUrl: true };
        this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
      } else {
        const navigationExtras: NavigationExtras = {
          state: {
            isShowBackButton: false
          }
        };
        this.navCtrl.navigateForward([`/${RouterLinks.DISTRICT_MAPPING}`], navigationExtras);
      }
    } else if (this.appGlobalService.isGuestUser
      && this.isSingleContent
      && !this.appGlobalService.isProfileSettingsCompleted) {
      const navigationExtras: NavigationExtras = {
        state: {
          isCreateNavigationStack: false,
          hideBackButton: true,
          showFrameworkCategoriesMenu: true
        }
      };
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    } else {
      this.goBack();
    }
  }

  getChildContents() {
    this.showSheenAnimation = false;
    const request: ChildContentRequest = { contentId: this.identifier, hierarchyInfo: [] };
    this.profile = this.appGlobalService.getCurrentUser();
    this.contentService.getChildContents(
      request).toPromise()
      .then(async (data: Content) => {
        console.log('getChildContents', data);
        if (data && data.contentData) {
          this.childrenData = data.children;
        }

        this.parents.splice(0, this.parents.length);
        this.parents.push(data);
        this.results = [];
        const contentData = data.contentData;
        this.findContentNode(data);

        if (this.results && this.results.length === 0) {
          this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
            '',
            PageId.DIAL_LINKED_NO_CONTENT,
            Environment.HOME);
          if (this.isProfileUpdated) {
            if (!await this.commonUtilService.isDeviceLocationAvailable()) {
              const navigationExtras: NavigationExtras = {
                state: {
                  isShowBackButton: false
                }
              };
              this.navCtrl.navigateForward([`/${RouterLinks.DISTRICT_MAPPING}`], navigationExtras);
            } else {
              this.navCtrl.navigateBack([RouterLinks.TABS]);
            }
            this.commonUtilService.showContentComingSoonAlert(this.source, data, this.dialCode);
          } else {
            this.commonUtilService.showContentComingSoonAlert(this.source, data, this.dialCode);
            window.history.go(-2);
          }
        } else if (this.results && this.results.length === 1 &&
          !(this.results[0].contentData.trackable && this.results[0].contentData.trackable.enabled === TrackingEnabled.YES)) {
          this.backToPreviusPage = false;
          this.events.unsubscribe(EventTopics.PLAYER_CLOSED);
          this.navCtrl.navigateForward([RouterLinks.CONTENT_DETAILS], {
            state: {
              content: this.results[0],
              isSingleContent: this.isSingleContent,
              resultsSize: this.results.length,
              corRelation: this.corRelationList,
              onboarding: this.onboarding
            }
          });
        }
      })
      .catch((err) => {
        console.log('err1-->', err);
        this.zone.run(() => {
          this.showChildrenLoader = false;
        });
        this.commonUtilService.showContentComingSoonAlert(this.source);
        this.location.back();

      });

  }

  calculateAvailableUserCount() {
    const profileRequest: GetAllProfileRequest = {
      local: true,
      server: false
    };
    this.profileService.getAllProfiles(profileRequest).pipe(
      map((profiles) => profiles.filter((profile) => !!profile.handle))
    ).subscribe(profiles => {
      if (profiles) {
        this.userCount = profiles.length;
      }
      if (this.appGlobalService.isUserLoggedIn()) {
        this.userCount += 1;
      }
    }, () => {
    });
  }

  /**
   * Play content
   */
  playContent(content: Content, isStreaming: boolean, contentInfo?: ContentInfo) {
    const extraInfoMap = { hierarchyInfo: [] };
    if (this.cardData && this.cardData.hierarchyInfo) {
      extraInfoMap.hierarchyInfo = this.cardData.hierarchyInfo;
    }
    const req: ContentMarkerRequest = {
      uid: this.appGlobalService.getCurrentUser().uid,
      contentId: content.identifier,
      data: JSON.stringify(content.contentData),
      marker: MarkerType.PREVIEWED,
      isMarked: true,
      extraInfo: extraInfoMap
    };
    this.contentService.setContentMarker(req).toPromise()
      .then(() => {
      }).catch(() => {
      });
    AppGlobalService.isPlayerLaunched = true;
    const values = new Map();
    values['isStreaming'] = isStreaming;
    const localContentInfo: ContentInfo = {
      telemetryObject: ContentUtil.getTelemetryObject(content),
      rollUp: ContentUtil.generateRollUp(content.hierarchyInfo, content.identifier),
      correlationList: this.corRelationList,
      hierachyInfo: content.hierarchyInfo,
      course: undefined
    };
    this.interactEventForPlayAndDownload(content, true);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      content.isAvailableLocally ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.PLAY_ONLINE,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      ContentUtil.getTelemetryObject(content),
      undefined,
      undefined,
      this.corRelationList);
    this.contentPlayerHandler.launchContentPlayer(content,
        isStreaming,
        false,
        contentInfo ? contentInfo : localContentInfo,
        false,
        false);
  }

  playOnline(content, isStreaming: boolean) {
    const telemetryObject = ContentUtil.getTelemetryObject(content);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject);
    if (content.contentData.streamingUrl && !content.isAvailableLocally) {
      const rollup = ContentUtil.generateRollUp(content.hierarchyInfo, content.identifier);
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SELECT_CARD, '',
        this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
        PageId.QR_CONTENT_RESULT,
        telemetryObject,
        undefined,
        rollup,
        this.corRelationList
      );
      const contentInfo: ContentInfo = {
        telemetryObject,
        rollUp: rollup,
        correlationList: this.corRelationList,
        hierachyInfo: content.hierarchyInfo,
        course: undefined
      };
      this.playContent(content, isStreaming, contentInfo);
    } else {
      this.navigateToDetailsPage(content);
    }
  }

  navigateToDetailsPage(content, paths?, contentIdentifier?) {
    this.interactEventForPlayAndDownload(content, false);
    if (!(content.contentData.downloadUrl) && !paths && ContentUtil.isTrackable(content.contentData) === -1) {
      this.commonUtilService.showToast('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
      return;
    }
    const corRelationList = [...this.corRelationList];
    if (paths && paths.length) {
      const rootId = paths[0].identifier ? paths[0].identifier : '';
      corRelationList.push({
        id: rootId || '',
        type: CorReleationDataType.ROOT_ID
      });
    }
    switch (ContentUtil.isTrackable(content)) {
      case 1:
        this.navService.navigateToTrackableCollection({
          content,
          corRelation: corRelationList
        });
        break;
      case 0:
        if (paths && paths.length && paths.length >= 2) {
          this.textbookTocService.setTextbookIds({ rootUnitId: paths[1].identifier, contentId: contentIdentifier });
        }
        this.navService.navigateToCollection({
          content,
          corRelation: corRelationList
        });
        break;
      case -1:
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          Boolean(content.isAvailableLocally) ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.DOWNLOAD_PLAY_CLICKED,
          !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
          PageId.DIAL_CODE_SCAN_RESULT);
        this.navService.navigateToContent({
          content,
          depth: '1',
          isChildContent: true,
          downloadAndPlay: true,
          corRelation: corRelationList,
          onboarding: this.onboarding,
          source: this.source
        });
        break;
    }
  }

  addElipsesInLongText(msg: string) {
    if (this.commonUtilService.translateMessage(msg).length >= 12) {
      return this.commonUtilService.translateMessage(msg).slice(0, 8) + '....';
    } else {
      return this.commonUtilService.translateMessage(msg);
    }
  }

  setContentDetails(identifier, refreshContentDetails: boolean) {
    const option: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };
    this.contentService.getContentDetails(option).toPromise()
      .then((data: any) => {
        if (data) {
          this.content.contentAccess = data.contentAccess ? data.contentAccess : [];
        }

        this.contentPlayerHandler.setContentPlayerLaunchStatus(false);
        this.ratingHandler.showRatingPopup(false, this.content, 'automatic', this.corRelationList, null);
        this.contentPlayerHandler.setLastPlayedContentId('');
      })
      .catch((error: any) => {
      });
  }

  setGrade(reset, grades) {
    if (reset) {
      this.profile.grade = [];
      this.profile.gradeValue = {};
    }

    each(grades, (grade) => {
      if (grade && this.profile.grade.indexOf(grade) === -1) {
        if (this.profile.grade && this.profile.grade.length) {
          this.profile.grade.push(grade);
        } else {
          this.profile.grade = [grade];
        }
      }
    });
  }

  setMedium(reset, mediums) {
    if (reset) {
      this.profile.medium = [];
    }
    each(mediums, (medium) => {
      if (medium && this.profile.medium.indexOf(medium) === -1) {
        if (this.profile.medium && this.profile.medium.length) {
          this.profile.medium.push(medium);
        } else {
          this.profile.medium = [medium];
        }
      }
    });
  }

  /**
   * categoryList
   * data
   * @param categoryType
   * return the code of board,medium and subject based on Name
   */
  findCode(categoryList: Array<any>, data, categoryType) {
    if (find(categoryList, (category) => category.name === data[categoryType])) {
      return find(categoryList, (category) => category.name === data[categoryType]).code;
    } else {
      return undefined;
    }
  }
  /**
   * Subscribe genie event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(() => {

        if (event.type === DownloadEventType.PROGRESS && event.payload.progress) {
          const downloadEvent = event as DownloadProgress;
          if (downloadEvent.payload.progress === -1) {
            this.downloadProgress = 0;
          } else if (downloadEvent.payload.identifier === this.content.identifier) {
            this.downloadProgress = downloadEvent.payload.progress;
          }

        }
        // Get child content
        // if (res.data && res.data.status === 'IMPORT_COMPLETED' && res.type === 'contentImport') {
        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
          const corRelationList: Array<CorrelationData> = [];
          corRelationList.push({ id: this.dialCode ? this.dialCode : '', type: CorReleationDataType.QR });
          corRelationList.push({
            id: this.content.leafNodesCount ? this.content.leafNodesCount.toString() : '0',
            type: CorReleationDataType.COUNT_NODE
          });
          this.telemetryGeneratorService.generatePageLoadedTelemetry(
            PageId.TEXTBOOK_IMPORT,
            this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
            this.content.identifier,
            ObjectType.TEXTBOOK,
            undefined, undefined,
            corRelationList
          );
          this.showLoading = false;
          this.isDownloadStarted = false;
          this.results = [];
          this.parents = [];
          this.paths = [];
          this.getChildContents();
          this.generateAuditEventForAutoFill();
        }
        // For content update available
        // if (res.data && res.type === 'contentUpdateAvailable' && res.data.identifier === this.identifier) {
        if (event.payload && event.type === ContentEventType.UPDATE && event.payload.contentId === this.identifier) {
          this.zone.run(() => {
            if (this.parentContent) {
              const parentIdentifier = this.parentContent.contentId || this.parentContent.identifier;
              this.showLoading = true;
              this.importContent([parentIdentifier], false);
            }
          });
        }
      });
    }) as any;
  }

  importContent(identifiers: Array<string>, isChild: boolean) {
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    // Call content service
    this.contentService.importContent(contentImportRequest).toPromise()
      .then((data: ContentImportResponse[]) => {
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.isDownloadStarted = false;
          this.showLoading = false;
          if (NetworkError.isInstance(error)) {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
        });
      });
  }

  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    const folderPath = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.externalDataDirectory;
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: folderPath,
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : []
      });
    });

    return requestParams;
  }

  cancelDownload() {
    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.content);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.location.back();

        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.location.back();

        });
      });
  }

  skipSteps() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.NO_QR_CODE_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT
    );
    if ((this.appGlobalService.isOnBoardingCompleted && this.appGlobalService.isProfileSettingsCompleted)
      || !this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {

      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    } else {
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], { state: { showFrameworkCategoriesMenu: true } });
    }
  }
  private showAllChild(content: any) {
    this.zone.run(() => {
      if (content.children === undefined || !content.children.length || ContentUtil.isTrackable(content.contentData) === 1) {
        if (content.mimeType !== MimeType.COLLECTION || ContentUtil.isTrackable(content.contentData) === 1) {
          if (content.contentData.appIcon) {
            if (content.contentData.appIcon.includes('http:') || content.contentData.appIcon.includes('https:')) {
              if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
                content.contentData.appIcon = this.defaultImg;
              }
            } else if (content.basePath) {
              content.contentData.appIcon = content.basePath + '/' + content.contentData.appIcon;
            }
          }
          this.results.push(content);

          const path = [];
          let latestParent = [];
          latestParent = this.parents[this.parents.length - 2];
          this.parents.forEach(ele => {
            path.push(ele);
          });
          path.splice(-1, 1);
          this.paths.push(path);
          this.latestParents.push(latestParent);
        }
        return;
      }
      content.children.forEach(child => {
        this.parents.push(child);
        this.showAllChild(child);
        this.parents.splice(-1, 1);
      });
    });
  }

  private findContentNode(data: any) {
    if (data && data.identifier === this.searchIdentifier) {
      this.showAllChild(data);
      return true;
    }

    if (data && data.children !== undefined) {
      data.children.forEach(child => {
        this.parents.push(child);
        const isFound = this.findContentNode(child);

        if (isFound === true) {
          return true;
        }
        this.parents.splice(-1, 1);
      });
    }

    return false;
  }

  handleHeaderEvents($event) {
    if($event.name === 'back'){
      this.handleBackButton(InteractSubtype.NAV_BACK_CLICKED);
    }
  }

  goBack() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(
      PageId.DIAL_CODE_SCAN_RESULT, Environment.HOME,
      true, this.content.identifier, this.corRelationList);
    if (this.isQrCodeLinkToContent) {
      window.history.go(-2);
    } else {
      this.location.back();
    }
  }

  openTextbookToc() {
    this.navService.navigateTo([`/${RouterLinks.COLLECTION_DETAIL_ETB}/${RouterLinks.TEXTBOOK_TOC}`], {
      childrenData: this.childrenData, parentId: this.identifier,
      stckyUnitTitle: this.stckyUnitTitle, stckyindex: this.stckyindex,
      latestParentNodes: this.latestParents
    });
    const values = new Map();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DROPDOWN_CLICKED,
      Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      undefined,
      values
    );
  }

  onScroll(event) {
    const titles = document.querySelectorAll('[data-sticky-unit]');
    const currentTitle = Array.from(titles).filter((title) => {
      return title.getBoundingClientRect().top < 200;
    }).slice(-1)[0];

    if (currentTitle) {
      this.zone.run(() => {
        this.stckyUnitTitle = currentTitle.getAttribute('data-sticky-unit');
        this.stckyindex = currentTitle.getAttribute('data-index');
        this.stckyParent = this.latestParents[this.stckyindex].contentData.name;
      });
    }

    if (event.scrollTop >= 205) {
      (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.add('sticky');
      return;
    }

    (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.remove('sticky');
  }

  // when coming back from toc page it has to scroll to the firstcontent of the selected chapter
  getFirstChildOfChapter(unit) {
    if (!this.chapterFirstChildId) {
      if (unit.children === undefined) {
        if (unit.mimeType !== MimeType.COLLECTION) {
          this.chapterFirstChildId = unit.identifier;
        }
        return;
      }
      unit.children.forEach(child => {
        this.getFirstChildOfChapter(child);
      });
    }
  }

  private interactEventForPlayAndDownload(content, play) {
    const telemetryObject = ContentUtil.getTelemetryObject(content);
    if (this.corRelationList && this.corRelationList.length) {
      this.corRelationList.push({ id: Mode.PLAY, type: CorReleationDataType.MODE });
      this.corRelationList.push({ id: telemetryObject.type || '', type: CorReleationDataType.TYPE });
      this.corRelationList.push({
        id: this.commonUtilService.networkInfo.isNetworkAvailable ?
          Mode.ONLINE : Mode.OFFLINE, type: InteractSubtype.NETWORK_STATUS
      });
    }
    const rollup = ContentUtil.generateRollUp(content.hierarchyInfo, content.identifier);
    this.telemetryGeneratorService.generateInteractTelemetry(
      play ? InteractType.PLAY : InteractType.DOWNLOAD,
      undefined,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      PageId.QR_CONTENT_RESULT,
      telemetryObject,
      undefined,
      rollup,
      this.corRelationList
    );
  }

  generateNewImpressionEvent(dialcode?) {
    const corRelationList: Array<CorrelationData> = [];
    if (dialcode) {
      corRelationList.push({ id: dialcode, type: CorReleationDataType.QR });
    }
    this.telemetryGeneratorService.generateImpressionTelemetry(
      dialcode ? ImpressionType.PAGE_REQUEST : InteractType.PLAY,
      dialcode ? '' : InteractSubtype.DOWNLOAD,
      dialcode ? PageId.TEXTBOOK_IMPORT : PageId.QR_CONTENT_RESULT,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      dialcode ? this.content.identifier : undefined,
      dialcode ? ObjectType.TEXTBOOK : undefined,
      undefined, undefined,
      dialcode ? corRelationList : undefined
    );
  }

  private generateAuditEventForAutoFill() {
    if (this.source === PageId.ONBOARDING_PROFILE_PREFERENCES && this.appGlobalService.isOnBoardingCompleted) {
      let correlationlist: Array<CorrelationData> = this.populateCData(this.profile.board, CorReleationDataType.BOARD);
      correlationlist = correlationlist.concat(this.populateCData(this.profile.medium, CorReleationDataType.MEDIUM));
      correlationlist = correlationlist.concat(this.populateCData(this.profile.grade, CorReleationDataType.CLASS));
      correlationlist.push({ id: ImpressionSubtype.AUTO, type: CorReleationDataType.FILL_MODE });
      const rollup = ContentUtil.generateRollUp(this.content.hierarchyInfo, this.content.identifier);
      this.telemetryGeneratorService.generateAuditTelemetry(
        Environment.ONBOARDING,
        AuditState.AUDIT_UPDATED,
        undefined,
        AuditType.SET_PROFILE,
        undefined,
        undefined,
        undefined,
        correlationlist,
        rollup
      );
    }
  }

  private populateCData(formControllerValues, correlationType): Array<CorrelationData> {
    const correlationList: Array<CorrelationData> = [];
    if (formControllerValues) {
      formControllerValues.forEach((value) => {
        correlationList.push({
          id: value,
          type: correlationType
        });
      });
    }
    return correlationList;
  }
}
