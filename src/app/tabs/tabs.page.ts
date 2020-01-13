import { ProfileType, SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { Component, ViewChild, ViewEncapsulation, Inject, OnInit } from '@angular/core';

import { IonTabs, Events, ToastController } from '@ionic/angular';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileConstants } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TabsPage implements OnInit {

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
  olderWebView = false;

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private appGlobalService: AppGlobalService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private externalIdVerificationService: ExternalIdVerificationService
  ) {

  }

  async ngOnInit() {
    console.log('Inside tabsPage');
    this.checkAndroidWebViewVersion();
    const session = await this.appGlobalService.authService.getSession().toPromise();
    if (!session) {
      console.log(`Success Platform Session`, session);

      const profileType = this.appGlobalService.guestProfileType;
      if (profileType === ProfileType.TEACHER) {
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
  }

  checkAndroidWebViewVersion() {
    var that = this;
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
    .then(function(packageInfo) {
      if (parseInt(packageInfo.versionName.split('.')[0], 10) <= 68) {
        that.olderWebView = true;
      }
    })
    .catch(function(error) { });
  }

  ionViewWillEnter() {
    this.tabs = this.container.getAllTabs();
    this.events.publish('update_header');
    this.events.subscribe('return_course', () => {
      console.log('tabs');
      setTimeout(() => {
        this.tabRef.select('courses');
      }, 300);
    });
  }

  openScanner(tab) {
    this.events.publish('tab.change', tab.label);
  }

  ionTabsDidChange(event: any) {
    this.tabs[2].root = event.tab;
    this.events.publish('tab.change', event.tab);
    this.commonUtilService.currentTabName = this.tabRef.getSelected();
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


  // async saveExternalUserAndShowPopup(userId) {
  //   const isCustodianUser = await this.isCustodianUser$.toPromise();
  //   const tenantSpecificMessages: any = await this.formAndFrameworkUtilService.getTenantSpecificMessages();
  //   if (isCustodianUser) {
  //     await this.profileService.getUserFeed().toPromise()
  //       .then(async (userFeed: UserFeed[]) => {
  //         userFeed = [this.userFeed];
  //         console.log('UserFeedResponse in Resources', userFeed);
  //         if (userFeed[0]) {
  //           if ((userFeed[0].category).toLowerCase() === 'orgmigrationaction') {
  //             let popupLabels = {};
  //             if (tenantSpecificMessages && tenantSpecificMessages.length) {
  //               if (tenantSpecificMessages[0] && tenantSpecificMessages[0].range && tenantSpecificMessages[0].range.length) {
  //                    popupLabels = tenantSpecificMessages[0].range[0];
  //               }
  //             }
  //             const popover = await this.popoverCtrl.create({
  //               component: TeacherIdVerificationComponent,
  //               backdropDismiss: false,
  //               cssClass: 'popover-alert popoverPosition',
  //               componentProps: {
  //                 userFeed: userFeed[0], tenantMessages: popupLabels
  //               }
  //             });
  //             await popover.present();
  //           }
  //         }
  //       })
  //       .catch((error) => {
  //         console.log('error', error);
  //       });
  //   }
  // }
}
