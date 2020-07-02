import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { SbGenericPopoverComponent } from 'app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Component, Inject, NgZone } from '@angular/core';
import {
  AlertController, Events, LoadingController, PopoverController, ToastController, Platform
} from '@ionic/angular';
import {
  AuthService,
  GetAllProfileRequest,
  GroupServiceDeprecated,
  GroupDeprecated,
  ProfilesToGroupRequestDeprecated,
  Profile,
  ProfileService,
  ProfileType,
  SharedPreferences,
  TelemetryObject
} from 'sunbird-sdk';

import { AppGlobalService } from 'services/app-global-service.service';
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
import {
  GUEST_STUDENT_SWITCH_TABS,
  GUEST_STUDENT_TABS,
  GUEST_TEACHER_SWITCH_TABS,
  GUEST_TEACHER_TABS,
  initTabs
} from 'app/module.service';
import { Map } from 'app/telemetryutil';
import { PreferenceKey, RouterLinks } from 'app/app.constant';
import { EditDeletePopoverComponent } from '../edit-delete-popover/edit-delete-popover.component';
import { GroupDetailNavPopover } from '../group-detail-nav-popover/group-detail-nav-popover';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage {
  group: GroupDeprecated;
  currentUserId: string;
  currentGroupId: string;
  userList: Array<Profile> = [];
  selectedUserIndex = -1;
  profileDetails: any;
  userUids = [];
  isNoUsers = true;
  playConfig: any;
  ProfileType = ProfileType;
  isCurrentGroupActive = false;
  backButtonFunc: Subscription;

  constructor(
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private zone: NgZone,
    private popOverCtrl: PopoverController,
    private container: ContainerService,
    private event: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {

    const extrasState = this.router.getCurrentNavigation().extras.state;

    if (extrasState) {
      this.group = extrasState.groupInfo;
      this.currentUserId = extrasState.currentUserId;
      this.currentGroupId = extrasState.currentGroupId;
      this.profileDetails = extrasState.profile;
      this.playConfig = extrasState.playConfig;
      this.isCurrentGroupActive = (this.group.gid === this.currentGroupId);
    }

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
      this.profileService.getAllProfiles(profileRequest).pipe(
        map((profiles) => profiles.filter((profile) => !!profile.handle))
      )
        .toPromise()
        .then((profiles) => {
          this.zone.run(async () => {
            await loader.dismiss();
            if (profiles && profiles.length) {
              this.userList = profiles;
              this.userList.forEach((item) => {
                this.userUids.push(item.uid);
              });
              this.isNoUsers = !this.userList.length;
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

    if (this.appGlobalService.isUserLoggedIn()) {
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
      await confirm.present();
      const { data } = await confirm.onDidDismiss();
      if (data && data.isLeftButtonClicked === null) {
        return;
      }
      if (data && !data.isLeftButtonClicked) {
        this.logOut(selectedUser, false);
      }
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
        goToEditGroup: () => {
          const navigationExtras: NavigationExtras = {
            state: {
              groupInfo: this.group
            }
          };
          this.router.navigate([RouterLinks.CREATE_GROUP], navigationExtras);
          popover.dismiss();
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

          this.router.navigate([RouterLinks.ADD_OR_REMOVE_GROUP_USER], navigationExtras);
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
          this.router.navigate([RouterLinks.ADD_OR_REMOVE_GROUP_USER], navigationExtras);

          await popover.dismiss();
        },
        noUsers: this.userList.length,
        isActiveGroup: this.isCurrentGroupActive
      },
      cssClass: 'user-popover',
      event: myEvent
    });

    await popover.present();
  }

  async presentPopover(myEvent, index: number) {
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
          };
          this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], navigationExtras);
          await popover.dismiss();
        },
        delete: async () => {
          this.userDeleteGroupConfirmBox(index);
          await popover.dismiss();

        },
        isCurrentUser: isActiveUser
      },
      cssClass: 'user-popover',
      event: myEvent
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
    const { data } = await confirm.onDidDismiss();
    if (data && data.isLeftButtonClicked === null) {
      return;
    }
    if (data && !data.isLeftButtonClicked) {
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
      this.location.back();
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
    const { data } = await confirm.onDidDismiss();
    if (data && data.isLeftButtonClicked === null) {
      return;
    }
    if (!data.isLeftButtonClicked) {
      this.removeGroupMember(index);
    }
  }

  removeGroupMember(index: number) {
    const userListIndex = this.userList.indexOf(this.userList[index]);
    this.userUids.forEach((item) => {
      if (this.userList[index].uid === item) {
        const elementIndex = this.userUids.indexOf(item);
        this.userUids.splice(elementIndex, 1);

      }
    });
    const req: ProfilesToGroupRequestDeprecated = {
      groupId: this.group.gid,
      uidList: this.userUids
    };

    this.groupService.addProfilesToGroup(req).subscribe(
      () => {
        this.userList.splice(userListIndex, 1);
        this.isNoUsers = !this.userList.length;
      }, error => { });
  }

  getGradeNameFromCode(data: Profile | GroupDeprecated): string {
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
    };

    this.router.navigate(['GuestEditProfilePage'], navigationExtras);
  }

  private setAsCurrentUser(selectedUser, isBeingPlayed: boolean) {
    this.groupService.setActiveSessionForGroup(this.group.gid)
      .subscribe(() => {
        this.profileService.setActiveSessionForProfile(selectedUser.uid).toPromise()
          .then(() => {
            if (isBeingPlayed) {
              this.playConfig['selectedUser'] = selectedUser;
              this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedUser.profileType).toPromise().then();
              this.event.publish('playConfig', this.playConfig);
              // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));

              this.router.navigate(['../'], { relativeTo: this.route });
            } else {
              if (selectedUser.profileType === ProfileType.STUDENT) {
                initTabs(this.container, isBeingPlayed ? GUEST_STUDENT_TABS : GUEST_STUDENT_SWITCH_TABS);
              } else {
                initTabs(this.container, isBeingPlayed ? GUEST_TEACHER_TABS : GUEST_TEACHER_SWITCH_TABS);
              }
              this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedUser.profileType).toPromise().then();

              this.event.publish('refresh:profile');
              this.event.publish(AppGlobalService.USER_INFO_UPDATED);

              this.router.navigate([RouterLinks.TABS]);
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('SWITCHING_TO', selectedUser.handle));
            }
          }, () => {
          });
      }, () => {
      });
  }

  goBack() {
    this.location.back();
  }
}
