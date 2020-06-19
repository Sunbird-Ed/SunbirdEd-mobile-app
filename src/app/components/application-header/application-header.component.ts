import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, OnDestroy, NgZone } from '@angular/core';
import { Events, MenuController, Platform, PopoverController } from '@ionic/angular';
import {
  AppGlobalService, UtilityService, CommonUtilService, NotificationService, TelemetryGeneratorService,
  InteractType, InteractSubtype, Environment, ActivePageService, ID, CorReleationDataType
} from '../../../services';
import { DownloadService, SharedPreferences, NotificationService as PushNotificationService, NotificationStatus, EventNamespace, DownloadProgress, DownloadEventType, EventsBusService, ProfileService, Profile, CachedItemRequestSourceFrom, ServerProfile, CorrelationData } from 'sunbird-sdk';
import { GenericAppConfig, PreferenceKey, EventTopics, ProfileConstants, RouterLinks } from '../../../app/app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription, combineLatest, Observable, EMPTY } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ToastNavigationComponent } from '../popups/toast-navigation/toast-navigation.component';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';

@Component({
  selector: 'app-application-header',
  templateUrl: './application-header.component.html',
  styleUrls: ['./application-header.component.scss'],
})
export class ApplicationHeaderComponent implements OnInit, OnDestroy {
  downloadProgressMap: { [key: string]: number } = {};
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
  showDownloadingIcon: boolean = false;
  networkSubscription: Subscription;
  isUnreadNotification: boolean = false;
  menuSide = 'left';
  profile: Profile;
  managedProfileList$: Observable<ServerProfile[]> = EMPTY;
  userAvatarConfig = { size: 'large', isBold: true, isSelectable: false, view: 'horizontal' };

  constructor(
    @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('NOTIFICATION_SERVICE') private pushNotificationService: PushNotificationService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
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
    private telemetryGeneratorService: TelemetryGeneratorService,
    private activePageService: ActivePageService,
    private popoverCtrl: PopoverController,
    private tncUpdateHandlerService: TncUpdateHandlerService
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
        if (params.lang === 'ur') {
          this.isRtl = true;
          this.menuSide = 'right';
        } else {
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
    combineLatest([
      this.downloadService.getActiveDownloadRequests(),
      this.eventsBusService.events(EventNamespace.DOWNLOADS).pipe(
        filter((event) => event.type === DownloadEventType.PROGRESS)
      )
    ]).subscribe(([list, event]) => {
      const downloadEvent = event as DownloadProgress;
      this.downloadProgressMap[downloadEvent.payload.identifier] = downloadEvent.payload.progress;

      if (list.length > 1) {
        this.showDownloadingIcon = true;
      } else if (list.length === 1 && this.downloadProgressMap[list[0].identifier] !== 100) {
        this.showDownloadingIcon = true;
      } else {
        this.showDownloadingIcon = false;
      }

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
      this.fetchManagedProfileDetails();
    }
  }

  toggleMenu() {
    this.menuCtrl.toggle();
    if (this.menuCtrl.isOpen()) {
      const pageId = this.activePageService.computePageId(this.router.url);
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.MENU_CLICKED,
        Environment.HOME,
        pageId, undefined
      );
    }
    this.events.publish(EventTopics.HAMBURGER_MENU_CLICKED);
  }

  emitEvent($event, name) {

    if (name === 'filter') {
      if (this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.headerEvents.emit({ name, event: $event });
      } else {
        this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
      }
    } else {
      this.headerEvents.emit({ name, event: $event });
    }
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

  async fetchManagedProfileDetails() {
    try {
      this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      this.managedProfileList$ = this.profileService.managedProfileManager.getManagedServerProfiles({
        from: CachedItemRequestSourceFrom.CACHE,
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      }).pipe(
        map(profiles => {
          return profiles.filter(p => p.id !== this.profile.uid);
        })
      );
    } catch (err) {
      console.log(err);
    }
  }

  addManagedUser() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
      return;
    }
    const pageId = this.activePageService.computePageId(this.router.url);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ADD,
      '',
      Environment.HOME,
      pageId,
      undefined,
      undefined,
      undefined,
      undefined,
      ID.BTN_ADD
    );

    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SUB_PROFILE_EDIT}`]);
  }

  openManagedUsers() {
    const pageId = this.activePageService.computePageId(this.router.url);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_MORE,
      '',
      Environment.HOME,
      pageId,
      undefined,
      undefined,
      undefined,
      undefined,
      ID.BTN_MORE
    );

    const navigationExtras: NavigationExtras = {
      state: {
        profile: this.profile
      }
    };
    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.MANAGE_USER_PROFILES}`], navigationExtras);
  }

  switchUser(user) {
    const pageId = this.activePageService.computePageId(this.router.url);
    const cData: Array<CorrelationData> = [
      { id: user.id || '', type: CorReleationDataType.SWITCHED_USER }
    ];
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ADD,
      '',
      Environment.HOME,
      pageId,
      undefined,
      undefined,
      undefined,
      cData,
      ID.BTN_SWITCH
    );
    this.profileService.managedProfileManager.switchSessionToManagedProfile({ uid: user.id }).toPromise().then(res => {
      this.events.publish(AppGlobalService.USER_INFO_UPDATED);
      this.events.publish('loggedInProfile:update');
      this.menuCtrl.close();
      this.showSwitchSuccessPopup(user.firstName);
      this.tncUpdateHandlerService.checkForTncUpdate();
    }).catch(err => {
      this.commonUtilService.showToast('ERROR_WHILE_SWITCHING_USER');
      console.error(err);
    });
  }

  async showSwitchSuccessPopup(name) {
    const confirm = await this.popoverCtrl.create({
      component: ToastNavigationComponent,
      componentProps: {
        message: this.commonUtilService.translateMessage('SUCCESSFULLY_SWITCHED_USER',  { '%app': this.appName, '%user': name }),
        description: this.commonUtilService.translateMessage('UPDATE_YOUR_PREFERENCE_FROM_PROFILE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('GO_TO_PROFILE'),
            btnClass: 'btn-right'
          }
        ]
      },
      cssClass: 'sb-popover'
    });
    await confirm.present();
    setTimeout(() => {
      if (confirm) {
        confirm.dismiss();
      }
    }, 3000);
    const { data } = await confirm.onDidDismiss();
    console.log(data);
    if (data) {
      this.router.navigate([`/${RouterLinks.PROFILE_TAB}`]);
    }
  }

}
