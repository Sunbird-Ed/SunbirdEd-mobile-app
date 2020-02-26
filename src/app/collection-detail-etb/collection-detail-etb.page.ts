import { TextbookTocService } from './textbook-toc-service';
import {
  Component, Inject, NgZone, OnInit, ViewChild, ViewEncapsulation, QueryList, ViewChildren,
  ElementRef, ChangeDetectorRef
} from '@angular/core';
import isObject from 'lodash/isObject';
import forEach from 'lodash/forEach';
import { TranslateService } from '@ngx-translate/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { IonContent as iContent } from '@ionic/angular';
import {
  Events, NavController, Platform, PopoverController,
} from '@ionic/angular';
import {
  Content, ContentAccess, ContentAccessStatus, ContentDeleteStatus, ContentDetailRequest, ContentEventType,
  ContentImport, ContentImportCompleted, ContentImportRequest,
  ContentImportResponse, ContentImportStatus, ContentMarkerRequest, ContentService, ContentUpdate, CorrelationData,
  DownloadEventType, DownloadProgress, EventsBusEvent, EventsBusService, MarkerType, Profile, ProfileService,
  ProfileType, Rollup, StorageService, TelemetryErrorCode, TelemetryObject
} from 'sunbird-sdk';
import {
  Environment, ErrorType, ImpressionType, InteractSubtype, InteractType, Mode, PageId, ID
} from '../../services/telemetry-constants';
import { Subscription } from 'rxjs';
import {ContentType, EventTopics, MimeType, RouterLinks, ShareItemType} from '../../app/app.constant';
import { AppGlobalService, AppHeaderService, CommonUtilService,
  CourseUtilService, TelemetryGeneratorService, UtilityService} from '../../services';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { ComingSoonMessageService } from 'services/coming-soon-message.service';
import { Location } from '@angular/common';

import {
  SbPopoverComponent
} from '../components/popups/sb-popover/sb-popover.component';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';

import {
  ConfirmAlertComponent, ContentRatingAlertComponent
} from '../components';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { tap } from 'rxjs/operators';
import {ContentPlayerHandler} from '@app/services/content/player/content-player-handler';
import {RatingHandler} from '@app/services/rating/rating-handler';
import {ContentInfo} from '@app/services/content/content-info';
declare const cordova;

@Component({
  selector: 'app-collection-detail-etb',
  templateUrl: './collection-detail-etb.page.html',
  styleUrls: ['./collection-detail-etb.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CollectionDetailEtbPage implements OnInit {

  @ViewChildren('filteredItems') public filteredItemsQueryList: QueryList<any>;

  facets: any;
  selected: boolean;
  isSelected: boolean;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };

  contentDetail?: Content;
  childrenData?: Array<any>;
  mimeTypes = [
    { name: 'ALL', selected: true, value: ['all'], iconNormal: '', iconActive: '' },
    {
      name: 'VIDEOS', value: ['video/mp4', 'video/x-youtube', 'video/webm'], iconNormal: './assets/imgs/play.svg',
      iconActive: './assets/imgs/play-active.svg'
    },
    {
      name: 'DOCS', value: ['application/pdf', 'application/epub', 'application/msword'], iconNormal: './assets/imgs/doc.svg',
      iconActive: './assets/imgs/doc-active.svg'
    },
    {
      name: 'INTERACTION',
      value: ['application/vnd.ekstep.ecml-archive', 'application/vnd.ekstep.h5p-archive', 'application/vnd.ekstep.html-archive'],
      iconNormal: './assets/imgs/touch.svg', iconActive: './assets/imgs/touch-active.svg'
    },
    // { name: 'AUDIOS', value: MimeType.AUDIO, iconNormal: './assets/imgs/audio.svg', iconActive: './assets/imgs/audio-active.svg'},
  ];
  activeMimeTypeFilter = ['all'];
  /**
   * Show loader while importing content
   */
  showChildrenLoader: boolean;

  /**
   * Contains card data of previous state
   */
  cardData: any;

  /**
   * Contains Parent Content Details
   */
  parentContent: any;

  /**
   * To hold identifier
   */
  identifier: string;

  /**
   * Contains child content import / download progress
   */
  downloadProgress: any;

  /**
   * To get course structure keys
   */
  objectKeys = Object.keys;

  /**
   * Contains
   */
  showDownloadBtn = false;

  /**
   * Flag downlaoded started
   */
  isDownloadStarted = false;

  /**
   * Contains current course depth
   */
  depth = '1';

  /**
   * Its get true when child is collection.
   * Used to show content depth
   *
   * @example 1.1 Collection 1
   */
  isDepthChild = false;

  /**
   * To hold content identifiers
   */
  queuedIdentifiers: Array<any> = [];

  faultyIdentifiers: Array<any> = [];

  /**
   * Download complete falg
   */
  isDownloadCompleted = false;

  /**
   * Total download count
   */
  totalDownload: number;

  /**
   * Current download count
   */
  currentCount = 0;

  /**
   * Contains identifier(s) of locally not available content(s)
   */
  downloadIdentifiers: Set<string> = new Set();

  /**
   * Child content size
   */
  downloadSize = 0;
  showCredits = false;

  /**
   * Contains total size of locally not available content(s)
   */
  downloadContentsSize: string;
  downloadPercentage: number;
  objId;
  objType;
  objVer;
  public showLoading = false;

  /**
   * Needed to handle collection auto update workflow
   */
  isUpdateAvailable = false;

  /**
   * To hold rating data
   */
  userRating = 0;
  isAlreadyEnrolled = false;
  /** sets true , if it comes from courses */
  fromCoursesPage = false;
  /**
   * Rating comment
   */
  ratingComment = '';
  // defaultIcon
  defaultAppIcon: string;

  localResourseCount: number;
  /**
   * Telemetry roll up object
   */
  public objRollup: Rollup;
  public didViewLoad: boolean;
  public backButtonFunc: Subscription;
  public baseUrl = '';
  guestUser = false;
  profileType = '';
  public corRelationList: Array<CorrelationData>;
  public shouldGenerateEndTelemetry = false;
  public source = '';
  isChildClickable = false;
  shownGroup = null;
  content: any;
  data: any;
  isChild = false;
  contentId: string;
  batchDetails: any;
  pageName: any;
  headerObservable: any;
  breadCrumb = new Map();
  scrollPosition = 0;
  currentFilter = 'ALL';
  localImage = '';
  appName: any;
  @ViewChild(iContent) ionContent: iContent;
  @ViewChild('stickyPillsRef') stickyPillsRef: ElementRef;
  private eventSubscription: Subscription;

  showDownload: boolean;
  contentTypesCount: any;
  stateData: any;
  stckyUnitTitle?: string;
  isChapterVisible = false;
  shouldPillsStick = false;
  importProgressMessage: string;
  showSheenAnimation = true;

  public telemetryObject: TelemetryObject;
  public rollUpMap: { [key: string]: Rollup } = {};
  _licenseDetails: any;
  get licenseDetails() {
    return this._licenseDetails;
  }
  set licenseDetails(val) {
    if (!this._licenseDetails && val) {
      this._licenseDetails = val;
    }
  }
  private previousHeaderBottomOffset?: number;
  lastContentPlayed: string;
  isContentPlayed = false;
  playingContent: Content;
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private navCtrl: NavController,
    private zone: NgZone,
    private events: Events,
    private popoverCtrl: PopoverController,
    private platform: Platform,
    private translate: TranslateService,
    private social: SocialSharing,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private courseUtilService: CourseUtilService,
    private utilityService: UtilityService,
    private fileSizePipe: FileSizePipe,
    private headerService: AppHeaderService,
    private comingSoonMessageService: ComingSoonMessageService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef,
    private textbookTocService: TextbookTocService,
    private contentPlayerHandler: ContentPlayerHandler,
    private ratingHandler: RatingHandler
  ) {
    this.objRollup = new Rollup();
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
    const extras = this.router.getCurrentNavigation().extras.state;

    if (extras) {
      this.content = extras.content;
      this.data = extras.data;
      this.cardData = extras.content;
      this.batchDetails = extras.batchDetails;
      this.pageName = extras.pageName;
      this.depth = extras.depth;
      this.corRelationList = extras.corRelation;
      this.shouldGenerateEndTelemetry = extras.shouldGenerateEndTelemetry;
      this.source = extras.source;
      this.fromCoursesPage = extras.fromCoursesPage;
      this.isAlreadyEnrolled = extras.isAlreadyEnrolled;
      this.isChildClickable = extras.isChildClickable;
      this.facets = extras.facets;
      this.telemetryObject = ContentUtil.getTelemetryObject(extras.content);
      // check for parent content
      this.parentContent = extras.parentContent;

      // check for parent content
      if (this.depth) {
        this.showDownloadBtn = false;
        this.isDepthChild = true;
      } else {
        this.isDepthChild = false;
      }
      this.identifier = this.cardData.contentId || this.cardData.identifier;
    }
  }

  /**
	  * Angular life cycle hooks
	  */
  ngOnInit() {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
    window['scrollWindow'] = this.ionContent;
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillEnter() {
    this.registerDeviceBackButton();
    this.zone.run(() => {
      this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
        this.handleHeaderEvents(eventName);
      });
      this.headerConfig = this.headerService.getDefaultPageConfig();
      this.headerConfig.actionButtons = ['download'];
      this.headerConfig.showHeader = false;
      this.headerConfig.showBurgerMenu = false;
      this.headerService.updatePageConfig(this.headerConfig);
      this.resetVariables();
      this.shownGroup = null;

      if (!this.didViewLoad) {
        this.generateRollUp();
        const contentType = this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType;
        this.objType = contentType;
        this.generateStartEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
        this.generateImpressionEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
        this.markContent();
      }

      this.didViewLoad = true;
      this.setContentDetails(this.identifier, true);
      this.events.subscribe(EventTopics.CONTENT_TO_PLAY, (data) => {
        this.playContent(data);
      });
      this.subscribeSdkEvent();
    });
    this.ionContent.ionScroll.subscribe((event) => {
      this.scrollPosition = event.scrollTop;
    });
  }

  openBrowser(url) {
    this.commonUtilService.openUrlInBrowser(url);
  }

  markContent() {
    const addContentAccessRequest: ContentAccess = {
      status: ContentAccessStatus.PLAYED,
      contentId: this.identifier,
      contentType: this.content.contentType
    };
    const profile: Profile = this.appGlobalService.getCurrentUser();
    this.profileService.addContentAccess(addContentAccessRequest).toPromise().then();
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


  // toggle the card
  toggleGroup(group, content, openCarousel?) {
    let isCollapsed = true;
    if (!openCarousel && this.isGroupShown(group)) {
      isCollapsed = false;
      this.shownGroup = null;
    } else {
      isCollapsed = false;
      this.shownGroup = group;
      setTimeout(() => {
        if (document.getElementById(content.identifier)) {
          window['scrollWindow'].getScrollElement()
            .scrollTo({
              top: document.getElementById(content.identifier).offsetTop - 165,
              left: 0,
              behavior: 'smooth'
            });
        }
      }, 100);
    }
    const values = new Map();
    values['isCollapsed'] = isCollapsed;

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UNIT_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      values,
      this.objRollup,
      this.corRelationList
    );
  }

  // to check whether the card is toggled or not
  isGroupShown(group) {
    return this.shownGroup === group;
  }

  changeValue(event, text) {
    if (!text) {
      this.isSelected = false;
    } else {
      this.isSelected = true;
    }
  }

  handleBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);

    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
    }
    this.location.back();
  }

  registerDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
        false, this.cardData.identifier, this.corRelationList);
      this.handleBackButton();
    });
  }

  /**
   * Function to rate content
   */
  async rateContent() {
    if (!this.guestUser) {
      if (this.contentDetail.isAvailableLocally) {
        const popUp = await this.popoverCtrl.create({
          component: ContentRatingAlertComponent,
          componentProps: {
            content: this.contentDetail,
            rating: this.userRating,
            comment: this.ratingComment,
            pageId: PageId.COLLECTION_DETAIL,
          },
          cssClass: 'content-rating-alert'
        });
        await popUp.present();
        const { data } = await popUp.onDidDismiss();
        if (data && data.message === 'rating.success') {
          this.userRating = data.rating;
          this.ratingComment = data.comment;
        }
      } else {
        this.commonUtilService.showToast('TRY_BEFORE_RATING');
      }
    } else {
      if (this.profileType === ProfileType.TEACHER) {
        this.commonUtilService.showToast('SIGNIN_TO_USE_FEATURE');
      }
    }
  }

  /**
   * Get the session to know if the user is logged-in or guest
   */
  checkLoggedInOrGuestUser() {
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
  }

  checkCurrentUserType() {
    if (this.guestUser) {
      this.appGlobalService.getGuestUserInfo()
        .then((userType) => {
          this.profileType = userType;
        })
        .catch((error) => {
          console.error('Error Occurred', error);
          this.profileType = '';
        });
    }
  }

  /**
   * To set content details in local variable
   * @param identifier identifier of content / course
   */
  async setContentDetails(identifier, refreshContentDetails: boolean) {
    const option: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };
    this.contentService.getContentDetails(option).toPromise()
      .then((data: Content) => {
        if (data) {
          this.licenseDetails = data.contentData.licenseDetails || this.licenseDetails;
          if (!data.isAvailableLocally) {
            this.contentDetail = data;
            this.generatefastLoadingTelemetry(InteractSubtype.FAST_LOADING_OF_TEXTBOOK_INITIATED);
            this.contentService.getContentHeirarchy(option).toPromise()
                .then((content: Content) => {
                  this.childrenData = content.children;
                  this.showSheenAnimation = false;
                  this.toggleGroup(0, this.content);
                  this.generatefastLoadingTelemetry(InteractSubtype.FAST_LOADING_OF_TEXTBOOK_FINISHED);
                }).catch((err) => {
              this.showSheenAnimation = false;
            });
            this.importContentInBackground([this.identifier], false);
          } else {
            this.showSheenAnimation = false;
            this.extractApiResponse(data);
          }
        }
      }).catch((error) => {
      console.log('error while loading content details', error);
      this.showSheenAnimation = false;
      this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      this.location.back();
    });
  }

  showLicensce() {
    this.showCredits = !this.showCredits;

    if (this.showCredits) {
      this.licenseSectionClicked('expanded');
    } else {
      this.licenseSectionClicked('collapsed');
    }
  }

  async showCommingSoonPopup(childData: any) {
    const message = await this.comingSoonMessageService.getComingSoonMessage(childData);
    if (childData.contentData.mimeType === MimeType.COLLECTION && !childData.children) {
      const popover = await this.popoverCtrl.create({
        component: SbGenericPopoverComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('CONTENT_COMMING_SOON'),
          sbPopoverMainTitle: message ? this.commonUtilService.translateMessage(message) :
            this.commonUtilService.translateMessage('CONTENT_IS_BEEING_ADDED') + childData.contentData.name,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('OKAY'),
              btnClass: 'popover-color'
            }
          ],
        },
        cssClass: 'sb-popover warning',
      });
      popover.present();
    }
  }

  /**
   * Function to extract api response.
   */
  extractApiResponse(data: Content) {
    this.contentDetail = data;
    // this.contentDetail.isAvailableLocally = data.isAvailableLocally;

    if (this.contentDetail.contentData.appIcon) {
      if (this.contentDetail.contentData.appIcon.includes('http:') || this.contentDetail.contentData.appIcon.includes('https:')) {
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.contentDetail.contentData.appIcon = this.contentDetail.contentData.appIcon;
        } else {
          this.contentDetail.contentData.appIcon = this.defaultAppIcon;
        }
      } else if (data.basePath) {
        this.localImage = data.basePath + '/' + this.contentDetail.contentData.appIcon;
      }
    }
    this.objId = this.contentDetail.identifier;
    this.objVer = this.contentDetail.contentData.pkgVersion;
    if (this.contentDetail.contentData.gradeLevel && this.contentDetail.contentData.gradeLevel.length) {
      this.contentDetail.contentData.gradeLevel ? this.contentDetail.contentData.gradeLevel.join(', ') : '';
    }
    if (this.contentDetail.contentData.attributions && this.contentDetail.contentData.attributions.length) {
      this.contentDetail.contentData.attributions ? this.contentDetail.contentData.attributions.join(', ') : '';
    }

    // User Rating
    const contentFeedback: any = data.contentFeedback ? data.contentFeedback : [];
    if (contentFeedback !== undefined && contentFeedback.length !== 0) {
      this.userRating = contentFeedback[0].rating;
      this.ratingComment = contentFeedback[0].comments;
    }


    if (Boolean(data.isAvailableLocally)) {
      this.showLoading = false;
      this.refreshHeader();
      if (data.isUpdateAvailable && !this.isUpdateAvailable) {
        this.isUpdateAvailable = true;
        this.showLoading = true;
        this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.contentDetail, false);
        this.importContent([this.identifier], false);
      } else {
        this.isUpdateAvailable = false;
        this.setChildContents();
      }
    } else {
      this.showLoading = true;
      this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.contentDetail, true);
      this.importContent([this.identifier], false);
    }

    if (this.contentDetail.contentData.me_totalDownloads) {
      this.contentDetail.contentData.me_totalDownloads = this.contentDetail.contentData.me_totalDownloads.split('.')[0];
    }
    this.setCollectionStructure();
  }

  setCollectionStructure() {
    this.showChildrenLoader = true;
    if (this.contentDetail.contentData.contentTypesCount) {
      if (!isObject(this.contentDetail.contentData.contentTypesCount)) {
        this.contentTypesCount = JSON.parse(this.contentDetail.contentData.contentTypesCount);
      } else {
        this.contentTypesCount = this.contentDetail.contentData.contentTypesCount;
      }
      // this.contentDetail.contentData.contentTypesCount = JSON.parse(this.contentDetail.contentData.contentTypesCount);
    } else if (this.cardData.contentTypesCount) {
      if (!isObject(this.cardData.contentTypesCount)) {
        this.contentTypesCount = JSON.parse(this.cardData.contentTypesCount);
        // this.contentDetail.contentData.contentTypesCount = JSON.parse(this.cardData.contentTypesCount);
      }
    } /*else {
      this.contentDetail.contentTypesCount;
    }*/
  }

  generateRollUp() {
    const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
    if (hierarchyInfo === null) {
      this.objRollup.l1 = this.identifier;
    } else {
      forEach(hierarchyInfo, (value, key) => {
        switch (key) {
          case 0:
            this.objRollup.l1 = value.identifier;
            break;
          case 1:
            this.objRollup.l2 = value.identifier;
            break;
          case 2:
            this.objRollup.l3 = value.identifier;
            break;
          case 3:
            this.objRollup.l4 = value.identifier;
            break;
        }
      });
    }
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams: ContentImport[] = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath(),
        contentId: value,
        correlationData: this.corRelationList ? this.corRelationList : [],
        rollUp: this.rollUpMap[value]
      });
    });

    return requestParams;
  }

  /**
   * Function to get import content api request params
   *
   * @param  identifiers contains list of content identifier(s)
   */
  importContent(identifiers: Array<string>, isChild: boolean, isDownloadAllClicked?) {
    if (this.showLoading && !this.isDownloadStarted) {
      this.headerService.hideHeader();
    }
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel'],
    };
    // Call content service
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (data && data.length && this.isDownloadStarted) {
            data.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.queuedIdentifiers.push(value.identifier);
              } else if (value.status === ContentImportStatus.NOT_FOUND) {
                this.faultyIdentifiers.push(value.identifier);
              }
            });

            if (isDownloadAllClicked) {
              this.telemetryGeneratorService.generateDownloadAllClickTelemetry(
                PageId.COLLECTION_DETAIL,
                this.contentDetail,
                this.queuedIdentifiers,
                identifiers.length
              );
            }

            if (this.queuedIdentifiers.length === 0) {
              if (this.isDownloadStarted) {
                this.showDownloadBtn = true;
                this.isDownloadStarted = false;
                this.showLoading = false;
                this.refreshHeader();
              }
            }
            if (this.faultyIdentifiers.length > 0) {
              const stackTrace: any = {};
              stackTrace.parentIdentifier = this.cardData.identifier;
              stackTrace.faultyIdentifiers = this.faultyIdentifiers;
              this.telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
                TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                ErrorType.SYSTEM,
                PageId.COLLECTION_DETAIL,
                JSON.stringify(stackTrace),
              );
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
          } else if (data && data[0].status === ContentImportStatus.NOT_FOUND) {
            this.showLoading = false;
            this.refreshHeader();
            this.showChildrenLoader = false;
            this.childrenData.length = 0;
          }
        });
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.showDownloadBtn = true;
          this.isDownloadStarted = false;
          this.showLoading = false;
          this.refreshHeader();
          if (Boolean(this.isUpdateAvailable)) {
            this.setChildContents();
          } else {
            if (error && (error.error === 'NETWORK_ERROR' || error.error === 'CONNECTION_ERROR')) {
              this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
            } else {
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
            this.showChildrenLoader = false;
            this.location.back();
          }
        });
      });
  }

  /**
   * Function to set child contents
   */
  setChildContents() {
    this.showChildrenLoader = true;
    const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
    const option = { contentId: this.identifier, hierarchyInfo }; // TODO: remove level
    this.contentService.getChildContents(option).toPromise()
      .then((data: Content) => {
        this.zone.run(() => {
          // console.log('data setChildContents', data);
          if (data && data.children) {
            this.breadCrumb.set(data.identifier, data.contentData.name);
            if (this.textbookTocService.textbookIds.rootUnitId && this.activeMimeTypeFilter !== ['all']) {
              this.onFilterMimeTypeChange(this.mimeTypes[0].value, 0, this.mimeTypes[0].name);
            }
            this.childrenData = data.children;
            this.changeDetectionRef.detectChanges();
          }

          if (!this.isDepthChild) {
            this.downloadSize = 0;
            this.localResourseCount = 0;
            this.getContentsSize(data.children || []);
          }
          this.showChildrenLoader = false;
          const divElement = this.filteredItemsQueryList.find((f) => f.nativeElement.id);
          let carouselIndex = this.childrenData
            .findIndex((d: Content) => {
              return divElement.nativeElement.id === d.identifier;
            });
          if (this.textbookTocService.textbookIds.rootUnitId) {
            carouselIndex = this.childrenData.findIndex((content) => this.textbookTocService.textbookIds.rootUnitId === content.identifier);
            // carouselIndex = carouselIndex > 0 ? carouselIndex : 0;
          }
          this.toggleGroup(carouselIndex, this.content, true);
          if (this.textbookTocService.textbookIds.contentId) {
            setTimeout(() => {
              (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.add('sticky');
              window['scrollWindow'].getScrollElement().then((v) => {
                document.getElementById(this.textbookTocService.textbookIds.contentId).scrollIntoView({behavior: 'smooth'});
                this.textbookTocService.resetTextbookIds();
              });
            }, 0);
          }

          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.IMPORT_COMPLETED,
            Environment.HOME,
            PageId.COLLECTION_DETAIL,
            this.telemetryObject,
            undefined,
            this.objRollup,
            this.corRelationList
          );
        });
      })
      .catch(() => {
        this.zone.run(() => {
          this.showChildrenLoader = false;
        });
      });
    // this.ionContent.scrollTo(0, this.scrollPosition);
  }

  getContentsSize(data) {
    data.forEach((value) => {
      this.breadCrumb.set(value.identifier, value.contentData.name);
      if (value.contentData.size) {
        this.downloadSize += Number(value.contentData.size);
      }
      if (!value.children) {
        if (value.isAvailableLocally) {
          this.localResourseCount++;
        }
      }

      if (value.children) {
        this.getContentsSize(value.children);
      }
      if (value.isAvailableLocally === false) {
        this.downloadIdentifiers.add(value.contentData.identifier);
        this.rollUpMap[value.contentData.identifier] = ContentUtil.generateRollUp(value.hierarchyInfo, undefined);
      }

    });
    if (this.downloadIdentifiers.size && !this.isDownloadCompleted) {
      this.showDownloadBtn = true;
    }
  }


  navigateToDetailsPage(content: any, depth) {
    this.zone.run(() => {
      if (content.contentType === ContentType.COURSE) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
          state: {
            content,
            depth,
            contentState: this.stateData,
            corRelation: this.corRelationList
          }
        });
      } else if (content.mimeType === MimeType.COLLECTION) {
        this.isDepthChild = true;
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
          state: {
            content,
            depth,
            contentState: this.stateData,
            corRelation: this.corRelationList
          }
        });
      } else {
        this.router.navigate([RouterLinks.CONTENT_DETAILS], {
          state: {
            content,
            depth,
            contentState: this.stateData,
            corRelation: this.corRelationList
          }
        });
      }
    });
  }

  navigateToContentPage(content: any, depth) {
    this.router.navigate([RouterLinks.CONTENT_DETAILS], {
      state: {
        isChildContent: true,
        content,
        depth,
        contentState: this.stateData,
        corRelation: this.corRelationList,
        breadCrumb: this.breadCrumb
      }
    });
  }

  /**
   * Reset all values
   */
  resetVariables() {
    this.isDownloadStarted = false;
    this.showLoading = false;
    this.refreshHeader();
    this.downloadProgress = 0;
    this.cardData = '';
    this.childrenData;
    this.contentDetail = undefined;
    this.showDownload = false;
    this.showDownloadBtn = false;
    this.downloadIdentifiers = new Set();
    this.queuedIdentifiers = [];
    this.isDownloadCompleted = false;
    this.currentCount = 0;
    this.downloadPercentage = 0;
    this.isUpdateAvailable = false;
  }

  /**
   * Subscribe Sunbird-SDK event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(() => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;

          if (downloadEvent.payload.identifier === this.contentDetail.identifier) {
            this.downloadProgress = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
            if (this.downloadProgress === 100) {
              this.showLoading = false;
              this.refreshHeader();
              this.contentDetail.isAvailableLocally = true;
            }
          }
        }

        if (event.payload && event.type === ContentEventType.SERVER_CONTENT_DATA) {
          this.licenseDetails = event.payload.licenseDetails;
      }

        // Get child content
        if (event.type === ContentEventType.CONTENT_EXTRACT_COMPLETED) {
          const contentImportedEvent = event as ContentImportCompleted;

          if (this.queuedIdentifiers.length && this.isDownloadStarted) {
            if (this.queuedIdentifiers.includes(contentImportedEvent.payload.contentId)) {
              this.currentCount++;
              this.downloadPercentage = +((this.currentCount / this.queuedIdentifiers.length) * (100)).toFixed(0);
            }
            if (this.queuedIdentifiers.length === this.currentCount) {
              this.showLoading = false;
              this.refreshHeader();
              this.isDownloadStarted = false;
              this.showDownloadBtn = false;
              this.isDownloadCompleted = true;
              this.showDownload = false;
              this.contentDetail.isAvailableLocally = true;
              this.downloadPercentage = 0;
              this.updateSavedResources();
              this.setChildContents();
            }
          } else if (this.parentContent && contentImportedEvent.payload.contentId === this.contentDetail.identifier) {
            // this condition is for when the child content update is available and we have downloaded parent content
            // but we have to refresh only the child content.
            this.showLoading = false;
            this.refreshHeader();
            this.setContentDetails(this.identifier, false);
          } else {
            if (this.isUpdateAvailable && contentImportedEvent.payload.contentId === this.contentDetail.identifier) {
              this.showLoading = false;
              this.refreshHeader();
              this.setContentDetails(this.identifier, false);
            } else {
              if (contentImportedEvent.payload.contentId === this.contentDetail.identifier) {
                this.showLoading = false;
                this.refreshHeader();
                this.updateSavedResources();
                this.setChildContents();
                // this.downloadSize = 0;
                // this.localResourseCount = 0;
                // this.getContentsSize(this.childrenData || []);
                this.contentDetail.isAvailableLocally = true;
              }

            }
          }
        }

        if (event.type === ContentEventType.IMPORT_PROGRESS) {
          const totalCountMsg = Math.floor((event.payload.currentCount / event.payload.totalCount) * 100) +
            '% (' + event.payload.currentCount + ' / ' + event.payload.totalCount + ')';
          this.importProgressMessage = this.commonUtilService.translateMessage('EXTRACTING_CONTENT', totalCountMsg);
          if (event.payload.currentCount === event.payload.totalCount) {
            let timer = 30;
            const interval = setInterval(() => {
              this.importProgressMessage = `Getting things ready in ${timer--}  seconds`;
              if (timer === 0) {
                this.importProgressMessage = 'Getting things ready';
                clearInterval(interval);
              }
            }, 1000);
          }
        }

        // For content update available
        const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
        const contentUpdateEvent = event as ContentUpdate;
        if (contentUpdateEvent.type === ContentEventType.UPDATE && hierarchyInfo === null) {
          this.zone.run(() => {
            if (this.parentContent) {
              const parentIdentifier = this.parentContent.contentId || this.parentContent.identifier;
              this.showLoading = true;
              this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.contentDetail, false);
              this.importContent([parentIdentifier], false);
            } else {
              this.setContentDetails(this.identifier, false);
            }
          });
        }
      });
    }) as any;
  }

  updateSavedResources() {
    this.events.publish('savedResources:update', {
      update: true
    });
  }

  async share() {
    // this.contentShareHandler.shareContent(this.contentDetail, this.corRelationList, this.objRollup);
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.contentDetail,
        corRelationList: this.corRelationList,
        objRollup: this.objRollup,
        pageId: PageId.COLLECTION_DETAIL,
        shareItemType: ShareItemType.ROOT_COLECTION
      },
      cssClass: 'sb-popover',
    });
    popover.present();
  }

  /**
   * Download single content
   */
  downloadAllContent(): void {
    this.downloadProgress = 0;
    this.showLoading = true;
    this.isDownloadStarted = true;
    this.downloadPercentage = 0;
    this.showDownload = true;
    this.importContent(Array.from(this.downloadIdentifiers), true, true);
  }


  /**
   * To get readable file size
   */
  getReadableFileSize(size): string {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(size, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
  }

  generateImpressionEvent(objectId, objectType, objectVersion) {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.DETAIL, '',
      PageId.COLLECTION_DETAIL,
      Environment.HOME,
      objectId,
      objectType,
      objectVersion,
      this.objRollup,
      this.corRelationList);
  }

  generateStartEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.COLLECTION_DETAIL,
      telemetryObject,
      this.objRollup,
      this.corRelationList);
  }

  generateEndEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateEndTelemetry(
      objectType ? objectType : ContentType.TEXTBOOK,
      Mode.PLAY,
      PageId.COLLECTION_DETAIL,
      Environment.HOME,
      telemetryObject,
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

  async showDownloadConfirmationAlert(myEvent) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let contentTypeCount;
      if (this.downloadIdentifiers.size) {
        contentTypeCount = this.downloadIdentifiers.size;
      } else {
        contentTypeCount = '';
      }
      /* generate telemetry on download click from device button
       * type: interaction
       */
      const telemetryObject = new TelemetryObject(this.content.identifier || this.content.contentId, this.content.contentType, this.content.pkgVersion);
      const values = new Map();
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.DOWNLOAD_CLICKED,
        Environment.HOME,
        PageId.COLLECTION_DETAIL,
        telemetryObject,
        values,
        this.objRollup,
        this.corRelationList);

      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('DOWNLOAD'),
          sbPopoverMainTitle: this.contentDetail.contentData.name,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('DOWNLOAD'),
              btnClass: 'popover-color'
            },
          ],
          icon: null,
          metaInfo: this.commonUtilService.translateMessage('ITEMS', contentTypeCount)
            + ' (' + this.fileSizePipe.transform(this.downloadSize, 2) + ')',
        },
        cssClass: 'sb-popover info',
      });
      await popover.present();
      /*
      * generate telemetry for the impression for download click from device button
      * type: impression
      */
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
        PageId.COLLECTION_DETAIL,
        Environment.HOME,
        this.identifier,
        '',
        this.content.pkgVersion,
        this.objRollup,
        this.corRelationList);

      const response = await popover.onDidDismiss();
      if (response && response.data) {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          InteractSubtype.DOWNLOAD_ALL_CLICKED,
          Environment.HOME,
          PageId.COLLECTION_DETAIL,
          this.telemetryObject,
          undefined,
          this.objRollup,
          this.corRelationList);
        this.downloadAllContent();
        this.events.publish('header:decreasezIndex');
      } else {
        // Cancel Clicked Telemetry
        this.generateCancelDownloadTelemetry(this.contentDetail);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  mergeProperties(mergeProp) {
    return ContentUtil.mergeProperties(this.contentDetail.contentData, mergeProp);
  }

  cancelDownload() {
    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.contentDetail);
    this.contentService.cancelDownload(this.identifier).toPromise().finally(() => {
      this.zone.run(() => {
        this.showLoading = false;
        this.refreshHeader();
        this.location.back();
      });
    });
  }
  generateCancelDownloadTelemetry(content: any) {
    const values = new Map();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CLOSE_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      values, this.objRollup,
      this.corRelationList);
  }

  /**
   * Function to View Credits
   */
  viewCredits() {
    this.courseUtilService.showCredits(this.contentDetail, PageId.COLLECTION_DETAIL, this.objRollup, this.corRelationList);
  }

  licenseSectionClicked(params) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(
       params === 'expanded' ? InteractType.LICENSE_CARD_EXPANDED : InteractType.LICENSE_CARD_COLLAPSED,
       '',
       undefined,
       PageId.COLLECTION_DETAIL,
       telemetryObject,
       undefined,
       this.objRollup,
       this.corRelationList,
       ID.LICENSE_CARD_CLICKED
     );
  }

  /**
   * method generates telemetry on click Read less or Read more
   * @param param string as read less or read more
   * @param objRollup object roll up
   * @param corRelationList correlation List
   */
  readLessorReadMore(param, objRollup, corRelationList) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.readLessOrReadMore(param, objRollup, corRelationList, telemetryObject);
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave() {
    this.downloadProgress = 0;
    this.headerObservable.unsubscribe();
    this.events.unsubscribe(EventTopics.CONTENT_TO_PLAY);
    this.events.publish('header:setzIndexToNormal');
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }

  }
  async showPopOver(event) {
    const telemetryObject = new TelemetryObject(this.content.identifier || this.content.contentId, this.content.contentType, this.content.pkgVersion);
    const values = new Map();
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.DELETE_ALL_CLICKED,
      Environment.HOME,
      PageId.SINGLE_DELETE_CONFIRMATION_POPUP,
      telemetryObject,
      values,
      this.objRollup,
      this.corRelationList);
    let contentTypeCount;
    let metaInfo: string;

    if (this.localResourseCount) {
      contentTypeCount = this.localResourseCount + '';
      metaInfo = this.commonUtilService.translateMessage('ITEMS', contentTypeCount) +
        ' (' + this.fileSizePipe.transform(this.contentDetail.sizeOnDevice, 2) + ')';
    } else {
      metaInfo = this.fileSizePipe.transform(this.contentDetail.sizeOnDevice, 2);
    }

    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        content: this.contentDetail,
        isChild: this.isDepthChild,
        objRollup: this.objRollup,
        pageName: PageId.COLLECTION_DETAIL,
        corRelationList: this.corRelationList,
        sbPopoverHeading: this.commonUtilService.translateMessage('DELETE'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('CONTENT_DELETE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('REMOVE'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: metaInfo,
        metaInfo: this.contentDetail.contentData.name
      },
      cssClass: 'sb-popover danger',
    });
    await confirm.present();
    /*
     * generate telemetry for the cancel click from the device button
     * type: impression
     */
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
      PageId.SINGLE_DELETE_CONFIRMATION_POPUP,
      Environment.HOME,
      this.identifier,
      "",
      this.content.pkgVersion,
      this.objRollup,
      this.corRelationList);
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.deleteContent();
    } else if (data && data.closeDeletePopOver) {
      this.closePopOver();
    }
  }

  /**
   * Construct content delete request body
   */
  getDeleteRequestBody() {
    const apiParams = {
      contentDeleteList: [{
        contentId: (this.contentDetail && this.contentDetail.identifier) ? this.contentDetail.identifier : '',
        isChildContent: this.isChild
      }]
    };
    return apiParams;
  }

  async deleteContent() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    const tmp = this.getDeleteRequestBody();
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.contentService.deleteContent(tmp).toPromise().then(async (res: any) => {
      await loader.dismiss();
      if (res && res[0].status === ContentDeleteStatus.NOT_FOUND) {
        this.commonUtilService.showToast('CONTENT_DELETE_FAILED');
      } else {
        // Publish saved resources update event
        this.events.publish('savedResources:update', {
          update: true
        });
        this.commonUtilService.showToast('MSG_RESOURCE_DELETED');
        // const popover = await this.popoverCtrl.getTop();
        // if (popover) {
        //   await popover.dismiss({ isDeleted: true });
        // }

        // this.popoverCtrl.dismiss({ isDeleted: true });
        this.location.back();
      }
    }).catch(async (error: any) => {
      await loader.dismiss();
      this.commonUtilService.showToast('CONTENT_DELETE_FAILED');
      const popover = await this.popoverCtrl.getTop();
      if (popover) {
        await popover.dismiss();
      }
    });
  }

  async closePopOver() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CLOSE_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
  }

  refreshHeader() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = ['download'];
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.showHeader = true;
    this.headerService.updatePageConfig(this.headerConfig);
    this.events.publish('header:setzIndexToNormal');
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
          true, this.cardData.identifier, this.corRelationList);
        this.handleBackButton();
        break;
      case 'download':
        this.redirectToActivedownloads();
        break;
    }
  }

  private redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined, this.objRollup,
      this.corRelationList);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  async onFilterMimeTypeChange(val, idx, currentFilter?) {
    const values = new Map();
    values['filter'] = currentFilter;
    this.activeMimeTypeFilter = val;
    this.currentFilter = this.commonUtilService.translateMessage(currentFilter);
    this.mimeTypes.forEach((type) => {
      type.selected = false;
    });
    this.mimeTypes[idx].selected = true;
    this.filteredItemsQueryList.changes.pipe(
      tap((v) => {
        this.changeDetectionRef.detectChanges();
        values['contentLength'] = v.length;
      })
    )
      .subscribe();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.FILTER_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
  }

  openTextbookToc() {
    this.shownGroup = null;
    this.router.navigate([`/${RouterLinks.COLLECTION_DETAIL_ETB}/${RouterLinks.TEXTBOOK_TOC}`],
      { state: { childrenData: this.childrenData, parentId: this.identifier } });
    const values = new Map();
    values['selectChapterVisible'] = this.isChapterVisible;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DROPDOWN_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );
  }

  onScroll(event) {
    if (event.detail.scrollTop >= 205) {
      (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.add('sticky');

      const boxes: HTMLElement[] = Array.from(document.getElementsByClassName('sticky-header-title-box')) as HTMLElement[];

      let headerBottomOffset = (this.stickyPillsRef.nativeElement as HTMLDivElement).getBoundingClientRect().bottom;

      // TODO: Logic will Change if Header Height got fixed
      if (this.previousHeaderBottomOffset && this.previousHeaderBottomOffset > headerBottomOffset) {
        headerBottomOffset = this.previousHeaderBottomOffset;
      }

      this.previousHeaderBottomOffset = headerBottomOffset;

      const boxesData = boxes.map(b => {
        return {
          elem: b,
          text: b.dataset['text'],
          renderLevel: parseInt(b.dataset['renderLevel']),
          offsetTop: b.getBoundingClientRect().top
        };
      });

      const activeBoxes = boxesData.filter(data => {
        return data.offsetTop < headerBottomOffset
          && (data.offsetTop + data.elem.getBoundingClientRect().height) > headerBottomOffset;
      });

      if (!activeBoxes.length) {
        return;
      }

      const activeBox = activeBoxes.reduce((acc, box) => {
        if (acc.renderLevel > box.renderLevel) {
          return acc;
        } else {
          return box;
        }
      }, activeBoxes[0]);

      if (activeBox.text) {
        this.stckyUnitTitle = activeBox.text;
      }
      return;
    }

    (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.remove('sticky');
  }

  importContentInBackground(identifiers: Array<string>, isChild: boolean, isDownloadAllClicked?) {
    if (this.showLoading && !this.isDownloadStarted) {
      this.headerService.hideHeader();
    }
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel'],
    };
    // Call content service
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (data && data.length && this.isDownloadStarted) {
            data.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.queuedIdentifiers.push(value.identifier);
              } else if (value.status === ContentImportStatus.NOT_FOUND) {
                this.faultyIdentifiers.push(value.identifier);
              }
            });

            if (this.faultyIdentifiers.length > 0) {
              const stackTrace: any = {};
              stackTrace.parentIdentifier = this.cardData.identifier;
              stackTrace.faultyIdentifiers = this.faultyIdentifiers;
              this.telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
                TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                ErrorType.SYSTEM,
                PageId.COLLECTION_DETAIL,
                JSON.stringify(stackTrace),
              );
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
          } else if (data && data[0].status === ContentImportStatus.NOT_FOUND) {
            this.showLoading = false;
            // this.refreshHeader();
            this.showChildrenLoader = false;
            this.childrenData.length = 0;
          }
        });
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.showDownloadBtn = true;
          this.isDownloadStarted = false;
          this.showLoading = false;
          if (error && (error.error === 'NETWORK_ERROR' || error.error === 'CONNECTION_ERROR')) {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
          this.showChildrenLoader = false;
          this.location.back();
        });
      });
  }
  generatefastLoadingTelemetry(interactSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      interactSubtype,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
  }

  playContent(event) {
    this.headerService.hideHeader();

    this.playingContent = event.content;
    const contentInfo: ContentInfo = {
      telemetryObject: ContentUtil.getTelemetryObject(this.playingContent),
      rollUp: ContentUtil.generateRollUp(this.playingContent.hierarchyInfo, this.playingContent.identifier),
      correlationList: this.corRelationList,
      hierachyInfo: this.playingContent.hierarchyInfo
    };
    let isStreaming: boolean;
    let shouldDownloadAndPlay: boolean;
    if (this.playingContent.contentData.streamingUrl &&
        this.commonUtilService.networkInfo.isNetworkAvailable && !(this.playingContent.mimeType === 'application/vnd.ekstep.h5p-archive')) {
      isStreaming = true;
      shouldDownloadAndPlay = false;
      this.lastContentPlayed = this.playingContent.identifier;
      this.generateInteractTelemetry(isStreaming, contentInfo.telemetryObject, contentInfo.rollUp, contentInfo.correlationList);
      this.contentPlayerHandler.launchContentPlayer(this.playingContent, isStreaming, shouldDownloadAndPlay, contentInfo, false, true);
    } else if (!this.commonUtilService.networkInfo.isNetworkAvailable && this.playingContent.isAvailableLocally) {
      isStreaming = false;
      shouldDownloadAndPlay = false;
      this.lastContentPlayed = this.playingContent.identifier;
      this.generateInteractTelemetry(isStreaming, contentInfo.telemetryObject, contentInfo.rollUp, contentInfo.correlationList);
      this.contentPlayerHandler.launchContentPlayer(this.playingContent, isStreaming, shouldDownloadAndPlay, contentInfo, false, true);
    } else if (this.commonUtilService.networkInfo.isNetworkAvailable && this.playingContent.isAvailableLocally) {
      isStreaming = false;
      shouldDownloadAndPlay = true;
      this.lastContentPlayed = this.playingContent.identifier;
      this.generateInteractTelemetry(isStreaming, contentInfo.telemetryObject, contentInfo.rollUp, contentInfo.correlationList);
      this.contentPlayerHandler.launchContentPlayer(this.playingContent, isStreaming, shouldDownloadAndPlay, contentInfo, false, true);
    } else if (!this.commonUtilService.networkInfo.isNetworkAvailable && !this.playingContent.isAvailableLocally) {
      const params: NavigationExtras = {
        state: {
          isChildContent: true,
          content: this.playingContent,
          corRelation: this.corRelationList,
        }
      };
      this.router.navigate([RouterLinks.CONTENT_DETAILS], params);
    } else {
      const params: NavigationExtras = {
        state: {
          isChildContent: true,
          content: this.playingContent,
          corRelation: this.corRelationList,
        }
      };
      this.router.navigate([RouterLinks.CONTENT_DETAILS], params);
    }
  }

  private generateInteractTelemetry(isStreaming: boolean, telemetryObject, rollup, correlationData) {
    const subType: string = isStreaming ? InteractSubtype.PLAY_ONLINE : InteractSubtype.PLAY_FROM_DEVICE;
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        subType,
        Environment.HOME,
        PageId.COLLECTION_DETAIL,
        telemetryObject,
        undefined,
        rollup,
        correlationData,
    );
  }
}
