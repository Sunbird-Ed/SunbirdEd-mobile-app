import { Location } from '@angular/common';
import {
  AfterViewInit, Component,
  EventEmitter, Inject, NgZone,
  OnInit, ViewChild
} from '@angular/core';
import { Event, NavigationExtras, NavigationStart, Router } from '@angular/router';
import { ActivePageService } from '@app/services/active-page/active-page-service';
import { LogoutHandlerService } from '@app/services/handlers/logout-handler.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { NetworkAvailabilityToastService } from '@app/services/network-availability-toast/network-availability-toast.service';
import { NotificationService as LocalNotification } from '@app/services/notification.service';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {
  CorReleationDataType, Environment,
  ID, ImpressionType, InteractSubtype, InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { Network } from '@ionic-native/network/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Events, IonRouterOutlet, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CsClientStorage } from '@project-sunbird/client-services/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, mapTo, mergeMap, take, tap } from 'rxjs/operators';
import {
  AuthEventType, CodePushExperimentService, CorrelationData,
  DeviceRegisterService, ErrorEventType, EventNamespace, EventsBusService,
  GetSystemSettingsRequest, NotificationService,
  Profile, ProfileService, ProfileType, SharedPreferences,
  SunbirdSdk,
  SystemSettings, SystemSettingsService, TelemetryAutoSyncService, TelemetryService
} from 'sunbird-sdk';
import {
  AppGlobalService,
  AppHeaderService, AppRatingService, CommonUtilService,
  FormAndFrameworkUtilService,
  LocalCourseService,
  LoginHandlerService, SplashScreenService, TelemetryGeneratorService,
  UtilityService
} from '../services';
import {
  AppThemes, EventTopics, GenericAppConfig,
  PreferenceKey, ProfileConstants, RouterLinks, SystemSettingsIds
} from './app.constant';
import { EventParams } from './components/sign-in-card/event-params.interface';
import { ApiUtilsService, DbService, LocalStorageService, NetworkService } from './manage-learn/core';

declare const cordova;

@Component({
  selector: 'app-root',
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

  private telemetryAutoSync: TelemetryAutoSyncService;
  toggleRouterOutlet = true;
  rootPageDisplayed = false;
  profile: any = {};
  selectedLanguage: string;
  appName: string;
  appVersion: string;
  @ViewChild('mainContent', { read: IonRouterOutlet, static: false }) routerOutlet: IonRouterOutlet;
  isForeground: boolean;
  isPlannedMaintenanceStarted = false;
  isUnplannedMaintenanceStarted = false;
  timeLeft: string;
  eventSubscription: Subscription;
  isTimeAvailable = false;
  isOnBoardingCompleted: boolean;

  constructor(
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('NOTIFICATION_SERVICE') private notificationServices: NotificationService,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('CODEPUSH_EXPERIMENT_SERVICE') private codePushExperimentService: CodePushExperimentService,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private platform: Platform,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private events: Events,
    private zone: NgZone,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private logoutHandlerService: LogoutHandlerService,
    private network: Network,
    private appRatingService: AppRatingService,
    private activePageService: ActivePageService,
    private notificationSrc: LocalNotification,
    private router: Router,
    private location: Location,
    private menuCtrl: MenuController,
    private networkAvailability: NetworkAvailabilityToastService,
    private splashScreenService: SplashScreenService,
    private localCourseService: LocalCourseService,
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private utils: ApiUtilsService,
    private networkServ: NetworkService,
    private localStorage: LocalStorageService,
    private db: DbService,
    private loginHandlerService: LoginHandlerService
  ) {
    this.telemetryAutoSync = this.telemetryService.autoSync;
  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.formAndFrameworkUtilService.init();
      this.networkAvailability.init();
      this.fcmTokenWatcher(); // Notification related
      this.getSystemConfig();
      this.utilityService.getBuildConfigValue(GenericAppConfig.VERSION_NAME)
        .then(versionName => {
          this.appVersion = versionName;
        });
      this.checkForExperiment();
      this.receiveNotification();
      this.utilityService.getDeviceSpec()
        .then((deviceSpec) => {
          this.telemetryGeneratorService.genererateAppStartTelemetry(deviceSpec);
        });
      this.generateNetworkTelemetry();
      this.autoSyncTelemetry();
      this.subscribeEvents();
      this.startOpenrapDiscovery();
      this.saveDefaultSyncSetting();
      this.checkAppUpdateAvailable();
      this.makeEntryInSupportFolder();
      await this.getSelectedLanguage();
      await this.getDeviceProfile();
      if (this.appGlobalService.getUserId()) {
        this.reloadSigninEvents();
      } else {
        this.reloadGuestEvents();
      }
      this.handleAuthAutoMigrateEvents();
      this.handleAuthErrors();
      this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, '').subscribe();
      window['thisRef'] = this;
      this.statusBar.styleBlackTranslucent();
      this.handleBackButton();
      this.appRatingService.checkInitialDate();
      this.getCampaignParameter();
      this.checkForCodeUpdates();
      this.checkAndroidWebViewVersion();
      await this.checkForTheme();
      this.onTraceIdUpdate();
      this.utils.initilizeML();
      this.networkServ.netWorkCheck();
    });

    this.headerService.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });

    this.commonUtilService.networkAvailability$.subscribe((available: boolean) => {
      const pageId: string = this.activePageService.computePageId(this.router.url);
      if (available) {
        this.addNetworkTelemetry(InteractSubtype.INTERNET_CONNECTED, pageId);
      } else {
        this.addNetworkTelemetry(InteractSubtype.INTERNET_DISCONNECTED, pageId);
      }
    });

    if (cordova.plugins.notification && cordova.plugins.notification.local &&
      cordova.plugins.notification.local.launchDetails && cordova.plugins.notification.local.launchDetails.action === 'click') {
      const corRelationList: Array<CorrelationData> = [];
      const localNotificationId = cordova.plugins.notification.local.launchDetails.id;
      corRelationList.push({ id: localNotificationId ? localNotificationId + '' : '', type: CorReleationDataType.NOTIFICATION_ID });
      this.telemetryGeneratorService.generateNotificationClickedTelemetry(
        InteractType.LOCAL,
        this.activePageService.computePageId(this.router.url),
        undefined,
        corRelationList
      );
    }
    this.notificationSrc.setupLocalNotification();

    this.triggerSignInEvent();
  }

  // TODO: make this as private
  checkAndroidWebViewVersion() {
    var that = this;
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
      .then(function (packageInfo) {
        that.formAndFrameworkUtilService.getWebviewConfig().then(function (webviewVersion) {
          if (parseInt(packageInfo.versionName.split('.')[0], 10) <= webviewVersion) {
            document.getElementById('update-webview-container').style.display = 'block';
            that.telemetryGeneratorService.generateImpressionTelemetry(
              ImpressionType.VIEW, '',
              PageId.UPDATE_WEBVIEW_POPUP,
              Environment.HOME);
          }
        }).catch(function (err) {
          if (parseInt(packageInfo.versionName.split('.')[0], 10) <= 54) {
            document.getElementById('update-webview-container').style.display = 'block';
          }
        });
      })
      .catch(function (error) { 
        console.error(error);
      });
  }

  openPlaystore() {
    plugins['webViewChecker'].openGooglePlayPage()
      .then(function () { })
      .catch(function (error) { 
        console.error(error);
      });

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UPDATE_WEBVIEW_CLICKED,
      Environment.HOME,
      PageId.UPDATE_WEBVIEW_POPUP);
  }

  private getSystemConfig() {
    const getSystemSettingsRequest: GetSystemSettingsRequest = {
      id: SystemSettingsIds.HOT_CODE_PUSH_KEY
    };
    this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        if (res && res.value) {
          const value = JSON.parse(res.value);
          if (value.deploymentKey) {
            this.preferences.putString(PreferenceKey.DEPLOYMENT_KEY, value.deploymentKey).subscribe();
          }
        }
      }).catch(err => {
        console.log('error :', err);
      });
  }

  private checkForCodeUpdates() {
    this.preferences.getString(PreferenceKey.DEPLOYMENT_KEY).toPromise().then(deploymentKey => {
      if (codePush != null && deploymentKey) {
        const value = new Map();
        value['deploymentKey'] = deploymentKey;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_INITIATED,
          Environment.HOME, PageId.HOME, null, value);
        codePush.sync((status => {
          this.syncStatus(status);
        }), {
          deploymentKey
        }, (progress) => this.downloadProgress(progress));
      } else {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_KEY_NOT_DEFINED,
          Environment.HOME, PageId.HOME);
      }
    });
  }

  private syncStatus(status) {
    switch (status) {
      case SyncStatus.DOWNLOADING_PACKAGE:
        const value = new Map();
        value['codepushUpdate'] = 'downloading-package';
        break;
      case SyncStatus.INSTALLING_UPDATE:
        const value1 = new Map();
        value1['codepushUpdate'] = 'installing-update';
        break;
      case SyncStatus.ERROR:
        const value2 = new Map();
        value2['codepushUpdate'] = 'error-in-update';
    }
  }

  private downloadProgress(downloadProgress) {
    if (downloadProgress) {
      console.log('Downloading ' + downloadProgress.receivedBytes + ' of ' +
        downloadProgress.totalBytes);
    }
  }

  private checkForExperiment() {
    if (codePush === null) {
      return;
    }
    /**
     * TODO
     * call the update
     * if update is set
     * then check for default-deplyment-key, if matches
     * then remove emperiment_key and emperiemtn_app_version
     * if not then
     * then set emperiment_key and experiemnt_app_version
     * if update is null
     * then remove emperiment_key and emperiemtn_app_version
     */
    codePush.getCurrentPackage((update) => {
      if (update) {
        this.codePushExperimentService.getDefaultDeploymentKey().subscribe(key => {
          if (key !== update.deploymentKey && this.appVersion === update.appVersion) {
            this.codePushExperimentService.setExperimentKey(update.deploymentKey).subscribe();
            this.codePushExperimentService.setExperimentAppVersion(update.appVersion).subscribe();
          } else if (key === update.deploymentKey || this.appVersion !== update.appVersion) {
            this.codePushExperimentService.setExperimentKey('').subscribe();
            this.codePushExperimentService.setExperimentAppVersion('').subscribe();
          }
        });
      } else {
        this.codePushExperimentService.setExperimentKey('').subscribe();
        this.codePushExperimentService.setExperimentAppVersion('').subscribe();
      }
    });
  }

  /* Generates new FCM Token if not available
   * if available then on token refresh updates FCM token
   */
  private async fcmTokenWatcher() {
    const fcmToken = await this.preferences.getString(PreferenceKey.FCM_TOKEN).toPromise();
    if (!fcmToken) {
      FCMPlugin.getToken((token) => {
        this.storeFCMToken(token);
        SunbirdSdk.instance.updateDeviceRegisterConfig({ fcmToken: token });
      });
    } else {
      FCMPlugin.onTokenRefresh((token) => {
        this.storeFCMToken(token);
        SunbirdSdk.instance.updateDeviceRegisterConfig({ fcmToken: token });
      });
    }
  }

  private storeFCMToken(token: string) {
    this.preferences.putString(PreferenceKey.FCM_TOKEN, token).toPromise();
  }

  /* Notification data will be received in data variable
   * can take action on data variable
   */
  private async receiveNotification() {
    const val = await this.preferences.getString(PreferenceKey.NOTIFICAITON_RECEIVED_AT).toPromise();
    if (val) {
      const corRelationList: Array<CorrelationData> = [];
      corRelationList.push({ id: val, type: CorReleationDataType.NOTIFICATION_RECEIVED_AT });
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.FCM,
        '',
        Environment.HOME,
        this.activePageService.computePageId(this.router.url),
        undefined,
        undefined,
        undefined,
        corRelationList,
        ID.NOTIFICATION_RECEIVED
      );
      await this.preferences.putString(PreferenceKey.NOTIFICAITON_RECEIVED_AT, '').toPromise();
    }
    FCMPlugin.onNotification((data) => {
      data['isRead'] = data.wasTapped ? 1 : 0;
      data['actionData'] = JSON.parse(data['actionData']);
      this.notificationServices.addNotification(data).subscribe((status) => {
        this.events.publish('notification:received');
        this.events.publish('notification-status:update', { isUnreadNotifications: true });
      });
      if (data.wasTapped) {
        // Notification was received on device tray and tapped by the user.
        const value = {
          notification_id: data.id
        };
        const corRelationList: Array<CorrelationData> = [];
        const fcmId = data.id;
        corRelationList.push({ id: fcmId ? fcmId + '' : '', type: CorReleationDataType.NOTIFICATION_ID });
        this.telemetryGeneratorService.generateNotificationClickedTelemetry(
          InteractType.FCM,
          this.activePageService.computePageId(this.router.url),
          value,
          corRelationList
        );
        this.notificationSrc.notificationId = data.id || '';
        this.notificationSrc.setNotificationParams(data);
        if (this.isForeground) {
          this.notificationSrc.handleNotification();
        }
      } else {
        // Notification was received in foreground. Maybe the user needs to be notified.
      }

    },
      (success) => {
        console.log('Notification Sucess Callback', success);
      },
      (err) => {
        console.error('Notification Error Callback', err);
      });
  }

  /**
   * Initializing the event for reloading the Tabs on Signing-In.
   */
  private triggerSignInEvent() {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async (skipNavigation) => {
      const batchDetails = await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise();
      const limitedSharingContentDetails = this.appGlobalService.limitedShareQuizContent;

      if (!batchDetails && !limitedSharingContentDetails) {
        this.toggleRouterOutlet = false;
      }

      // This setTimeout is very important for reloading the Tabs page on SignIn.
      setTimeout(async () => {
        /* Medatory for login flow
         * eventParams are essential parameters for avoiding duplicate calls to API
         * skipSession & skipProfile should be true here
         * until further change
         */
        const eventParams: EventParams = {
          skipSession: true,
          skipProfile: true
        };
        this.events.publish(AppGlobalService.USER_INFO_UPDATED, eventParams);
        this.toggleRouterOutlet = true;
        this.reloadSigninEvents();
        this.events.publish('UPDATE_TABS');
        if (batchDetails) {
          await this.localCourseService.checkCourseRedirect();
        } else if (!skipNavigation || !skipNavigation.skipRootNavigation) {
          this.router.navigate([RouterLinks.TABS]);
        }
      }, 0);
    });
  }

  /**
   * Enter all methods which should trigger during OnInit and User Sign-In.
   */
  reloadSigninEvents() {
    this.checkForTncUpdate();
  }

  reloadGuestEvents() {
    this.checkDeviceLocation();
    this.checkGuestUserType();
  }

  private async checkGuestUserType() {
    const isAdminUser = (await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise() === ProfileType.ADMIN);
    if (isAdminUser && this.appGlobalService.isGuestUser) {
      this.loginHandlerService.signIn();
    }
  }

  addNetworkTelemetry(subtype: string, pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      subtype,
      Environment.HOME,
      pageId
    );
  }

  ngAfterViewInit(): void {
    this.platform.resume.subscribe(() => {
      if (!this.appGlobalService.isNativePopupVisible) {
        this.telemetryGeneratorService.generateInterruptTelemetry('resume', '');
      }
      this.splashScreenService.handleSunbirdSplashScreenActions();
      this.checkForCodeUpdates();
      this.notificationSrc.handleNotification();
      this.isForeground = true;
    });

    this.platform.pause.subscribe(() => {
      if (!this.appGlobalService.isNativePopupVisible) {
        this.telemetryGeneratorService.generateInterruptTelemetry('background', '');
      }
      this.isForeground = false;
    });
  }

  private handleBackButton() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.rootPageDisplayed = event.url.indexOf('tabs') !== -1;
      }
    });
    this.platform.backButton.subscribeWithPriority(0, async () => {
      if (this.router.url === RouterLinks.LIBRARY_TAB || this.router.url === RouterLinks.COURSE_TAB
        || this.router.url === RouterLinks.HOME_TAB
        || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url === RouterLinks.PROFILE_TAB ||
        this.router.url === RouterLinks.GUEST_PROFILE_TAB || this.router.url === RouterLinks.ONBOARDING_DISTRICT_MAPPING
        || this.router.url.startsWith(RouterLinks.HOME_TAB)) {
        if (await this.menuCtrl.isOpen()) {
          this.menuCtrl.close();
        } else {
          this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false);
        }
      } else {
        if (this.location.back && !this.rootPageDisplayed) {
          this.location.back();
        }
      }
    });
  }

  private generateNetworkTelemetry() {
    const value = new Map();
    value['network-type'] = this.network.type;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      InteractSubtype.NETWORK_STATUS, Environment.HOME, PageId.SPLASH_SCREEN, undefined, value);
  }

  private subscribeEvents() {
    this.events.subscribe(EventTopics.TAB_CHANGE, (pageId) => {
      this.zone.run(() => {
        this.generateInteractEvent(pageId);
        // Added below code to generate Impression Before Interact for Library,Courses,Profile
        this.generateImpressionEvent(pageId);
      });
    });

    this.translate.onLangChange.subscribe((params) => {
      if (params.lang === 'ur') {
        // migration-TODO since platfrom is changed, this is a quick fix need to review later
        document.documentElement.dir = 'rtl';
      } else {
        // migration-TODO since platfrom is changed, this is a quick fix need to review later
        document.documentElement.dir = 'ltr';
      }
    });
    // planned maintenance
    this.eventSubscription = this.eventsBusService.events(EventNamespace.ERROR).pipe(
      filter((event) => event.type === ErrorEventType.PLANNED_MAINTENANCE_PERIOD),
      take(1)
    ).subscribe(() => {
      this.isPlannedMaintenanceStarted = true;
      this.isOnBoardingCompleted = this.appGlobalService.isOnBoardingCompleted;
      if (this.isPlannedMaintenanceStarted) {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW,
          '',
          PageId.PLANNED_MAINTENANCE_BANNER,
          this.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING
        );
        let intervalRef;
        const backButtonSubscription = this.platform.backButton.subscribeWithPriority(13, () => {
          backButtonSubscription.unsubscribe();
          this.isPlannedMaintenanceStarted = false;
          if (intervalRef) {
            clearInterval(intervalRef);
            intervalRef = undefined;
          }
        });
        // for timer optional
        // const second = 1000,
        //     minute = second * 60,
        //     hour = minute * 60,
        //     day = hour * 24;
        //
        // const countDown = new Date('Aug 14, 2020 00:00:00').getTime();
        // intervalRef = setInterval(() => {
        //   this.isTimeAvailable = true;
        //   const now = new Date().getTime(),
        //           distance = countDown - now;
        //
        //       document.getElementById('timer').innerText = `${Math.floor((distance % (day)) / (hour))} : ${Math.floor((distance % (hour)) / (minute))} : ${Math.floor((distance % (minute)) / second)}`;
        //
        //     }, second);
      }
    });
    // unplanned maintenance
    // this.events.subscribe('EventTopics:maintenance:unplanned', (data) => {
    //   this.isUnplannedMaintenanceStarted = data.isUnplannedMaintenanceStarted;
    //   if (this.isUnplannedMaintenanceStarted) {
    //     this.timeLeft = '3';
    //     window.document.body.classList.add('show-maintenance');
    //   }
    // });
  }

  closeUnPlannedMaintenanceBanner() {
    window.document.body.classList.remove('show-maintenance');
    this.isUnplannedMaintenanceStarted = false;
  }

  private generateInteractEvent(pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.TAB_CLICKED,
      Environment.HOME,
      pageId ? pageId.toLowerCase() : PageId.QRCodeScanner);
  }

  private async generateImpressionEvent(pageId: string) {
    pageId = pageId.toLowerCase();
    const env = pageId.localeCompare(PageId.PROFILE) ? Environment.HOME : Environment.USER;
    const corRelationList: Array<CorrelationData> = [];
    if (pageId === PageId.LIBRARY) {
      const currentProfile: Profile = this.appGlobalService.getCurrentUser();
      corRelationList.push({ id: currentProfile.board ? currentProfile.board.join(',') : '', type: CorReleationDataType.BOARD });
      corRelationList.push({ id: currentProfile.medium ? currentProfile.medium.join(',') : '', type: CorReleationDataType.MEDIUM });
      corRelationList.push({ id: currentProfile.grade ? currentProfile.grade.join(',') : '', type: CorReleationDataType.CLASS });
      corRelationList.push({ id: currentProfile.profileType, type: CorReleationDataType.USERTYPE });
    } else if (pageId === PageId.COURSES) {
      const channelId = await this.preferences.getString(PreferenceKey.PAGE_ASSEMBLE_ORGANISATION_ID).toPromise();
      if (channelId) {
        corRelationList.push({ id: channelId, type: CorReleationDataType.SOURCE });
      }
    }

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      pageId ? pageId : PageId.HOME,
      env, undefined, undefined, undefined, undefined,
      corRelationList);
  }

  private async checkForTncUpdate() {
    this.appGlobalService.isSignInOnboardingCompleted = false;
    await this.tncUpdateHandlerService.checkForTncUpdate();
  }

  private async checkDeviceLocation() {
    if (!(await this.commonUtilService.isDeviceLocationAvailable())) {
      const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      if (await this.appGlobalService.getProfileSettingsStatus(profile)) {
        const navigationExtras: NavigationExtras = {
          state: {
            isShowBackButton: false
          }
        };
        await this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
        this.splashScreenService.handleSunbirdSplashScreenActions();
      }
    }
  }

  private async getSelectedLanguage() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (selectedLanguage) {
      await this.translate.use(selectedLanguage);
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
    return this.preferences.getString(PreferenceKey.SYNC_CONFIG).toPromise()
      .then(val => {
        if (val === undefined || val === '' || val === null) {
          this.preferences.putString(PreferenceKey.SYNC_CONFIG, 'ALWAYS_ON').toPromise().then();
        }
      });
  }

  private async startOpenrapDiscovery(): Promise<undefined> {
    if (this.appGlobalService.OPEN_RAPDISCOVERY_ENABLED) {
      return new Observable((observer) => {
        (window as any).openrap.startDiscovery(
          (response: { ip: string, actionType: 'connected' | 'disconnected' }) => {
            observer.next(response);
          }, (e) => {
            observer.error(e);
          }
        );
      }).pipe(
        tap((response: { ip?: string, actionType: 'connected' | 'disconnected' }) => {
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
        }),
        mapTo(undefined)
      ).toPromise();
    }
  }

  private async checkAppUpdateAvailable() {
    return this.formAndFrameworkUtilService.checkNewAppVersion()
      .then(result => {
        if (result) {
          setTimeout(() => {
            this.events.publish('force_optional_upgrade', result);
          }, 5000);
        }
      })
      .catch(err => {
        console.error('checkNewAppVersion err', err);
      });
  }


  private autoSyncTelemetry() {
    this.telemetryAutoSync.start(30 * 1000).pipe(
      mergeMap(() => {
        return combineLatest([
          this.platform.pause.pipe(tap(() => this.telemetryAutoSync.pause())),
          this.platform.resume.pipe(tap(() => this.telemetryAutoSync.continue()))
        ]);
      })
    ).subscribe();
  }

  initializeApp() {
    this.headerService.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
    });
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      const routeUrl = this.router.url;

      if ((routeUrl.indexOf(RouterLinks.USER_TYPE_SELECTION) !== -1)
        || (routeUrl.indexOf(RouterLinks.CHAPTER_DETAILS) !== -1)
        || (routeUrl.indexOf(RouterLinks.CURRICULUM_COURSES) !== -1)
        || (routeUrl.indexOf(RouterLinks.ACTIVE_DOWNLOADS) !== -1)
        || (routeUrl.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1)
        || (routeUrl.indexOf(RouterLinks.COLLECTION_DETAILS) !== -1)
        || (routeUrl.indexOf(RouterLinks.CONTENT_DETAILS) !== -1)
        || (routeUrl.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1)
        || (routeUrl.indexOf(RouterLinks.FAQ_HELP) !== -1)
        || (routeUrl.indexOf(RouterLinks.PROFILE_SETTINGS) !== -1)
        || (routeUrl.indexOf(RouterLinks.QRCODERESULT) !== -1)
        || (routeUrl.indexOf(RouterLinks.STORAGE_SETTINGS) !== -1)
        || (routeUrl.indexOf(RouterLinks.EXPLORE_BOOK) !== -1)
        || (routeUrl.indexOf(RouterLinks.PERMISSION) !== -1)
        || (routeUrl.indexOf(RouterLinks.LANGUAGE_SETTING) !== -1)
        || (routeUrl.indexOf(RouterLinks.MY_GROUPS) !== -1)
      ) {
        this.headerService.sidebarEvent($event);
        return;
      } else {
        if (this.router.url === RouterLinks.LIBRARY_TAB || this.router.url === RouterLinks.COURSE_TAB
          || this.router.url === RouterLinks.HOME_TAB
          || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url === RouterLinks.PROFILE_TAB ||
          this.router.url === RouterLinks.GUEST_PROFILE_TAB || this.router.url.startsWith(RouterLinks.HOME_TAB)) {
          this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false).then();
        } else {
          if (this.location.back) {
            this.location.back();
          }
        }
      }
    } else {
      this.headerService.sidebarEvent($event);
    }
  }

  menuItemAction(menuName) {
    switch (menuName.menuItem) {
      case 'MY_GROUPS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.MY_GROUPS_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );
        const navigationExtrasUG: NavigationExtras = { state: { profile: this.profile } };
        this.router.navigate([`/${RouterLinks.MY_GROUPS}`], navigationExtrasUG);
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
        this.router.navigate([`/${RouterLinks.LANGUAGE_SETTING}`, true]);
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
          this.logoutHandlerService.onLogout();
          this.localStorage.deleteAllStorage();
          this.db.dropDb();
        }
        break;

      case 'UPDATE':
        cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
          () => { },
          () => { }
        );
        break;
    }
  }

  private handleAuthAutoMigrateEvents() {
    this.eventsBusService.events(EventNamespace.AUTH).pipe(
      filter((e) => e.type === AuthEventType.AUTO_MIGRATE_SUCCESS || e.type === AuthEventType.AUTO_MIGRATE_FAIL),
    ).subscribe((e) => {
      switch (e.type) {
        case AuthEventType.AUTO_MIGRATE_SUCCESS: {
          this.commonUtilService.showToast('AUTO_MIGRATION_SUCCESS_MESSAGE');
          break;
        }
        case AuthEventType.AUTO_MIGRATE_FAIL: {
          this.commonUtilService.showToast('AUTO_MIGRATION_FAIL_MESSAGE');
          break;
        }
      }
    });
  }

  private handleAuthErrors() {
    this.eventsBusService.events(EventNamespace.ERROR).pipe(
      filter((e) => e.type === ErrorEventType.AUTH_TOKEN_REFRESH_ERROR),
    ).subscribe(() => {
      this.logoutHandlerService.onLogout();
    });
  }

  private getCampaignParameter() {
    this.preferences.getString(PreferenceKey.CAMPAIGN_PARAMETERS).toPromise().then((data) => {
      if (data) {
        const response = JSON.parse(data);
        const utmValue = response['val'];
        if (response.val && response.val.length) {
          this.splaschreenDeeplinkActionHandlerDelegate.checkUtmContent(response.val);
        }
        const utmTelemetry = {
          utm_data: utmValue
        };
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.UTM_INFO,
          Environment.HOME,
          PageId.HOME,
          undefined,
          utmTelemetry,
          undefined);
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

  private async getDeviceProfile() {
    if (!(await this.commonUtilService.isDeviceLocationAvailable())
      && !(await this.commonUtilService.isIpLocationAvailable())) {
      this.deviceRegisterService.getDeviceProfile().toPromise().then(async (response) => {
        if (response.userDeclaredLocation) {
          await this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(response.userDeclaredLocation)).toPromise();
        } else if (response.ipLocation) {
          const ipLocationMap = new Map();
          if (response.ipLocation.state) {
            ipLocationMap['state'] = response.ipLocation.state;
            if (response.ipLocation.district) {
              ipLocationMap['district'] = response.ipLocation.district;
            }
          }
          await this.preferences.putString(PreferenceKey.IP_LOCATION, JSON.stringify(ipLocationMap)).toPromise();
        }
      });
    }
  }

  navigateToDownloads() {
    this.isPlannedMaintenanceStarted = false;
    this.router.navigate([RouterLinks.DOWNLOAD_TAB]);
  }


  closePlannedMaintenanceBanner() {
    this.isPlannedMaintenanceStarted = false;
  }

  private async checkForTheme() {
    const selectedTheme = await this.preferences.getString(PreferenceKey.CURRENT_SELECTED_THEME).toPromise();
    if (selectedTheme === AppThemes.JOYFUL) {
      await this.headerService.showStatusBar();
    } else {
      this.headerService.hideStatusBar();
    }
  }

  private onTraceIdUpdate() {
    this.preferences.addListener(CsClientStorage.TRACE_ID, (value) => {
      if (value) {
        // show toast
      } else {
        // do not show the toast.
      }
    });
  }
}
