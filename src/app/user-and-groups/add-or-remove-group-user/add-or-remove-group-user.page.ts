import { Component, Inject, NgZone, OnInit } from '@angular/core';
// import { AlertController, IonicPage, LoadingController, NavController, NavParams, PopoverController } from 'ionic-angular';
import {
  GetAllProfileRequest,
  Group,
  GroupService,
  ObjectType,
  Profile,
  ProfileService,
  ProfilesToGroupRequest,
  ProfileType,
  TelemetryObject,
} from 'sunbird-sdk';
// import { GuestEditProfilePage } from '../../profile/guest-edit.profile/guest-edit.profile';
// import { TelemetryGeneratorService } from '../../../service/telemetry-generator.service';
import { AppHeaderService, CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { SbGenericPopoverComponent } from 'src/app/components/popups/sb-generic-popover/sb-generic-popover.component';
// import { SbGenericPopoverComponent } from '@a  pp/component/popups/sb-generic-popup/sb-generic-popover';


@Component({
  selector: 'app-add-or-remove-group-user',
  templateUrl: './add-or-remove-group-user.page.html',
  styleUrls: ['./add-or-remove-group-user.page.scss'],
})
export class AddOrRemoveGroupUserPage implements OnInit {

  ProfileType = ProfileType;
  addUsers = true;
  userSelectionMap: Map<string, boolean> = new Map();
  memberSelectionMap: Map<string, boolean> = new Map();
  uniqueUserList: Array<Profile>;
  groupInfo: Group;
  groupMembers: Array<Profile>;
  uid: any;
  allUsers: Array<Profile> = [];
  selectedUids: Array<string> = [];

  selectedUserLength = '';
  selectedGroupMemberLength = '';
  constructor(
    @Inject('GROUP_SERVICE') private groupService: GroupService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.addUsers = Boolean(this.router.getCurrentNavigation().extras.state.isAddUsers);
    this.groupInfo = this.router.getCurrentNavigation().extras.state.groupInfo;
    this.groupMembers = this.router.getCurrentNavigation().extras.state.groupMembers;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
    this.getAllProfile();
  }

  getAllProfile() {
    const req: GetAllProfileRequest = {
      local: true
    };

    this.profileService.getAllProfiles(req)
      .map((profiles) => profiles.filter((profile) => !!profile.handle))
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
    let value = this.userSelectionMap.get(this.uniqueUserList[index].uid);
    if (value) {
      value = false;
    } else {
      value = true;
    }
    this.userSelectionMap.set(this.uniqueUserList[index].uid, value);
  }

  toggleMemberSelect(index: number) {
    let value = this.memberSelectionMap.get(this.groupMembers[index].uid);
    if (value) {
      value = false;
    } else {
      value = true;
    }
    this.memberSelectionMap.set(this.groupMembers[index].uid, value);
  }

  goToEditGroup(index) {
    this.router.navigate(['GuestEditProfilePage']);
  }

  isUserSelected(index: number) {
    console.log('Index', index);
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
    // this.getSelectedUids();
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

    console.log('selectedUids', selectedUids.length);
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

    console.log('selectedUids', selectedUids.length);
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


    const req: ProfilesToGroupRequest = {
      groupId: this.groupInfo.gid,
      uidList: groupMembersUids.concat(this.getSelectedUids())
    };
    this.groupService.addProfilesToGroup(req)
      .subscribe(async (success) => {
        console.log(success);
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_MEMBER_ADD_SUCCESS'));
        // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));
        this.router.navigate(['../'], { relativeTo: this.route });
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
    const leftBtnClicked = await confirm.onDidDismiss();

    if (leftBtnClicked == null) {
      return;
    }
    if (!leftBtnClicked) {
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
    const req: ProfilesToGroupRequest = {
      groupId: this.groupInfo.gid,
      uidList: this.selectedUids
    };

    this.groupService.addProfilesToGroup(req)
      .subscribe(async (success) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_MEMBER_DELETE_SUCCESS'));
        // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));
        this.router.navigate(['../'], { relativeTo: this.route });
      }, async (error) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
        console.error('Error : ' + error);
      });
  }

  getGradeNameFromCode(data: Profile | Group): string {
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
