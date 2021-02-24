import { Component, Inject, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { PreferenceKey, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { LoginHandlerService } from '@app/services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { ContainerService } from '@app/services/container.services';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { ProfileHandler } from '@app/services/profile-handler';
import { SplashScreenService } from '@app/services/splash-screen.service';
import {
  AuditProps,
  AuditType, CorReleationDataType, Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';
import { Events, IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AuditState, CorrelationData, Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SharedPreferences,
  UpdateServerProfileInfoRequest
} from 'sunbird-sdk';

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

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private zone: NgZone,
    private event: Events,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private platform: Platform,
    private headerService: AppHeaderService,
    private router: Router,
    public frameworkGuard: HasNotSelectedFrameworkGuard,
    private splashScreenService: SplashScreenService,
    private nativePageTransitions: NativePageTransitions,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private profileHandler: ProfileHandler,
    private loginHandlerService: LoginHandlerService
  ) {
  }

  getNavParams() {
    this.navParams = window.history.state;
    this.categoriesProfileData = this.navParams.categoriesProfileData;
  }

  ionViewDidEnter() {
    this.hideOnboardingSplashScreen();
  }

  async hideOnboardingSplashScreen() {
    if (this.navParams && this.navParams.forwardMigration) {
      if (!this.frameworkGuard.guardActivated) {
        this.splashScreenService.handleSunbirdSplashScreenActions();
      }
    }
  }

  async ionViewWillEnter() {
    if (this.appGlobalService.isUserLoggedIn()) {
      this.selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    }
    this.supportedUserTypeConfig = await this.profileHandler.getSupportedUserTypes();
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
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.appName = await this.commonUtilService.getAppName();
    this.headerService.hideHeader();
    this.profile = this.appGlobalService.getCurrentUser();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
      /* New Telemetry */
      this.telemetryGeneratorService.generateBackClickedNewTelemetry(
        true,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        PageId.USER_TYPE
      );
      this.handleBackButton();
      this.backButtonFunc.unsubscribe();
    });
    this.hideBackButton = false;
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    this.event.unsubscribe('back');

    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleBackButton(isBackClicked?) {
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
    this.router.navigate([`/${RouterLinks.LANGUAGE_SETTING}`]);
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.USER_TYPE_SELECTION,
        this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        true);
      this.handleBackButton();
    }
  }

  selectUserTypeCard(selectedUserTypeName: string, userType: string) {
    this.selectCard(selectedUserTypeName, userType);
    this.generateUserTypeClicktelemetry(userType);
    if (!this.categoriesProfileData) {
      setTimeout(() => {
        this.continue();
      }, 50);
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

  selectCard(userType, profileType) {
    this.zone.run(() => {
      this.selectedUserType = profileType;
      this.continueAs = this.commonUtilService.translateMessage(
        'CONTINUE_AS_ROLE',
        this.commonUtilService.translateMessage(userType)
      );

      this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUserType).toPromise().then();
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

  continue() {
    // this.generateInteractEvent(this.selectedUserType);
    // When user is changing the role via the Guest Profile screen
    if (this.profile !== undefined && this.profile.handle) {
      // if role types are same
      if (this.profile.profileType === this.selectedUserType) {
        this.gotoNextPage();
      } else {
        this.gotoNextPage(true);
      }
    } else {
      const profileRequest: Profile = {
        uid: this.profile.uid,
        handle: 'Guest1',
        profileType: this.selectedUserType,
        source: ProfileSource.LOCAL
      };
      this.setProfile(profileRequest);
    }
  }

  // TODO Remove getCurrentUser as setCurrentProfile is returning uid
  setProfile(profileRequest: Profile) {
    this.profileService.updateProfile(profileRequest).toPromise().then(() => {
      return this.profileService.setActiveSessionForProfile(profileRequest.uid).toPromise().then(() => {
        return this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
          .then((success: any) => {
            const userId = success.uid;
            this.event.publish(AppGlobalService.USER_INFO_UPDATED);
            if (userId !== 'null') {
              this.preferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, userId).toPromise().then();
            }
            this.profile = success;
            this.gotoNextPage();
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
  gotoNextPage(isUserTypeChanged: boolean = false) {
    // Update the Global variable in the AppGlobalService
    this.event.publish(AppGlobalService.USER_INFO_UPDATED);

    if (this.commonUtilService.isAccessibleForNonStudentRole(this.selectedUserType)) {
      initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.selectedUserType === ProfileType.STUDENT) {
      initTabs(this.container, GUEST_STUDENT_TABS);
    }

    if (this.appGlobalService.isProfileSettingsCompleted && this.appGlobalService.isOnBoardingCompleted && !isUserTypeChanged) {
      this.navigateToTabsAsGuest();
    } else if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
      if (isUserTypeChanged) {
        this.updateProfile('ProfileSettingsPage', { showProfileSettingPage: true });
      } else {
        this.selectedUserType === ProfileType.ADMIN ? this.loginHandlerService.signIn() :
          this.navigateToProfileSettingsPage({ showProfileSettingPage: true });
      }
    } else {
      this.updateProfile('ProfileSettingsPage', { showTabsPage: true });
    }
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
      .then((res: any) => {
        if (page === 'TabsPage') {
          this.navigateToTabsAsGuest();
        } else if (this.categoriesProfileData) {
          this.navigateToTabsAsLogInUser();
        } else {
          this.selectedUserType === ProfileType.ADMIN ? this.loginHandlerService.signIn() : this.navigateToProfileSettingsPage(params);
          // this.navigateToProfileSettingsPage(params);
        }
      }).catch(error => {
        console.error('Error=', error);
      });
    const request: UpdateServerProfileInfoRequest = {
      userId: this.profile.uid,
      userType: this.selectedUserType
    };
    this.profileService.updateServerProfile(request).toPromise()
      .then().catch((e) => console.log('server error for update profile', e));
  }

  async navigateToTabsAsLogInUser() {
    if (this.categoriesProfileData.status) {
      if (this.categoriesProfileData.showOnlyMandatoryFields) {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        if (this.categoriesProfileData.hasFilledLocation || await this.tncUpdateHandlerService.isSSOUser(this.profile)) {
          this.router.navigate([RouterLinks.TABS]);
        } else {
          const navigationExtras: NavigationExtras = {
            state: {
              isShowBackButton: false
            }
          };
          this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        }
      }
    } else {
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
        state: this.categoriesProfileData
      });
    }
  }

  navigateToTabsAsGuest() {
    const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
    this.router.navigate(['/tabs'], navigationExtras);
  }

  async navigateToProfileSettingsPage(params) {
    const navigationExtras: NavigationExtras = { state: params };
    const options: NativeTransitionOptions = {
      direction: 'left',
      duration: 500,
      androiddelay: 500,
      fixedPixelsTop: 0,
      fixedPixelsBottom: 0
    };
    this.nativePageTransitions.slide(options);
    this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
  }

  async navigateToProfilePage() {
    const navigationExtras: NavigationExtras = {};
    const options: NativeTransitionOptions = {
      direction: 'left',
      duration: 500,
      androiddelay: 500,
      fixedPixelsTop: 0,
      fixedPixelsBottom: 0
    };
    // this.nativePageTransitions.slide(options);
    this.router.navigate([`/${RouterLinks.GUEST_PROFILE}`], navigationExtras);
  }

  onSubmitAttempt() {
    setTimeout(() => {
      this.continue();
    }, 50);
  }

  ngOnDestroy() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
}
