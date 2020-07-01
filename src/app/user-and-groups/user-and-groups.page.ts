import { RouterLinks } from './../app.constant';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Platform, PopoverController, Events } from '@ionic/angular';
import { Location } from '@angular/common';
import {
  AuthService,
  GetAllProfileRequest,
  GroupServiceDeprecated,
  GroupDeprecated,
  Profile,
  ProfileService,
  ProfileType,
  SharedPreferences,
  TelemetryObject
} from 'sunbird-sdk';
import { AppGlobalService, CommonUtilService } from '../../services';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Map } from '../telemetryutil';
import { PreferenceKey } from '../app.constant';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
} from '../../services/telemetry-constants';
import { AppHeaderService, ContainerService } from '../../services';
import { Router, NavigationExtras } from '@angular/router';
import { EditDeletePopoverComponent } from './edit-delete-popover/edit-delete-popover.component';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { initTabs, GUEST_STUDENT_TABS, GUEST_STUDENT_SWITCH_TABS, GUEST_TEACHER_TABS, GUEST_TEACHER_SWITCH_TABS } from '../module.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-user-and-groups',
  templateUrl: './user-and-groups.page.html',
  styleUrls: ['./user-and-groups.page.scss'],


})
export class UserAndGroupsPage implements OnInit {
  segmentType = 'users';
  groupName: string;
  showEmptyGroupsMessage = true;
  currentUserId: string;
  currentGroupId: string;
  playConfig: any;

  userList: Array<Profile> = [];
  groupList: Array<GroupDeprecated> = [];

  profileDetails: Profile;
  loadingUserList = false;

  userType: string;
  noUsersPresent = false;
  selectedUserIndex = -1;
  lastCreatedProfileData: any;

  selectedUsername: string;
  isCurUserSelected: boolean;
  ProfileType = ProfileType;
  isLoggedIn = false;
  headerObservable: Subscription;
  backButtonFunc: Subscription;

  constructor(
    private zone: NgZone,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private platform: Platform,
    private appGlobalService: AppGlobalService,
    private container: ContainerService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService,
    private popOverCtrl: PopoverController,
    private router: Router,
    private event: Events,
    private location: Location
  ) {
    /* Check userList length and show message or list accordingly */

    // TODO
    this.currentUserId = this.router.getCurrentNavigation().extras.state.userId;
    this.playConfig = this.router.getCurrentNavigation().extras.state.playConfig;
    if (!this.currentUserId && this.appGlobalService.getCurrentUser()) {
      this.currentUserId = this.appGlobalService.getCurrentUser().uid;
    }

    if (this.appGlobalService.isUserLoggedIn()) {
      this.profileDetails = this.appGlobalService.getCurrentUser();
    }
  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.USERS_GROUPS,
      Environment.USER
    );
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.zone.run(() => {
      this.getAllProfile();
      this.getAllGroup();
      this.getCurrentGroup();
      // this.getLastCreatedProfile();

      this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
        this.dismissPopup();
        this.backButtonFunc.unsubscribe();
      });
    });

    if (this.userList) {
      this.noUsersPresent = false;
      this.loadingUserList = true;
    }
  }

  getCurrentGroup() {
    this.groupService.getActiveSessionGroup().subscribe((val: GroupDeprecated) => {
      const group = val;
      if (group) {
        this.zone.run(() => {
          this.currentGroupId = group.gid;
        });
      }
    }, () => { });
  }

  async dismissPopup() {
    const activePortal = await this.popOverCtrl.getTop();
    if (activePortal) {
      activePortal.dismiss();
    } else {
      this.location.back();
    }
  }

  async presentPopover(myEvent, index, isUser) {
    let isCurrentUser = isUser ? this.currentUserId === this.userList[index].uid : this.currentGroupId === this.groupList[index].gid;
    const popover = await this.popOverCtrl.create({
      component: EditDeletePopoverComponent,
      componentProps: {
        edit: async () => {
          if (isUser) {
            this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], {
              state: {
                profile: this.userList[index],
                isCurrentUser
              }
            });
          } else {
            this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.CREATE_GROUP}`], {
              state: {
                groupInfo: this.groupList[index]
              }
            });
          }
          await popover.dismiss();
        },
        delete: async () => {
          if (isUser) {
            this.deleteUserConfirmBox(index);
          } else {
            this.deleteGroupConfirmBox(index);
          }
          await popover.dismiss();
        },
        isCurrentUser
      },
      cssClass: 'user-popover',
      event: myEvent
    }
    );
    await popover.present();
  }

  async getAllProfile() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();

    const profileRequest: GetAllProfileRequest = {
      local: true
    };
    this.loadingUserList = true;
    setTimeout(() => {
      this.zone.run(() => {
        this.profileService.getAllProfiles(profileRequest).pipe(
          map((profiles) => profiles.filter((profile) => !!profile.handle))
        ).subscribe(async (profiles) => {
          const profileList: Array<Profile> = profiles;
          if (profileList && profileList.length) {
            this.userList = [...profileList].sort((prev: Profile, next: Profile) => {
              if (prev.uid === this.currentUserId) {
                return -1;
              }

              if (next.uid === this.currentUserId) {
                return 1;
              }

              if (prev.handle < next.handle) {
                return -1;
              }
              if (prev.handle > next.handle) {
                return 1;
              }
              return 0;
            });
            this.noUsersPresent = false;
            this.loadingUserList = false;
          } else {
            this.noUsersPresent = true;
            this.loadingUserList = false;
          }

          await loader.dismiss();

        }, async () => {
          await loader.dismiss();
          this.noUsersPresent = true;
          this.loadingUserList = false;
        });
      });
    }, 1000);
  }

  getAllGroup() {
    this.zone.run(() => {
      this.groupService.getAllGroups().subscribe((groups: GroupDeprecated[]) => {
        if (groups && groups.length) {
          this.showEmptyGroupsMessage = false;
          this.groupList = [...groups].sort((prev: GroupDeprecated, next: GroupDeprecated) => {
            if (prev.gid === this.currentGroupId) {
              return -1;
            }

            if (next.gid === this.currentGroupId) {
              return 1;
            }

            if (prev.name < next.name) {
              return -1;
            }
            if (prev.name > next.name) {
              return 1;
            }
            return 0;
          });
        } else {
          this.showEmptyGroupsMessage = true;
        }
      }, () => {
      });
    });
  }

  /* Navigates to group details page */
  goToGroupDetail(index) {
    const navigationExtras: NavigationExtras = {
      state: {
        groupInfo: this.groupList[index],
        currentUserId: this.currentUserId,
        currentGroupId: this.currentGroupId,
        profile: this.profileDetails,
        playConfig: this.playConfig
      }
    };

    this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.GROUP_DETAILS}`], navigationExtras);
  }

  /**
   * Navigates to Create group Page
   */
  createGroup() {
    // Generate create group click event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CREATE_GROUP_CLICKED,
      Environment.USER,
      PageId.USERS_GROUPS
    );
    this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.CREATE_GROUP}`]);
  }


  goToSharePage() {
    const navigationExtras: NavigationExtras = {
      state: {
        isNewUser: true
      }
    };
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SHARE_CLICKED,
      Environment.USER,
      PageId.USERS_GROUPS
    );
    this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.SHARE_USER_AND_GROUPS}`], navigationExtras);
  }

  /**
   * Navigates to group Details page
   */
  gotToGroupDetailsPage() {
    const navigationExtras: NavigationExtras = {
      state: {
        item: this.groupList
      }
    };

    this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.GROUP_DETAILS}`], navigationExtras);
  }

  /**
   * Navigates to Create User Page
   */
  createUser() {
    this.getLastCreatedProfile().then(() => {
      // Generate create user click event
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CREATE_USER_CLICKED,
        Environment.USER,
        PageId.USERS_GROUPS
      );

      const navigationExtras: NavigationExtras = {
        state: {
          isNewUser: true,
          lastCreatedProfile: this.lastCreatedProfileData
        }
      };
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], navigationExtras);
    }).catch((error) => {
      const navigationExtras: NavigationExtras = {
        state: {
          isNewUser: true
        }
      };
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], navigationExtras);

    });
  }

  selectUser(index: number, uid?: string, name?: string) {
    this.isCurUserSelected = this.appGlobalService.getCurrentUser().uid === uid;
    this.isLoggedIn = (this.currentUserId === uid);
    this.zone.run(() => {
      this.selectedUserIndex = (this.selectedUserIndex === index) ? -1 : index;
    });
    this.selectedUsername = name;
    const values = new Map();
    values.uid = this.currentUserId;
    values.userName = this.selectedUsername;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.USER_CLICKED,
      Environment.USER,
      PageId.USERS_GROUPS,
      undefined,
      values
    );
  }

  onSegmentChange(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      event.detail.value === 'groups' ? InteractSubtype.GROUP_CLICKED : InteractSubtype.USER_CLICKED,
      Environment.USER,
      PageId.USERS_GROUPS
    );
    this.zone.run(() => {
      this.selectedUserIndex = -1;
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      event.detail.value,
      Environment.USER
    );
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
      PageId.USERS_GROUPS
    );

    const selectedUser = this.userList[this.selectedUserIndex];

    const valuesMap = new Map();
    const fromUser = new Map();
    fromUser.uid = this.currentUserId;
    fromUser.type = this.appGlobalService.isUserLoggedIn() ? 'signedin' : 'guest';

    const toUser = new Map();
    toUser.uid = selectedUser.uid;
    toUser.type = 'guest';

    valuesMap.from = fromUser;
    valuesMap.to = toUser;

    const telemetryObject = new TelemetryObject(selectedUser.uid, ObjectType.USER, undefined);

    // Generate Switch user initiate interact event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SWITCH_USER_INITIATE,
      Environment.USER,
      PageId.USERS_GROUPS,
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
          }, {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover',
    });

    if (this.appGlobalService.isUserLoggedIn()) {
      await confirm.present();
    } else {
      this.setAsCurrentUser(selectedUser, false);
    }

    await confirm.onDidDismiss().then(response => {
      if (response.data.isLeftButtonClicked == null) {
        return;
      }
      if (!response.data.isLeftButtonClicked) {
        this.logOut(selectedUser, false);
      }
    });

    // Generate Switch user success event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.SWITCH_USER_SUCCESS,
      Environment.USER,
      PageId.USERS_GROUPS,
      telemetryObject,
      valuesMap
    );
  }

  // method below fetches the last created user
  getLastCreatedProfile() {
    return new Promise((resolve, reject) => {
      this.profileService.getAllProfiles().pipe(
        map((profiles) => (profiles.sort((p1, p2) => p2.createdAt - p1.createdAt))[0])
      )
        .toPromise().then((lastCreatedProfile: any) => {
          this.lastCreatedProfileData = lastCreatedProfile;
          resolve(lastCreatedProfile);
        }).catch(() => {
          reject(null);
        });
    });
  }

  logOut(selectedUser: any, isBeingPlayed: boolean) {
    const telemetryObject = new TelemetryObject(this.profileDetails.uid, Environment.USER, undefined);

    // Generate Logout success event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOGOUT_INITIATE,
      Environment.USER,
      PageId.USERS_GROUPS,
      telemetryObject
    );
    if (isBeingPlayed) {
      this.setAsCurrentUser(selectedUser, true);
    } else {
      if (this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.authService.resignSession().subscribe(() => {
          (window as any).splashscreen.clearPrefs();
          this.setAsCurrentUser(selectedUser, false);
        }, () => {
        });
      } else {
        this.authService.resignSession().subscribe();
        (window as any).splashscreen.clearPrefs();
        this.setAsCurrentUser(selectedUser, false);
      }
    }

    // Generate Logout success event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.LOGOUT_SUCCESS,
      Environment.USER,
      PageId.USERS_GROUPS,
      telemetryObject
    );

  }

  /* condition for disabling the play button */
  disablePlayButton() {
    return this.selectedUserIndex === -1 && !this.userList.length;
  }

  /** Delete alert box */
  async deleteGroupConfirmBox(index) {
    const confirm = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('GROUP_DELETE_CONFIRM', this.groupList[index].name),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('GROUP_DELETE_CONFIRM_MESSAGE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
          }, {
            btntext: this.commonUtilService.translateMessage('YES'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    await confirm.onDidDismiss().then(response => {
      if (response.data.isLeftButtonClicked == null) {
        return;
      }
      if (!response.data.isLeftButtonClicked) {
        this.deleteGroup(index);
      }
    });
  }

  /* Navigates to play content details page nd launch the player */
  play() {
    const selectedUser = this.userList[this.selectedUserIndex];
    if (this.appGlobalService.isUserLoggedIn()) {
      this.logOut(selectedUser, true);
    } else {
      this.setAsCurrentUser(selectedUser, true);
    }

  }

  deleteGroup(index: number) {

    const gid = this.groupList[index].gid;
    const telemetryObject = new TelemetryObject(gid, ObjectType.GROUP, undefined);

    // Generate Delete user event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_GROUP_INITIATE,
      Environment.USER,
      PageId.GROUPS,
      telemetryObject
    );
    this.groupService.deleteGroup(gid).subscribe(() => {
      this.groupList.splice(index, 1);
      this.getAllGroup();
    }, () => {
    });
  }

  /** Delete alert box */
  async deleteUserConfirmBox(index) {
    const confirm = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('USER_DELETE_CONFIRM', this.userList[index].handle),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('USER_DELETE_CONFIRM_MESSAGE'),
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
    await confirm.onDidDismiss().then(response => {
      if (response.data.isLeftButtonClicked == null) {
        return;
      }
      if (!response.data.isLeftButtonClicked) {
        this.deleteUser(index);
      }
    });
  }

  deleteUser(index: number) {
    const uid = this.userList[index].uid;

    const telemetryObject = new TelemetryObject(uid, ObjectType.USER, undefined);

    // Generate Delete user event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_USER_INITIATE,
      Environment.USER,
      PageId.USERS_GROUPS,
      telemetryObject
    );
    this.profileService.deleteProfile(uid)
      .subscribe(() => {
        this.userList.splice(index, 1);
        if (this.userList.length === 0) {
          this.noUsersPresent = true;
        }
      }, () => {
      });
  }

  getGradeNameFromCode(data: Profile | GroupDeprecated): string {
    if (data.grade && data.grade.length > 0) {
      const gradeName = [];
      data.grade.forEach(code => {
        if (data.gradeValue && data.gradeValue[code]) {
          gradeName.push(data.gradeValue[code]);
        }
      });

      if (gradeName.length === 0) {
        return data.grade.join(',');
      }

      return gradeName.join(',');
    }

    return '';
  }

  private setAsCurrentUser(selectedUser, isBeingPlayed: boolean) {
    this.groupService.removeActiveGroupSession()
      .subscribe(() => {
      }, () => { });
    this.profileService.setActiveSessionForProfile(selectedUser.uid).subscribe(() => {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('SWITCHING_TO', selectedUser.handle),
        undefined, undefined, 1000);
      setTimeout(() => {
        if (isBeingPlayed) {
          this.playConfig.selectedUser = selectedUser;
          this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedUser.profileType).toPromise().then();
          this.event.publish('playConfig', this.playConfig);
          this.location.back();

        } else {
          if (selectedUser.profileType === ProfileType.STUDENT) {
            initTabs(this.container, isBeingPlayed ? GUEST_STUDENT_TABS : GUEST_STUDENT_SWITCH_TABS);
            this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedUser.profileType).toPromise().then();
          } else {
            initTabs(this.container, isBeingPlayed ? GUEST_TEACHER_TABS : GUEST_TEACHER_SWITCH_TABS);
            this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedUser.profileType).toPromise().then();
          }
          this.event.publish('refresh:profile');
          this.event.publish(AppGlobalService.USER_INFO_UPDATED);

          this.router.navigate([`/${RouterLinks.TABS}`]);

        }
      }, 1000);
    }, () => {
    });
  }

  ionViewWillLeave(): void {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'share': this.goToSharePage();
        break;
    }
  }

  goBack() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(
      PageId.USERS_GROUPS, Environment.USER, true,
    );
    this.location.back();
  }
}
