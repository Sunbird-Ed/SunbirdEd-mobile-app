import {Component, Inject, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  AddMembersRequest,
  CheckUserExistsRequest,
  GroupMember,
  GroupMemberRole,
  GroupService,
  ProfileService,
  SystemSettingsService
} from 'sunbird-sdk';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {Platform, PopoverController} from '@ionic/angular';
import {
  AppHeaderService,
  CommonUtilService,
  Environment,
  ID,
  InteractSubtype,
  InteractType,
  PageId,
  TelemetryGeneratorService
} from '@app/services';
import {animationShrinkOutTopRight} from '../../animations/animation-shrink-out-top-right';
import {MyGroupsPopoverComponent} from '../../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import {animationGrowInFromEvent} from '@app/app/animations/animation-grow-in-from-event';

@Component({
  selector: 'app-add-member-to-group',
  templateUrl: './add-member-to-group.page.html',
  styleUrls: ['./add-member-to-group.page.scss'],
})
export class AddMemberToGroupPage {
  captchaResponse: string;
  isUserIdVerified = false;
  showErrorMsg = false;
  headerObservable: any;
  isCaptchaEnabled: boolean;
  showLoader: boolean;
  username = '';
  groupId: string;
  sunbirdGoogleCaptchaKey;
  memberList: GroupMember[] = [];
  userDetails;
  private unregisterBackButton: Subscription;
  appName: string;
  @ViewChild('cap') cap;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
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
    this.memberList = extras.memberList;
    this.getGoogleCaptchaSiteKey();
  }

  getGoogleCaptchaSiteKey() {
    if (this.commonUtilService.getGoogleCaptchaConfig().size === 0) {
      this.systemSettingsService.getSystemSettings({ id: 'googleReCaptcha' }).toPromise()
        .then((res) => {
          const captchaConfig = JSON.parse(res.value);
          this.isCaptchaEnabled =  captchaConfig['isEnabled'] || captchaConfig.get('isEnabled');
          this.sunbirdGoogleCaptchaKey = captchaConfig['key'] || captchaConfig.get('key');
          this.commonUtilService.setGoogleCaptchaConfig(this.sunbirdGoogleCaptchaKey, this.isCaptchaEnabled);
        });
    } else if (Boolean(this.commonUtilService.getGoogleCaptchaConfig())) {
      const captchaConfig = this.commonUtilService.getGoogleCaptchaConfig();
      this.isCaptchaEnabled = captchaConfig['isEnabled'] || captchaConfig.get('isEnabled');
      this.sunbirdGoogleCaptchaKey = captchaConfig['key'] || captchaConfig.get('key');
    }
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

  async captchaResolved(res) {
      this.captchaResponse = res;
  }

  async onVerifyClick() {
    if (this.isCaptchaEnabled) {
      this.cap.execute();
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VERIFY_CLICKED,
      Environment.GROUP,
      PageId.ADD_MEMBER);
    if (!this.username) {
      this.showErrorMsg = true;
      return;
    }
    if (this.isCaptchaEnabled) {
      if (!this.captchaResponse) {
        return false;
      }
    }
    this.showErrorMsg = false;
    const checkUserExistsRequest: CheckUserExistsRequest = {
      matching: {
        key: 'userName',
        value: this.username
      },
      captchaResponseToken: this.captchaResponse || undefined
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
    this.showLoader = true;
    this.profileService.checkServerProfileExists(checkUserExistsRequest).toPromise()
      .then(async (checkUserExistsResponse) => {
        this.showLoader = false;
        if (checkUserExistsResponse && checkUserExistsResponse.exists) {
          this.userDetails = checkUserExistsResponse;
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
        } else {
          this.showErrorMsg = true;
        }
      }).catch(async (e) => {
        console.error(e);
        this.showLoader = false;
      });
  }

  onClearUser() {
    this.isUserIdVerified = false;
    this.username = '';
  }

  async onAddToGroupClick() {
    const userExist = this.memberList.find(m => m.userId === this.userDetails.id);
    // Check if user already exist in group
    if (userExist) {
      this.commonUtilService.showToast('MEMBER_ALREADY_EXISTS_IN_GROUP');
      return;
    }

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
          userId: this.userDetails.id,
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
        console.log(e);
        await loader.dismiss();
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      });
  }

  async openInfoPopup(event: MouseEvent) {
    const popover = await this.popoverCtrl.create({
      component: MyGroupsPopoverComponent,
      componentProps: {
        isFromAddMember: true
      },
      enterAnimation: animationGrowInFromEvent(event),
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
