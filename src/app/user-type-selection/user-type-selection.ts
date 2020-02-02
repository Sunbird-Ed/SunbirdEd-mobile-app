import { Subscription } from 'rxjs';
import { Component, Inject, NgZone, ViewChild, OnInit } from '@angular/core';
import { IonRouterOutlet, Events, Platform } from '@ionic/angular';
import { } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { ProfileConstants, PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Profile, ProfileService, ProfileSource, ProfileType, SharedPreferences, } from 'sunbird-sdk';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '@app/services/telemetry-constants';
import { ContainerService } from '@app/services/container.services';
import { initTabs, GUEST_STUDENT_TABS, GUEST_TEACHER_TABS } from '@app/app/module.service';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { SplashScreenService } from '@app/services/splash-screen.service';

const selectedCardBorderColor = '#006DE5';
const borderColor = '#F7F7F7';

@Component({
  selector: 'page-user-type-selection',
  templateUrl: 'user-type-selection.html',
  styleUrls: ['./user-type-selection.scss']
})

export class UserTypeSelectionPage implements OnInit {
  teacherCardBorderColor = '#F7F7F7';
  studentCardBorderColor = '#F7F7F7';
  userTypeSelected = false;
  selectedUserType: ProfileType;
  continueAs = '';
  profile: Profile;
  backButtonFunc: Subscription;
  headerObservable: any;
  studentImageUri = 'assets/imgs/ic_student.png';
  teacherImageUri = 'assets/imgs/ic_teacher.png';
  private navParams: any;
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

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
    private splashScreenService: SplashScreenService
  ) {
    this.getNavParams();
  }

  getNavParams() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }
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

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.USER_TYPE_SELECTION,
      this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING);
  }

  ionViewWillEnter() {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithBackButton();
    this.profile = this.appGlobalService.getCurrentUser();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
      this.handleBackButton();
      this.backButtonFunc.unsubscribe();
    });
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    this.event.unsubscribe('back');

    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleBackButton() {
    this.router.navigate([`/${RouterLinks.LANGUAGE_SETTING}`]);
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(
          PageId.USER_TYPE_SELECTION,
          this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
          true);
                   this.handleBackButton();
                   break;
    }
  }

  selectTeacherCard() {
    this.selectCard('USER_TYPE_1', ProfileType.TEACHER);
  }

  selectStudentCard() {
    this.selectCard('USER_TYPE_2', ProfileType.STUDENT);
  }

  selectCard(userType, profileType) {
    this.zone.run(() => {
      this.userTypeSelected = true;
      this.teacherCardBorderColor = (userType === 'USER_TYPE_1') ? selectedCardBorderColor : borderColor;
      this.studentCardBorderColor = (userType === 'USER_TYPE_1') ? borderColor : selectedCardBorderColor;
      this.selectedUserType = profileType;
      this.continueAs = this.commonUtilService.translateMessage(
        'CONTINUE_AS_ROLE',
        this.commonUtilService.translateMessage(userType)
      );

      this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUserType).toPromise().then();
    });
    const values = new Map();
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
    this.generateInteractEvent(this.selectedUserType);
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
          }).catch(() => {
            return 'null';
          });
      });
    });
  }

  /**
   * It will initializes tabs based on the user type and navigates to respective page
   * @param isUserTypeChanged
   */

  // changes
  gotoNextPage(isUserTypeChanged: boolean = false) {
    // Update the Global variable in the AppGlobalService
    this.event.publish(AppGlobalService.USER_INFO_UPDATED);

    if (this.selectedUserType === ProfileType.TEACHER) {
      initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.selectedUserType === ProfileType.STUDENT) {
      initTabs(this.container, GUEST_STUDENT_TABS);
    }

    if (this.appGlobalService.isProfileSettingsCompleted && this.appGlobalService.isOnBoardingCompleted) {
      this.navigateToTabsAsGuest();
    } else if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
      if (isUserTypeChanged) {
        this.updateProfile('PermissionPage', { showProfileSettingPage: true });
      } else {
        this.navigateToPermissions({ showProfileSettingPage: true });
      }
    } else {
      this.updateProfile('PermissionPage', { showTabsPage: true });
    }
  }

  generateInteractEvent(userType) {
    const values = new Map();
    values['userType'] = (userType).toUpperCase();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTINUE_CLICKED,
      this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.USER_TYPE_SELECTION,
      undefined,
      values);
  }

  /**
   * Updates profile and navigates to desired page with given params
   * @param page
   * @param params
   */
  updateProfile(page: string, params = {}) {
    this.profile.profileType = this.selectedUserType;
    this.profileService.updateProfile(this.profile).toPromise()
      .then((res: any) => {
        if (page === 'TabsPage') {
          this.navigateToTabsAsGuest();
        } else {
          this.navigateToPermissions(params);
        }
      }).catch(error => {
        console.error('Error=', error);
      });
  }

  navigateToTabsAsGuest() {
    const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
    this.router.navigate(['/tabs'], navigationExtras);
  }

  navigateToPermissions(params) {
    const navigationExtras: NavigationExtras = { state: params };
    this.router.navigate([`/${RouterLinks.SETTINGS}/${RouterLinks.PERMISSION}`], navigationExtras);
  }
}
