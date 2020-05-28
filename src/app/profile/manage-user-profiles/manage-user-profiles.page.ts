import { Component, OnInit, Inject } from '@angular/core';

import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks, ProfileConstants } from '@app/app/app.constant';
import { Router } from '@angular/router';
import { CommonUtilService } from '@app/services/common-util.service';
import { ProfileService, CachedItemRequestSourceFrom, SharedPreferences, ServerProfile } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { Events } from '@ionic/angular';
import { Observable, EMPTY, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-manage-user-profiles',
  templateUrl: './manage-user-profiles.page.html',
  styleUrls: ['./manage-user-profiles.page.scss'],
})
export class ManageUserProfilesPage implements OnInit {

  sbCardConfig = {
    size: 'medium',
    isBold: false,
    isSelectable: false,
    view: 'horizontal'
  };
  manageProfileList$: Observable<ServerProfile[]>;
  selectedUserIndex = -1;
  appName = '';
  selectedUser: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private appHeaderService: AppHeaderService,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private events: Events
  ) {
    this.manageProfileList$ = combineLatest([
      this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }),
      this.profileService.getManagedServerProfiles({ from: CachedItemRequestSourceFrom.SERVER })
    ]).pipe(
      map(([activeProfile, profiles]) => {
        return profiles.filter(p => p.id !== activeProfile.uid);
      }),
      catchError(err => {
        this.commonUtilService.showToast('ERROR_WHILE_FETCHING_USERS');
        console.error(err);
        return EMPTY;
      })
    );
   }

  ngOnInit() {
    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    });
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  selecteUser(user, index) {
    this.selectedUserIndex = index;
    this.selectedUser = user;
  }

  onMenuCliced(event) {
    console.log(event);
  }

  switchUser() {
    if (!this.selectedUser || !this.selectedUser.id) {
      return;
    }
    this.profileService.switchSessionToManagedProfile({ uid: this.selectedUser.id }).toPromise().then(res => {
      this.events.publish(AppGlobalService.USER_INFO_UPDATED);
      this.events.publish('loggedInProfile:update');
      // this.commonUtilService.showToast('SUCCESSFULLY_SWITCHED_USER', null, null, null, null, this.selectedUser.firstName || '');
      this.commonUtilService.showSwitchUserManagedProfileTost('SUCCESSFULLY_SWITCHED_USER', this.selectedUser.firstName);
      this.router.navigate([RouterLinks.TABS]);
    }).catch(err => {
      this.commonUtilService.showToast('ERROR_WHILE_SWITCHING_USER');
      console.error(err);
    });
  }

  addUser() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
      return;
    }

    this.router.navigate([`/${RouterLinks.PROFILE_TAB}/${RouterLinks.SUB_PROFILE_EDIT}`]);
  }

}
