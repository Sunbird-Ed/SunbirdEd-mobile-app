import { ProfileType, SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS, LOGIN_TEACHER_TABS } from './../module.service';
import { Component, ViewChild, ViewEncapsulation, Inject } from '@angular/core';

import { IonTabs, Events, ToastController } from '@ionic/angular';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileConstants } from '../app.constant';
import { CommonUtilService } from '@app/services';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TabsPage {

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
    private commonUtilService: CommonUtilService
  ) {

  }

  async ionViewWillEnter() {
    console.log("Inside tabsPage");

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
    let tabIndex;

    this.tabs.forEach((tab, index) => {
      if (tab.isSelected === true) {
        tabIndex = index;
      }
    });

    this.events.publish('update_header', { index: tabIndex });
    // Raise an Event
    setTimeout(() => {
      this.tabRef.select(tabIndex);
    }, 300);
  }

  public ionTabsWillChange(event: any) {
    console.log("Inside ionChange");


    // if active tab is other than scanner tab i.e, = tab 2
    // if (tab.index !== 2) {
    //   this.tabs.forEach((tabTo, index) => {
    //     this.appGlobalService.currentPageId = tab.tabTitle;
    //     if (tabTo.isSelected === true) {
    //       tabTo.isSelected = false;
    //     }

    //     if (index === tab.index) {
    //       tabTo.isSelected = true;
    //     }
    //   });
    // }

    // this.events.publish('tab.change', tab.tabTitle);
  }

  public async customClick(tab, _index) {
    // this.tabIndex = _index;
    if (tab.disabled && tab.availableLater) {
      let toast = await this.toastCtrl.create({
        message: 'Will be available in later release',
        duration: 3000,
        position: 'middle',
        cssClass: 'sb-toast available-later',
        showCloseButton: false
      });

      await toast.present();
    }

    if (tab.disabled && !tab.availableLater) {
      const toast = await this.toastCtrl.create({
        message: 'Available for teachers only',
        duration: 3000,
        position: 'middle',
        cssClass: 'sb-toast available-later',
        showCloseButton: false
      });
      await toast.present();
    }
  }

}
