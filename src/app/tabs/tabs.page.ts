import { ProfileType, SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { Component, ViewChild, ViewEncapsulation, Inject, OnInit, AfterViewInit } from '@angular/core';
import { IonTabs, Events, ToastController } from '@ionic/angular';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileConstants, EventTopics, RouterLinks, PreferenceKey } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId } from '@app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TabsPage implements OnInit, AfterViewInit {

  configData: any;
  @ViewChild('myTabs') tabRef: IonTabs;
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
  isPageInitialised = false;

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
      initTabs(this.container, LOGIN_TEACHER_TABS);
    }

    this.tabs = this.container.getAllTabs();
    this.events.subscribe('UPDATE_TABS', () => {
      this.tabs = this.container.getAllTabs();
    });
    this.isPageInitialised = true;
  }

  ngAfterViewInit() {
    this.setQrStyles();
  }

  setQrStyles() {
    setTimeout(async () => {
      if (document.getElementById('qrScannerIcon') && document.getElementById('backdrop')) {
        const backdropClipCenter = document.getElementById('qrScannerIcon').getBoundingClientRect().left +
          ((document.getElementById('qrScannerIcon').getBoundingClientRect().width) / 2);

        (document.getElementById('backdrop').getElementsByClassName('bg')[0] as HTMLDivElement).setAttribute(
          'style',
          `background-image: radial-gradient(circle at ${backdropClipCenter}px 56px, rgba(0, 0, 0, 0) 30px, rgba(0, 0, 0, 0.9) 30px);`
        );
      } else {
        this.setQrStyles();
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
    this.tabs[2].root = event.tab;
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

}
