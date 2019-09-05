import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, OnDestroy, NgZone } from '@angular/core';
import { Events, MenuController, Platform } from '@ionic/angular';
import { AppGlobalService, UtilityService, CommonUtilService, NotificationService } from '../../../services';
import { DownloadService, SharedPreferences, NotificationService as PushNotificationService, NotificationStatus } from 'sunbird-sdk';
import { GenericAppConfig, PreferenceKey, RouterLinks } from '../../../app/app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-application-header',
  templateUrl: './application-header.component.html',
  styleUrls: ['./application-header.component.scss'],
})
export class ApplicationHeaderComponent implements OnInit, OnDestroy {
  chosenLanguageString: string;
  selectedLanguage: string;
  @Input() headerConfig: any = false;
  @Output() headerEvents = new EventEmitter();
  @Output() sideMenuItemEvent = new EventEmitter();

  appLogo?: string;
  appName?: string;
  versionName?: string;
  versionCode?: string;
  decreaseZindex = false;
  isRtl: boolean;
  isLoggedIn = false;
  isDownloadingActive: boolean = false;
  showDownloadAnimation: boolean = false;
  networkSubscription: Subscription;
  isUnreadNotification: boolean = false;
  menuSide = 'left';

  constructor(
    @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('NOTIFICATION_SERVICE') private pushNotificationService: PushNotificationService,
    public menuCtrl: MenuController,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private utilityService: UtilityService,
    private changeDetectionRef: ChangeDetectorRef,
    private notification: NotificationService,
    private translate: TranslateService,
    private platform: Platform,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.setLanguageValue();
    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res && res.selectedLanguage) {
        this.setLanguageValue();
      }
    });
    this.getUnreadNotifications();
  }

  ngOnInit() {
    this.setAppLogo();
    this.setAppVersion();
    this.events.subscribe('user-profile-changed', () => {
      this.setAppLogo();
    });
    this.events.subscribe('app-global:profile-obj-changed', () => {
      this.setAppLogo();
    });

    this.events.subscribe('notification-status:update', (eventData) => {
      this.isUnreadNotification = eventData.isUnreadNotifications;
    });
    this.translate.onLangChange.subscribe((params) => {
      this.ngZone.run(() => {
        if (params.lang === 'ur' && !this.platform.isRTL) {
          this.isRtl = true;
          this.menuSide = 'right';
        } else if (this.platform.isRTL) {
          this.menuSide = 'left';
          this.isRtl = false;
        }
      });
    });
    this.events.subscribe('header:decreasezIndex', () => {
      this.decreaseZindex = true;
    });
    this.events.subscribe('header:setzIndexToNormal', () => {
      this.decreaseZindex = false;
    });
    this.listenDownloads();
    this.networkSubscription = this.commonUtilService.networkAvailability$.subscribe((available: boolean) => {
      this.setAppLogo();
    });
  }

  setAppVersion(): any {
    this.utilityService.getBuildConfigValue(GenericAppConfig.VERSION_NAME)
      .then(vName => {
        this.versionName = vName;
        this.utilityService.getBuildConfigValue(GenericAppConfig.VERSION_CODE)
          .then(vCode => {
            this.versionCode = vCode;
          })
          .catch(error => {
            console.error('Error in getting app version code', error);
          });
      })
      .catch(error => {
        console.error('Error in getting app version name', error);
      });
  }

  setLanguageValue() {
    this.preference.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise()
      .then(value => {
        this.selectedLanguage = value;
      });
    this.preference.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
      .then(langCode => {
        console.log('Language code: ', langCode);
        this.notification.setupLocalNotification(langCode);
      });
  }

  listenDownloads() {
    this.downloadService.getActiveDownloadRequests().subscribe((list) => {
      this.showDownloadAnimation = !!list.length;
      this.changeDetectionRef.detectChanges();
    });
  }

  setAppLogo() {
    if (!this.appGlobalService.isUserLoggedIn()) {
      this.isLoggedIn = false;
      this.appLogo = './assets/imgs/ic_launcher.png';
      this.appVersion.getAppName().then((appName: any) => {
        this.appName = appName;
      });
    } else {
      this.isLoggedIn = true;
      this.preference.getString('app_logo').toPromise().then(value => {
        if (value) {
          this.appLogo = this.commonUtilService.networkInfo.isNetworkAvailable ? value : './assets/imgs/ic_launcher.png';
        } else {
          this.appLogo = './assets/imgs/ic_launcher.png';
        }
      });
      this.preference.getString('app_name').toPromise().then(value => {
        this.appName = value;
      });
    }
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  emitEvent($event, name) {
    this.headerEvents.emit({ name, event: $event });
  }

  emitSideMenuItemEvent($event, menuItem) {
    this.toggleMenu();
    this.sideMenuItemEvent.emit({ menuItem });
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
    this.events.subscribe('user-profile-changed');
    this.events.subscribe('app-global:profile-obj-changed');
  }

  getUnreadNotifications() {
    let newNotificationCount = 0;
    this.pushNotificationService.getAllNotifications({ notificationStatus: NotificationStatus.ALL }).subscribe((notificationList: any) => {
      notificationList.forEach((item) => {
        if (!item.isRead) {
          newNotificationCount++;
        }
      });

      this.isUnreadNotification = Boolean(newNotificationCount);
    });
  }

}
