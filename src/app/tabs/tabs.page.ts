import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EventTopics, PreferenceKey, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs, LOGIN_ADMIN_TABS, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { OnTabViewWillEnter } from '@app/app/tabs/on-tab-view-will-enter';
import { PageId } from '@app/services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { ContainerService } from '@app/services/container.services';
import { Events, IonTabs, ToastController } from '@ionic/angular';
import { ProfileService, ProfileType, SharedPreferences } from 'sunbird-sdk';

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

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private appGlobalService: AppGlobalService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {

  }

  async ngOnInit() {
    this.checkAndroidWebViewVersion();
    const session = await this.appGlobalService.authService.getSession().toPromise();
    if (!session) {
      const profileType = this.appGlobalService.guestProfileType;
      if (this.commonUtilService.isAccessibleForNonStudentRole(profileType)) {
        initTabs(this.container, GUEST_TEACHER_TABS);
      } else {
        initTabs(this.container, GUEST_STUDENT_TABS);
      }
    } else {
      if ((await this.preferences.getString('SHOW_WELCOME_TOAST').toPromise()) === 'true') {
        this.preferences.putString('SHOW_WELCOME_TOAST', 'false').toPromise().then();

        const serverProfile = await this.profileService.getServerProfilesDetails({
          userId: session.userToken,
          requiredFields: ProfileConstants.REQUIRED_FIELDS,
        }).toPromise();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('WELCOME_BACK', serverProfile.firstName));
      }
      const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
      initTabs(this.container,
        selectedUserType === ProfileType.ADMIN ? LOGIN_ADMIN_TABS : LOGIN_TEACHER_TABS);
    }

    this.tabs = this.container.getAllTabs();
    this.events.subscribe('UPDATE_TABS', async (data) => {
      if (data && data.type === 'SWITCH_TABS_USERTYPE') {
        const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        initTabs(this.container, selectedUserType === ProfileType.ADMIN ? LOGIN_ADMIN_TABS : LOGIN_TEACHER_TABS);
      } else {
        this.tabs = this.container.getAllTabs();
      }
    });
  }

  ngAfterViewInit() {
    this.setQRStyles();
    this.setQRTabRoot(this.tabRef.getSelected());
  }

  setQRStyles() {
    setTimeout(async () => {
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
    var that = this;
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
      (this.tabRef.outlet.component as OnTabViewWillEnter).tabViewWillEnter();
    }
    this.tabs = this.container.getAllTabs();
    this.events.publish('update_header');
    this.events.subscribe('return_course', () => {
      setTimeout(() => {
        this.tabRef.select('courses');
      }, 300);
    });
    this.events.subscribe('to_profile', () => {
      setTimeout(() => {
        this.tabRef.select('profile');
      }, 300);
    });
  }

  openScanner(tab) {
    this.events.publish(EventTopics.TAB_CHANGE, tab.label);
  }

  ionTabsDidChange(event: any) {
    this.setQRTabRoot(event.tab);
    if (event.tab === 'resources') {
      event.tab = PageId.LIBRARY;
      this.events.publish(EventTopics.TAB_CHANGE, event.tab);
    } else {
      this.events.publish(EventTopics.TAB_CHANGE, event.tab);
    }
    this.commonUtilService.currentTabName = this.tabRef.getSelected();
    this.checkOnboardingProfileDetails();
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
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], {
        state: {
          hideBackButton: true
        }
      });
    }
  }

  private setQRTabRoot(tab: string) {
    if (this.tabs && this.tabs[2]) {
      this.tabs[2].root = tab;
    }
  }

}
