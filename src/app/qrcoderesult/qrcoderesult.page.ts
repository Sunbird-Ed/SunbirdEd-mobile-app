import { TextbookTocService } from './../collection-detail-etb/textbook-toc-service';
import { CommonUtilService } from './../../services/common-util.service';
import { Component, Inject, NgZone, OnDestroy, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ContentType, MimeType, RouterLinks, EventTopics } from '../../app/app.constant';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService } from '../../services/app-global-service.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import find from 'lodash/find';
import each from 'lodash/each';
import { IonContent as iContent } from '@ionic/angular';
// import map from 'lodash/map';
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
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetAllProfileRequest,
  GetSuggestedFrameworksRequest,
  MarkerType,
  NetworkError,
  PlayerService,
  Profile,
  ProfileService,
  TelemetryObject
} from 'sunbird-sdk';
import { Subscription } from 'rxjs';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { File } from '@ionic-native/file/ngx';
import { AppHeaderService } from '../../services/app-header.service';
import { Location } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { Platform, Events, NavController } from '@ionic/angular';
import { RatingHandler } from '@app/services/rating/rating-handler';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { mapTo, map } from 'rxjs/operators';
declare const cordova;

@Component({
  selector: 'app-qrcoderesult',
  templateUrl: './qrcoderesult.page.html',
  styleUrls: ['./qrcoderesult.page.scss'],
})
export class QrcoderesultPage implements OnDestroy {
  @ViewChild('stickyPillsRef') stickyPillsRef: ElementRef;
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
  content: Content;

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
  @ViewChild(iContent) ionContent: iContent;

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

    // check for parent content
    this.parentContent = this.navData.parentContent;
    this.isProfileUpdated = this.navData.isProfileUpdated;
    this.searchIdentifier = this.content.identifier;
    this.isQrCodeLinkToContent = this.navData.isQrCodeLinkToContent;

    if (this.parentContent) {
      this.isParentContentAvailable = true;
      this.identifier = this.parentContent.identifier;
    } else {
      this.isParentContentAvailable = false;
      this.identifier = this.content.identifier;
    }
    if (this.backToPreviusPage) {
      this.getChildContents();
      this.backToPreviusPage = false;
    }
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(InteractSubtype.DEVICE_BACK_CLICKED);
      this.unregisterBackButton.unsubscribe();
    });
    this.subscribeSdkEvent();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  ionViewDidEnter() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '',
      PageId.DIAL_CODE_SCAN_RESULT,
      !this.appGlobalService.isProfileSettingsCompleted ? Environment.ONBOARDING : this.appGlobalService.getPageIdForTelemetry());

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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      clickSource || InteractSubtype.NAV_BACK_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT);
    if (this.source === PageId.LIBRARY || this.source === PageId.COURSES || !this.isSingleContent) {
      this.goBack();
    } else if (this.isSingleContent && this.appGlobalService.isProfileSettingsCompleted) {
      if (await this.commonUtilService.isDeviceLocationAvailable()) {
        const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
        this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
      } else {
        const navigationExtras: NavigationExtras = {
          state: {
            isShowBackButton: false
          }
        };
        this.navCtrl.navigateForward([`/${RouterLinks.DISTRICT_MAPPING}`], navigationExtras);
      }
    } else if (this.appGlobalService.isGuestUser && this.isSingleContent && !this.appGlobalService.isProfileSettingsCompleted) {
      const navigationExtras: NavigationExtras = { state: { isCreateNavigationStack: false, hideBackButton: true, showFrameworkCategoriesMenu: true  } };
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    } else {
      this.goBack();
    }
  }

  getChildContents() {
    const request: ChildContentRequest = { contentId: this.identifier, hierarchyInfo: [] };
    this.contentService.getChildContents(
      request).toPromise()
      .then(async (data: Content) => {
        if (data && data.contentData) {
          this.childrenData = data.children;
        }

        this.parents.splice(0, this.parents.length);
        this.parents.push(data);
        this.results = [];
        this.profile = this.appGlobalService.getCurrentUser();
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
             this.commonUtilService.showContentComingSoonAlert(this.source);
            } else {
              this.commonUtilService.showContentComingSoonAlert(this.source);
              window.history.go(-2);
            }
        } else if (this.results && this.results.length === 1) {
          this.backToPreviusPage = false;
          this.events.unsubscribe(EventTopics.PLAYER_CLOSED);
          this.navCtrl.navigateForward([RouterLinks.CONTENT_DETAILS], {
            state: {
              content: this.results[0],
              isSingleContent: this.isSingleContent,
              resultsSize: this.results.length,
              corRelation: this.corRelationList
            }
           });
        }

      })
      .catch(() => {
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
  playContent(content: Content) {
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
    const request: any = {};
    request.streaming = true;
    AppGlobalService.isPlayerLaunched = true;
    const values = new Map();
    values['isStreaming'] = request.streaming;
    const identifier = content.identifier;
    let telemetryObject: TelemetryObject;
    const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
    telemetryObject = new TelemetryObject(identifier, objectType, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_PLAY,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject,
      values,
      undefined,
      this.corRelationList);
    this.openPlayer(content, request);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      content.isAvailableLocally ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.PLAY_ONLINE,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject,
      undefined,
      undefined,
      this.corRelationList);
  }

  playOnline(content) {
    const identifier = content.identifier;
    let telemetryObject: TelemetryObject;
    const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
    telemetryObject = new TelemetryObject(identifier, objectType, undefined);

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
      PageId.DIAL_CODE_SCAN_RESULT,
      telemetryObject);
    if (content.contentData.streamingUrl && !content.isAvailableLocally) {
      this.playContent(content);
    } else {
      this.navigateToDetailsPage(content);
    }
  }

  navigateToDetailsPage(content, paths?, contentIdentifier?) {
    if (content && content.contentData && content.contentData.contentType === ContentType.COURSE) {
      // this.navCtrl.push(EnrolledCourseDetailsPage, {
      //   content: content,
      //   corRelation: this.corRelationList
      // });
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {
          content: content,
          corRelation: this.corRelationList
        }
      });
    } else if (content && content.mimeType === MimeType.COLLECTION) {
      // this.navCtrl.push(CollectionDetailsEtbPage, {
      //   content: content,
      //   corRelation: this.corRelationList
      // });
      if (paths.length && paths.length >= 2) {
        this.textbookTocService.setTextbookIds({ rootUnitId: paths[1].identifier, contentId: contentIdentifier });
      }
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {
          content: content,
          corRelation: this.corRelationList
        }
      });
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        Boolean(content.isAvailableLocally) ? InteractSubtype.PLAY_FROM_DEVICE : InteractSubtype.DOWNLOAD_PLAY_CLICKED,
        !this.appGlobalService.isOnBoardingCompleted ? Environment.ONBOARDING : Environment.HOME,
        PageId.DIAL_CODE_SCAN_RESULT);
      // this.navCtrl.push(ContentDetailsPage, {
      //   content: content,
      //   depth: '1',
      //   isChildContent: true,
      //   downloadAndPlay: true,
      //   corRelation: this.corRelationList
      // });
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content: content,
          depth: '1',
          isChildContent: true,
          downloadAndPlay: true,
          corRelation: this.corRelationList
        }
      });
    }
  }


  /** funtion add elipses to the texts**/

  addElipsesInLongText(msg: string) {
    if (this.commonUtilService.translateMessage(msg).length >= 12) {
      return this.commonUtilService.translateMessage(msg).slice(0, 8) + '....';
    } else {
      return this.commonUtilService.translateMessage(msg);
    }
  }

  /**
   * To set content details in local variable
   * @param {string} identifier identifier of content / course
   */
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
   * @param categoryList
   * @param data
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
   * comparing current profile data with qr result data, If not matching then reset current profile data
   * @param {object} data
   * @param {object} profile
   */
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
          this.showLoading = false;
          this.isDownloadStarted = false;
          this.results = [];
          this.parents = [];
          this.paths = [];
          this.getChildContents();
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
          data = data;
        });
      })
      .catch((error: any) => {
        this.zone.run(() => {
          this.isDownloadStarted = false;
          this.showLoading = false;
          if (error instanceof NetworkError) {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
        });
      });
  }

  /**
   * Function to get import content api request params
   *
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: cordova.file.externalDataDirectory,
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
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], { state: {showFrameworkCategoriesMenu: true } });
    }
  }

  private showAllChild(content: any) {
    this.zone.run(() => {
      if (content.children === undefined) {
        if (content.mimeType !== MimeType.COLLECTION) {
          if (content.contentData.appIcon) {
            if (content.contentData.appIcon.includes('http:') || content.contentData.appIcon.includes('https:')) {
              if (this.commonUtilService.networkInfo.isNetworkAvailable) {
                content.contentData.appIcon = content.contentData.appIcon;
              } else {
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

  private openPlayer(playingContent, request) {
    this.playerService.getPlayerConfig(playingContent, request).subscribe((data) => {
      data['data'] = {};
      this.events.subscribe(EventTopics.PLAYER_CLOSED, () => {
        this.setContentDetails(playingContent.identifier, true);
        this.events.unsubscribe(EventTopics.PLAYER_CLOSED);
      });
      if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
        if (!request.streaming) {
          this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
            this.canvasPlayerService.xmlToJSon(`${data.metadata.basePath}/index.ecml`).then((json) => {
              data['data'] = json;
              const navigationExtras: NavigationExtras = { state: { config: data } };
              this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
            }).catch((error) => {
              console.error('error1', error);
            });
          }).catch((err) => {
            console.error('err', err);
            this.canvasPlayerService.readJSON(`${data.metadata.basePath}/index.json`).then((json) => {
              data['data'] = json;
              const navigationExtras: NavigationExtras = { state: { config: data } };
              this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
            }).catch((e) => {
              console.error('readJSON error', e);
            });
          });
        } else {
          const navigationExtras: NavigationExtras = { state: { config: data } };
          this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
        }

      } else {
        const navigationExtras: NavigationExtras = { state: { config: data } };
        this.router.navigate([`/${RouterLinks.PLAYER}`], navigationExtras);
      }
    });
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.handleBackButton(InteractSubtype.NAV_BACK_CLICKED);
        break;
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
    this.router.navigate([`/${RouterLinks.COLLECTION_DETAIL_ETB}/${RouterLinks.TEXTBOOK_TOC}`],
      { state: { childrenData: this.childrenData, parentId: this.identifier,
        stckyUnitTitle: this.stckyUnitTitle , stckyindex: this.stckyindex,
        latestParentNodes: this.latestParents} });
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

}
