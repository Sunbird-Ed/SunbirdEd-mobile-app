import {Component, Inject, NgZone, ViewChild, OnInit} from '@angular/core';
import {
  AlertController,
  IonApp,
  Events,
  NavController,
  // NavParams,
  Platform,
  PopoverController,
  ToastController,
  ModalController
} from '@ionic/angular';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import * as _ from 'lodash';
import {ContentConstants, EventTopics, PreferenceKey, StoreRating, XwalkConstants, ShareUrl, RouterLinks} from '../../app/app.constant';
import {GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs} from '../../app/module.service';
import {Map} from '../telemetryutil';
import {
  BookmarkComponent,
  ConfirmAlertComponent,
  ContentActionsComponent,
  ContentRatingAlertComponent,
  SbPopoverComponent
} from '../components';
import {AppGlobalService, AppHeaderService, AppRatingService, CourseUtilService, UtilityService, CanvasPlayerService} from '../../services';
import {EnrolledCourseDetailsPage} from '../enrolled-course-details-page/enrolled-course-details-page';
import {Network} from '@ionic-native/network/ngx';
import {UserAndGroupsPage} from '../user-and-groups/user-and-groups.page';
import {TelemetryGeneratorService} from '../../services/telemetry-generator.service';
import {CommonUtilService} from '../../services/common-util.service';
import {DialogPopupComponent} from '../components/dialog-popup/dialog-popup.component';
import {
  AuthService,
  ChildContentRequest,
  Content,
  ContentDeleteStatus,
  ContentDetailRequest,
  ContentEventType,
  ContentExportRequest,
  ContentExportResponse,
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
  PlayerService,
  ProfileService,
  ProfileType,
  Rollup,
  SharedPreferences,
  StorageService,
  TelemetryObject
} from 'sunbird-sdk';
// migration-TODO
// import {CanvasPlayerService} from '../player/canvas-player.service';
// import {PlayerPage} from '../player/player';
import {File} from '@ionic-native/file/ngx';
import {Subscription} from 'rxjs';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
} from '../../services/telemetry-constants';
import {TabsPage} from '../tabs/tabs.page';
import {ContainerService} from '@app/services/container.services';
import {FileSizePipe} from '@app/pipes/file-size/file-size';
import {TranslateService} from '@ngx-translate/core';
import {SbGenericPopoverComponent} from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import {RatingAlertComponent} from '../components/rating-alert/rating-alert.component';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

declare const cordova;


@Component({
  selector: 'app-content-details',
  templateUrl: './content-details.page.html',
  styleUrls: ['./content-details.page.scss'],
})
export class ContentDetailsPage implements OnInit {
  resumedCourseCardData: any;
  [x: string]: any;
  apiLevel: number;
  appAvailability: string;
  content: Content;
  playingContent: Content;
  isChildContent = false;
  contentDetails: any;
  identifier: string;
  headerObservable: any;
  new = true;

  /**
   * To hold previous state data
   */
  cardData: any;

  /**
   * Content depth
   */
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
  userRating = 0;
  /*stores streaming url*/
  streamingUrl: any;
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
  isGuestUser = false;
  launchPlayer: boolean;
  profileType = '';
  isResumedCourse: boolean;
  objId;
  objType;
  objVer;
  didViewLoad: boolean;
  contentDetail: any;
  backButtonFunc = undefined;
  baseUrl = '';
  shouldGenerateEndTelemetry = false;
  source = '';
  unregisterBackButton: any;
  userCount = 0;
  shouldGenerateTelemetry = true;
  playOnlineSpinner: boolean;
  defaultAppIcon: string;
  // migration-TODO
  // @ViewChild(Navbar) navBar: Navbar;
  showMessage: any;
  localImage: any;
  isUsrGrpAlrtOpen = false;
  private resume;
  private ratingComment = '';
  private corRelationList: Array<CorrelationData>;
  private eventSubscription: Subscription;
  defaultLicense: string;

  showDownload: boolean;
  contentPath: Array<any>[];
  FileSizePipe: any;
  toast: any;
  childPaths: Array<string> = [];
  breadCrumbData: any;
  networkSubscription: any;
  showChildrenLoader: any;
  hierarchyInfo: any;
  showLoading: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PLAYER_SERVICE') private playerService: PlayerService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private navCtrl: NavController,
    // private navParams: NavParams,
    private zone: NgZone,
    private events: Events,
    private popoverCtrl: PopoverController,
    private social: SocialSharing,
    private platform: Platform,
    public appGlobalService: AppGlobalService,
    private alertCtrl: AlertController,
    private ionicApp: IonApp,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private courseUtilService: CourseUtilService,
    private canvasPlayerService: CanvasPlayerService,
    private file: File,
    private utilityService: UtilityService,
    private container: ContainerService,
    private network: Network,
    public toastController: ToastController,
    private fileSizePipe: FileSizePipe,
    private translate: TranslateService,
    private headerService: AppHeaderService,
    private appRatingService: AppRatingService,
    private location: Location,
    private modalCtrl: ModalController,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.objRollup = new Rollup();
    // this.userId = this.appGlobalService.getUserId();
    this.subscribePlayEvent();
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
    this.handlePageResume();
    this.checkDeviceAPILevel();
    this.checkappAvailability();
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
    this.defaultLicense = ContentConstants.DEFAULT_LICENSE;

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        console.log('params from state : ', this.router.getCurrentNavigation().extras.state);
        this.cardData = this.router.getCurrentNavigation().extras.state.content;
        this.isChildContent = this.router.getCurrentNavigation().extras.state.isChildContent;
        this.cardData.depth = this.router.getCurrentNavigation().extras.state.depth === undefined ? '' : this.router.getCurrentNavigation().extras.state.depth;
        this.corRelationList = this.router.getCurrentNavigation().extras.state.corRelation;
        this.identifier = this.cardData.contentId || this.cardData.identifier;
        this.isResumedCourse = Boolean(this.router.getCurrentNavigation().extras.state.isResumedCourse);
        this.source = this.router.getCurrentNavigation().extras.state.source;
        this.shouldGenerateEndTelemetry = this.router.getCurrentNavigation().extras.state.shouldGenerateEndTelemetry;
        this.downloadAndPlay = this.router.getCurrentNavigation().extras.state.downloadAndPlay;
        this.playOnlineSpinner = true;
        this.contentPath = this.router.getCurrentNavigation().extras.state.paths;
        this.breadCrumbData = this.router.getCurrentNavigation().extras.state.breadCrumb;
        this.launchPlayer = this.router.getCurrentNavigation().extras.state.launchplayer;
        this.resumedCourseCardData = this.router.getCurrentNavigation().extras.state.resumedCourseCardData;
      }
    });
  }

  ngOnInit() {

    // this.navBar.backButtonClick = (e: UIEvent) => {
    //   this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CONTENT_DETAIL, Environment.HOME,
    //     true, this.cardData.identifier, this.corRelationList);
    //   this.handleNavBackButton();
    // };
    // this.handleDeviceBackButton();

    if (!AppGlobalService.isPlayerLaunched) {
      this.calculateAvailableUserCount();
    }

    this.events.subscribe(EventTopics.PLAYER_CLOSED, (data) => {
      if (data.selectedUser) {
        if (!data.selectedUser['profileType']) {
          this.profileService.getActiveProfileSession().toPromise()
            .then((profile) => {
              this.switchUser(profile);
            });
        } else {
          this.switchUser(data.selectedUser);
        }
      }
    });
  }

  private switchUser(selectedUser) {
    if (this.appGlobalService.isUserLoggedIn()) {
      this.authService.resignSession().subscribe();
      (window as any).splashscreen.clearPrefs();
    }
    this.resetTabs(selectedUser);
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillEnter(): void {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.hideHeader();

    if (this.isResumedCourse && !this.isPlayerLaunched) {
      if (this.isUsrGrpAlrtOpen) {
        this.isUsrGrpAlrtOpen = false;
      } else {
        // migration-TODO
        // this.navCtrl.insert(this.navCtrl.length() - 1, EnrolledCourseDetailsPage, {
        //   content: this.navParams.get('resumedCourseCardData')
        // });
      }
    } else {
      this.generateTelemetry();
    }

    this.setContentDetails(this.identifier, true, this.isPlayerLaunched);
    this.subscribeSdkEvent();
    this.findHierarchyOfContent();
    // this.setContentDetails(this.identifier, true, false);
    // this.subscribeGenieEvent();
    this.networkSubscription = this.commonUtilService.networkAvailability$.subscribe((available: boolean) => {
      if (available) {
        this.presentToast();
        if (this.toast) {
          this.toast.dismiss();
          this.toast = undefined;
        }
      } else {
        this.presentToastForOffline();
      }
    });
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave(): void {
    this.headerObservable.unsubscribe();
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
      if (this.toast) {
        this.toast.dismiss();
        this.toast = undefined;
      }
    }
  }

  handleNavBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
    }
    this.popToPreviousPage(true);
    this.backButtonFunc.unsubscribe();
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CONTENT_DETAIL, Environment.HOME,
        false, this.cardData.identifier, this.corRelationList);
      this.didViewLoad = false;
      this.dismissPopup();
      this.popToPreviousPage(true);
      this.generateEndEvent(this.objId, this.objType, this.objVer);
      if (this.shouldGenerateEndTelemetry) {
        this.generateQRSessionEndEvent(this.source, this.cardData.identifier);
      }
      this.backButtonFunc.unsubscribe();
    });
  }

  handlePageResume() {
    // This is to know when the app has come to foreground
    // this.resume = this.platform.resume.subscribe(() => {
    //   console.log('Page Resumed');
    //   this.isContentPlayed = true;
    //   if (this.isPlayerLaunched) {
    //     this.isPlayerLaunched = false;
    //     this.setContentDetails(this.identifier, true /* No Automatic Rating for 1.9.0 */);
    //   }
    //   // this.updateContentProgress();
    // });
  }

  subscribePlayEvent() {
    this.utilityService.getBuildConfigValue('BASE_URL')
      .then(response => {
        this.baseUrl = response;
        console.log('url', this.baseUrl);
      });
    this.events.subscribe('playConfig', (config) => {
      this.appGlobalService.setSelectedUser(config['selectedUser']);
      this.playContent(config.streaming);
    });
  }

  // You are Offline Toast
  async presentToastForOffline() {
    this.toast = await this.toastController.create({
      duration: 2000,
      message: this.commonUtilService.translateMessage('NO_INTERNET_TITLE'),
      showCloseButton: true,
      position: 'top',
      closeButtonText: '',
      cssClass: 'toastHeader'
    });
    this.toast.present();
    this.toast.onDidDismiss(() => {
      this.toast = undefined;
    });
  }

  // You are Online Toast
  async presentToast() {
    const toast = await this.toastController.create({
      duration: 2000,
      message: this.commonUtilService.translateMessage('INTERNET_AVAILABLE'),
      showCloseButton: false,
      position: 'top',
      cssClass: 'toastForOnline'
    });
    toast.present();
  }

  /**
   * Get the session to know if the user is logged-in or guest
   *
   */
  checkLoggedInOrGuestUser() {
    this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
  }

  calculateAvailableUserCount() {
    const profileRequest: GetAllProfileRequest = {
      local: true,
      server: false
    };
    this.profileService.getAllProfiles(profileRequest)
      .map((profiles) => profiles.filter((profile) => !!profile.handle))
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

  checkCurrentUserType() {
    if (this.isGuestUser) {
      this.appGlobalService.getGuestUserInfo()
        .then((userType) => {
          this.profileType = userType;
        })
        .catch((error) => {
          console.log('Error Occurred', error);
          this.profileType = '';
        });
    }
  }

  checkBookmarkStatus() {
    this.preferences.getString(PreferenceKey.IS_BOOKMARK_VIEWED).toPromise().then(val => {
      if (!val) {
        this.showBookmarkMenu();
      }
    });
  }

  /*
   selectBookmark() {
     this.content.bookmarked = true;
     this.showMessage = true;
     const notifyTimer = Observable.timer(10000);
     notifyTimer.subscribe(e => {
       this.showMessage = false;
     });
   }

   deSelectBookmark() {
     this.content.bookmarked = false;
     if (this.showMessage) {
       this.showMessage = false;
     }
   }
   */
  /**
   * Function to rate content
   */

  async rateContent(popupType: string) {
    const paramsMap = new Map();
    if (this.isContentPlayed || this.content.contentAccess.length) {
      if (popupType === 'automatic') {
        if (!(await this.appRatingService.checkReadFile())) {
          this.preferences.getString(PreferenceKey.APP_RATING_DATE).toPromise().then(async res => {
            if (await this.validateAndCheckDateDiff(res)) {
              paramsMap['IsPlayed'] = 'N';
              this.appRating();
            } else {
              paramsMap['IsPlayed'] = 'Y';
              this.contentRating(popupType);
            }
          }).catch(err => {
            paramsMap['IsPlayed'] = 'Y';
            this.contentRating(popupType);
          });
        } else {
          paramsMap['IsPlayed'] = 'Y';
          this.contentRating(popupType);
        }
      } else if (popupType === 'manual') {
        paramsMap['IsPlayed'] = 'Y';
        this.contentRating(popupType);
      }

    } else {
      paramsMap['IsPlayed'] = 'N';
      this.commonUtilService.showToast('TRY_BEFORE_RATING');
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RATING_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      undefined,
      paramsMap,
      this.objRollup,
      this.corRelationList);
  }

  async validateAndCheckDateDiff(date) {
    let isValid = false;
    if (await this.commonUtilService.networkInfo.isNetworkAvailable) {
      const presentDate = moment();
      const initialDate = moment(date);
      if (initialDate.isValid()) {
        const diffInDays = presentDate.diff(initialDate, 'days');
        if (diffInDays >= StoreRating.DATE_DIFF) {
          isValid = true;
        }
      }
    }
    return isValid;
  }

  async contentRating(popupType) {
    const popover = await this.popoverCtrl.create({
      component: ContentRatingAlertComponent,
      componentProps: {
        content: this.content,
        pageId: PageId.CONTENT_DETAIL,
        rating: this.userRating,
        comment: this.ratingComment,
        popupType: popupType,
      },
      cssClass: 'sb-popover info',
    });
    await popover.present();
    await popover.onDidDismiss().then(response => {
      if (response.data && response.data.message === 'rating.success') {
        this.userRating = response.data.rating;
        this.ratingComment = response.data.comment;
      }
    })
  }

  async appRating() {
    const popover = await this.popoverCtrl.create({
      component: RatingAlertComponent,
      componentProps: {},
      cssClass: 'sb-popover'
    });
    await popover.present();
    await popover.onDidDismiss().then(response => {
      switch (response.data) {
        case null: {
          this.appRatingService.setInitialDate();
          break;
        }
        case StoreRating.RETURN_HELP: {
          this.appRatingService.setInitialDate();
          this.router.navigate([`/${RouterLinks.FAQ_HELP}`]);
          break;
        }
      }
    })
  }

  /**
   * To set content details in local variable
   * @param {string} identifier identifier of content / course
   * @param refreshContentDetails
   * @param showRating
   */

  async setContentDetails(identifier, refreshContentDetails: boolean, showRating: boolean) {
    let loader;
    if (!showRating) {
      loader = await this.commonUtilService.getLoader();
      await loader.present();
    }
    const req: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      attachContentAccess: true,
      emitUpdateIfAny: refreshContentDetails
    };

    this.contentService.getContentDetails(req).toPromise()
      .then((data: Content) => {
        this.zone.run(async () => {
          if (data) {
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
            this.isPlayerLaunched = false;
            if (this.userRating === 0) {
              if (!this.appGlobalService.getSelectedUser()) {
                this.rateContent('automatic');
              }
            }
          }
        });
      })
      .catch(async (error: any) => {
        await loader.dismiss();
        if (this.isDownloadStarted) {
          this.contentDownloadable[this.content.identifier] = false;
          // this.content.downloadable = false;
          this.isDownloadStarted = false;
        }
        if (error.hasOwnProperty('CONNECTION_ERROR') === 'CONNECTION_ERROR') {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else if (error.hasOwnProperty('SERVER_ERROR') === 'SERVER_ERROR' ||
          error.hasOwnProperty('SERVER_AUTH_ERROR') === 'SERVER_AUTH_ERROR') {
          this.commonUtilService.showToast('ERROR_FETCHING_DATA');
        } else {
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
        // this.navCtrl.pop();
        this.location.back();
      });
  }

  extractApiResponse(data: Content) {
    if (this.isResumedCourse) {
      this.setChildContents();
    }

    this.content = data;
    this.contentDownloadable[this.content.identifier] = data.isAvailableLocally;
    if (this.content.lastUpdatedTime !== 0) {
      this.playOnlineSpinner = false;
    }
    if (this.content.contentData.appIcon) {
      if (this.content.contentData.appIcon.startsWith('http')) {
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.content.contentData.appIcon = this.content.contentData.appIcon;
        } else {
          this.content.contentData.appIcon = this.defaultAppIcon;
        }
      } else if (data.basePath) {
        this.content.contentData.appIcon = data.basePath + '/' + this.content.contentData.appIcon;
        console.log('local Image', this.localImage);
      }
    }
    this.content.contentAccess = data.contentAccess ? data.contentAccess : [];
    this.content.contentMarker = data.contentMarker ? data.contentMarker : [];

    if (this.cardData && this.cardData.hierarchyInfo) {
      data.hierarchyInfo = this.cardData.hierarchyInfo;
      this.isChildContent = true;
    }
    if (this.content.contentData.streamingUrl) {
      this.streamingUrl = this.content.contentData.streamingUrl;
    }

    if (!this.isChildContent && this.content.contentMarker.length
      && this.content.contentMarker[0].extraInfoMap
      && this.content.contentMarker[0].extraInfoMap.hierarchyInfo
      && this.content.contentMarker[0].extraInfoMap.hierarchyInfo.length) {
      this.isChildContent = true;
    }

    this.playingContent = data;
    // if (this.content.contentData.gradeLevel && this.content.contentData.gradeLevel.length
    //   && typeof this.content.contentData.gradeLevel !== 'string') {
    //  this.content.contentData.gradeLevel.join(', ');
    // }
    // if (this.content.contentData.attributions && this.content.contentData.attributions.length) {
    //   this.content.contentData.attributions ? this.content.contentData.attributions.join(', ') : '';
    // }
    if (this.content.contentData.me_totalRatings) {
      this.content.contentData.me_totalRatings = parseInt(this.content.contentData.me_totalRatings, 10) + '';
    }
    this.objId = this.content.identifier;
    this.objVer = this.content.contentData.pkgVersion;

    // User Rating
    const contentFeedback: any = data.contentFeedback;
    if (contentFeedback !== undefined && contentFeedback.length !== 0) {
      this.userRating = contentFeedback[0].rating;
      this.ratingComment = contentFeedback[0].comments;
    }

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

    if (this.isPlayerLaunched) {
      this.downloadAndPlay = false;
    }
    console.log('DownloadnPlay', this.downloadAndPlay);

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
  }

  /**
   * Function to set child contents
   */
  setChildContents(): void {
    this.showChildrenLoader = true;
    // const option = new ChildContentRequest();
    const option: ChildContentRequest = {
      contentId: this.resumedCourseCardData && this.resumedCourseCardData.contentId ?
        this.resumedCourseCardData.contentId : this.resumedCourseCardData.identifier,
      hierarchyInfo: null,
      level: !this.resumedCourseCardData ? 1 : 0,
    };
    // if (this.navParams.get('resumedCourseCardData')) {
    //   option.contentId = this.navParams.get('resumedCourseCardData').contentId || this.navParams.get('resumedCourseCardData').identifier;
    // }
    option.hierarchyInfo = null;

    if (this.resumedCourseCardData && !this.resumedCourseCardData.batchId) {
      option.level = 1;
    }
    this.contentService.getChildContents(option).toPromise()
      .then((data: any) => {
        this.zone.run(() => {
          if (data && data.children) {
            this.hierarchyInfo = this.getHierarchyInfo(data);
          }
        });
      })
      .catch((error: string) => {
        this.zone.run(() => {
        });
      });
  }

  getHierarchyInfo(childrenData) {
    // step 1: if children.length != 0
    // step 2: then, loopthrough and match identifier
    // step 3: if matches, then, return hirearchy info
    // step 4: else, step 1 again
    let hierarchyInfo: any;
    if (childrenData.children && childrenData.children.length) {
      // hierarchyInfo = childrenData.children.find((ele) => {
      // childrenData.children.forEach(ele => {
      for (let i = 0; i < childrenData.children.length; i++) {
        const ele = childrenData.children[i];
        if (!hierarchyInfo && ele.identifier === this.identifier) {
          return ele;
        } else if (!hierarchyInfo) {
          hierarchyInfo = this.getHierarchyInfo(ele);
          if (hierarchyInfo) {
            return hierarchyInfo;
          }
        }
      }
    }
  }

  generateTelemetry() {
    if (!this.didViewLoad && !this.isContentPlayed) {
      this.generateRollUp();
      if (this.cardData) {
        const contentType = this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType;
        this.objType = contentType;
        this.generateImpressionEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
        this.generateStartEvent(this.cardData.identifier, contentType, this.cardData.pkgVersion);
      }
    }
    this.didViewLoad = true;
  }

  generateDetailsInteractEvent() {
    const values = new Map();
    values['isUpdateAvailable'] = this.isUpdateAvail;
    values['isDownloaded'] = this.contentDownloadable[this.content.identifier];
    values['autoAfterDownload'] = this.downloadAndPlay ? true : false;
    const contentType = this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType;

    const telemetryObject = new TelemetryObject(
      this.content.identifier,
      this.cardData.contentData ? this.cardData.contentData.contentType : this.cardData.contentType,
      this.content.contentData.pkgVersion,
    );

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      ImpressionType.DETAIL,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      telemetryObject,
      values,
      this.objRollup,
      this.corRelationList);
  }

  generateRollUp() {
    if (this.cardData) {
      const hierarchyInfo = this.cardData.hierarchyInfo ? this.cardData.hierarchyInfo : null;
      if (hierarchyInfo === null) {
        this.objRollup.l1 = this.identifier;
      } else {
        _.forEach(hierarchyInfo, (value, key) => {
          if (key === 0) {
            this.objRollup.l1 = value.identifier;
          } else if (key === 1) {
            this.objRollup.l2 = value.identifier;
          } else if (key === 2) {
            this.objRollup.l3 = value.identifier;
          } else if (key === 3) {
            this.objRollup.l4 = value.identifier;
          }
        });
      }
    }
  }

  generateImpressionEvent(objectId, objectType, objectVersion) {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.DETAIL, '',
      PageId.CONTENT_DETAIL,
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
      PageId.CONTENT_DETAIL,
      telemetryObject,
      this.objRollup,
      this.corRelationList);
  }

  generateEndEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateEndTelemetry(
      objectType,
      Mode.PLAY,
      PageId.CONTENT_DETAIL,
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

  /**
   * It will Dismiss active popup
   */
  async dismissPopup() {
    // migration-TODO

    const activePortal = await this.modalCtrl.getTop();
    // const activePortal = this.ionicApp._modalPortal.getActive() || this.ionicApp._overlayPortal.getActive();
    if (activePortal) {
      activePortal.dismiss();
    } else {
      this.location.back();
    }
  }

  popToPreviousPage(isNavBack?) {
    if (this.isResumedCourse) {
      // migration-TODO
      // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 3));
      this.router.navigate(['../../'], { relativeTo: this.route});
    } else {
      if (isNavBack) {
        // this.navCtrl.pop();
        this.location.back();
      }
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
  importContent(identifiers: Array<string>, isChild: boolean) {
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
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
          });
        }

        if (event.payload && event.type === ContentEventType.STREAMING_URL_AVAILABLE) {
          this.zone.run(() => {
            const eventPayload = event.payload;
            if (eventPayload.contentId === this.content.identifier) {
              if (eventPayload.streamingUrl) {
                this.streamingUrl = eventPayload.streamingUrl;
                this.playingContent.contentData.streamingUrl = eventPayload.streamingUrl;
              } else {
                this.playOnlineSpinner = false;
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
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverMainTitle: this.content.contentData.name,
          icon: null,
          metaInfo:
            '1 item ' + '(' + this.fileSizePipe.transform(this.content.contentData.size, 2) + ')',
          isUpdateAvail: this.contentDownloadable[this.content.identifier] && this.isUpdateAvail,
        },
        cssClass: 'sb-popover info',
      });
      await popover.present();
      const response = await popover.onDidDismiss();
      if (response.data) {
        this.downloadContent();
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
        this.events.subscribe('genie.event', (data) => {
          this.zone.run(() => {
            data = JSON.parse(data);
            const res = data;
            if (res.type === 'downloadProgress' && res.data.downloadProgress) {
              this.downloadProgress = res.data.downloadProgress === -1 ? '0' : res.data.downloadProgress;
              if (res.data.downloadProgress === 100) {
                // this.showLoading = false;
                this.showDownload = false;
                this.content.isAvailableLocally = true;
              }
            }
          });
        });
        const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          this.isUpdateAvail ? InteractSubtype.UPDATE_INITIATE : InteractSubtype.DOWNLOAD_INITIATE,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          telemetryObject,
          values,
          this.objRollup,
          this.corRelationList);
      }
    });
  }

  cancelDownload() {
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

  /**
   * function add eclipses to the texts
   */
  addElipsesInLongText(msg: string) {
    if (this.commonUtilService.translateMessage(msg).length >= 12) {
      return this.commonUtilService.translateMessage(msg).slice(0, 8) + '....';
    } else {
      return this.commonUtilService.translateMessage(msg);
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
      const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        subtype,
        Environment.HOME,
        PageId.CONTENT_DETAIL,
        telemetryObject,
        values,
        this.objRollup,
        this.corRelationList);
    }

    if (!AppGlobalService.isPlayerLaunched && this.userCount > 2 && this.network.type !== '2g') {
      this.openPlayAsPopup(isStreaming);
      // alert.present();
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
            md: 'md-sad',
            ios: 'ios-sad',
            className: ''
          },
          metaInfo: '',
          sbPopoverContent: this.commonUtilService.translateMessage('CONSIDER_DOWNLOAD')
        },
        cssClass: 'sb-popover warning',
      });
      await popover.present();
      const response = await popover.onDidDismiss();
      if (response.data == null) {
        return;
      }
      if (response.data) {
        if (!AppGlobalService.isPlayerLaunched && this.userCount > 2) {
          this.openPlayAsPopup(isStreaming);
        } else {
          this.playContent(isStreaming);
        }
      } else {
        this.downloadContent();
      }
    } else {
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
          md: 'md-warning',
          ios: 'ios-warning',
          className: ''
        }
      },
      cssClass: 'sb-popover warning',
    });
    await popover.present();
    await popover.onDidDismiss();
    // migration-TODO
    // this.navCtrl.pop();
    this.location.back();

  }

  async openPlayAsPopup(isStreaming) {
    const profile = this.appGlobalService.getCurrentUser();
    this.isUsrGrpAlrtOpen = true;
    // if (profile.board.length > 1) {
    const confirm = await this.popoverCtrl.create( {
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('PLAY_AS'),
        sbPopoverMainTitle: profile.handle,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          },
          {
            btntext: this.commonUtilService.translateMessage('CHANGE_USER'),
            btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const response = await confirm.onDidDismiss();
    console.log('response inside content details' , response);
    if (response.data == null) {
      return;
    }
    if (response.data) {
      this.playContent(isStreaming);
    } else {
      const playConfig: any = {};
      playConfig.playContent = true;
      playConfig.streaming = isStreaming;
      this.router.navigate([RouterLinks.USER_AND_GROUPS], {
        state: {
          playConfig: playConfig
        }
      });
    }

  }

  /**
   * Play content
   */
  playContent(isStreaming: boolean) {
    // set the boolean to true, so when the content player is closed, we get to know that
    // we are back from content player
    if (this.apiLevel < 21 && this.appAvailability === 'false') {
      this.showPopupDialog();
    } else {
      this.downloadAndPlay = false;
      if (!AppGlobalService.isPlayerLaunched) {
        AppGlobalService.isPlayerLaunched = true;
      }
      this.zone.run(() => {
        this.isPlayerLaunched = true;
        const values = new Map();

        values['autoAfterDownload'] = this.downloadAndPlay ? true : false;
        values['isStreaming'] = isStreaming;
        const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          InteractSubtype.CONTENT_PLAY,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          telemetryObject,
          values,
          this.objRollup,
          this.corRelationList);
      });

      if (isStreaming) {
        const extraInfoMap = { hierarchyInfo: [] };
        if (this.cardData && this.cardData.hierarchyInfo) {
          extraInfoMap.hierarchyInfo = this.cardData.hierarchyInfo;
        } else if (this.hierarchyInfo && this.hierarchyInfo.hierarchyInfo) {
          extraInfoMap.hierarchyInfo = this.hierarchyInfo.hierarchyInfo;
        }

        const playContent = this.playingContent;
      }
      this.downloadAndPlay = false;
      const request: any = {};
      if (isStreaming) {
        request.streaming = isStreaming;
      }
      request['correlationData'] = this.corRelationList;

      if (this.isResumedCourse) {
        this.playingContent.hierarchyInfo = this.hierarchyInfo.hierarchyInfo;
      }

      this.playerService.getPlayerConfig(this.playingContent, request).subscribe((data) => {
        data['data'] = {};
        if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
          if (!isStreaming) {
            this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
              this.canvasPlayerService.xmlToJSon(`${data.metadata.basePath}/index.ecml`).then((json) => {
                data['data'] = json;
                this.router.navigate([RouterLinks.PLAYER], {
                  state: {
                    config: data
                  }
                });
              }).catch((error) => {
                console.error('error1', error);
              });
            }).catch((err) => {
              console.error('err', err);
              this.canvasPlayerService.readJSON(`${data.metadata.basePath}/index.json`).then((json) => {
                data['data'] = json;
                this.router.navigate([RouterLinks.PLAYER], {
                  state: {
                    config: data
                  }
                });
              }).catch((e) => {
                console.error('readJSON error', e);
              });
            });
          } else {
            this.router.navigate([RouterLinks.PLAYER], {
              state: {
                config: data
              }
            });
          }

        } else {
          this.router.navigate([RouterLinks.PLAYER], {
            state: {
              config: data
            }
          });
        }
      });
    }
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
        console.log('device api level', this.apiLevel);
      }).catch((error: any) => {
        console.error('Error ', error);
      });
  }

  async showOverflowMenu(event) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.KEBAB_MENU_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    const popover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      componentProps: {
        content: this.content,
        isChild: this.isChildContent,
        objRollup: this.objRollup,
        pageName: PageId.CONTENT_DETAIL,
        corRelationList: this.corRelationList
      },
      cssClass: 'content-action'
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    this.zone.run(() => {
      if (data.isDeleted) {
        this.content.contentData.streamingUrl = this.streamingUrl;
        this.contentDownloadable[this.content.identifier] = false;
        const playContent = this.playingContent;
        playContent.isAvailableLocally = false;
        //   this.content.streamingUrl = this.streamingUrl;
      }
    });
  }

  async showDeletePopup() {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.KEBAB_MENU_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        content: this.content,
        isChild: this.isChildContent,
        objRollup: this.objRollup,
        pageName: PageId.CONTENT_DETAIL,
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
        metaInfo: this.content.contentData.name,
        sbPopoverContent: ' 1 item' + ' (' + this.fileSizePipe.transform(this.content.sizeOnDevice, 2) + ')',
      },
      cssClass: 'sb-popover danger',
    });
    await confirm.present();
    const response = await confirm.onDidDismiss();
    if (response.data) {
      this.deleteContent();
      this.popoverCtrl.dismiss();
    }
  }

  /**
   * Construct content delete request body
   */
  getDeleteRequestBody() {
    const apiParams = {
      contentDeleteList: [{
        contentId: (this.content && this.content.identifier) ? this.content.identifier : '',
        isChildContent: this.isChild
      }]
    };
    return apiParams;
  }

  showToaster(message) {
    // const toast = await this.toastController.create({
    //   message: message,
    //   duration: 2000,
    //   position: 'bottom'
    // });
    // toast.present();
    this.commonUtilService.showToast(message);
  }

  getMessageByConstant(constant: string) {
    let msg = '';
    this.translate.get(constant).subscribe(
      (value: any) => {
        msg = value;
      }
    );
    return msg;
  }

  async deleteContent() {
    const telemetryObject: TelemetryObject = new TelemetryObject(this.content.identifier,
      this.content.contentType, this.content.contentData.pkgVersion);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_CLICKED,
      Environment.HOME,
      this.pageName,
      telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList);
    const tmp = this.getDeleteRequestBody();
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.contentService.deleteContent(tmp).toPromise().then(async (res: any) => {
      await loader.dismiss();
      if (res && res.status === ContentDeleteStatus.NOT_FOUND) {
        this.showToaster(this.getMessageByConstant('CONTENT_DELETE_FAILED'));
      } else {
        // Publish saved resources update event
        this.events.publish('savedResources:update', {
          update: true
        });
        this.content.contentData.streamingUrl = this.streamingUrl;
        this.contentDownloadable[this.content.identifier] = false;
        const playContent = this.playingContent;
        playContent.isAvailableLocally = false;
        this.isDownloadStarted = false;
        this.showToaster(this.getMessageByConstant('MSG_RESOURCE_DELETED'));
      }
    }).catch(async (error: any) => {
      await loader.dismiss();
      console.log('delete response: ', error);
      this.showToaster(this.getMessageByConstant('CONTENT_DELETE_FAILED'));
    });
  }

  async showBookmarkMenu(event?) {
    const popover = await this.popoverCtrl.create({
      component: BookmarkComponent,
      componentProps: {
        content: this.content,
        isChild: this.isChildContent,
        objRollup: this.objRollup,
        corRelationList: this.corRelationList,
        position: 'bottom'
      },
      cssClass: 'bookmark-menu'
    });
    popover.present();
  }

  updateBookmarkPreference() {
    this.preference.putString(PreferenceKey.IS_BOOKMARK_VIEWED, 'true');
    this.popoverCtrl.dismiss();
    console.log('updateBookmarkPreference');
  }

  /**
   * Shares content to external devices
   */
  async share() {
    this.generateShareInteractEvents(InteractType.TOUCH, InteractSubtype.SHARE_LIBRARY_INITIATED, this.content.contentType);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const url = this.baseUrl + ShareUrl.CONTENT + this.content.identifier;
    if (this.contentDownloadable[this.content.identifier]) {
      const exportContentRequest: ContentExportRequest = {
        contentIds: [this.content.identifier],
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath()
      };
      this.contentService.exportContent(exportContentRequest).toPromise()
        .then(async (response: ContentExportResponse) => {
          await loader.dismiss();
          this.generateShareInteractEvents(InteractType.OTHER, InteractSubtype.SHARE_LIBRARY_SUCCESS, this.content.contentType);
          this.social.share('', '', '' + response.exportedFilePath, url);
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast('SHARE_CONTENT_FAILED');
        });
    } else {
      await loader.dismiss();
      this.generateShareInteractEvents(InteractType.OTHER, InteractSubtype.SHARE_LIBRARY_SUCCESS, this.content.contentType);
      this.social.share(null, null, null, url);
    }

  }

  /**
   * Generates Interact Events
   * @param interactType
   * @param subType
   * @param contentType
   */
  generateShareInteractEvents(interactType, subType, contentType) {
    const values = new Map();
    values['ContentType'] = contentType;
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(interactType,
      subType,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      telemetryObject,
      values,
      this.objRollup,
      this.corRelationList);
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
   * @param {string} param string as read less or read more
   * @param {object} objRollup object roll up
   * @param corRelationList correlation List
   */
  readLessorReadMore(param, objRollup, corRelationList) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      param = 'read-more-clicked' === param ? InteractSubtype.READ_MORE_CLICKED : InteractSubtype.READ_LESS_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL,
      undefined,
      telemetryObject,
      objRollup,
      corRelationList
    );
  }

  async showPopupDialog() {
    const popover = await this.popoverCtrl.create({
      component: DialogPopupComponent,
      componentProps: {
        title: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED'),
        body: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED_DESC'),
        buttonText: this.commonUtilService.translateMessage('INSTALL_CROSSWALK')
      },
      cssClass: 'popover-alert'
    });
    popover.present();
  }

  private resetTabs(selectedUser) {
    setTimeout(() => {
      if (selectedUser.profileType === ProfileType.STUDENT) {
        initTabs(this.container, GUEST_STUDENT_TABS);
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise().then();
      } else {
        initTabs(this.container, GUEST_TEACHER_TABS);
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise().then();
      }
      this.events.publish('refresh:profile');
      this.events.publish(AppGlobalService.USER_INFO_UPDATED);
      this.appGlobalService.setSelectedUser(undefined);
      // migration-TODO
      // this.app.getRootNav().setRoot(TabsPage);
    }, 1000);
  }

  /* Present Toast */


  /* SUDO
   if firstprperty is there and secondprperty is not there, then return firstprperty value
   else if firstprperty is not there and secondprperty is there, then return secondprperty value
   else do the merger of firstprperty and secondprperty value and return merged value
 */
  mergeProperties(firstProp, secondProp) {
    if (this.content.contentData[firstProp] && !this.content.contentData[secondProp]) {
      return this.content.contentData[firstProp];
    } else if (!this.content.contentData[firstProp] && this.content.contentData[secondProp]) {
      return this.content.contentData[secondProp];
    } else {
      let first: any;
      let second: any;
      first = this.content.contentData[firstProp].split(', ');
      second = this.content.contentData[secondProp].split(', ');
      first = second.concat(first);
      first = Array.from(new Set(first));
      return first.join(', ');
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CONTENT_DETAIL, Environment.HOME,
        true, this.cardData.identifier, this.corRelationList);
        // migration-TODO
        // this.handleNavBackButton();
        break;
    }
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

  goBack(index, length) {
    if (index !== (length - 1)) {
      // this.navCtrl.pop();
      this.location.back();
    }
  }
}
