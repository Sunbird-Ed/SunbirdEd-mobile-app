import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Events, Platform, IonRouterOutlet, MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { Network } from '@ionic-native/network/ngx';

import {
  AuthService, ErrorEventType, EventNamespace, EventsBusService, ProfileService, SharedPreferences,
  SunbirdSdk, TelemetryAutoSyncUtil, TelemetryService, NotificationService
} from 'sunbird-sdk';

import { InteractType, InteractSubtype, Environment, PageId, ImpressionType } from 'services/telemetry-constants';
import { GenericAppConfig, PreferenceKey } from './app.constant';
import { ActivePageService } from '@app/services/active-page/active-page-service';
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService,
  UtilityService,
  AppRatingService,
  AppHeaderService,
  FormAndFrameworkUtilService,
} from '../services';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplashscreenImportActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { LogoutHandlerService} from '@app/services/logout-handler.service';
import { NotificationService as localNotification } from '@app/services/notification.service';
import { RouterLinks } from './app.constant';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';

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
  @ViewChild('mainContent', { read: IonRouterOutlet }) routerOutlet: IonRouterOutlet;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('NOTIFICATION_SERVICE') private notificationServices: NotificationService,
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
    private splashcreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate,
    private splashscreenImportActionHandlerDelegate: SplashscreenImportActionHandlerDelegate,
    private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    private headerService: AppHeaderService,
    private logoutHandlerService: LogoutHandlerService,
    private network: Network,
    private appRatingService: AppRatingService,
    private activePageService: ActivePageService,
    private notificationSrc: localNotification,
    private router: Router,
    private location: Location,
    private menuCtrl: MenuController
  ) {
    this.telemetryAutoSyncUtil = new TelemetryAutoSyncUtil(this.telemetryService);
    platform.ready().then(async () => {
      this.fcmTokenWatcher(); // Notification related
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
      this.checkForTncUpdate();
      this.handleAuthErrors();
      await this.getSelectedLanguage();
      this.handleSunbirdSplashScreenActions();
      this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, '').subscribe();
      window['thisRef'] = this;
      this.statusBar.styleBlackTranslucent();
      this.handleBackButton();
      this.appRatingService.checkInitialDate();
      this.getUtmParameter();
    });
  }

  checkForCodeUpdates() {
    this.preferences.getString(PreferenceKey.DEPLOYMENT_KEY).toPromise().then(deploymentKey => {
      if (codePush != null && deploymentKey) {
        const value = new Map();
        value['deploymentKey'] = deploymentKey;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_INITIATED,
          Environment.HOME, PageId.HOME, null, value);
        codePush.sync(this.syncStatus, {
          deploymentKey: deploymentKey
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
      this.handleSunbirdSplashScreenActions();
    });

    this.platform.pause.subscribe(() => {
      this.telemetryGeneratorService.generateInterruptTelemetry('background', '');
    });
  }

  handleBackButton() {
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
        if (this.location.back) {
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
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      pageId,
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
        console.error('checkNewAppVersion err', err);
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
