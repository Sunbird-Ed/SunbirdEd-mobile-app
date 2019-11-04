import { Router, NavigationExtras, NavigationStart, NavigationEnd, NavigationError, Event } from '@angular/router';
import { Location } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Events, Platform, IonRouterOutlet, MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { Network } from '@ionic-native/network/ngx';

import {
  ErrorEventType, EventNamespace, EventsBusService, SharedPreferences,
  SunbirdSdk, TelemetryAutoSyncUtil, TelemetryService, NotificationService, GetSystemSettingsRequest, SystemSettings, SystemSettingsService,
  CodePushExperimentService, AuthEventType, CorrelationData, Profile
} from 'sunbird-sdk';

import {
    InteractType,
    InteractSubtype,
    Environment, PageId,
    ImpressionType,
    CorReleationDataType,
    ImpressionSubtype
} from 'services/telemetry-constants';
import { PreferenceKey, EventTopics, SystemSettingsIds } from './app.constant';
import { ActivePageService } from '@app/services/active-page/active-page-service';
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService,
  UtilityService,
  AppRatingService,
  AppHeaderService,
  FormAndFrameworkUtilService,
  SplashScreenService
} from '../services';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { LogoutHandlerService } from '@app/services/handlers/logout-handler.service';
import { NotificationService as localNotification } from '@app/services/notification.service';
import { RouterLinks } from './app.constant';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { NetworkAvailabilityToastService } from '@app/services/network-availability-toast/network-availability-toast.service';

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

  private telemetryAutoSyncUtil: TelemetryAutoSyncUtil;
  toggleRouterOutlet = true;
  rootPageDisplayed: boolean = false;
  profile: any = {};
  selectedLanguage: string;
  appName: string;
  appVersion: string;
  @ViewChild('mainContent', { read: IonRouterOutlet }) routerOutlet: IonRouterOutlet;

  constructor(
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('NOTIFICATION_SERVICE') private notificationServices: NotificationService,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('CODEPUSH_EXPERIMENT_SERVICE') private codePushExperimentService: CodePushExperimentService,
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
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private headerService: AppHeaderService,
    private logoutHandlerService: LogoutHandlerService,
    private network: Network,
    private appRatingService: AppRatingService,
    private activePageService: ActivePageService,
    private notificationSrc: localNotification,
    private router: Router,
    private location: Location,
    private menuCtrl: MenuController,
    private networkAvailability: NetworkAvailabilityToastService,
    private splashScreenService: SplashScreenService
  ) {
    this.telemetryAutoSyncUtil = new TelemetryAutoSyncUtil(this.telemetryService);
    platform.ready().then(async () => {
      this.networkAvailability.init();
      this.fcmTokenWatcher(); // Notification related
      this.getSystemConfig();
      this.utilityService.getBuildConfigValue('VERSION_NAME')
        .then(response => {
          this.appVersion = response;
        });
      this.checkForExperiment();
      this.receiveNotification();
      this.telemetryGeneratorService.genererateAppStartTelemetry(await utilityService.getDeviceSpec());
      this.generateNetworkTelemetry();
      this.autoSyncTelemetry();
      this.subscribeEvents();
      this.showAppWalkThroughScreen();
      this.startOpenrapDiscovery();
      this.saveDefaultSyncSetting();
      this.checkAppUpdateAvailable();
      this.makeEntryInSupportFolder();
      await this.getSelectedLanguage();
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
      this.getUtmParameter();
      this.checkForCodeUpdates();
    });
  }

  getSystemConfig() {
    const getSystemSettingsRequest: GetSystemSettingsRequest = {
      id: SystemSettingsIds.COURSE_FRAMEWORK_ID
    };
    this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        //   res['deploymentKey'] = '6Xhfs4-WVV8dhYN9U5OkZw6PukglrykIsJ8-B';
        if (res['deploymentKey']) {
          this.codePushExperimentService.setDefaultDeploymentKey(res['deploymentKey']).subscribe();
        }
      }).catch(err => {
        console.log('error :', err);
      });
  }

  checkForCodeUpdates() {
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
        }, this.downloadProgress);
      } else {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_KEY_NOT_DEFINED,
          Environment.HOME, PageId.HOME);
      }
    });
  }

  syncStatus(status) {
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

  checkForExperiment() {
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

  downloadProgress(downloadProgress) {
    if (downloadProgress) {
      console.log('Downloading ' + downloadProgress.receivedBytes + ' of ' +
        downloadProgress.totalBytes);
    }
  }

  /* Generates new FCM Token if not available
   * if available then on token refresh updates FCM token
   */
  async fcmTokenWatcher() {
    const fcmToken = await this.preferences.getString('fcm_token').toPromise();
    if (!fcmToken) {
      FCMPlugin.getToken((token) => {
        this.storeFCMToken(token);
        SunbirdSdk.instance.updateDeviceRegisterConfig({ fcmToken: token });
      });
    }
    FCMPlugin.onTokenRefresh((token) => {
      this.storeFCMToken(token);
      SunbirdSdk.instance.updateDeviceRegisterConfig({ fcmToken: token });
    });
  }

  storeFCMToken(token: string) {
    this.preferences.putString('fcm_token', token).toPromise();
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
      const value = new Map();
      value['notification_id'] = data.id;
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER,
        InteractSubtype.NOTIFICATION_RECEIVED,
        Environment.HOME,
        this.activePageService.computePageId(this.router.url),
        undefined,
        value
      );

      data['isRead'] = data.wasTapped ? 1 : 0;
      data['actionData'] = JSON.parse(data['actionData']);
      this.notificationServices.addNotification(data).subscribe((status) => {
        this.events.publish('notification:received');
        this.events.publish('notification-status:update', { isUnreadNotifications: true });
      });
      this.splaschreenDeeplinkActionHandlerDelegate.handleNotification(data);
    },
      (success) => {
        console.log('Notification Sucess Callback');
        console.log(success);
      },
      (err) => {
        console.log('Notification Error Callback');
        console.log(err);
      });
  }

  ngOnInit() {
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
    this.notificationSrc.setupLocalNotification();

    this.triggerSignInEvent();
  }

  /**
   * Initializing the event for reloading the Tabs on Signing-In.
   */
  triggerSignInEvent() {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async () => {
      let batchDetails;
      await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise()
        .then(async (resp) => {
          if (resp) {
            batchDetails = resp;
          } else {
            this.toggleRouterOutlet = false;
          }
        });
      // this.toggleRouterOutlet = false;
      // This setTimeout is very important for reloading the Tabs page on SignIn.
      setTimeout(async () => {
        this.events.publish(AppGlobalService.USER_INFO_UPDATED);
        this.toggleRouterOutlet = true;
        this.reloadSigninEvents();
        this.events.publish('UPDATE_TABS');
        if (batchDetails) {
          await this.splaschreenDeeplinkActionHandlerDelegate.onAction('content').toPromise();
        } else {
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
      this.telemetryGeneratorService.generateInterruptTelemetry('resume', '');
      this.splashScreenService.handleSunbirdSplashScreenActions();
      this.checkForCodeUpdates();
    });

    this.platform.pause.subscribe(() => {
      this.telemetryGeneratorService.generateInterruptTelemetry('background', '');
    });
  }

  handleBackButton() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
        if (event.url.indexOf('tabs') !== -1) {
          this.rootPageDisplayed = true;
        } else {
          this.rootPageDisplayed = true;
        }
      }
    });
    this.platform.backButton.subscribeWithPriority(0, async () => {
      console.log('URL' + this.router.url);
      if (this.router.url === RouterLinks.LIBRARY_TAB || this.router.url === RouterLinks.COURSE_TAB
        || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url === RouterLinks.PROFILE_TAB ||
        this.router.url === RouterLinks.GUEST_PROFILE_TAB) {
        if (await this.menuCtrl.isOpen()) {
          this.menuCtrl.close();
        } else {
          this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false);
        }
      } else {
        // this.routerOutlet.pop();
        if (this.location.back && !this.rootPageDisplayed) {
          this.location.back();
        }
      }
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
      } else if (this.platform.isRTL) {
        // migration-TODO since platfrom is changed, this is a quick fix need to review later
        document.documentElement.dir = 'ltr';
      }
    });
  }

  private async checkForTncUpdate() {
    await this.tncUpdateHandlerService.checkForTncUpdate();
  }

  private async checkDeviceLocation() {
    if (!(await this.commonUtilService.isDeviceLocationAvailable())
      && (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true')) {
      const navigationExtras: NavigationExtras = {
        state: {
          isShowBackButton: false
        }
      };
      await this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
      this.splashScreenService.handleSunbirdSplashScreenActions();
    }
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

  private generateInteractEvent(pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.TAB_CLICKED,
      Environment.HOME,
      pageId ? pageId.toLowerCase() : PageId.QRCodeScanner);
  }

  private generateImpressionEvent(pageId: string) {
    pageId = pageId.toLowerCase();
    const env = pageId.localeCompare(PageId.PROFILE) ? Environment.HOME : Environment.USER;
    const corRelationList: Array<CorrelationData> = [];
    if (pageId === 'resources') {
      const currentProfile: Profile = this.appGlobalService.getCurrentUser();
      corRelationList.push({ id: currentProfile.board ? currentProfile.board.join(',') : '', type: CorReleationDataType.BOARD });
      corRelationList.push({ id: currentProfile.medium ? currentProfile.medium.join(',') : '', type: CorReleationDataType.MEDIUM });
      corRelationList.push({ id: currentProfile.grade ? currentProfile.grade.join(',') : '', type: CorReleationDataType.CLASS });
      corRelationList.push({ id: currentProfile.profileType, type: CorReleationDataType.USERTYPE });
    }

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      pageId,
      env, undefined, undefined, undefined, undefined,
      corRelationList);
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
        console.error('checkNewAppVersion err', err);
      });
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
        || (routeUrl.indexOf(RouterLinks.STORAGE_SETTINGS) !== -1)
        || (routeUrl.indexOf(RouterLinks.EXPLORE_BOOK) !== -1)
        || (routeUrl.indexOf(RouterLinks.PERMISSION) !== -1)) {
        this.headerService.sidebarEvent($event);
        return;
      } else {
        if (this.router.url === RouterLinks.LIBRARY_TAB || this.router.url === RouterLinks.COURSE_TAB
          || this.router.url === RouterLinks.DOWNLOAD_TAB || this.router.url === RouterLinks.PROFILE_TAB ||
          this.router.url === RouterLinks.GUEST_PROFILE_TAB) {
          this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false).then();
        } else {
          // this.routerOutlet.pop();
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
        }
        break;

    }
  }

  private handleAuthAutoMigrateEvents() {
    this.eventsBusService.events(EventNamespace.AUTH)
      .filter((e) => e.type === AuthEventType.AUTO_MIGRATE_SUCCESS || e.type === AuthEventType.AUTO_MIGRATE_FAIL)
      .take(1).subscribe((e) => {
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
