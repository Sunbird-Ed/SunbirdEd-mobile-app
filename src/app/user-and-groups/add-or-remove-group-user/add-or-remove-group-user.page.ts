import { Location } from '@angular/common';
import { Component, Inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import {
  GetAllProfileRequest,
  GroupDeprecated,
  GroupServiceDeprecated,
  ObjectType,
  Profile,
  ProfileService,
  ProfilesToGroupRequestDeprecated,
  ProfileType,
  TelemetryObject,
} from 'sunbird-sdk';

import { AppHeaderService } from 'services/app-header.service';
import { CommonUtilService } from 'services/common-util.service';
import { TelemetryGeneratorService } from 'services/telemetry-generator.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from 'services/telemetry-constants';
import { SbGenericPopoverComponent } from 'app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-add-or-remove-group-user',
  templateUrl: './add-or-remove-group-user.page.html',
  styleUrls: ['./add-or-remove-group-user.page.scss'],
})
export class AddOrRemoveGroupUserPage {
  ProfileType = ProfileType;
  addUsers = true;
  userSelectionMap: Map<string, boolean> = new Map();
  memberSelectionMap: Map<string, boolean> = new Map();
  uniqueUserList: Array<Profile>;
  groupInfo: GroupDeprecated;
  groupMembers: Array<Profile>;
  uid: any;
  allUsers: Array<Profile> = [];
  selectedUids: Array<string> = [];
  selectedUserLength = '';
  selectedGroupMemberLength = '';

  constructor(
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private popoverCtrl: PopoverController,
    private router: Router,
    private location: Location
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.addUsers = Boolean(extrasState.isAddUsers);
      this.groupInfo = extrasState.groupInfo;
      this.groupMembers = extrasState.groupMembers;

      if (this.addUsers) {
        this.headerService.showHeaderWithBackButton([], this.commonUtilService.translateMessage('ADD_USERS_TO_GROUP'));
      } else {
        this.headerService.showHeaderWithBackButton([], this.commonUtilService.translateMessage('REMOVE_USERS_FROM_GROUP'));
      }
    }
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
    this.getAllProfile();
  }

  getAllProfile() {
    const req: GetAllProfileRequest = {
      local: true
    };

    this.profileService.getAllProfiles(req).pipe(
      map((profiles) => profiles.filter((profile) => !!profile.handle))
    )
      .subscribe((profiles) => {
        this.allUsers = profiles;
        const uniqueUserList = this.allUsers.filter(e => {
          const found = this.groupMembers.find(m => {
            return m.uid === e.uid;
          });
          return found === undefined;
        });
        this.zone.run(() => {
          this.uniqueUserList = uniqueUserList;

          if (!this.addUsers) {
            this.groupMembers.forEach((element, index) => {
              this.memberSelectionMap.set(this.groupMembers[index].uid, true);
            });
          }
        });
      }, (error) => {
        console.log('Something went wrong while fetching user list', error);
      });
  }

  toggleSelect(index: number) {
    const value = this.userSelectionMap.get(this.uniqueUserList[index].uid);
    this.userSelectionMap.set(this.uniqueUserList[index].uid, !value);
  }

  toggleMemberSelect(index: number) {
    const value = this.memberSelectionMap.get(this.groupMembers[index].uid);
    this.memberSelectionMap.set(this.groupMembers[index].uid, !value);
  }

  goToEditGroup(index) {
    this.router.navigate(['GuestEditProfilePage']);
  }

  isUserSelected(index: number) {
    this.getSelectedUids();
    return Boolean(this.userSelectionMap.get(this.uniqueUserList[index].uid));
  }

  isGroupMemberSelected(index: number) {
    this.getSelectedGroupMemberUids();
    return Boolean(this.memberSelectionMap.get(this.groupMembers[index].uid));
  }

  selectAll() {
    this.userSelectionMap.clear();
    this.zone.run(() => {
      this.uniqueUserList.forEach((element, index) => {
        this.userSelectionMap.set(this.uniqueUserList[index].uid, true);
      });
    });
  }

  unselectAll() {
    this.zone.run(() => {
      this.memberSelectionMap.clear();
      this.groupMembers.forEach((element, index) => {
        this.memberSelectionMap.set(this.groupMembers[index].uid, false);
      });
    });
  }

  remove() {
    this.groupMembers.forEach((item) => {
      if (!Boolean(this.memberSelectionMap.get(item.uid))) {
        this.selectedUids.push(item.uid);
      }
    });

    this.deleteUsersFromGroupConfirmBox(this.selectedGroupMemberLength);
  }

  getSelectedUids() {
    const selectedUids: Array<string> = [];
    this.uniqueUserList.forEach((item) => {
      if (Boolean(this.userSelectionMap.get(item.uid))) {
        selectedUids.push(item.uid);
      }
    });

    this.zone.run(() => {
      this.selectedUserLength = (selectedUids.length) ? selectedUids.length.toString() : '';
    });
    return selectedUids;
  }

  getSelectedGroupMemberUids() {
    const selectedUids: Array<string> = [];
    this.groupMembers.forEach((item) => {
      if (Boolean(this.memberSelectionMap.get(item.uid))) {
        selectedUids.push(item.uid);
      }
    });

    this.zone.run(() => {
      this.selectedGroupMemberLength = (selectedUids.length) ? selectedUids.length.toString() : '';
    });
  }

  async add() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const groupMembersUids: Array<string> = [];

    this.groupMembers.forEach(element => {
      groupMembersUids.push(element.uid);
    });


    const req: ProfilesToGroupRequestDeprecated = {
      groupId: this.groupInfo.gid,
      uidList: groupMembersUids.concat(this.getSelectedUids())
    };
    this.groupService.addProfilesToGroup(req)
      .subscribe(async (success) => {
        console.log(success);
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_MEMBER_ADD_SUCCESS'));
        this.location.back();
      },
        async (error) => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
          console.log('Error : ' + error);
          loader.dismiss();
        });
  }

  async deleteUsersFromGroupConfirmBox(length) {
    const confirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      translucent: true,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('REMOVE_MULTIPLE_USERS_FROM_GROUP', length),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('USER_DELETE_CONFIRM_SECOND_MESSAGE'),
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
      cssClass: 'sb-popover'
    });

    await confirm.present();
    const { data } = await confirm.onDidDismiss();

    if (data && data.leftBtnClicked === null) {
      return;
    } else if (data && !data.leftBtnClicked) {
      this.deleteUsersFromGroup();
    }
  }

  async deleteUsersFromGroup() {
    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(this.groupInfo.gid, ObjectType.GROUP, undefined);

    const valuesMap = new Map();
    valuesMap['UIDS'] = this.selectedUids;

    // Generate Delete users from group event
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.DELETE_USER_INITIATE,
      Environment.USER,
      PageId.REMOVE_USERS_FROM_GROUP,
      telemetryObject,
      valuesMap
    );
    const loader = await this.commonUtilService.getLoader();
    const req: ProfilesToGroupRequestDeprecated = {
      groupId: this.groupInfo.gid,
      uidList: this.selectedUids
    };

    this.groupService.addProfilesToGroup(req)
      .subscribe(async (success) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_MEMBER_DELETE_SUCCESS'));
        this.location.back();
      }, async (error) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
        console.error('Error : ' + error);
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
}
