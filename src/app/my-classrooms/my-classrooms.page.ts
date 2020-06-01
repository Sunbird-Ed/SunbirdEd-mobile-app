import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks } from '../app.constant';
import { AuthService, ClassRoomService, ClassRoom } from '@project-sunbird/sunbird-sdk';
import { LoginHandlerService } from '@app/services/login-handler.service';
import { CommonUtilService } from '@app/services';
import { PopoverController } from '@ionic/angular';
import { MyGroupsPopoverComponent } from '../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';

@Component({
  selector: 'app-my-classrooms',
  templateUrl: './my-classrooms.page.html',
  styleUrls: ['./my-classrooms.page.scss'],
})
export class MyClassroomsPage implements OnInit, OnDestroy {
  isGuestUser: boolean;
  groupList: ClassRoom[] = [];
  groupListLoader = false;
  headerObservable: any;

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private headerService: AppHeaderService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController
  ) {  }

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  async checkUserLoggedIn() {
    const session = await this.authService.getSession().toPromise();
    this.isGuestUser = !session;
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton(['groupInfo']);
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.fetchGroupList();
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'groupInfo':
        this.openinfopopup();
        break;
    }
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

  async openinfopopup() {
    const popover = await this.popoverCtrl.create({
      component: MyGroupsPopoverComponent,
      componentProps: {
        title: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED'),
        body: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED_DESC'),
        buttonText: this.commonUtilService.translateMessage('INSTALL_CROSSWALK')
      },
      cssClass: 'popover-my-groups'
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data === undefined) { // Backdrop clicked
    } else if (data.closeDeletePopOver) { // Close clicked
    } else if (data.canDelete) {
    }
  }

}
