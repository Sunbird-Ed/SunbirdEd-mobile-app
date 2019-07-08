import { Component, Inject, NgZone, ViewChild } from '@angular/core';
import { Events, NavController, NavParams, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as _ from 'lodash';
// import { ContentDetailsPage } from '@app/pages/content-details/content-details';
import { ConfirmAlertComponent, ContentActionsComponent, ContentRatingAlertComponent } from '../components/index';
import { ContentType, MimeType, ShareUrl } from '../../app/app.constant';
// import { EnrolledCourseDetailsPage } from '../enrolled-course-details-page';
import {
  AppGlobalService,
  AppHeaderService,
  CommonUtilService,
  CourseUtilService,
  TelemetryGeneratorService,
  UtilityService
} from '../../services/index';
import {
  ChildContentRequest,
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentExportRequest,
  ContentExportResponse,
  ContentImport,
  ContentImportCompleted,
  ContentImportRequest,
  ContentImportResponse,
  ContentImportStatus,
  ContentService,
  ContentUpdate,
  CorrelationData,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  ProfileType,
  Rollup,
  StorageService,
  TelemetryErrorCode,
  TelemetryObject
} from 'sunbird-sdk';
import {
  Environment,
  ErrorType,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
} from '../../services/telemetry-constants';
import { Subscription } from 'rxjs';
import { ContentShareHandlerService } from '../../services/content/content-share-handler.service';
import { EnrolledCourseDetailsPage } from '../enrolled-course-details-page/enrolled-course-details-page';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.page.html',
  styleUrls: ['./collection-details.page.scss'],
})
export class CollectionDetailsPage {
  contentDetail?: Content;
  childrenData: Array<any>;

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
  downloadIdentifiers = [];

  /**
   * Child content size
   */
  downloadSize = 0;

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
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };

  /**
   * Telemetry roll up object
   */
  public objRollup: Rollup;
  public didViewLoad: boolean;
  public backButtonFunc = undefined;
  public baseUrl = '';
  guestUser = false;
  profileType = '';

  public corRelationList: Array<CorrelationData>;
  public shouldGenerateEndTelemetry = false;
  public source = '';
  isChildClickable = false;
  // migration-TODO
  // @ViewChild(Navbar) navBar: any;
  private eventSubscription: Subscription;

  headerObservable: any;
  constructor(
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    // migration-TODO
    // private navCtrl: NavController,
    // private navParams: NavParams,
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
    private headerService: AppHeaderService,
    private contentShareHandler: ContentShareHandlerService
  ) {

    this.objRollup = new Rollup();
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillEnter(): void {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.zone.run(() => {
      this.headerConfig = this.headerService.getDefaultPageConfig();
      this.headerConfig.actionButtons = [];
      this.headerConfig.showHeader = false;
      this.headerConfig.showBurgerMenu = false;
      this.headerService.updatePageConfig(this.headerConfig);
      this.resetVariables();
      // migration-TODO
      // this.cardData = this.navParams.get('content');
      // this.corRelationList = this.navParams.get('corRelation');
      // const depth = this.navParams.get('depth');
      // this.shouldGenerateEndTelemetry = this.navParams.get('shouldGenerateEndTelemetry');
      // this.source = this.navParams.get('source');
      // this.fromCoursesPage = this.navParams.get('fromCoursesPage');
      // this.isAlreadyEnrolled = this.navParams.get('isAlreadyEnrolled');
      // this.isChildClickable = this.navParams.get('isChildClickable');

      // check for parent content
      // this.parentContent = this.navParams.get('parentContent');

      if (this.depth) {
        this.depth = this.depth;
        this.showDownloadBtn = false;
        this.isDepthChild = true;
      } else {
        this.isDepthChild = false;
      }

      if (this.isDepthChild) {
        const actionsButtons = ['share'];
        if (this.cardData.isAvailableLocally) {
          actionsButtons.push('more');
        }
        this.headerService.showHeaderWithBackButton(actionsButtons);
      } else {
        this.headerService.showHeaderWithBackButton();
      }

      this.identifier = this.cardData.contentId || this.cardData.identifier;

      if (!this.didViewLoad) {
        this.generateRollUp();
        const contentType = this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType;
        this.objType = contentType;
        this.generateStartEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
        this.generateImpressionEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
      }

      this.didViewLoad = true;
      this.setContentDetails(this.identifier, true);
      this.subscribeSdkEvent();
      this.registerDeviceBackButton();
    });
  }

  handleBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);

    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
    }
    // migration-TODO
    // this.navCtrl.pop();
    this.backButtonFunc();
  }

  registerDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
        false, this.cardData.identifier, this.corRelationList);
      this.handleBackButton();
    });
  }

  async rateContent(event) {
    // TODO: check content is played or not
    if (!this.guestUser) {
      if (this.contentDetail.isAvailableLocally) {
        const popover = await this.popoverCtrl.create({
          component: ContentRatingAlertComponent,
          componentProps: {
            content: this.contentDetail,
            pageId: PageId.CONTENT_DETAIL,
            rating: this.userRating,
            comment: this.ratingComment,
            // popupType: popupType,
          },
          cssClass: 'sb-popover info',
        });
        await popover.present();
        const response = await popover.onDidDismiss();
        if (response.data && response.data.message === 'rating.success') {
          this.userRating = response.data.rating;
          this.ratingComment = response.data.comment;
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.RATING_CLICKED,
          Environment.HOME,
          PageId.COLLECTION_DETAIL,
          undefined,
          undefined,
          this.objRollup,
          this.corRelationList
        );
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
   *
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
   * @param {string} identifier identifier of content / course
   */
  async setContentDetails(identifier, refreshContentDetails: boolean) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const option: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };
    this.contentService.getContentDetails(option).toPromise()
      .then((data: Content) => {
        this.zone.run(async () => {
         await loader.dismiss().then(() => {
            if (data) {
              this.extractApiResponse(data);
            }
          });
        });
      })
      .catch(async (error: any) => {
        console.log('error while loading content details', error);
        await loader.dismiss();
        this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        // migration-TODO
        // this.navCtrl.pop();
      });
  }

  /**
   * Function to extract api response.
   */
  extractApiResponse(data: Content) {
    this.contentDetail = data;
    this.contentDetail.isAvailableLocally = data.isAvailableLocally;
    this.objId = this.contentDetail.identifier;
    this.objVer = this.contentDetail.contentData.pkgVersion;
    if (this.contentDetail.contentData.gradeLevel && this.contentDetail.contentData.gradeLevel.length) {
      this.contentDetail.contentData.gradeLevel ? this.contentDetail.contentData.gradeLevel.join(', ') : '';
    }
    if (this.contentDetail.contentData.attributions && this.contentDetail.contentData.attributions.length) {
      this.contentDetail.contentData.attributions ? this.contentDetail.contentData.attributions.join(', ') : '';
    }
    if (this.contentDetail.contentData.me_totalRatings) {
      const rating = this.contentDetail.contentData.me_totalRatings.split('.');
      if (rating && rating[0]) {
        this.contentDetail.contentData.me_totalRatings = rating[0];
      }
    }

    // User Rating
    const contentFeedback: any = data.contentFeedback ? data.contentFeedback : [];
    if (contentFeedback !== undefined && contentFeedback.length !== 0) {
      this.userRating = contentFeedback[0].rating;
      this.ratingComment = contentFeedback[0].comments;
    }


    if (Boolean(data.isAvailableLocally)) {
      this.showLoading = false;
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
      this.contentDetail.contentData.contentTypesCount = JSON.parse(this.contentDetail.contentData.contentTypesCount);
    } else if (this.cardData.contentTypesCount) {
      if (!_.isObject(this.cardData.contentTypesCount)) {
        this.contentDetail.contentData.contentTypesCount = JSON.parse(this.cardData.contentTypesCount);
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
      _.forEach(hierarchyInfo, (value, key) => {
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
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    _.forEach(identifiers, (value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath(),
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : []
      });
    });

    return requestParams;
  }

  /**
   * Function to get import content api request params
   *
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  importContent(identifiers: Array<string>, isChild: boolean, isDownloadAllClicked?) {
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    // Call content service
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {

          if (data && data.length && this.isDownloadStarted) {
            _.forEach(data, (value) => {
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
          console.log('error while loading content details', error);
          // if (this.isDownloadStarted) {
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
            // migration-TODO
            // this.navCtrl.pop();
          }
        });
      });
  }

  /**
   * Function to set child contents
   */
  setChildContents() {
    const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
    const option: ChildContentRequest = { contentId: this.identifier, hierarchyInfo: hierarchyInfo }; // TODO: remove level
    this.contentService.getChildContents(option).toPromise()
      .then((data: Content) => {
        this.zone.run(() => {
          if (data && data.children) {
            this.childrenData = data.children;
          }

          if (!this.isDepthChild) {
            this.downloadSize = 0;
            this.getContentsSize(data.children || []);
          }
          this.showChildrenLoader = false;
        });
      })
      .catch((error: string) => {
        console.log('Error: while fetching child contents ===>>>', error);
        this.zone.run(() => {
          this.showChildrenLoader = false;
        });
      });
  }

  getContentsSize(data) {
    _.forEach(data, (value) => {
      if (value.contentData.size) {
        this.downloadSize += Number(value.contentData.size);
      }
      this.getContentsSize(value.children);
      if (value.isAvailableLocally === false) {
        this.downloadIdentifiers.push(value.contentData.identifier);
      }
    });
    if (this.downloadIdentifiers.length && !this.isDownloadCompleted) {
      this.showDownloadBtn = true;
    }
  }

  /**
   * @param {array} data
   */
  showDownloadAllBtn(data) {
    let size = 0;
    this.zone.run(() => {
      _.forEach(data, (value) => {
        if (value.isAvailableLocally === false) {
          this.downloadIdentifiers.push(value.contentData.identifier);
          size += value.contentData.size;
        }
      });
      this.downloadContentsSize = this.getReadableFileSize(+size);
      if (this.downloadIdentifiers.length) {
        this.showDownloadBtn = true;
      }
    });
  }

  navigateToDetailsPage(content: any, depth) {
    // const stateData = this.navParams.get('contentState');

    this.zone.run(() => {
      if (content.contentType === ContentType.COURSE) {
        // this.navCtrl.push(EnrolledCourseDetailsPage, {
        //   content: content,
        //   depth: depth,
        //   contentState: stateData,
        //   corRelation: this.corRelationList
        // });
      } else if (content.mimeType === MimeType.COLLECTION) {
        this.isDepthChild = true;
        // this.navCtrl.push(CollectionDetailsPage, {
        //   content: content,
        //   depth: depth,
        //   contentState: stateData,
        //   corRelation: this.corRelationList
        // });
      } else {
        // this.navCtrl.push(ContentDetailsPage, {
        //   isChildContent: true,
        //   content: content,
        //   depth: depth,
        //   contentState: stateData,
        //   corRelation: this.corRelationList
        // });
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
    this.childrenData = [];
    this.contentDetail = undefined;
    this.showDownloadBtn = false;
    this.downloadIdentifiers = [];
    this.queuedIdentifiers = [];
    this.isDepthChild = this.isDepthChild;
    this.showDownloadBtn = false;
    this.isDownloadCompleted = false;
    this.currentCount = 0;
    this.downloadPercentage = 0;
    this.isUpdateAvailable = false;
  }

  /**
   * Subscribe Sunbird-SDK event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
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
        // Get child content
        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
          const contentImportEvent = event as ContentImportCompleted;
          if (this.queuedIdentifiers.length && this.isDownloadStarted) {
            if (_.includes(this.queuedIdentifiers, contentImportEvent.payload.contentId)) {
              this.currentCount++;
              this.downloadPercentage = +((this.currentCount / this.queuedIdentifiers.length) * (100)).toFixed(0);
            }
            if (this.queuedIdentifiers.length === this.currentCount) {
              this.showLoading = false;
              this.refreshHeader();
              this.isDownloadStarted = false;
              this.showDownloadBtn = false;
              this.isDownloadCompleted = true;
              this.contentDetail.isAvailableLocally = true;
              this.downloadPercentage = 0;
              this.updateSavedResources();
            }
          } else if (this.parentContent && contentImportEvent.payload.contentId === this.contentDetail.identifier) {
            // this condition is for when the child content update is available and we have downloaded parent content
            // but we have to refresh only the child content.
            this.showLoading = false;
            this.refreshHeader();
            this.setContentDetails(this.identifier, false);
          } else {
            if (this.isUpdateAvailable && contentImportEvent.payload.contentId === this.contentDetail.identifier) {
              this.showLoading = false;
              this.refreshHeader();
              this.setContentDetails(this.identifier, false);
            } else {
              if (contentImportEvent.payload.contentId === this.contentDetail.identifier) {
                this.showLoading = false;
                this.refreshHeader();
                this.updateSavedResources();
                this.setChildContents();
                this.contentDetail.isAvailableLocally = true;
              }

            }
          }
        }

        // For content update available
        const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
        const contentUpdateEvent = event as ContentUpdate;
        if (contentUpdateEvent.payload && contentUpdateEvent.type === ContentEventType.UPDATE && hierarchyInfo === null) {
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

  share() {
    this.contentShareHandler.shareContent(this.contentDetail, this.corRelationList, this.objRollup);
  }

  /**
   * Download single content
   */
  downloadAllContent(): void {
    this.downloadProgress = 0;
    this.showLoading = true;
    this.isDownloadStarted = true;
    this.downloadPercentage = 0;
    this.importContent(this.downloadIdentifiers, true, true);
  }

  /**
   * To get readable file size
   * @param {number} size
   */
  getReadableFileSize(size): string {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(size, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
  }

  async showOverflowMenu(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.KEBAB_MENU_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL,
      undefined,
      undefined,
      this.objRollup,
      this.corRelationList);

    const popover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      componentProps: {
        content: this.contentDetail,
        isChild: this.isDepthChild,
        objRollup: this.objRollup,
        pageName: PageId.COLLECTION_DETAIL,
        corRelationList: this.corRelationList
      },
      cssClass: 'content-action'
    });
    await popover.present();
    const response = await popover.onDidDismiss();
    if (response.data === 'delete.success' || response.data === 'flag.success') {
      // migration-TODO
      // this.navCtrl.pop();
    }
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
      objectType,
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
  // migration-TODO
  // async showDownloadConfirmationAlert(myEvent) {
  //   if (this.commonUtilService.networkInfo.isNetworkAvailable) {
  //     const popover = await this.popoverCtrl.create(ConfirmAlertComponent, {
  //       cssClass: 'sb-popover info'
  //     });
  //     popover.present({
  //       ev: myEvent
  //     });
  //     popover.onDidDismiss((canDownload: boolean = false) => {
  //       if (canDownload) {
  //         this.downloadAllContent();
  //       }
  //     });
  //   } else {
  //     this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
  //   }
  // }

  cancelDownload() {
    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.contentDetail);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        this.zone.run(() => {
          this.showLoading = false;
          // migration-TODO
          // this.navCtrl.pop();
        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoading = false;
          // migration-TODO
          // this.navCtrl.pop();
        });
      });
  }

  /**
   * Function to View Credits
   */
  viewCredits() {
    this.courseUtilService.showCredits(this.contentDetail, PageId.COLLECTION_DETAIL, this.objRollup, this.corRelationList);
  }

  /**
   * method generates telemetry on click Read less or Read more
   * @param {string} param string as read less or read more
   * @param {object} objRollup object roll up
   * @param corRelationList correlation List
   */
  readLessorReadMore(param, objRollup, corRelationList) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.readLessOrReadMore(param, objRollup, corRelationList, telemetryObject);
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave(): void {
    this.headerObservable.unsubscribe();
    this.downloadProgress = 0;
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc();
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'share': this.share();
        break;
      case 'more': this.showOverflowMenu($event);
        break;
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
        true, this.cardData.identifier, this.corRelationList);
        this.handleBackButton();
        break;
    }
  }

  refreshHeader() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.showHeader = true;
    this.headerService.updatePageConfig(this.headerConfig);
  }

}
