import { Component, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ServerProfileDetailsRequest,
  ProfileService,
  GroupService,
  AddMembersRequest,
  GroupMemberRole
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileConstants } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';
import {
  AppHeaderService,
  CommonUtilService,
  Environment, ID,
  InteractSubtype,
  InteractType,
  PageId,
  TelemetryGeneratorService
} from '@app/services';
import { PopoverController } from '@ionic/angular';
import { animationGrowInTopRight } from '../../animations/animation-grow-in-top-right';
import { animationShrinkOutTopRight } from '../../animations/animation-shrink-out-top-right';
import { MyGroupsPopoverComponent } from '../../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';

@Component({
  selector: 'app-add-member-to-group',
  templateUrl: './add-member-to-group.page.html',
  styleUrls: ['./add-member-to-group.page.scss'],
})
export class AddMemberToGroupPage {
  userId = '';
  isUserIdVerified = false;
  showErrorMsg = false;
  headerObservable: any;
  userName = 'Rahul';
  groupId: string;
  userDetails;
  private unregisterBackButton: Subscription;
  appName: string;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.groupId = extras.groupId;
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    if (this.isUserIdVerified) {
      this.isUserIdVerified = false;
    } else {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ADD_MEMBER, Environment.GROUP, isNavBack);
      this.location.back();
    }
  }

  async onVerifyClick() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.VERIFY_CLICKED,
        Environment.GROUP,
        PageId.ADD_MEMBER);
    if (!this.userId) {
      this.showErrorMsg = true;
      return;
    }
    this.showErrorMsg = false;
    const req: ServerProfileDetailsRequest = {
      userId: 'da4e72df-0371-45be-9df4-a7c7762d3d7f',
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    };
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.INITIATED,
        '',
        Environment.GROUP,
        PageId.ADD_MEMBER,
        undefined,
        undefined,
        undefined,
        undefined,
        ID.VERIFY_MEMBER);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.profileService.getServerProfilesDetails(req).toPromise()
      .then(async (serverProfile) => {
        await loader.dismiss();
        if (serverProfile) {
          this.userDetails = serverProfile;
          this.userName = serverProfile.firstName ? serverProfile.firstName : '';
          this.userName += serverProfile.lastName ? serverProfile.lastName : '';
          this.isUserIdVerified = true;
          this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.SUCCESS,
              '',
              Environment.GROUP,
              PageId.ADD_MEMBER,
              undefined,
              undefined,
              undefined,
              undefined,
              ID.VERIFY_MEMBER);
          console.log('this.userName', this.userName);
        }
      }).catch(async () => {
        await loader.dismiss();
      });
  }

  onClearUser() {
    this.isUserIdVerified = false;
    this.userId = '';
  }

  async onAddToGroupClick() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.ADD_MEMBER_TO_GROUP_CLICKED,
        Environment.GROUP,
        PageId.ADD_MEMBER);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.INITIATED,
        '',
        Environment.GROUP,
        PageId.ADD_MEMBER,
        undefined,
        undefined,
        undefined,
        undefined,
        ID.ADD_MEMBER_TO_GROUP);
    const addMemberToGroupReq: AddMembersRequest = {
      groupId: this.groupId,
      addMembersRequest: {
        members: [{
          userId: this.userDetails.userId,
          role: GroupMemberRole.MEMBER
        }]
      }
    };
    this.groupService.addMembers(addMemberToGroupReq).toPromise()
      .then(async (res) => {
        if (res.error && res.error.members && res.error.members.length) {
          throw res.error.members[0];
        } else {
          await loader.dismiss();
          this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.SUCCESS,
              '',
              Environment.GROUP,
              PageId.ADD_MEMBER,
              undefined,
              undefined,
              undefined,
              undefined,
              ID.ADD_MEMBER_TO_GROUP);
          this.commonUtilService.showToast('MEMBER_ADDED_TO_GROUP');
          this.location.back();
        }
      }).catch(async (e) => {
        console.error(e);
        await loader.dismiss();
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      });
  }

  async openinfopopup() {
    const popover = await this.popoverCtrl.create({
      component: MyGroupsPopoverComponent,
      componentProps: {
        isFromAddMember: true
      },
      enterAnimation: animationGrowInTopRight,
      leaveAnimation: animationShrinkOutTopRight,
      backdropDismiss: false,
      showBackdrop: true,
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
