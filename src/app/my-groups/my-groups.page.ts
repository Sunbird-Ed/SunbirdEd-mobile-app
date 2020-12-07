import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AppHeaderService } from '@app/services/app-header.service';
import {
  RouterLinks, PreferenceKey,
  SystemSettingsIds, ProfileConstants
} from '../app.constant';
import {
  AuthService, SharedPreferences, GroupService, Group,
  GroupSearchCriteria, CachedItemRequestSourceFrom, SortOrder,
  ObjectType, TelemetryObject, UpdateMembersRequest, GroupUpdateMembersResponse, SystemSettingsService, GetSystemSettingsRequest, SystemSettings, ProfileService, ServerProfileDetailsRequest, CorrelationData, AcceptTermsConditionRequest
} from '@project-sunbird/sunbird-sdk';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
  CommonUtilService,
  AppGlobalService,
  TelemetryGeneratorService,
  ImpressionType,
  PageId,
  Environment, InteractType, InteractSubtype, ID, CorReleationDataType
} from '@app/services';
import { Platform, PopoverController } from '@ionic/angular';
import { MyGroupsPopoverComponent } from '../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { animationGrowInTopRight } from '../animations/animation-grow-in-top-right';
import { animationShrinkOutTopRight } from '../animations/animation-shrink-out-top-right';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { GroupGuideLinesPopoverComponent } from '../components/popups/group-guidelines-popup/group-guidelines-popup.component';
import { CsGroupUpdateGroupGuidelinesRequest } from '@project-sunbird/client-services/services/group/interface';

interface GroupData extends Group {
  initial: string;
}
@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.page.html',
  styleUrls: ['./my-groups.page.scss'],
})
export class MyGroupsPage implements OnInit, OnDestroy {
  isGuestUser: boolean;
  groupList: GroupData[] = [];
  themeColors: string[] = ['#FFDFC7', '#C2ECE6', '#FFE59B', '#DAD4FF', '#80CBC4', '#E6EE9C', '#FFE082'];
  fontColor: string[] = ['#AD632D', '#149D88', '#8D6A00', '#635CDC', '#00695C', '#9E9D24', '#FF8F00'];
  groupListLoader = false;
  headerObservable: any;
  userId: string;
  unregisterBackButton: Subscription;
  fromRegistrationFlow = false;
  groupTncVersion: string;
  isGroupTncAcceptenceChecked: boolean;
  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private sbProgressLoader: SbProgressLoader,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private location: Location
  ) {
    if (this.router.getCurrentNavigation()) {
      const extras = this.router.getCurrentNavigation().extras.state;
      if (extras) {
        this.fromRegistrationFlow = extras.fromRegistrationFlow;
      }
    }
  }

  async ngOnInit() {
    this.isGroupTncAcceptenceChecked = false;
  }

  private checkUserLoggedIn() {
    this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
  }

  async ionViewWillEnter() {
    this.checkUserLoggedIn();
    if (!this.isGuestUser) {
      this.groupListLoader = true;
    }
    this.handleBackButton();
    this.headerService.showHeaderWithBackButton(['groupInfo']);
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    try {
      this.userId = await this.appGlobalService.getActiveProfileUid();
      const groupInfoScreen = await this.preferences.getBoolean(PreferenceKey.CREATE_GROUP_INFO_POPUP).toPromise();
      if (!groupInfoScreen) {
        this.openinfopopup();
        this.preferences.putBoolean(PreferenceKey.CREATE_GROUP_INFO_POPUP, true).toPromise().then();
      }
    } catch (err) {
    }
    if (!this.isGuestUser) {
      this.fetchGroupList();
    }
  }

  async ionViewDidEnter() {
    this.sbProgressLoader.hide({ id: 'login' });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.MY_GROUP,
      Environment.GROUP
    );
  }

  ionViewWillLeave() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'groupInfo':
          this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.INFORMATION_ICON_CLICKED)
        this.openinfopopup();
        break;
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.MY_GROUP, Environment.GROUP, true);
        this.goback();
        break;
    }
  }

  private handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.MY_GROUP,
        Environment.GROUP,
        false);
      this.goback();
    });
  }

  goback() {
    if (this.fromRegistrationFlow) {
      this.router.navigate([RouterLinks.TABS]);
    } else {
      this.location.back();
    }
  }

  createClassroom() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.CREATE_GROUP_CLICKED)
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
  }

  login() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.LOGIN_CLICKED)
    this.loginHandlerService.signIn({ skipRootNavigation: true, redirectUrlAfterLogin: RouterLinks.MY_GROUPS });
  }

  async fetchGroupList() {
    this.groupListLoader = true;
    try {
      const groupSearchCriteria: GroupSearchCriteria = {
        from: CachedItemRequestSourceFrom.SERVER,
        request: {
          filters: {
            userId: this.userId
          },
          sort_by: { name: SortOrder.ASC }
        }
      };
      this.groupList = (await this.groupService.search(groupSearchCriteria).toPromise())
        .map<GroupData>((group, index) => {
          return {
            ...group,
            initial: this.commonUtilService.extractInitial(group.name),
            cardBgColor: this.themeColors[index % this.themeColors.length],
            cardTitleColor: this.fontColor[index % this.fontColor.length]
          };
        });
      this.groupListLoader = false;
      if (!this.isGroupTncAcceptenceChecked) {
        this.checkIfUserAcceptedGuidelines();
      }
    } catch (e) {
      console.error(e);
      this.groupListLoader = false;
    }
  }

  navigateToGroupdetailsPage(event) {
    const telemetryObject = new TelemetryObject(event.data.id, ObjectType.GROUP, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.GROUP_CLICKED, Environment.GROUP, PageId.MY_GROUP, telemetryObject);
    const navigationExtras: NavigationExtras = {
      state: {
        groupId: event.data.id
      }
    };
    if (event.data && event.data.hasOwnProperty('visited') && event.data.visited === false) {
      this.openAcceptGuidelinesPopup(false, navigationExtras);
    } else {
      this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`], navigationExtras);
    }
  }

  async openinfopopup() {
    const popover = await this.popoverCtrl.create({
      component: MyGroupsPopoverComponent,
      componentProps: {
        title: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED'),
        body: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED_DESC'),
        buttonText: this.commonUtilService.translateMessage('INSTALL_CROSSWALK')
      },
      cssClass: 'popover-my-groups',
      enterAnimation: animationGrowInTopRight,
      leaveAnimation: animationShrinkOutTopRight,
      backdropDismiss: false,
      showBackdrop: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data === undefined) { // Backdrop clicked
    } else if (data.closeDeletePopOver) { // Close clicked
    } else if (data.canDelete) {
    }
  }

  async openAcceptGuidelinesPopup(shouldUpdateUserLevelGroupTnc, navigationExtras?, event?) {
    const confirm = await this.popoverCtrl.create({
      component: GroupGuideLinesPopoverComponent,
      componentProps: {
        icon: null,
        shouldUpdateUserLevelGroupTnc
      },
      cssClass: 'sb-popover info',
      backdropDismiss: !shouldUpdateUserLevelGroupTnc
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data == null) {
      return;
    }
    if (data && data.isLeftButtonClicked) {
      let corRelationList = [];
      if(navigationExtras) {
        corRelationList = [{ id: navigationExtras.state.groupId, type: CorReleationDataType.GROUP_ID }];
      }
      if(!shouldUpdateUserLevelGroupTnc) {
        const request: CsGroupUpdateGroupGuidelinesRequest = {
          userId: this.userId,
          groups: [{
            groupId: navigationExtras.state.groupId,
            visited: true
          }]
        }
        this.generateInteractTelemetry(InteractType.INITIATED, '', corRelationList, ID.ACCEPT_GROUP_GUIDELINES)

        try {
          const updateMemberResponse: GroupUpdateMembersResponse = await this.groupService.updateGroupGuidelines(request).toPromise();
          if(updateMemberResponse.error){
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
          } else {
            this.generateInteractTelemetry(InteractType.SUCCESS,'', corRelationList, ID.ACCEPT_GROUP_GUIDELINES)
          }
          this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`], navigationExtras);
          // Incase of close button click data.isLeftButtonClicked = null so we have put the false condition check
        } catch (err) {
          this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
        }
      } else {
        this.updateGroupTnc(this.groupTncVersion);
      }
    }
  }

  checkIfUserAcceptedGuidelines() {
    const getSystemSettingsRequest: GetSystemSettingsRequest = {
      id: SystemSettingsIds.GROUPS_TNC
    };
    this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        if (res && res.value) {
          const value = JSON.parse(res.value);
          this.groupTncVersion = value.latestVersion;
          const req: ServerProfileDetailsRequest = {
            userId: this.userId,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
            from: CachedItemRequestSourceFrom.SERVER
          };
          this.profileService.getServerProfilesDetails(req).toPromise()
            .then((profileDetails) => {
              if (profileDetails.allTncAccepted
                && profileDetails.allTncAccepted.groupsTnc
                && profileDetails.allTncAccepted.groupsTnc.version) {
                if (profileDetails.allTncAccepted.groupsTnc.version !== this.groupTncVersion) {
                  if (this.groupList.length) {
                    // this.updateGroupTnc(this.groupTncVersion);
                    this.openAcceptGuidelinesPopup(true);
                  } else {
                    this.updateGroupTnc(this.groupTncVersion, profileDetails.managedBy);
                  }
                }
              } else {
                if (this.groupList.length) {
                  this.openAcceptGuidelinesPopup(true);
                } else {
                  this.updateGroupTnc(this.groupTncVersion, profileDetails.managedBy);
                }
              }
            });
        }
      }).catch(err => {
        console.log('error :', err);
      });
  }

  private async updateGroupTnc(latestVersion, managedBy?) {
    this.isGroupTncAcceptenceChecked = true;
    try {
      let acceptTermsAndConditionsRequest: AcceptTermsConditionRequest = {
        version: latestVersion,
        tncType: 'groupsTnc'
      };
      if(managedBy) {
        const userId = (await this.profileService.getActiveProfileSession().toPromise()).uid;
        acceptTermsAndConditionsRequest.userId = userId
      } 
      const isTCAccepted = await this.profileService.acceptTermsAndConditions(acceptTermsAndConditionsRequest).toPromise();
    } catch (err) {
      console.error('acceptTermsAndConditions err', err);
    }
    if(this.groupList.length){
        this.generateInteractTelemetry(InteractType.INITIATED, '', ID.ACCEPT_GROUP_GUIDELINES)
      try{
        const groupsData = [];
        this.groupList.forEach((g) => {
          const gdata = {
            groupId: g.id,
            visited: true
          };
          groupsData.push(gdata);
        });
        const request: CsGroupUpdateGroupGuidelinesRequest = {
          userId: this.userId,
          groups: groupsData
        };
        const groupsUpdateResponse = await this.groupService.updateGroupGuidelines(request).toPromise();
        this.generateInteractTelemetry(InteractType.SUCCESS, '', ID.ACCEPT_GROUP_GUIDELINES)
        this.fetchGroupList();
      } catch (err) {
        console.log('groupsUpdateResponse err', err);
      }
    }
  }
  private generateInteractTelemetry(interactType, interactSubType, correlationList?, id? ){
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType,
      interactSubType,
      Environment.GROUP,
      PageId.MY_GROUP,
      undefined,
      undefined,
      undefined,
      correlationList,
      id
    );
  }
}
