import { ProfileType, SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { Component, ViewChild, ViewEncapsulation, Inject, NgZone, OnInit } from '@angular/core';

import { IonTabs, Events, ToastController } from '@ionic/angular';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileConstants } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
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

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private appGlobalService: AppGlobalService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private zone: NgZone
  ) {

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
      initTabs(this.container, LOGIN_TEACHER_TABS);
    }
  }

  ionViewWillEnter() {
    this.tabs = this.container.getAllTabs();
    this.events.publish('update_header');
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
}
