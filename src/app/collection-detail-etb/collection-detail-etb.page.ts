import { TextbookTocService } from './textbook-toc-service';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import isObject from 'lodash/isObject';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { Events, IonContent as iContent, Platform, PopoverController } from '@ionic/angular';
import {
  Content,
  ContentAccess,
  ContentAccessStatus,
  ContentDetailRequest,
  ContentEventType,
  ContentImport,
  ContentImportCompleted,
  ContentImportRequest,
  ContentImportResponse,
  ContentImportStatus,
  ContentMarkerRequest,
  ContentService,
  ContentUpdate,
  CorrelationData,
  DownloadEventType,
  DownloadProgress,
  DownloadService,
  DownloadTracking,
  EventsBusEvent,
  EventsBusService,
  MarkerType,
  Profile,
  ProfileService,
  Rollup,
  StorageService,
  TelemetryErrorCode,
  TelemetryObject
} from 'sunbird-sdk';
import {
  Environment, ErrorType, ImpressionType, InteractSubtype, InteractType, Mode, PageId, ID, CorReleationDataType
} from '../../services/telemetry-constants';
import { Subscription, Observable } from 'rxjs';
import { EventTopics, RouterLinks, ShareItemType } from '../../app/app.constant';
import {
  AppGlobalService, AppHeaderService, CommonUtilService,
  TelemetryGeneratorService
} from '../../services';
import { Location } from '@angular/common';

import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';

import {
  ConfirmAlertComponent, CollectionChildComponent
} from '../components';
import { Router } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { share } from 'rxjs/operators';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ContentInfo } from '@app/services/content/content-info';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { NavigationService } from '@app/services/navigation-handler.service';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { IButtonConfig, TocCardType } from '@project-sunbird/common-consumption';

@Component({
  selector: 'app-collection-detail-etb',
  templateUrl: './collection-detail-etb.page.html',
  styleUrls: ['./collection-detail-etb.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CollectionDetailEtbPage implements OnInit {

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
      name: 'VIDEO', value: ['video/mp4', 'video/x-youtube', 'video/webm'], iconNormal: './assets/imgs/play.svg',
      iconActive: './assets/imgs/play-active.svg'
    },
    {
      name: 'DOC', value: ['application/pdf', 'application/epub', 'application/msword'], iconNormal: './assets/imgs/doc.svg',
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
  public corRelationList: Array<CorrelationData>;
  public shouldGenerateEndTelemetry = false;
  public source = '';
  isChildClickable = false;
  hiddenGroups = new Set();
  shownGroups = undefined;
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
  @ViewChild('collectionChildComp') collectionChildComp: CollectionChildComponent;
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
  private previousHeaderBottomOffset?: number;
  isContentPlayed = false;
  contentDeleteObservable: any;

  _licenseDetails: any;
  trackDownloads$: Observable<DownloadTracking>;
  showCollapsedPopup = true;
  get licenseDetails() {
    return this._licenseDetails;
  }
  set licenseDetails(val) {
    if (!this._licenseDetails && val) {
      this._licenseDetails = val;
    }
  }
  pageId = PageId.COLLECTION_DETAIL;
  collectionTocData: Content;
  TocCardType = TocCardType;
  activeContent;
  playBtnConfig: IButtonConfig;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    private zone: NgZone,
    private events: Events,
    private popoverCtrl: PopoverController,
    private platform: Platform,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private navService: NavigationService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private fileSizePipe: FileSizePipe,
    private headerService: AppHeaderService,
    private location: Location,
    private router: Router,
    private changeDetectionRef: ChangeDetectorRef,
    private textbookTocService: TextbookTocService,
    private contentPlayerHandler: ContentPlayerHandler,
    private contentDeleteHandler: ContentDeleteHandler,
    private sbProgressLoader: SbProgressLoader
  ) {
    this.objRollup = new Rollup();
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
    const extras = this.router.getCurrentNavigation().extras.state;

    if (extras) {
      this.setExtrasData(extras);
    }
  }

  private setExtrasData(extras) {
    this.content = extras.content;
    this.data = extras.data;
    this.cardData = extras.content;
    this.batchDetails = extras.batchDetails;
    this.pageName = extras.pageName;
    this.depth = extras.depth;
    this.corRelationList = extras.corRelation || [];
    this.shouldGenerateEndTelemetry = extras.shouldGenerateEndTelemetry;
    this.source = extras.source;
    this.fromCoursesPage = extras.fromCoursesPage;
    this.isAlreadyEnrolled = extras.isAlreadyEnrolled;
    this.isChildClickable = extras.isChildClickable;
    this.facets = extras.facets;
    this.telemetryObject = ContentUtil.getTelemetryObject(extras.content);
    this.parentContent = extras.parentContent;
    if (this.depth) {
      this.showDownloadBtn = false;
      this.isDepthChild = true;
    } else {
      this.isDepthChild = false;
    }
    this.identifier = this.cardData.contentId || this.cardData.identifier;
  }

  ngOnInit() {
    this.playBtnConfig = {
      label: this.commonUtilService.translateMessage('PLAY'),
      show: true
    };

    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
    window['scrollWindow'] = this.ionContent;
    this.trackDownloads$ = this.downloadService.trackDownloads({ groupBy: { fieldPath: 'rollUp.l1', value: this.identifier } }).pipe(
      share());
  }

  ionViewWillEnter() {
    this.headerService.showStatusBar();
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
      this.hiddenGroups.clear();
      this.shownGroups = undefined;
      this.assignCardData();
      this.resetVariables();
      this.setContentDetails(this.identifier, true);
      this.events.subscribe(EventTopics.CONTENT_TO_PLAY, (data) => {
        this.playContent(data);
      });
      this.subscribeSdkEvent();
    });
    this.ionContent.ionScroll.subscribe((event) => {
      this.scrollPosition = event.scrollTop;
    });

    this.events.subscribe(EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN, (data) => {
      if (data.content) {
        this.refreshContentDetails(data);
      }
    });
  }

  ionViewDidEnter() {
    this.sbProgressLoader.hide({ id: this.identifier });
  }

  private assignCardData() {
    if (!this.didViewLoad) {
      this.objRollup = ContentUtil.generateRollUp(this.cardData.hierarchyInfo, this.cardData.identifier);
      const contentType = this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType;
      this.objType = contentType;
      this.generateStartEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
      this.generateImpressionEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
      this.markContent();
    }
    this.didViewLoad = true;
  }

  refreshContentDetails(data) {
    this.resetVariables();
    this.shownGroups = undefined;
    this.hiddenGroups.clear();
    this.setExtrasData(data);
    this.didViewLoad = false;
    this.assignCardData();
    this.setContentDetails(this.identifier, true);
    this.subscribeSdkEvent();
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
      this.shownGroups = undefined;
      this.hiddenGroups.add(group);
    } else {
      isCollapsed = false;
      this.shownGroups = group;
      this.hiddenGroups.delete(group);
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
    if (this.activeMimeTypeFilter.indexOf('all') === 0) {
      return this.shownGroups === group;
    } else {
      return !this.hiddenGroups.has(group);
    }
  }

  changeValue(text) {
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
    if (this.source === PageId.ONBOARDING_PROFILE_PREFERENCES) {
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], { state: { showFrameworkCategoriesMenu: true }, replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  registerDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
        false, this.cardData.identifier, this.corRelationList);
      this.handleBackButton();
    });
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
      .then((data: Content | any) => {
        if (data) {
          this.licenseDetails = data.contentData.licenseDetails || this.licenseDetails;
          if (data.contentData.attributions && data.contentData.attributions.length) {
            data.contentData.attributions = (data.contentData.attributions.sort()).join(', ');
          }
          if (!data.isAvailableLocally) {
            this.contentDetail = data;
            this.telemetryGeneratorService.generatefastLoadingTelemetry(
              InteractSubtype.FAST_LOADING_INITIATED,
              PageId.COLLECTION_DETAIL,
              this.telemetryObject,
              undefined,
              this.objRollup,
              this.corRelationList
            );
            this.contentService.getContentHeirarchy(option).toPromise()
              .then((content: Content) => {
                this.setTocData(content);
                this.showSheenAnimation = false;
                this.toggleGroup(0, this.content);
                this.telemetryGeneratorService.generatefastLoadingTelemetry(
                  InteractSubtype.FAST_LOADING_FINISHED,
                  PageId.COLLECTION_DETAIL,
                  this.telemetryObject,
                  undefined,
                  this.objRollup,
                  this.corRelationList
                );
              }).catch(() => {
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

  /**
   * Function to extract api response.
   */
  extractApiResponse(data: Content) {
    this.contentDetail = data;
    this.contentDetail.contentData.appIcon = ContentUtil.getAppIcon(this.contentDetail.contentData.appIcon,
      this.contentDetail.basePath, this.commonUtilService.networkInfo.isNetworkAvailable);
    this.objId = this.contentDetail.identifier;
    this.objVer = this.contentDetail.contentData.pkgVersion;

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
    } else if (this.cardData.contentTypesCount) {
      if (!isObject(this.cardData.contentTypesCount)) {
        this.contentTypesCount = JSON.parse(this.cardData.contentTypesCount);
      }
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
            this.collectionTocData.children.length = 0;
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
            if (this.textbookTocService.textbookIds.content) {
              this.activeContent = this.textbookTocService.textbookIds.content;
            }
            this.setTocData(data);
            this.changeDetectionRef.detectChanges();
          }

          if (!this.isDepthChild) {
            this.downloadSize = 0;
            this.localResourseCount = 0;
            this.getContentsSize(data.children || []);
          }
          this.showChildrenLoader = false;
          if (this.textbookTocService.textbookIds.contentId) {
            setTimeout(() => {
              (this.stickyPillsRef.nativeElement as HTMLDivElement).classList.add('sticky');
              window['scrollWindow'].getScrollElement().then(() => {
                document.getElementById(this.textbookTocService.textbookIds.contentId).scrollIntoView({ behavior: 'smooth' });
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

  private setTocData(content) {
    this.childrenData = content.children;
    this.collectionTocData = content;
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
      if (!value.isAvailableLocally && value.contentData.downloadUrl) {
        this.downloadIdentifiers.add(value.contentData.identifier);
        this.rollUpMap[value.contentData.identifier] = ContentUtil.generateRollUp(value.hierarchyInfo, undefined);
      }

    });
    if (this.downloadIdentifiers.size && !this.isDownloadCompleted) {
      this.showDownloadBtn = true;
    }
  }


  navigateToDetailsPage(content: any, depth, corRelationData?) {
    const corRelationList = [...this.corRelationList];
    if (corRelationData) {
      corRelationList.push(corRelationData);
    }
    this.zone.run(() => {
      switch (ContentUtil.isTrackable(content)) {
        case 1:
        case 0:
          this.navService.navigateToTrackableCollection({
            content,
            depth,
            contentState: this.stateData,
            corRelation: corRelationList
          });
          break;
        case -1:
          this.navService.navigateToContent({
            isChildContent: true,
            content,
            depth,
            contentState: this.stateData,
            corRelation: corRelationList,
            breadCrumb: this.breadCrumb
          });
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
              if (this.contentDetail) {
                this.contentDetail.isAvailableLocally = true;
              }
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
    await popover.present();
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
    this.showCollapsedPopup = false;
    this.importContent(Array.from(this.downloadIdentifiers), true, true);
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
      objectType ? objectType : CsPrimaryCategory.DIGITAL_TEXTBOOK,
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

  async showDownloadConfirmationAlert() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const contentTypeCount = this.downloadIdentifiers.size ? this.downloadIdentifiers.size : '';
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
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
        PageId.DOWNLOAD_ALL_CONFIRMATION_POPUP,
        Environment.HOME,
        this.contentDetail.identifier,
        this.contentDetail.contentData.contentType,
        this.contentDetail.contentData.pkgVersion,
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
        this.generateCancelDownloadTelemetry();
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

  generateCancelDownloadTelemetry() {
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
  async showDeletePopOver() {
    this.contentDeleteObservable = this.contentDeleteHandler.contentDeleteCompleted$.subscribe(() => {
      this.location.back();
    });

    const contentInfo: ContentInfo = {
      telemetryObject: this.telemetryObject,
      rollUp: this.objRollup,
      correlationList: this.corRelationList,
      hierachyInfo: undefined,
    };
    this.contentDeleteHandler.showContentDeletePopup(this.contentDetail, this.isChild, contentInfo, PageId.COLLECTION_DETAIL);
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
    this.hiddenGroups.clear();
    this.shownGroups = undefined;
    this.navService.navigateTo([`/${RouterLinks.COLLECTION_DETAIL_ETB}/${RouterLinks.TEXTBOOK_TOC}`],
      { childrenData: this.childrenData, parentId: this.identifier })
    // this.router.navigate([`/${RouterLinks.COLLECTION_DETAIL_ETB}/${RouterLinks.TEXTBOOK_TOC}`], // **** check needed ****
    //   { state: { childrenData: this.childrenData, parentId: this.identifier } });
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
          renderLevel: parseInt(b.dataset['renderLevel'], 10),
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

  importContentInBackground(identifiers: Array<string>, isChild: boolean) {
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

  playContent(event, corRelationData?) {
    const corRelationList = [...this.corRelationList];
    if (corRelationData) {
      corRelationList.push(corRelationData);
    }

    const telemetryDetails = {
      pageId: PageId.COLLECTION_DETAIL,
      corRelationList
    };

    const navExtras = {
      state: {
        isChildContent: true,
        content: event.content,
        depth: 1,
        contentState: this.stateData,
        corRelation: corRelationList,
        breadCrumb: this.breadCrumb
      }
    };

    this.contentPlayerHandler.playContent(event.content, navExtras, telemetryDetails, false);

  }

  tocCardClick(event) {
    if (!(event.event instanceof Event)) {
      return;
    }

    const corRelationData = {
      id: event.rollup[0],
      type: CorReleationDataType.ROOT_ID
    };

    this.setActiveContentData(event, InteractSubtype.CONTENT_CLICKED, corRelationData);

    this.navigateToDetailsPage(event.data, 1, corRelationData);
  }

  playButtonClick(event) {
    const corRelationData = {
      id: event.rollup[0],
      type: CorReleationDataType.ROOT_ID
    };

    this.setActiveContentData(event, InteractSubtype.PLAY_CLICKED, corRelationData);

    this.playContent({ content: event.data }, corRelationData);
  }

  private setActiveContentData(event, telemetrySubType, corRelationData) {
    this.activeContent = event.data;
    this.textbookTocService.setTextbookIds({ contentId: event.data.identifier, rootUnitId: undefined });

    const corRelationList = [...this.corRelationList];
    if (corRelationData) {
      corRelationList.push(corRelationData);
    }
    const values = {
      contentClicked: event.data && event.data.identifier
    };

    const telemetryObj = ContentUtil.getTelemetryObject(event.data);

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      telemetrySubType,
      Environment.HOME,
      PageId.TEXTBOOK_TOC, telemetryObj,
      values,
      this.objRollup, corRelationList
    );
  }

}
