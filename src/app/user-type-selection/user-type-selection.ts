import { Component, Inject, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { OnboardingScreenType, PreferenceKey, ProfileConstants, RouterLinks } from '../../app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs, LOGIN_TEACHER_TABS } from '../../app/module.service';
import { HasNotSelectedFrameworkGuard } from '../../guards/has-not-selected-framework.guard';
import { LoginHandlerService } from '../../services/login-handler.service';
import { OnboardingConfigurationService } from '../../services/onboarding-configuration.service';
import { AppGlobalService } from '../../services/app-global-service.service';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { ContainerService } from '../../services/container.services';
import { TncUpdateHandlerService } from '../../services/handlers/tnc-update-handler.service';
import { ProfileHandler } from '../../services/profile-handler';
import { SplashScreenService } from '../../services/splash-screen.service';
import {
  AuditProps,
  AuditType, CorReleationDataType, Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { Subscription } from 'rxjs';
import {
  AuditState, CorrelationData, Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SharedPreferences,
  UpdateServerProfileInfoRequest,
  FrameworkService,
  CachedItemRequestSourceFrom,
  Framework,
  GetSuggestedFrameworksRequest
} from '@project-sunbird/sunbird-sdk';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';

@Component({
  selector: 'page-user-type-selection',
  templateUrl: 'user-type-selection.html',
  styleUrls: ['./user-type-selection.scss']
})

export class UserTypeSelectionPage implements OnDestroy {
  selectedUserType?: any;
  continueAs = '';
  profile: Profile;
  backButtonFunc: Subscription;
  headerObservable: any;
  studentImageUri = 'assets/imgs/ic_student.svg';
  teacherImageUri = 'assets/imgs/ic_teacher.svg';
  otherImageUri = 'assets/imgs/ic_other.svg';
  selectCardImageUri = 'assets/imgs/ic_check.svg';
  private navParams: any;
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
  appName = '';
  public hideBackButton = true;
  ProfileType = ProfileType;
  categoriesProfileData: any;
  supportedUserTypeConfig: Array<any>;
  isUserTypeSelected = false;
  defaultFramework: any;
  loader: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private zone: NgZone,
    private event: Events,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    public platform: Platform,
    private headerService: AppHeaderService,
    private router: Router,
    public frameworkGuard: HasNotSelectedFrameworkGuard,
    private splashScreenService: SplashScreenService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private profileHandler: ProfileHandler,
    private loginHandlerService: LoginHandlerService,
    private onboardingConfigurationService: OnboardingConfigurationService,
    private externalIdVerificationService: ExternalIdVerificationService,
  ) {
  }

  getNavParams() {
    this.navParams = window.history.state;
    this.categoriesProfileData = this.navParams.categoriesProfileData;
  }

  async ionViewDidEnter() {
    await this.hideOnboardingSplashScreen();
  }

  async hideOnboardingSplashScreen() {
    if (this.navParams && this.navParams.forwardMigration) {
      if (!this.frameworkGuard.guardActivated) {
        await this.splashScreenService.handleSunbirdSplashScreenActions();
      }
    }
  }

  async setValue() {

    await this.frameworkService.getDefaultChannelDetails().toPromise()
      .then(async(data) => {
        this.defaultFramework = data;
        await this.preferences.putString('defaultFrameworkId', this.defaultFramework.defaultFramework).toPromise();
        await this.preferences.putString('defaultRootOrgId', data.identifier).toPromise();
      })
  }

  async ionViewWillEnter() {
    await this.setValue();
    if (this.appGlobalService.isUserLoggedIn()) {
      this.selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    }
    await this.setUserTypeForNewUser();
    this.getSupportedUserTypes()

    console.log('supportedUserTypeConfigsupportedUserTypeConfigsupportedUserTypeConfigsupportedUserTypeConfig', this.supportedUserTypeConfig)
    if (this.router.url === '/' + RouterLinks.USER_TYPE_SELECTION) {
      setTimeout(() => {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW, '',
          PageId.USER_TYPE_SELECTION,
          this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING);
        /* New Telemetry */
        this.telemetryGeneratorService.generatePageLoadedTelemetry(
          PageId.USER_TYPE,
          this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING
        );
      }, 350);
    }
    this.getNavParams();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async eventName => {
      await this.handleHeaderEvents(eventName);
    });
    this.appName = await this.commonUtilService.getAppName();
    await this.headerService.hideHeader();
    this.profile = this.appGlobalService.getCurrentUser();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, async () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
      /* New Telemetry */
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(
        true,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        PageId.USER_TYPE
      );
      if(this.onboardingConfigurationService.initialOnboardingScreenName === OnboardingScreenType.USER_TYPE_SELECTION) {
        await this.commonUtilService.showExitPopUp(PageId.USER_TYPE_SELECTION, Environment.ONBOARDING, false);
      }
      if (this.categoriesProfileData) {
        if (this.platform.is('ios')) {
          await this.headerService.showHeaderWithHomeButton();
        } else {
          await this.commonUtilService.showExitPopUp(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
        }
      } else {
        this.backButtonFunc.unsubscribe();
      }
    });
    if(this.onboardingConfigurationService.initialOnboardingScreenName !== OnboardingScreenType.USER_TYPE_SELECTION){
      this.hideBackButton = false;
    }
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    this.event.unsubscribe('back');

    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async handleBackButton(isBackClicked?) {
    if (isBackClicked) {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.USER_TYPE_SELECTION,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        true);
      /* New Telemetry */
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(
        false,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        PageId.USER_TYPE
      );
    }
    if (!this.categoriesProfileData) {
      await this.router.navigate([`/${RouterLinks.LANGUAGE_SETTING}`]);
    }
  }

  async handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.USER_TYPE_SELECTION,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        true);
      await this.handleBackButton();
    }
  }

  async selectUserTypeCard(selectedUserTypeName: string, userType: string, isActive: boolean) {
    if (isActive) {
      await this.selectCard(selectedUserTypeName, userType);
      this.generateUserTypeClicktelemetry(userType);
      if (!this.categoriesProfileData) {
        this.onSubmitAttempt()
      }
    }
  }

  generateUserTypeClicktelemetry(userType: string) {
    const correlationlist: Array<CorrelationData> = [];
    correlationlist.push({ id: userType, type: CorReleationDataType.USERTYPE });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_USERTYPE, '',
      Environment.ONBOARDING,
      PageId.USER_TYPE,
      undefined,
      undefined,
      undefined,
      correlationlist
    );
  }

  async selectCard(userType, profileType) {
    await this.zone.run(async () => {
      this.selectedUserType = profileType;
      this.isUserTypeSelected = true;
      this.continueAs = this.commonUtilService.translateMessage(
        'CONTINUE_AS_ROLE',
        this.commonUtilService.translateMessage(userType)
      );

      await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUserType).toPromise();
    });
    const values = {};
    values['userType'] = (this.selectedUserType).toUpperCase();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.USER_TYPE_SELECTED,
      this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.USER_TYPE_SELECTION,
      undefined,
      values
    );
  }

  async continue() {
    // this.generateInteractEvent(this.selectedUserType);
    // When user is changing the role via the Guest Profile screen
    if (this.profile !== undefined && this.profile.handle) {
      // if role types are same
      if (this.profile.profileType === this.selectedUserType) {
        await this.gotoNextPage();
      } else {
        await this.gotoNextPage(true);
      }
    } else {
      const profileRequest: Profile = {
        uid: this.profile.uid,
        handle: 'Guest1',
        profileType: this.selectedUserType,
        source: ProfileSource.LOCAL
      };
      await this.setProfile(profileRequest);
    }
  }

  async setProfile(profileRequest: Profile) {
    await this.profileService.updateProfile(profileRequest).toPromise().then(() => {
      return this.profileService.setActiveSessionForProfile(profileRequest.uid).toPromise().then(() => {
        return this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
          .then(async (success: any) => {
            const userId = success.uid;
            this.event.publish(AppGlobalService.USER_INFO_UPDATED);
            if (userId !== 'null') {
              await this.preferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, userId).toPromise().then();
            }
            this.profile = success;
            await this.gotoNextPage();
            this.generateAuditEvents();
          }).catch(() => {
            return 'null';
          });
      });
    });
  }

  /**
   * It will initializes tabs based on the user type and navigates to respective page
   * isUserTypeChanged
   */

  // changes
  async gotoNextPage(isUserTypeChanged: boolean = false) {
    // Update the Global variable in the AppGlobalService
    this.event.publish(AppGlobalService.USER_INFO_UPDATED);

    if (this.commonUtilService.isAccessibleForNonStudentRole(this.selectedUserType)) {
      initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.selectedUserType === ProfileType.STUDENT) {
      initTabs(this.container, GUEST_STUDENT_TABS);
    }

    if (this.appGlobalService.isProfileSettingsCompleted && this.appGlobalService.isOnBoardingCompleted && !isUserTypeChanged) {
      await this.navigateToTabsAsGuest();
    } else {
      if (isUserTypeChanged) {
        this.updateProfile('ProfileSettingsPage', { showProfileSettingPage: true , defaultFrameworkID: this.defaultFramework.defaultFramework, 
          rootOrgId: this.defaultFramework.identifier});
      } else {
        if (this.selectedUserType === ProfileType.ADMIN) {
          await this.router.navigate([RouterLinks.SIGN_IN]);
        } else {
          await this.navigateToProfileSettingsPage({ showProfileSettingPage: true ,
            defaultFrameworkID: this.defaultFramework.defaultFramework, rootOrgId: this.defaultFramework.identifier});
        }
      }
    }
    //  else {
    //   this.updateProfile('ProfileSettingsPage', { showTabsPage: true });
    // }
  }

  generateInteractEvent(userType) {
    const values = new Map();
    values['userType'] = (userType).toUpperCase();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.USER_TYPE_SELECTED,
      this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.USER_TYPE_SELECTION,
      undefined,
      values
    );

    /* New Telemetry */
    const correlationlist: Array<CorrelationData> = [];
    correlationlist.push({ id: userType, type: CorReleationDataType.USERTYPE });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CONTINUE, '',
      this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.USER_TYPE,
      undefined,
      values,
      undefined,
      correlationlist
    );
  }

  /**
   * Updates profile and navigates to desired page with given params
   * page
   * params
   */
  updateProfile(page: string, params = {}) {
    this.profile.profileType = this.selectedUserType;
    this.profileService.updateProfile(this.profile).toPromise()
      .then(async (res: any) => {
        if (page === 'TabsPage') {
          await this.navigateToTabsAsGuest();
        } else if (this.categoriesProfileData) {
          await this.navigateToTabsAsLogInUser();
        } else {
          if (this.selectedUserType === ProfileType.ADMIN) {
            await this.router.navigate([RouterLinks.SIGN_IN]);
          } else {
            await this.navigateToProfileSettingsPage(params, true);
          }
        }
      }).catch(error => {
        console.error('Error=', error);
      });
    const request: UpdateServerProfileInfoRequest = {
      userId: this.profile.uid,
      profileUserType: {
        type: this.selectedUserType
      }
    };
    this.profileService.updateServerProfile(request).toPromise()
      .then().catch((e) => console.log('server error for update profile', e));
  }

  async navigateToTabsAsLogInUser() {
    if (this.categoriesProfileData.status) {
      if (this.categoriesProfileData.showOnlyMandatoryFields) {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        const isSSOUser = await this.tncUpdateHandlerService.isSSOUser(this.profile);
        if (this.categoriesProfileData.hasFilledLocation || isSSOUser) {
          if (!isSSOUser) {
            await this.appGlobalService.showYearOfBirthPopup(this.profile.serverProfile);
          }
          if (this.appGlobalService.isJoinTraningOnboardingFlow) {
            window.history.go(-this.categoriesProfileData.noOfStepsToCourseToc);
          } else {
            await this.router.navigate([RouterLinks.TABS]);
          }
          await this.externalIdVerificationService.showExternalIdVerificationPopup();
        } else {
          const navigationExtras: NavigationExtras = {
            state: {
              isShowBackButton: false,
              noOfStepsToCourseToc: this.categoriesProfileData.noOfStepsToCourseToc + 1
            }
          };
          await this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        }
      }
    } else {
      this.categoriesProfileData['noOfStepsToCourseToc'] = this.categoriesProfileData.noOfStepsToCourseToc + 1;
      await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
        state: this.categoriesProfileData
      });
    }
  }

  async navigateToTabsAsGuest() {
    const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
    await this.router.navigate(['/tabs'], navigationExtras);
  }

  async navigateToProfileSettingsPage(params, isUpdateProfile? ) {
    const navigationExtras: NavigationExtras = { state: params };
    if(isUpdateProfile) {
      this.generateAuditEvents();
    }
    await this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
  }

  async navigateToProfilePage() {
    const navigationExtras: NavigationExtras = {};
    await this.router.navigate([`/${RouterLinks.GUEST_PROFILE}`], navigationExtras);
  }

  onSubmitAttempt() {
    setTimeout(async () => {
      await this.continue();
    }, 50);
  }

  ngOnDestroy() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async setUserTypeForNewUser() {
    if (this.selectedUserType === 'none') {
      this.commonUtilService.getGuestUserConfig().then(async (profile) => {
        this.selectedUserType = profile.profileType;
        await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUserType).toPromise().then();
      }).catch((e) => console.error(e));
    }
    this.isUserTypeSelected = this.selectedUserType !== 'none' ? true : false;
  }

  generateAuditEvents(){
    const correlationlist: Array<CorrelationData> = [{ id: PageId.USER_TYPE, type: CorReleationDataType.FROM_PAGE }];
    correlationlist.push({ id: this.selectedUserType, type: CorReleationDataType.USERTYPE });
    this.telemetryGeneratorService.generateAuditTelemetry(
      Environment.ONBOARDING,
      AuditState.AUDIT_UPDATED,
      [AuditProps.PROFILE_TYPE],
      AuditType.SELECT_USERTYPE,
      undefined,
      undefined,
      undefined,
      correlationlist
    );
  }

  async getSupportedUserTypes() {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    const rootOrgId = this.onboardingConfigurationService.getAppConfig().overriddenDefaultChannelId
    this.supportedUserTypeConfig = await this.profileHandler.getSupportedUserTypes(rootOrgId);
    await this.loader.dismiss();
  }
}
