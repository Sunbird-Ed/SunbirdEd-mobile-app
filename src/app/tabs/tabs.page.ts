import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EventTopics, PreferenceKey, ProfileConstants, RouterLinks, SwitchableTabsConfig } from '../../app/app.constant';
import { initTabs } from '../../app/module.service';
import { OnTabViewWillEnter } from '../../app/tabs/on-tab-view-will-enter';
import { PageId } from '../../services/telemetry-constants';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CommonUtilService } from '../../services/common-util.service';
import { ContainerService } from '../../services/container.services';
import { IonTabs, ToastController } from '@ionic/angular';
import { Events } from '../../util/events';
import { ProfileService, ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { OnboardingConfigurationService } from '../../services/onboarding-configuration.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TabsPage implements OnInit, AfterViewInit {

  configData: any;
  @ViewChild('tabRef', { static: false }) tabRef: IonTabs;
  tabIndex = 0;
  tabs = [];
  headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search', 'filter'],
  };
  selectedLanguage: string;
  appLabel: any;
  olderWebView = false;
  tabList: any;
  selectedTab: string;

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private appGlobalService: AppGlobalService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private onboardingConfigurationService: OnboardingConfigurationService
  ) {

  }

  async ngOnInit() {
    this.checkAndroidWebViewVersion();
    const session = await this.appGlobalService.authService.getSession().toPromise();
    if (session) {
      if ((await this.preferences.getString('SHOW_WELCOME_TOAST').toPromise()) === 'true') {
        await this.preferences.putString('SHOW_WELCOME_TOAST', 'false').toPromise().then();

        const serverProfile = await this.profileService.getServerProfilesDetails({
          userId: session.userToken,
          requiredFields: ProfileConstants.REQUIRED_FIELDS,
        }).toPromise();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('WELCOME_BACK', serverProfile.firstName));
      }
    }
    await this.refreshTabs();
    this.events.subscribe('UPDATE_TABS', async (data) => {
      await this.refreshTabs(data);
    });
  }

  private async refreshTabs(data?) {
    this.selectedTab = '';
    initTabs(this.container, await this.getInitialTabs(await this.appGlobalService.authService.getSession().toPromise()));
    this.tabs = this.container.getAllTabs();
    if (!data || (data && !data.navigateToCourse)) {
      await this.router.navigate(['/tabs/' + this.tabs[0].root]);
    }
  }

  ngAfterViewInit() {
    this.setQRStyles();
    this.setQRTabRoot(this.tabRef.getSelected());
  }

  setQRStyles() {
    setTimeout(() => {
      if (document.getElementById('qrScannerIcon') && document.getElementById('backdrop')) {
        const backdropClipCenter = document.getElementById('qrScannerIcon').getBoundingClientRect().left +
          ((document.getElementById('qrScannerIcon').getBoundingClientRect().width) / 2);

        (document.getElementById('backdrop').getElementsByClassName('bg')[0] as HTMLDivElement).setAttribute(
          'style',
          `background-image: radial-gradient(circle at ${backdropClipCenter}px 56px, rgba(0, 0, 0, 0) 30px, rgba(0, 0, 0, 0.9) 30px);`
        );
      } else {
        this.setQRStyles();
      }
    }, 2000);
  }

  checkAndroidWebViewVersion() {
    let that = this;
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
      .then(function (packageInfo) {
        if (parseInt(packageInfo.versionName.split('.')[0], 10) <= 68) {
          that.olderWebView = true;
        }
      })
      .catch(function (error) { });
  }

  ionViewWillEnter() {
    if (this.tabRef.outlet.component['tabViewWillEnter']) {
      (this.tabRef.outlet.component as unknown as OnTabViewWillEnter).tabViewWillEnter();
    }
    this.tabs = this.container.getAllTabs();
    this.events.publish('update_header');
    this.events.subscribe('return_course', () => {
      setTimeout(async () => {
        const tab:any = 'courses';
        await this.tabRef.select(tab);
      }, 300);
    });
    this.events.subscribe('to_profile', () => {
      setTimeout(async () => {
        const tab:any = 'profile';
        await this.tabRef.select(tab);
      }, 300);
    });
  }

  openScanner(tab) {
    this.events.publish(EventTopics.TAB_CHANGE, tab.label);
  }

  async ionTabsDidChange(event: any) {
    this.selectedTab = event.tab;
    this.setQRTabRoot(event.tab);
    if (this.selectedTab) {
      const tabButtons = document.querySelectorAll('ion-tab-button');
  
      tabButtons.forEach((tabButton: HTMLElement) => {
        const iconElement = tabButton.querySelector('ion-icon');
        const tabRoot = iconElement.ariaLabel;
        console.log(tabRoot);
        
        if (tabRoot === this.selectedTab) {
          tabButton.setAttribute('id', 'qa_tabs_' + this.selectedTab);
        }
      });
    }
    if (event.tab === 'resources') {
      event.tab = PageId.LIBRARY;
      this.events.publish(EventTopics.TAB_CHANGE, event.tab);
    } else {
      this.events.publish(EventTopics.TAB_CHANGE, event.tab);
    }
    this.commonUtilService.currentTabName = this.tabRef.getSelected();
    await this.checkOnboardingProfileDetails();
  }

  public async onTabClick(tab) {
    if (tab.disabled) {
      if (tab.availableLater) {
        this.commonUtilService.showToast('Will be available in later release', false, 'sb-toast available-later');
      } else {
        this.commonUtilService.showToast('AVAILABLE_FOR_TEACHERS', false, 'sb-toast available-later');
      }
    }
  }

  async checkOnboardingProfileDetails() {
    if (!this.appGlobalService.isUserLoggedIn() && !this.appGlobalService.isOnBoardingCompleted) {
      await this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], {
        state: {
          hideBackButton: true
        }
      });
    }
  }

  private setQRTabRoot(tab: string) {
    if (this.tabs && this.tabs.find((ele) => ele.name === 'qrscanner')) {
      const objIndex = this.tabs.findIndex((obj => obj.name === 'qrscanner'));
      this.tabs[objIndex].root = tab;
    }
  }

  private async getInitialTabs(session): Promise<any[]> {
    const defaultSwitchableTabsConfig = SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG;
    const selectedSwitchableTabsConfig = (await this.preferences.getString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG).toPromise()) ||
      defaultSwitchableTabsConfig;
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    this.tabList = await this.onboardingConfigurationService.initializedTabs(selectedSwitchableTabsConfig, selectedUserType);
    const config = {
      'GUEST_TEACHER': {
        [SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG]: this.tabList,
        [SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG]: this.tabList
      },
      'GUEST_STUDENT': {
        [SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG]: this.tabList,
        [SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG]: this.tabList
      },
      'LOGIN_USER': {
        [SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG]: this.tabList,
        [SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG]: this.tabList
      },
      'LOGIN_ADMIN': {
        [SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG]: this.tabList,
        [SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG]: this.tabList
      }
    };


    if (!session) {
      const profileType = this.appGlobalService.guestProfileType;
      if (this.commonUtilService.isAccessibleForNonStudentRole(profileType)) {
        return config['GUEST_TEACHER'][selectedSwitchableTabsConfig];
      } else {
        return config['GUEST_STUDENT'][selectedSwitchableTabsConfig];
      }
    } else {
      return selectedUserType === ProfileType.ADMIN ?
        config['LOGIN_ADMIN'][selectedSwitchableTabsConfig] :
        config['LOGIN_USER'][selectedSwitchableTabsConfig];
    }
  }
}
