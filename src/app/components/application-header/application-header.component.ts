import { AppOrientation } from './../../app.constant';
import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Inject, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApplicationHeaderKebabMenuComponent } from '../../../app/components/application-header/application-header-kebab-menu.component';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { App } from '@capacitor/app';
import { MenuController, Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, EMPTY, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  CachedItemRequestSourceFrom,
  CorrelationData, DownloadEventType, DownloadProgress, DownloadService,
  EventNamespace, EventsBusService, NotificationService as PushNotificationService,
  Profile, ProfileService,
  ServerProfile, SharedPreferences, UserFeedStatus
} from '@project-sunbird/sunbird-sdk';
import {
  AppThemes, EventTopics, GenericAppConfig, PreferenceKey,
  ProfileConstants, RouterLinks, SwitchableTabsConfig,AppMode
} from '../../../app/app.constant';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { CorReleationDataType, Environment, ID, InteractSubtype, InteractType, PageId } from '../../../services/telemetry-constants';
import { CommonUtilService } from '../../../services/common-util.service';
import { UtilityService } from '../../../services/utility-service';
import { NotificationService } from '../../../services/notification.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ActivePageService } from '../../../services/active-page/active-page-service';
import { AppHeaderService } from '../../../services/app-header.service';
import { ToastNavigationComponent } from '../popups/toast-navigation/toast-navigation.component';

declare const cordova;

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
  isDownloadingActive = false;
  showDownloadingIcon = false;
  networkSubscription: Subscription;
  isUnreadNotification = false;
  menuSide = 'left';
  profile: Profile;
  managedProfileList$: Observable<ServerProfile[]> = EMPTY;
  userAvatarConfig = { size: 'large', isBold: true, isSelectable: false, view: 'horizontal' };
  appTheme = AppThemes.DEFAULT;
  unreadNotificationsCount = 0;
  isUpdateAvailable = false;
  currentSelectedTabs: string;
  isDarkMode:boolean;
  showReports: any;
  showLoginButton = false;
  notificationCount = {
    unreadCount : 0
  };
  isTablet = false;
  orientationToSwitch = AppOrientation.LANDSCAPE;
  isMenuOpen: boolean = false;

  // Font Increase Decrease Variables
  fontSize: any;
  defaultFontSize = 16;
  isGuestUser = true;
  guestUserDetails;
  showYearOfBirthPopup = false;
  public isIOS = false;
  @ViewChild('increaseFontSize') increaseFontSize: ElementRef;
  @ViewChild('decreaseFontSize') decreaseFontSize: ElementRef;
  @ViewChild('resetFontSize') resetFontSize: ElementRef;

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
    private utilityService: UtilityService,
    private changeDetectionRef: ChangeDetectorRef,
    private notification: NotificationService,
    private translate: TranslateService,
    public platform: Platform,
    private router: Router,
    private ngZone: NgZone,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private activePageService: ActivePageService,
    private popoverCtrl: PopoverController,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private appHeaderService: AppHeaderService,
    private renderer: Renderer2
  ) {
    this.setLanguageValue();
    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res?.selectedLanguage) {
        this.setLanguageValue();
      }
    });
    this.events.subscribe('onPreferenceChange:showReport', res => {
      this.showReports = res;
    });
    this.getUnreadNotifications();
    this.isTablet = window['isTablet'];
    this.events.subscribe(EventTopics.ORIENTATION, async () => {
      await this.checkCurrentOrientation();
    });
  }

  async ngOnInit() {
    await this.setAppLogo();
    this.setAppVersion();
    this.events.subscribe('user-profile-changed', async () => {
      await this.setAppLogo();
    });
    this.events.subscribe('app-global:profile-obj-changed', async () => {
      await this.setAppLogo();
    });
    this.events.subscribe(EventTopics.NOTIFICATION_REFRESH, async () => {
      await this.getUnreadNotifications();
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
    this.listenNotifications();
    this.networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      await this.setAppLogo();
    });
    this.appTheme = document.querySelector('html').getAttribute('data-theme');
    this.preference.getString('data-mode').subscribe((val)=>{
      this.isDarkMode = val === AppMode.DARKMODE;
    });
    await this.checkForAppUpdate();
  }
  ngAfterViewInit() {
    this.changeFontSize('reset');
  }

  private setAppVersion(): any {
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
    }).catch(e => console.log(e));
    this.preference.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
    .then(async langCode => {
      console.log('Language code: ', langCode);
      await this.notification.setupLocalNotification(langCode);
    }).catch(e => console.log(e));
  }

  listenDownloads() {
    combineLatest([
      this.downloadService.getActiveDownloadRequests(),
      this.eventsBusService.events(EventNamespace.DOWNLOADS).pipe(
        filter((event: any) => event.type === DownloadEventType.PROGRESS)
      )
    ]).subscribe(([list, event]: any) => {
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

  private listenNotifications() {
    this.pushNotificationService.notifications$.subscribe((notifications) => {
      this.unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
    });
  }

  async setAppLogo() {
    if (!this.appGlobalService.isUserLoggedIn()) {
      this.isLoggedIn = false;
      this.appLogo = './assets/imgs/ic_launcher.png';
      this.appName = (await App.getInfo()).name;
    } else {
      this.isLoggedIn = true;
      this.preference.getString('app_logo').toPromise().then(value => {
        if (value) {
          this.appLogo = this.commonUtilService.networkInfo.isNetworkAvailable ? value : './assets/imgs/ic_launcher.png';
        } else {
          this.appLogo = './assets/imgs/ic_launcher.png';
        }
      }).catch(err => console.error(err));
      this.appName = await this.preference.getString('app_name').toPromise();
      await this.fetchManagedProfileDetails();
    }
    this.refreshLoginInButton();
  }

  async toggleMenu() {
    await this.menuCtrl.toggle();
    this.isMenuOpen = await this.menuCtrl.isEnabled();
    if (this.isMenuOpen) {
      const pageId = this.activePageService.computePageId(this.router.url);
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.MENU_CLICKED,
        Environment.HOME,
        pageId
      );
    }
    this.events.publish(EventTopics.HAMBURGER_MENU_CLICKED);
    this.currentSelectedTabs = await this.preference.getString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG).toPromise();
  }

  announceToTalkBack(state: string) {
    const liveRegion = document.getElementById('talkback-live-region');
    if (liveRegion) {
      liveRegion.textContent = state;
      liveRegion.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        liveRegion.textContent = '';
        liveRegion.setAttribute('aria-hidden', 'true');
      }, 100);
    }
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
    this.menuCtrl.close().then(() => {
      this.sideMenuItemEvent.emit({ menuItem });
    }).catch((e) => {
      this.sideMenuItemEvent.emit({ menuItem });
    })
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
    this.events.subscribe('user-profile-changed');
    this.events.subscribe('app-global:profile-obj-changed');
  }

  async getUnreadNotifications() {
    await this.notification.fetchNotificationList().then((data) => {
      const notificationList = data.feeds;
      const unreadNotificationList = notificationList.filter((n: any) => n.status === UserFeedStatus.UNREAD);
      this.notificationCount.unreadCount = unreadNotificationList.length;
    })
  }

  async fetchManagedProfileDetails() {
    try {
      this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      if (!this.profile?.serverProfile) {
        this.managedProfileList$ = EMPTY;
        return;
      }
      this.managedProfileList$ = this.profileService.managedProfileManager.getManagedServerProfiles({
        from: CachedItemRequestSourceFrom.CACHE,
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      }).pipe(
        map((profiles: any) => {
          return profiles.filter(p => p.id !== this.profile.uid);
        })
      );
    } catch (err) {
      console.log(err);
    }
  }

  async addManagedUser() {
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

    await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SUB_PROFILE_EDIT}`]);
  }

  async openManagedUsers() {
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
    await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.MANAGE_USER_PROFILES}`], navigationExtras);
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
    this.profileService.managedProfileManager.switchSessionToManagedProfile({ uid: user.id }).toPromise().then(async res => {
      this.events.publish(AppGlobalService.USER_INFO_UPDATED);
      this.events.publish('loggedInProfile:update');
      if(user?.profileUserType?.type){
        await this.preference.putString(PreferenceKey.SELECTED_USER_TYPE, user.profileUserType.type).toPromise();
        this.events.publish('UPDATE_TABS', {type: 'SWITCH_TABS_USERTYPE'});
      }
      await this.menuCtrl.close();
      await this.showSwitchSuccessPopup(user.firstName);
      await this.tncUpdateHandlerService.checkForTncUpdate();
    }).catch(err => {
      this.commonUtilService.showToast('ERROR_WHILE_SWITCHING_USER');
      console.error(err);
    });
  }

  async showSwitchSuccessPopup(name) {
    const confirm = await this.popoverCtrl.create({
      component: ToastNavigationComponent,
      componentProps: {
        message: this.commonUtilService.translateMessage('SUCCESSFULLY_SWITCHED_USER', { '%app': this.appName, '%user': name }),
        description: this.commonUtilService.translateMessage('UPDATE_YOUR_PREFERENCE_FROM_PROFILE', { app_name: this.appName }),
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
    setTimeout(async () => {
      if (confirm) {
        await confirm.dismiss();
      }
    }, 3000);
    const { data } = await confirm.onDidDismiss();
    console.log(data);
    if (data) {
      await this.router.navigate([`/${RouterLinks.PROFILE_TAB}`]);
    }
  }

  async switchTheme() {
    if (document.querySelector('html').getAttribute('data-theme') === AppThemes.DEFAULT) {
      this.appTheme = AppThemes.JOYFUL;
      await this.preference.putString('current_selected_theme', this.appTheme).toPromise();
      document.querySelector('html').setAttribute('device-accessable-theme', 'accessible');
      await this.appHeaderService.showStatusBar().then();
    } else {
      document.querySelector('html').setAttribute('data-theme', AppThemes.DEFAULT);
      this.appTheme = AppThemes.DEFAULT;
      await this.preference.putString('current_selected_theme', this.appTheme).toPromise();
      document.querySelector('html').setAttribute('device-accessable-theme', '');
      this.appHeaderService.hideStatusBar();
    }
    await this.menuCtrl.close();
  }
  async switchMode(){
    if (document.querySelector('html').getAttribute('data-mode') === AppMode.DEFAULT) {
      this.isDarkMode=true
      this.appTheme = AppMode.DARKMODE;
      document.querySelector('html').setAttribute('data-mode', AppMode.DARKMODE);
      await this.preference.putString('data-mode', AppMode.DARKMODE).toPromise();
      await this.appHeaderService.showStatusBar().then();
    } else {
      document.querySelector('html').setAttribute('data-mode', AppMode.DARKMODE);
      this.isDarkMode=false
      this.appTheme = AppMode.DEFAULT;
      document.querySelector('html').setAttribute('data-mode', AppMode.DEFAULT);
      await this.preference.putString('data-mode', AppMode.DEFAULT).toPromise();
      this.appHeaderService.hideStatusBar();
    }
    await this.menuCtrl.close();
  }

  async switchTabs() {
    this.currentSelectedTabs = await this.preference.getString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG).toPromise();
    let subType = InteractSubtype.OPTED_IN;
    if (this.currentSelectedTabs === SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG) {
      await this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
        SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG).toPromise();
      this.events.publish('UPDATE_TABS', { type: 'SWITCH_TABS_USERTYPE' });
      subType = InteractSubtype.OPTED_OUT;
    } else if (!this.currentSelectedTabs || this.currentSelectedTabs === SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG) {
      await this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
        SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG).toPromise();
      this.events.publish('UPDATE_TABS', { type: 'SWITCH_TABS_USERTYPE' });
      subType = InteractSubtype.OPTED_IN;
    }
    const userType = await this.preference.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    const isNewUser = await this.preference.getBoolean(PreferenceKey.IS_NEW_USER).toPromise();
    this.telemetryGeneratorService.generateNewExprienceSwitchTelemetry(
      PageId.MENU,
      subType,
        {
            userType,
            isNewUser
        }
    );
    await this.commonUtilService.populateGlobalCData();
    await this.menuCtrl.close();
  }

  private async checkForAppUpdate() {
    return new Promise<void>((resolve => {
      cordova.plugins.InAppUpdateManager.isUpdateAvailable((result: string) => {
        if (result) {
          this.isUpdateAvailable = true;
          resolve();
        }
      }, () => { });
    }));
  }

  async showKebabMenu(event) {
    const kebabMenuPopover = await this.popoverCtrl.create({
      component: ApplicationHeaderKebabMenuComponent,
      event,
      showBackdrop: false,
      componentProps: {
        options: this.headerConfig.kebabMenuOptions || []
      },
    });
    await kebabMenuPopover.present();
    const { data } = await kebabMenuPopover.onDidDismiss();
    if (!data) {
      return;
    }
    this.emitEvent({ event, option: data.option }, 'kebabMenu');
  }

  private refreshLoginInButton() {
    const profileType = this.appGlobalService.getGuestUserType();
    this.showLoginButton = this.commonUtilService.isAccessibleForNonStudentRole(profileType);
  }

  private async checkCurrentOrientation() {
    const currentOritentation = await this.preference.getString(PreferenceKey.ORIENTATION).toPromise();
    if ( currentOritentation === AppOrientation.LANDSCAPE) {
      this.orientationToSwitch = AppOrientation.PORTRAIT;
    } else {
      this.orientationToSwitch = AppOrientation.LANDSCAPE;
    }
  }
  

  async signin() { await this.router.navigate([RouterLinks.SIGN_IN]); }

  changeFontSize(value: string) {
    const elFontSize = window.getComputedStyle(document.documentElement).getPropertyValue('font-size');

    const localFontSize = localStorage.getItem('fontSize');
    const currentFontSize = localFontSize || elFontSize;
    this.fontSize = parseInt(currentFontSize);
    if (value === 'increase') {
      this.renderer.setAttribute(this.increaseFontSize.nativeElement, 'aria-pressed', 'true');
      this.renderer.removeAttribute(this.decreaseFontSize.nativeElement, 'aria-pressed');
      this.renderer.removeAttribute(this.resetFontSize.nativeElement, 'aria-pressed');
      this.fontSize = this.fontSize + 2;
      if (this.fontSize <= 20) {
        this.setLocalFontSize(this.fontSize);
      }
    } else if (value === 'decrease') {
      this.renderer.setAttribute(this.decreaseFontSize.nativeElement, 'aria-pressed', 'true');
      this.renderer.removeAttribute(this.increaseFontSize.nativeElement, 'aria-pressed');
      this.renderer.removeAttribute(this.resetFontSize.nativeElement, 'aria-pressed');
      this.fontSize = this.fontSize - 2;
      if (this.fontSize >= 12) {
        this.setLocalFontSize(this.fontSize);
      }
    } else {
      this.renderer.setAttribute(this?.resetFontSize?.nativeElement, 'aria-pressed', 'true');
      this.renderer.removeAttribute(this?.increaseFontSize?.nativeElement, 'aria-pressed');
      this.renderer.removeAttribute(this?.decreaseFontSize?.nativeElement, 'aria-pressed');
      this.setLocalFontSize(this?.defaultFontSize);
    }
  }

  setLocalFontSize(value: any) {
    document.documentElement.style.setProperty('font-size', value + 'px', 'important');
    localStorage.setItem('fontSize', value);
    this.isDisableFontSize(value);
  }

  isDisableFontSize(value: any) {
    value = parseInt(value);
    if (value === 20) {
      this.renderer.setAttribute(this.increaseFontSize.nativeElement, 'disabled', 'true');
      this.renderer.removeAttribute(this.decreaseFontSize.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.resetFontSize.nativeElement, 'disabled');
    } else if (value === 12) {
      this.renderer.setAttribute(this.decreaseFontSize.nativeElement, 'disabled', 'true');
      this.renderer.removeAttribute(this.increaseFontSize.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.resetFontSize.nativeElement, 'disabled');
    } else if (value === 16) {
      this.renderer.setAttribute(this.resetFontSize.nativeElement, 'disabled', 'true');
      this.renderer.removeAttribute(this.increaseFontSize.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.decreaseFontSize.nativeElement, 'disabled');
    } else {
      this.renderer.removeAttribute(this.increaseFontSize.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.decreaseFontSize.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.resetFontSize.nativeElement, 'disabled');
    }
  }
}
