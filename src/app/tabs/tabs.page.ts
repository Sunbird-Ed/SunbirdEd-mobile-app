import { ProfileType, SharedPreferences, ProfileService, UserFeed } from 'sunbird-sdk';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { Component, ViewChild, ViewEncapsulation, Inject, NgZone, OnInit } from '@angular/core';

import { IonTabs, Events, ToastController, PopoverController } from '@ionic/angular';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileConstants, PreferenceKey } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
import { Observable } from 'rxjs';
import { TeacherIdVerificationComponent } from '../components/popups/teacher-id-verification-popup/teacher-id-verification-popup.component';
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
  public isCustodianUser$: Observable<boolean>;
  isCustodianUser: any;

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private appGlobalService: AppGlobalService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private zone: NgZone,
    private popoverCtrl: PopoverController
  ) {
    this.isCustodianUser$ = this.profileService.isDefaultChannelProfile()
      .map((isDefaultChannelProfile) => isDefaultChannelProfile) as any;

  }

  async ngOnInit() {
    console.log('Inside tabsPage');

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
      this.saveExternalUser(session.userToken);
      this.showExternalPopup(session.userToken);
      initTabs(this.container, LOGIN_TEACHER_TABS);
    }

    this.tabs = this.container.getAllTabs();
    this.events.subscribe('UPDATE_TABS', () => {
      this.tabs = this.container.getAllTabs();
    });
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

  async saveExternalUser(userId) {
    const isCustodianUser = await this.isCustodianUser$.toPromise();
    console.log('this.iscustodianUser', isCustodianUser);
    if (isCustodianUser) {
      await this.profileService.getUserFeed().toPromise()
        .then(async (userFeed: UserFeed[]) => {
          console.log('UserFeedResponse in Resources', userFeed);
          if (userFeed[0]) {
            if ((userFeed[0].category).toLowerCase() === 'orgmigrationaction') {
              await this.preferences.putBoolean(PreferenceKey.SHOW_EXTERNAL_VERIFICATION + '-' + userId, true).toPromise();
            }
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
  }
  async showExternalPopup(userId) {
    const isCustodianUser = await this.isCustodianUser$.toPromise();
    if (isCustodianUser) {
      await this.profileService.getUserFeed().toPromise()
        .then(async (userFeed: UserFeed[]) => {
          console.log('UserFeedResponse in Resources', userFeed);
          if (userFeed[0]) {
            if ((userFeed[0].category).toLowerCase() === 'orgmigrationaction') {
              if (await this.preferences.getBoolean(PreferenceKey.SHOW_EXTERNAL_VERIFICATION + '-' + userId).toPromise()) {
                const popover = await this.popoverCtrl.create({
                  component: TeacherIdVerificationComponent,
                  backdropDismiss: false,
                  cssClass: 'popover-alert popoverPosition',
                  componentProps: userFeed[0]
                });
                await popover.present();
              }
            }
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
  }
}
