import { SbGenericPopoverComponent } from 'src/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import {
  CommonUtilService,
  AppHeaderService,
  ContainerService,
  Environment,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
  TelemetryGeneratorService
} from './../../../services';
import { TranslateService } from '@ngx-translate/core';
import { Component, Inject, NgZone, ViewChild, OnInit } from '@angular/core';
import {
  AlertController, Events, LoadingController, PopoverController, ToastController
} from '@ionic/angular';
// import { PopoverPage } from '../popover/popover';
// import { GroupDetailNavPopoverPage } from '../group-detail-nav-popover/group-detail-nav-popover';
// import { CreateGroupPage } from '../create-group/create-group';
// import { AddOrRemoveGroupUserPage } from '../add-or-remove-group-user/add-or-remove-group-user';
import {
  AuthService,
  GetAllProfileRequest,
  Group,
  GroupService,
  Profile,
  ProfileService,
  ProfilesToGroupRequest,
  ProfileType,
  SharedPreferences,
  TelemetryObject
} from 'sunbird-sdk';
import { AppGlobalService } from '../../../services';
import {
  GUEST_STUDENT_SWITCH_TABS,
  GUEST_STUDENT_TABS,
  GUEST_TEACHER_SWITCH_TABS,
  GUEST_TEACHER_TABS,
  // initTabs
} from '../../../app/module.service';
// import { GuestEditProfilePage } from '../../profile/guest-edit.profile/guest-edit.profile';
import { } from '../../../services';
import { Map } from '../../../app/telemetryutil';
import { PreferenceKey } from '../../../app/app.constant';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { EditDeletePopoverComponent } from '../edit-delete-popover/edit-delete-popover.component';
import { GroupDetailNavPopover } from '../group-detail-nav-popover/group-detail-nav-popover';
// import { TabsPage } from '@app/pages/tabs/tabs';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {
  group: Group;
  currentUserId: string;
  currentGroupId: string;
  userList: Array<Profile> = [];
  selectedUserIndex = -1;
  profileDetails: any;
  userUids = [];
  isNoUsers = false;
  playConfig: any;
  ProfileType = ProfileType;
  isCurrentGroupActive = false;

  constructor(
    @Inject('GROUP_SERVICE') private groupService: GroupService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private zone: NgZone,
    private translate: TranslateService,
    private popOverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private container: ContainerService,
    private event: Events,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router

  ) {
    this.group = window.history.state.groupInfo;
    this.currentUserId = window.history.state.currentUserId;
    this.currentGroupId = window.history.state.currentGroupId;
    this.profileDetails = window.history.state.profile;
    this.playConfig = window.history.state.playConfig;

    this.isCurrentGroupActive = (this.group.gid === this.currentGroupId);

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
    this.getAllProfile();
  }


  async getAllProfile() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const profileRequest: GetAllProfileRequest = {
      local: true,
      groupId: this.group.gid
    };

    this.zone.run(() => {
      this.profileService.getAllProfiles(profileRequest)
        .map((profiles) => profiles.filter((profile) => !!profile.handle))
        .toPromise()
        .then((profiles) => {
          this.zone.run(async () => {
            await loader.dismiss();
            if (profiles && profiles.length) {
              this.userList = profiles;
              this.userList.forEach((item) => {
                this.userUids.push(item.uid);
              });
              this.isNoUsers = (this.userList.length) ? false : true;
            }
          });
        }).catch(async () => {
          await loader.dismiss();
        });
    });
  }


  selectUser(index: number, name: string) {
    this.zone.run(() => {
      this.selectedUserIndex = (this.selectedUserIndex === index) ? -1 : index;
      // this.resizeContent();
    });
  }

  /**
   * Shows Prompt for switch Account
   */
  async switchAccountConfirmBox() {
    // Generate Switch User click event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SWITCH_USER_CLICKED,
      Environment.USER,
      PageId.GROUP_DETAIL
    );

    const selectedUser = this.userList[this.selectedUserIndex];
    const valuesMap = new Map();
    const fromUser = new Map();
    fromUser['uid'] = this.currentUserId;
    fromUser['type'] = this.appGlobalService.isUserLoggedIn() ? 'signed-in' : 'guest';

    const toUser = new Map();
    toUser['uid'] = selectedUser.uid;
    toUser['type'] = 'guest';

    valuesMap['from'] = fromUser;
    valuesMap['to'] = toUser;
    valuesMap['gid'] = this.group.gid;

    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(selectedUser.uid, Environment.USER, undefined);

    // Generate Switch user initiate interact event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SWITCH_USER_INITIATE,
      Environment.USER,
      PageId.GROUP_DETAIL,
      telemetryObject,
      valuesMap
    );

    const confirm = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('SWITCH_ACCOUNT_CONFIRMATION'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('SIGNED_OUT_ACCOUNT_MESSAGE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
          },
          {
            btntext: this.commonUtilService.translateMessage('OKAY'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    const isLeftBtnClicked = await confirm.onDidDismiss();
    if (isLeftBtnClicked == null) {
      return;
    }
    if (!isLeftBtnClicked) {
      this.logOut(selectedUser, false);
    }

    if (this.appGlobalService.isUserLoggedIn()) {
      await confirm.present();
    } else {
      this.setAsCurrentUser(selectedUser, false);
    }

    // Generate Switch user success event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.SWITCH_USER_SUCCESS,
      Environment.USER,
      PageId.GROUP_DETAIL,
      telemetryObject,
      valuesMap);
  }

  // takes to content details page and launches player
  play() {
    const selectedUser = this.userList[this.selectedUserIndex];
    if (this.appGlobalService.isUserLoggedIn()) {
      this.logOut(selectedUser, true);
    } else {
      this.setAsCurrentUser(selectedUser, true);
    }
  }

  logOut(selectedUser: any, isBeingPlayed: boolean) {
    const telemetryObject = new TelemetryObject(this.profileDetails.id, Environment.USER, undefined);


    // Generate Logout initiate event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOGOUT_INITIATE,
      Environment.USER,
      PageId.GROUP_DETAIL,
      telemetryObject
    );
    if (isBeingPlayed) {
      this.authService.resignSession().subscribe();
      (<any>window).splashscreen.clearPrefs();
      this.setAsCurrentUser(selectedUser, true);
    } else {
      if (this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.authService.resignSession().toPromise().then(() => {
          (<any>window).splashscreen.clearPrefs();
          this.setAsCurrentUser(selectedUser, false);
        });
      } else {
        this.authService.resignSession().subscribe();
        (<any>window).splashscreen.clearPrefs();
        this.setAsCurrentUser(selectedUser, false);
      }
    }
    // Generate Logout success event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.LOGOUT_SUCCESS,
      Environment.USER,
      PageId.GROUP_DETAIL,
      telemetryObject
    );
  }

  async presentPopoverNav(myEvent) {
    const popover = await this.popOverCtrl.create({
      component: GroupDetailNavPopover,
      componentProps: {
        goToEditGroup: async () => {
          const navigationExtras: NavigationExtras = {
            state: {
              groupInfo: this.group
            }
          }
          this.router.navigate(['CreateGroupPage'], navigationExtras);
          await popover.dismiss();
        },
        deleteGroup: async () => {

          this.deleteGroupConfirmBox();
          await popover.dismiss();
        },
        addUsers: async () => {
          const navigationExtras: NavigationExtras = {
            state: {
              isAddUsers: true,
              groupInfo: this.group,
              groupMembers: this.userList
            }
          }

          this.router.navigate(['AddOrRemoveGroupUserPage'], navigationExtras);
          await popover.dismiss();
        },
        removeUser: async () => {
          const navigationExtras: NavigationExtras = {
            state: {
              isAddUsers: false,
              groupInfo: this.group,
              groupMembers: this.userList
            }
          }
          this.router.navigate(['AddOrRemoveGroupUserPage'], navigationExtras);

          await popover.dismiss();
        },
        noUsers: (this.userList.length) ? true : false,
        isActiveGroup: this.isCurrentGroupActive
      },
      cssClass: 'user-popover'
    });

    await popover.present();
  }

  async presentPopover(myEvent, index) {
    const profile = this.userList[index];
    let isActiveUser = false;
    if (profile.uid === this.currentUserId && this.isCurrentGroupActive) {
      isActiveUser = true;
    }

    const popover = await this.popOverCtrl.create({
      component: EditDeletePopoverComponent,
      componentProps: {
        edit: async () => {
          const navigationExtras: NavigationExtras = {
            state: {
              profile: this.userList[index]
            }
          }

          this.router.navigate(['GuestEditProfilePage'], navigationExtras)
          await popover.dismiss();
        },
        delete: async () => {
          this.userDeleteGroupConfirmBox(index);
          await popover.dismiss();

        },
        isCurrentUser: isActiveUser
      },
      cssClass: 'user-popover'
    });
    await popover.present();
  }


  /** Delete alert box */
  async deleteGroupConfirmBox() {
    const confirm = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('GROUP_DELETE_CONFIRM', this.group.name),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('GROUP_DELETE_CONFIRM_MESSAGE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
          },
          {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const isLeftBtnClicked = await confirm.onDidDismiss();
    if (isLeftBtnClicked == null) {
      return;
    }
    if (!isLeftBtnClicked) {
      this.deleteGroup();
    }
  }

  deleteGroup() {
    const telemetryObject = new TelemetryObject(this.group.gid, ObjectType.GROUP, undefined);

    // Generate Delete group event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_GROUP_INITIATE,
      Environment.USER,
      PageId.GROUP_DETAIL,
      telemetryObject);
    this.groupService.deleteGroup(this.group.gid).subscribe(() => {
      // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));

      this.router.navigate(['../'], { relativeTo: this.route });
    }, (error) => {
    });
  }

  /* delete confirm box for user */
  /** Delete alert box */
  async userDeleteGroupConfirmBox(index) {

    const confirm = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('USER_DELETE_CONFIRM_MESSAGE_FROM_GROUP', this.userList[index].handle),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('USER_DELETE_CONFIRM_SECOND_MESSAGE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm sb-btn-outline-info'
          },
          {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          },
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const isLeftButtonClicked = await confirm.onDidDismiss();
    if (isLeftButtonClicked == null) {
      return;
    }
    if (!isLeftButtonClicked) {
      this.deleteUsersinGroup(index);
    }
  }

  deleteUsersinGroup(index: number) {
    const userListIndex = this.userList.indexOf(this.userList[index]);
    this.userUids.forEach((item) => {
      if (this.userList[index].uid === item) {
        const elementIndex = this.userUids.indexOf(item);
        this.userUids.splice(elementIndex, 1);

      }
    });
    const req: ProfilesToGroupRequest = {
      groupId: this.group.gid,
      uidList: this.userUids
    };

    this.groupService.addProfilesToGroup(req).subscribe(
      () => {
        this.userList.splice(userListIndex, 1);
        this.isNoUsers = (this.userList.length) ? false : true;
      }, error => { });
  }

  getGradeNameFromCode(data: Profile | Group): string {
    if (data.grade && data.grade.length > 0) {
      const gradeName = [];
      data.grade.forEach(code => {
        if (data['gradeValue'] && data['gradeValue'][code]) {
          gradeName.push(data['gradeValue'][code]);
        }
      });

      if (gradeName.length === 0) {
        return data.grade.join(',');
      }

      return gradeName.join(',');
    }

    return '';
  }


  navigateToAddUser() {
    const navigationExtras: NavigationExtras = {
      state: {
        isNewUser: true
      }
    }

    this.router.navigate(['GuestEditProfilePage'], navigationExtras)
  }

  private setAsCurrentUser(selectedUser, isBeingPlayed: boolean) {
    this.groupService.setActiveSessionForGroup(this.group.gid)
      .subscribe(() => {
        this.profileService.setActiveSessionForProfile(selectedUser.uid).toPromise()
          .then(() => {
            if (isBeingPlayed) {
              this.playConfig['selectedUser'] = selectedUser;
              if (selectedUser.profileType === ProfileType.STUDENT) {
                this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise().then();
              } else {
                this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise().then();
              }
              this.event.publish('playConfig', this.playConfig);
              // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));

              this.router.navigate(['../'], { relativeTo: this.route });
            } else {
              if (selectedUser.profileType === ProfileType.STUDENT) {
                //MIGRTION TODO
                // initTabs(this.container, isBeingPlayed ? GUEST_STUDENT_TABS : GUEST_STUDENT_SWITCH_TABS);
                this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise().then();
              } else {
                //MIGRTION TODO
                // initTabs(this.container, isBeingPlayed ? GUEST_TEACHER_TABS : GUEST_TEACHER_SWITCH_TABS);
                this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise().then();
              }

              this.event.publish('refresh:profile');
              this.event.publish(AppGlobalService.USER_INFO_UPDATED);

              //MIGRTION TODO
              // this.app.getRootNav().setRoot(TabsPage);
              this.showToast(this.commonUtilService.translateMessage('SWITCHING_TO', selectedUser.handle))
            }


          }, () => {
          });
      }, () => {
      });
  }

  async showToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
