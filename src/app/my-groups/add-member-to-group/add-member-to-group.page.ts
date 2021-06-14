import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AddMembersRequest,
  CheckUserExistsRequest,
  GroupMember,
  GroupMemberRole,
  GroupService,
  ProfileService,
  SystemSettingsService,
  SharedPreferences,
  CorrelationData
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import {
  AppHeaderService,
  CommonUtilService,
  Environment,
  ID,
  InteractSubtype,
  InteractType,
  PageId,
  TelemetryGeneratorService,
  UtilityService
} from '@app/services';
import { animationShrinkOutTopRight } from '../../animations/animation-shrink-out-top-right';
import { MyGroupsPopoverComponent } from '../../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { animationGrowInFromEvent } from '@app/app/animations/animation-grow-in-from-event';
import { PreferenceKey, GroupErrorCodes } from '@app/app/app.constant';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-add-member-to-group',
  templateUrl: './add-member-to-group.page.html',
  styleUrls: ['./add-member-to-group.page.scss'],
})
export class AddMemberToGroupPage {

  corRelationList: Array<CorrelationData>;
  isUserIdVerified = false;
  showErrorMsg = false;
  headerObservable: any;
  showLoader: boolean;
  username = '';
  groupId: string;
  memberList: GroupMember[] = [];
  userDetails;
  private unregisterBackButton: Subscription;
  appName: string;
  @ViewChild('cap') cap: RecaptchaComponent;
  @ViewChild('addMemberInfoPopupRef') addMemberInfoPopupRef: ElementRef<HTMLSpanElement>;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private sbUtility: UtilityService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.groupId = extras.groupId;
    this.memberList = extras.memberList;
    this.corRelationList = extras.corRelation;
  }

  async getGoogleCaptchaSiteKey(): Promise<{ isCaptchaEnabled: boolean, captchaKey: string }> {
    if (this.commonUtilService.getGoogleCaptchaConfig().size === 0) {
      return this.systemSettingsService.getSystemSettings({ id: 'appGoogleReCaptcha' }).toPromise()
        .then((res) => {
          const captchaConfig = JSON.parse(res.value);
          const isCaptchaEnabled = captchaConfig['isEnabled'] || captchaConfig.get('isEnabled');
          const captchaKey = captchaConfig['key'] || captchaConfig.get('key');
          this.commonUtilService.setGoogleCaptchaConfig(captchaKey, isCaptchaEnabled);
          return { isCaptchaEnabled, captchaKey };
        });
    } else if (Boolean(this.commonUtilService.getGoogleCaptchaConfig())) {
      const captchaConfig = this.commonUtilService.getGoogleCaptchaConfig();
      const isCaptchaEnabled = captchaConfig['isEnabled'] || captchaConfig.get('isEnabled');
      const captchaKey = captchaConfig['key'] || captchaConfig.get('key');
      return { isCaptchaEnabled, captchaKey };
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

  async ionViewDidEnter() {
    try {
      const addMemberInfoScreen = await this.preferences.getBoolean(PreferenceKey.ADD_MEMBER_TO_GROUP_INFO_POPUP).toPromise();
      if (!addMemberInfoScreen) {
        this.addMemberInfoPopupRef.nativeElement.click();
        // this.openInfoPopup();
        this.preferences.putBoolean(PreferenceKey.ADD_MEMBER_TO_GROUP_INFO_POPUP, true).toPromise().then();
      }
    } catch (err) {
    }
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
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ADD_MEMBER,
        Environment.GROUP, isNavBack, undefined, this.corRelationList);
      this.location.back();
    }
  }

  async onVerifyClick() {
    let captchaResponse: string | undefined;
    const { isCaptchaEnabled, captchaKey } = await this.getGoogleCaptchaSiteKey();
    if (isCaptchaEnabled) {
      await this.sbUtility.verifyCaptcha(captchaKey).then((res) => {
        captchaResponse = res;
      }).catch((error) => {
        console.error(error);
      });
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.VERIFY_USER,
      InteractSubtype.VERIFY_CLICKED,
      Environment.GROUP,
      PageId.ADD_MEMBER,
      undefined, undefined, undefined, this.corRelationList, ID.VERIFY_USER);

    if (!this.username) {
      this.showErrorMsg = true;
      return;
    }
    this.showErrorMsg = false;
    const checkUserExistsRequest: CheckUserExistsRequest = {
      matching: {
        key: 'userName',
        value: this.username
      },
      captchaResponseToken: captchaResponse
    };
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.INITIATED,
      '',
      Environment.GROUP,
      PageId.ADD_MEMBER,
      undefined,
      undefined,
      undefined,
      this.corRelationList,
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
            this.corRelationList,
            ID.VERIFY_MEMBER);
        } else {
          this.showErrorMsg = true;
        }
      }).catch(async (e) => {
        console.error(e);
        this.showLoader = false;
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      });
  }

  onClearUser() {
    this.isUserIdVerified = false;
    this.username = '';
  }

  async onAddToGroupClick() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
      return;
    }

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
      PageId.ADD_MEMBER,
      undefined, undefined, undefined, this.corRelationList);

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
      this.corRelationList,
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
        await loader.dismiss();
        if (res.error && res.error.members && res.error.members.length) {
          console.log('in err');
          if (res.error.members[0].errorCode === GroupErrorCodes.EXCEEDED_MEMBER_MAX_LIMIT) {
            this.commonUtilService.showToast('ERROR_MAXIMUM_MEMBER_COUNT_EXCEEDS');
          }
        } else {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.ADD_MEMBER,
            undefined,
            undefined,
            undefined,
            this.corRelationList,
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
