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
    // private loadingCtrl: LoadingController,
    private commonUtilService: CommonUtilService,
    // private alertCtrl: AlertController,
    // private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // this.addUsers = Boolean(this.navParams.get('isAddUsers'));
    // this.groupInfo = this.navParams.get('groupInfo');
    // this.groupMembers = this.navParams.get('groupMembers');

    this.addUsers = Boolean(this.route.snapshot.paramMap.get('isAddUsers'));
    this.route.queryParams.subscribe((data) => {
      this.groupInfo = data.group;
    })
    // this.groupMembers = this.navParams.get('groupMembers');
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
    // this.navCtrl.push(GuestEditProfilePage, {});
  }
}
