import { Router, NavigationExtras, RouterOutlet } from '@angular/router';
import { AfterViewInit, Component, Inject, NgZone, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';

import { Events, Platform, IonRouterOutlet } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService,
  UtilityService,
  AppRatingService,
  AppHeaderService,
  FormAndFrameworkUtilService,
} from '../services';
import { InteractType, InteractSubtype, Environment, PageId, ImpressionType } from 'services/telemetry-constants';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, LOGIN_TEACHER_TABS } from './module.service';
// migration-TODO
import { initTabs } from './module.service';
import { Observable } from 'rxjs/Observable';
import { ImageLoaderService, ImageLoaderConfigService } from 'ionic-image-loader';
import { GenericAppConfig, PreferenceKey, ProfileConstants } from './app.constant';
import { Network } from '@ionic-native/network/ngx';
import {
  AuthService, ErrorEventType, EventNamespace, EventsBusService, ProfileService, ProfileType, SharedPreferences,
  SunbirdSdk, TelemetryAutoSyncUtil, TelemetryService, NotificationService
} from 'sunbird-sdk';
import { tap } from 'rxjs/operators';
import { ActivePageService } from '../services/active-page-service';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from '../services/sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplashscreenImportActionHandlerDelegate } from '../services/sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { ContainerService, LogoutHandlerService, TncUpdateHandlerService } from '../services';
import { NotificationService as localNotification } from '../services/notification.service';
import { TabsPage } from './tabs/tabs.page';
import { RouterLinks } from './app.constant';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  providers: [
    SplashcreenTelemetryActionHandlerDelegate,
    SplashscreenImportActionHandlerDelegate,
    SplaschreenDeeplinkActionHandlerDelegate
  ],
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
  rootPage: any;
  public counter = 0;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search'],
  };
  public sideMenuEvent = new EventEmitter<void>();
  public showWalkthroughBackDrop = false;

  private telemetryAutoSyncUtil: TelemetryAutoSyncUtil;

  profile: any = {};
  selectedLanguage: string;
  appName: string;
  @ViewChild('mainContent', { read: IonRouterOutlet })routerOutlet: IonRouterOutlet;

  constructor(
    // private splashScreen: SplashScreen,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('NOTIFICATION_SERVICE') private notificationServices: NotificationService,
    private platform: Platform,
    private statusBar: StatusBar,
    private imageLoaderConfig: ImageLoaderConfigService,
    private translate: TranslateService,
    private events: Events,
    private zone: NgZone,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private utilityService: UtilityService,
    private splashcreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate,
    private splashscreenImportActionHandlerDelegate: SplashscreenImportActionHandlerDelegate,
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private headerServie: AppHeaderService,
    private logoutHandlerService: LogoutHandlerService,
    private network: Network,
    private appRatingService: AppRatingService,
    private activePageService: ActivePageService,
    private notificationSrc: localNotification,
    private headerService: AppHeaderService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private containerService: ContainerService,
    private location: Location
  ) {
    this.telemetryAutoSyncUtil = new TelemetryAutoSyncUtil(this.telemetryService);
    platform.ready().then(async () => {
      console.log("Inside platform ready");
      this.fcmTokenWatcher(); // Notification related
      this.receiveNotification();
      this.imageLoaderConfig.enableDebugMode();
      this.imageLoaderConfig.setMaximumCacheSize(100 * 1024 * 1024);
      this.telemetryGeneratorService.genererateAppStartTelemetry(await utilityService.getDeviceSpec());
      this.generateNetworkTelemetry();
      this.autoSyncTelemetry();
      this.subscribeEvents();
      this.showAppWalkThroughScreen();
      this.startOpenrapDiscovery();
      this.saveDefaultSyncSetting();
      this.checkAppUpdateAvailable();
      this.makeEntryInSupportFolder();
      this.checkForTncUpdate();
      this.handleAuthErrors();
      await this.getSelectedLanguage();
      await this.navigateToAppropriatePage();
      this.handleSunbirdSplashScreenActions();
      this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, '').subscribe();
      window['thisRef'] = this;
      this.statusBar.styleBlackTranslucent();
      this.handleBackButton();
      this.appRatingService.checkInitialDate();
      this.getUtmParameter();
    });
  }

  /* Generates new FCM Token if not available
   * if available then on token refresh updates FCM token
   */
  async fcmTokenWatcher() {
    const fcmToken = await this.preferences.getString('fcm_token').toPromise();
    if (!fcmToken) {
      FCMPlugin.getToken((token) => {
        this.storeFCMToken(token);
        SunbirdSdk.instance.updateTelemetryConfig({ fcmToken: token });
      });
    }
    FCMPlugin.onTokenRefresh((token) => {
      this.storeFCMToken(token);
      SunbirdSdk.instance.updateTelemetryConfig({ fcmToken: token });
    });
  }

  storeFCMToken(token: string) {
    this.preferences.putString('fcm_token', token).toPromise();
  }

  handleNotification(data) {
    switch (data.actionData.actionType) {
      case 'updateApp':
        console.log('updateApp');
        break;
      case 'contentUpdate':
        console.log('contentUpdate');
        break;
      case 'bookUpdate':
        console.log('bookUpdate');
        break;
      default:
        console.log('Default Called');
        break;
    }
  }


  /* Notification data will be received in data variable
   * can take action on data variable
   */
  receiveNotification() {
    FCMPlugin.onNotification((data) => {
      if (data.wasTapped) {
        // Notification was received on device tray and tapped by the user.
      } else {
        // Notification was received in foreground. Maybe the user needs to be notified.
      }
      data['isRead'] = data.wasTapped ? 1 : 0;
      data['actionData'] = JSON.parse(data['actionData']);
      this.notificationServices.addNotification(data).subscribe((status) => {
        this.events.publish('notification:received');
        this.events.publish('notification-status:update', { isUnreadNotifications: true });
      });
    },
      (sucess) => {
        console.log('Notification Sucess Callback');
        console.log(sucess);
      },
      (err) => {
        console.log('Notification Error Callback');
        console.log(err);
      });
  }

  /**
	 * Angular life cycle hooks
	 */
  ngOnInit() {
    this.headerServie.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });

    this.commonUtilService.networkAvailability$.subscribe((available: boolean) => {
      // migration-TODO
      // const navObj: any = this.app.getActiveNavs()[0];
      // const activeView: any = navObj.getActive();
      // const pageId: string = this.activePageService.computePageId((activeView as any).instance);
      // if (available) {
      //   this.addNetworkTelemetry(InteractSubtype.INTERNET_CONNECTED, pageId);
      // } else {
      //   this.addNetworkTelemetry(InteractSubtype.INTERNET_DISCONNECTED, pageId);
      // }
    });
    this.notificationSrc.setupLocalNotification();
  }

  addNetworkTelemetry(subtype: string, pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      subtype,
      Environment.HOME,
      pageId, undefined
    );
  }
  ngAfterViewInit(): void {
    this.platform.resume.subscribe(() => {
      this.telemetryGeneratorService.generateInterruptTelemetry('resume', '');
      this.handleSunbirdSplashScreenActions();
    });

    this.platform.pause.subscribe(() => {
      this.telemetryGeneratorService.generateInterruptTelemetry('background', '');
    });
  }

  handleBackButton() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      console.log('URL' + this.router.url);
      if(this.router.url === RouterLinks.LIBRARY_TAB || this.router.url == RouterLinks.COURSE_TAB 
      || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url == RouterLinks.PROFILE_TAB || 
      this.router.url == RouterLinks.GUEST_PROFILE_TAB) {
        this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false);
      } else {
        // this.routerOutlet.pop();
        this.location.back && this.location.back();
      }
      // migration-TODO
      // let navObj = this.app.getRootNavs()[0];
      // let currentPage = navObj.getActive().name;
      // const activeView: any = this.nav.getActive();
      // let activeView: any;
      // if (activeView != null && ((activeView as any).instance instanceof TabsPage)) {
      //   navObj = this.app.getActiveNavs()[0];
      //   currentPage = navObj.getActive().name;
      // }

      //   if (navObj.canGoBack()) {
      //     return navObj.pop();
      //   } else {
      //     this.commonUtilService.showExitPopUp(this.activePageService.computePageId((activeView as any).instance), Environment.HOME, false);
      //   }
    });

  }

  generateNetworkTelemetry() {
    const value = new Map();
    value['network-type'] = this.network.type;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      InteractSubtype.NETWORK_STATUS, Environment.HOME, PageId.SPLASH_SCREEN, undefined, value);
  }

  subscribeEvents() {
    this.events.subscribe('coach_mark_seen', (data) => {
      this.showWalkthroughBackDrop = data.showWalkthroughBackDrop;
      this.appName = data.appName;
    });
    this.events.subscribe('tab.change', (data) => {
      this.zone.run(() => {
        this.generateInteractEvent(data);
        // Added below code to generate Impression Before Interact for Library,Courses,Profile
        this.generateImpressionEvent(data);
      });
    });

    this.translate.onLangChange.subscribe((params) => {
      if (params.lang === 'ur' && !this.platform.isRTL) {
        // migration-TODO since platfrom is changed, this is a quick fix need to review later
        document.documentElement.dir = 'rtl';
        // this.platform .setDir('rtl', true);
      } else if (this.platform.isRTL) {
        // migration-TODO since platfrom is changed, this is a quick fix need to review later
        document.documentElement.dir = 'ltr';
        // this.platform.setDir('ltr', true);
      }
    });
  }


  private async checkForTncUpdate() {
    await this.tncUpdateHandlerService.checkForTncUpdate();
  }

  private async getSelectedLanguage() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (selectedLanguage) {
      await this.translate.use(selectedLanguage).toPromise();
    }
  }

  private async makeEntryInSupportFolder() {
    return new Promise((resolve => {
      (window as any).supportfile.makeEntryInSunbirdSupportFile((result) => {
        this.preferences.putString(PreferenceKey.KEY_SUNBIRD_SUPPORT_FILE_PATH, result).toPromise().then();
        resolve();
      }, () => {
      });
    }));
  }

  private async saveDefaultSyncSetting() {
    return this.preferences.getString('sync_config').toPromise()
      .then(val => {
        if (val === undefined || val === '' || val === null) {
          this.preferences.putString('sync_config', 'ALWAYS_ON').toPromise().then();
        }
      });
  }

  private generateInteractEvent(pageid: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.TAB_CLICKED,
      Environment.HOME,
      pageid.toLowerCase());
  }

  private generateImpressionEvent(pageid: string) {
    pageid = pageid.toLowerCase();
    const env = pageid.localeCompare(PageId.PROFILE) ? Environment.HOME : Environment.USER;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      pageid,
      env);
  }

  private async startOpenrapDiscovery(): Promise<undefined> {
    if (this.appGlobalService.OPEN_RAPDISCOVERY_ENABLED) {
      return Observable.create((observer) => {
        (window as any).openrap.startDiscovery(
          (response: { ip: string, actionType: 'connected' | 'disconnected' }) => {
            observer.next(response);
          }, (e) => {
            observer.error(e);
          }
        );
      }).do((response: { ip?: string, actionType: 'connected' | 'disconnected' }) => {
        const values = new Map();
        values['openrapInfo'] = response;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
          response.actionType === 'connected' ? InteractSubtype.OPENRAP_DEVICE_CONNECTED : InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
          Environment.HOME,
          Environment.HOME, undefined,
          values);
        SunbirdSdk.instance.updateContentServiceConfig({
          host: response.actionType === 'connected' ? response.ip : undefined
        });

        SunbirdSdk.instance.updatePageServiceConfig({
          host: response.actionType === 'connected' ? response.ip : undefined
        });

        SunbirdSdk.instance.updateTelemetryConfig({
          host: response.actionType === 'connected' ? response.ip : undefined
        });
      }).toPromise();
    }
  }

  private async checkAppUpdateAvailable() {
    return this.formAndFrameworkUtilService.checkNewAppVersion()
      .then(result => {
        if (result !== undefined) {
          setTimeout(() => {
            this.events.publish('force_optional_upgrade', { upgrade: result });
          }, 5000);
        }
      }).catch(err => {
        // console.log('checkNewAppVersion err', err, err instanceof NetworkError);
      });
  }

  private async handleSunbirdSplashScreenActions(): Promise<undefined> {
    const stringifiedActions = await new Promise<string>((resolve) => {
      splashscreen.getActions((actionsTobeDone) => {
        resolve(actionsTobeDone);
      });
    });

    const actions: { type: string, payload: any }[] = JSON.parse(stringifiedActions);

    for (const action of actions) {
      switch (action.type) {
        case 'TELEMETRY': {
          await this.splashcreenTelemetryActionHandlerDelegate.onAction(action.type, action.payload).toPromise();
          break;
        }
        case 'IMPORT': {
          await this.splashscreenImportActionHandlerDelegate.onAction(action.type, action.payload).toPromise();
          break;
        }
        case 'DEEPLINK': {
          await this.splaschreenDeeplinkActionHandlerDelegate.onAction(action.payload.type, action.payload).toPromise();
          break;
        }
        default:
          return;
      }
    }

    splashscreen.markImportDone();
    splashscreen.hide();
  }

  private autoSyncTelemetry() {
    this.telemetryAutoSyncUtil.start(30 * 1000)
      .mergeMap(() => {
        return Observable.combineLatest(
          this.platform.pause.pipe(tap(() => this.telemetryAutoSyncUtil.pause())),
          this.platform.resume.pipe(tap(() => this.telemetryAutoSyncUtil.continue()))
        );
      })
      .subscribe();
  }

  initializeApp() {
    this.headerService.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      // this.splashScreen.hide();
    });
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      const routeUrl = this.router.url;

      if ((routeUrl.indexOf(RouterLinks.USER_TYPE_SELECTION) !== -1)
      || (routeUrl.indexOf(RouterLinks.ACTIVE_DOWNLOADS) !== -1)
      || (routeUrl.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1)
      || (routeUrl.indexOf(RouterLinks.COLLECTION_DETAILS) !== -1)
      || (routeUrl.indexOf(RouterLinks.CONTENT_DETAILS) !== -1)
      || (routeUrl.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1)
      || (routeUrl.indexOf(RouterLinks.FAQ_HELP) !== -1)
      || (routeUrl.indexOf(RouterLinks.PROFILE_SETTINGS) !== -1)
      || (routeUrl.indexOf(RouterLinks.QRCODERESULT) !== -1)
      || (routeUrl.indexOf(RouterLinks.STORAGE_SETTINGS)) !== -1) {
          this.headerService.sidebarEvent($event);
          return;
      } else {
        if (this.router.url === RouterLinks.LIBRARY_TAB || this.router.url === RouterLinks.COURSE_TAB
          || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url === RouterLinks.PROFILE_TAB ||
          this.router.url === RouterLinks.GUEST_PROFILE_TAB) {
            this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false);
          } else {
          // this.routerOutlet.pop();
            this.location.back && this.location.back();
          }
      }
    } else {
      this.headerService.sidebarEvent($event);
    }
    /*if ($event.name === 'back') {
      let navObj = this.app.getRootNavs()[0];
      let activeView: ViewController = this.nav.getActive();
      if (activeView != null && ((<any>activeView).instance instanceof TabsPage)) {
        navObj = this.app.getActiveNavs()[0];
        activeView = navObj.getActive();
      }
      if (((<any>activeView).instance instanceof UserTypeSelectionPage)
        || ((<any>activeView).instance instanceof EnrolledCourseDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsEtbPage)
        || ((<any>activeView).instance instanceof ContentDetailsPage)
        || ((<any>activeView).instance instanceof OnboardingPage)
        || ((<any>activeView).instance instanceof QrCodeResultPage)
        || ((<any>activeView).instance instanceof FaqPage)
        || ((<any>activeView).instance['pageId'] === 'ProfileSettingsPage')
      ) {
        this.headerServie.sidebarEvent($event);
        return;
      }
      if (navObj.canGoBack()) {
        return navObj.pop();
      } else {
        this.commonUtilService.showExitPopUp(this.activePageService.computePageId((<any>activeView).instance), Environment.HOME, false);
      }*/
  }

  getProfileSettingConfig(hideBackButton = false) {
    this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE)
      .then(response => {
        if (response === 'true') {
          // migration-TODO
          // this.nav.setRoot('ProfileSettingsPage', { hideBackButton: hideBackButton });
        } else {
          // migration-TODO
          // this.nav.setRoot(TabsPage);
        }
      })
      .catch(error => {
        // migration-TODO
        // this.nav.setRoot(TabsPage);
      });
  }

  private async navigateToAppropriatePage() {
    // const session = await this.authService.getSession().toPromise();
    // console.log(`Platform Session`, session);
    // if (!session) {
    //   console.log(`Success Platform Session`, session);
    //   this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
    //     .then(async (profileType: ProfileType | undefined) => {
    //       if (!profileType) {
    //         this.appGlobalService.isProfileSettingsCompleted = false;
    //         // migration-TODO
    //         // this.rootPage = LanguageSettingsPage;
    //         this.router.navigate(['settings/language-setting', false]);
    //         return;
    //       }

    //       switch (profileType.toLocaleLowerCase()) {
    //         case ProfileType.TEACHER: {
    //           await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
    //           // migration-TODO
    //           // initTabs(this.containerService, GUEST_TEACHER_TABS);
    //           break;
    //         }
    //         case ProfileType.STUDENT: {
    //           await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise();
    //           // migration-TODO
    //           // initTabs(this.containerService, GUEST_STUDENT_TABS);
    //           break;
    //         }
    //       }

    //       const display_cat_page: string = await this.utilityService
    //         .getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE);

    //       if (display_cat_page === 'false') {
    //         // migration-TODO
    //         // await this.nav.setRoot(TabsPage);
    //       } else {
    //         const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
    //           .toPromise();
    //         if (
    //           profile
    //           && profile.syllabus && profile.syllabus[0]
    //           && profile.board && profile.board.length
    //           && profile.grade && profile.grade.length
    //           && profile.medium && profile.medium.length
    //         ) {
    //           this.appGlobalService.isProfileSettingsCompleted = true;
    //           // migration-TODO
    //           // await this.nav.setRoot(TabsPage);
    //         } else {
    //           this.appGlobalService.isProfileSettingsCompleted = false;
    //           try {
    //             if ((await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise()) === 'true') {
    //               this.getProfileSettingConfig(true);
    //             } else {
    //               // migration-TODO
    //               // await this.nav.insertPages(0, [{ page: LanguageSettingsPage }, { page: UserTypeSelectionPage }]);
    //               this.router.navigate(['settings/language-setting', false]);
    //             }
    //           } catch (e) {
    //             this.getProfileSettingConfig();
    //           }
    //         }
    //       }
    //     });
    // } else {
    //   console.log(`Failure Session`, session);
    //   this.profileService.getActiveSessionProfile({
    //     requiredFields: ProfileConstants.REQUIRED_FIELDS
    //   }).toPromise()
    //     .then(async (profile: any) => {
    //       if (profile
    //         && profile.syllabus && profile.syllabus[0]
    //         && profile.board && profile.board.length
    //         && profile.grade && profile.grade.length
    //         && profile.medium && profile.medium.length) {

    //         // migration-TODO
    //         // initTabs(this.containerService, LOGIN_TEACHER_TABS);

    //         if ((await this.preferences.getString('SHOW_WELCOME_TOAST').toPromise()) === 'true') {
    //           this.preferences.putString('SHOW_WELCOME_TOAST', 'false').toPromise().then();

    //           const serverProfile = await this.profileService.getServerProfilesDetails({
    //             userId: session.userToken,
    //             requiredFields: ProfileConstants.REQUIRED_FIELDS,
    //           }).toPromise();

    //           this.commonUtilService
    //             .showToast(this.commonUtilService.translateMessage('WELCOME_BACK', serverProfile.firstName));
    //         }
    //         // migration-TODO
    //         // this.rootPage = TabsPage;
    //       } else {
    //         const serverProfile = await this.profileService.getServerProfilesDetails({
    //           userId: session.userToken,
    //           requiredFields: ProfileConstants.REQUIRED_FIELDS,
    //         }).toPromise();

    //         this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, profile)
    //           .then((value) => {
    //             if (value['status']) {
    //               // migration-TODO
    //               // this.nav.setRoot(TabsPage);
    //               // initTabs(this.containerService, LOGIN_TEACHER_TABS);
    //             } else {
    //               // migration-TODO
    //               // this.nav.setRoot(CategoriesEditPage, {
    //               //   showOnlyMandatoryFields: true,
    //               //   profile: value['profile']
    //               // });
    //             }
    //           });
    //       }
    //     });
    // }
  }

  menuItemAction(menuName) {
    switch (menuName.menuItem) {
      case 'USERS_AND_GROUPS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.USER_GROUP_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );
        const navigationExtrasUG: NavigationExtras = { state: { profile: this.profile } };
        this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}`], navigationExtrasUG);
        break;

      case 'REPORTS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.REPORTS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        const navigationExtrasReports: NavigationExtras = { state: { profile: this.profile } };
        this.router.navigate([`/${RouterLinks.REPORTS}`], navigationExtrasReports);
        break;

      case 'SETTINGS': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SETTINGS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        this.router.navigate([`/${RouterLinks.SETTINGS}`]);
        break;
      }
      case 'LANGUAGE': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.LANGUAGE_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        this.router.navigate([`/${RouterLinks.MENU_LANGUAGE_SETTING}`, true]);
        break;
      }

      case 'HELP':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.HELP_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        this.router.navigate([`/${RouterLinks.FAQ_HELP}`]);
        break;

      case 'LOGOUT':
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        } else {
          // migration-TODO
          this.logoutHandlerService.onLogout();
        }
        break;

    }
  }

  private handleAuthErrors() {
    this.eventsBusService.events(EventNamespace.ERROR)
      .filter((e) => e.type === ErrorEventType.AUTH_TOKEN_REFRESH_ERROR)
      .take(1).subscribe(() => {
        this.logoutHandlerService.onLogout();
      });
  }
  getUtmParameter() {
    this.utilityService.getUtmInfo().then(response => {
      if (response) {
        const utmTelemetry = new Map();
        utmTelemetry['utm_data'] = response;
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.UTM_INFO,
          Environment.HOME,
          PageId.HOME,
          undefined,
          utmTelemetry);
        this.utilityService.clearUtmInfo();
      }
    })
      .catch(error => {
        console.log('Error is', error);
      });
  }

  qrWalkthroughBackdropClicked() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.WALKTHROUGH_BACKDROP_CLICKED,
      Environment.ONBOARDING,
      PageId.LIBRARY,
    );
  }

  onConfirmationClicked(event) {
    event.stopPropagation();
    this.showWalkthroughBackDrop = false;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.WALKTHROUGH_CONFIRMATION_CLICKED,
      Environment.ONBOARDING,
      PageId.LIBRARY
    );
  }

  private async showAppWalkThroughScreen() {
    const showAppWalkthrough: boolean = await this.preferences.getBoolean('coach_mark_seen').toPromise();
    await this.preferences.putBoolean('coach_mark_seen', showAppWalkthrough).toPromise();
  }
}
