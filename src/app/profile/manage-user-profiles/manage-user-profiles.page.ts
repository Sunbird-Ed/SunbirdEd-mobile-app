import { Component, OnInit } from '@angular/core';

import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks } from '@app/app/app.constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-user-profiles',
  templateUrl: './manage-user-profiles.page.html',
  styleUrls: ['./manage-user-profiles.page.scss'],
})
export class ManageUserProfilesPage implements OnInit {

  manageProfileList = [
    { title: 'User Name 1', initial: 'abc111', isAdmin: true, id: '1111111111' },
    { title: 'User Name 2', initial: 'abc222', isAdmin: true, id: '2222222222' },
    { title: 'User Name 3', initial: 'abc222', isAdmin: true, id: '2222222222' },
    { title: 'User Name 4', initial: 'abc222', isAdmin: true, id: '2222222222' },
    { title: 'User Name 5', initial: 'abc222', isAdmin: true, id: '2222222222' }
  ];
  selectedUserIndex = -1;
  constructor(
    private appHeaderService: AppHeaderService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  selectedUser(user, index) {
    this.selectedUserIndex = index;
    console.log(user);
  }

  onMenuCliced(event) {
    console.log(event);
  }

  switchUser() {
    
  }

  addUser() {
    // if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
    //   this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    //   return;
    // }

    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SUB_PROFILE_EDIT}`]);
  }

}
