import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks } from '../app.constant';
import { AuthService, ClassRoomService, ClassRoom } from '@project-sunbird/sunbird-sdk';
import { LoginHandlerService } from '@app/services/login-handler.service';

@Component({
  selector: 'app-my-classrooms',
  templateUrl: './my-classrooms.page.html',
  styleUrls: ['./my-classrooms.page.scss'],
})
export class MyClassroomsPage implements OnInit {
  isGuestUser: boolean;
  groupList: ClassRoom[] = [];
  groupListLoader = false;

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private headerService: AppHeaderService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
  ) {  }

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  async checkUserLoggedIn() {
    const session = await this.authService.getSession().toPromise();
    this.isGuestUser = !session;
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.fetchGroupList();
  }

  createClassroom() {
    this.router.navigate([`/${RouterLinks.MY_CLASSROOMS}/${RouterLinks.CREATE_EDIT_CLASSROOM}`]);
  }

  login() {
    this.loginHandlerService.signIn({skipRootNavigation: true});
  }

  async fetchGroupList() {
    this.groupListLoader = true;
    try {
      this.groupList = await this.classRoomService.getAll().toPromise();
      this.groupListLoader = false;
      console.log('this.groupList', this.groupList);
    } catch {
      this.groupListLoader = false;
    }
  }

  navigateToGroupdetailsPage(e) {
    const navigationExtras: NavigationExtras = {
      state: {
        groupId: e.data.identifier
      }
    };
    this.router.navigate([`/${RouterLinks.MY_CLASSROOMS}/${RouterLinks.CLASS_DETAILS}`], navigationExtras);
  }

}
