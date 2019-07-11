import { Component, Inject, NgZone, ViewChild, OnInit } from '@angular/core';
import { Events, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap, NavigationExtras } from '@angular/router';
// import {GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs, Map, PreferenceKey} from '../app.constant';
// migration-TODO
import {PreferenceKey, RouterLinks} from '../app.constant';
import {AppGlobalService, CommonUtilService, TelemetryGeneratorService, AppHeaderService, SunbirdQRScanner} from '../../services/index';
// import {SunbirdQRScanner} from '@app/pages/qrscanner';
// import {LanguageSettingsPage} from '@app/pages/language-settings/language-settings';
import { Profile, ProfileService, ProfileSource, ProfileType, SharedPreferences, } from 'sunbird-sdk';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '../../services/telemetry-constants';
import { ContainerService } from '../../services/container.services';
// import { TabsPage } from '../tabs/tabs';
import { ProfileConstants } from '../app.constant';
import { GUEST_TEACHER_TABS, initTabs, GUEST_STUDENT_TABS } from '../module.service';

const selectedCardBorderColor = '#006DE5';
const borderColor = '#F7F7F7';

@Component({
  selector: 'page-user-type-selection',
  templateUrl: 'user-type-selection.html',
  styleUrls: ['./user-type-selection.scss']
})

export class UserTypeSelectionPage {
  teacherCardBorderColor = '#F7F7F7';
  studentCardBorderColor = '#F7F7F7';
  userTypeSelected = false;
  selectedUserType: ProfileType;
  continueAs = '';
  profile: Profile;
  backButtonFunc = undefined;
  headerObservable: any;

  /**
   * Contains paths to icons
   */
  studentImageUri = 'assets/imgs/ic_student.png';
  teacherImageUri = 'assets/imgs/ic_teacher.png';
  isChangeRoleRequest = false;
  private navParams: any;
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public navCtrl: NavController,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private zone: NgZone,
    private event: Events,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private scannerService: SunbirdQRScanner,
    private platform: Platform,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.getNavParams();
  }

  getNavParams() {
    const navigation = this.router.getCurrentNavigation();
    this.navParams = false;
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }
    console.log(this.navParams);
  }

  ionViewDidLoad() {
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
    if (this.navParams && this.navParams.isChangeRoleRequest && Boolean(this.navParams.isChangeRoleRequest)) {
      this.isChangeRoleRequest = Boolean(this.navParams.isChangeRoleRequest);
    }
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
      this.handleBackButton();
      this.backButtonFunc.unsubscribe();
    });
  }

  ionViewWillLeave() {
    // const self = this;
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    this.event.unsubscribe('back');
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleBackButton() {
    if (this.isChangeRoleRequest) {
      // this.navCtrl.pop();
      this.location.back();
    } else {
      this.router.navigate(['settings/language-setting', 'false']);
    }
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, true);
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
      if (!this.isChangeRoleRequest) {
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUserType).toPromise().then();
      }
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
   * @param {boolean} isUserTypeChanged
   */

  // changes
  gotoNextPage(isUserTypeChanged: boolean = false) {
    // Update the Global variable in the AppGlobalService
    this.event.publish(AppGlobalService.USER_INFO_UPDATED);

    if (this.selectedUserType === ProfileType.TEACHER) {
      // migration-TODO
      // initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.selectedUserType === ProfileType.STUDENT) {
      // migration-TODO
      // initTabs(this.container, GUEST_STUDENT_TABS);
    }
    if (this.isChangeRoleRequest && isUserTypeChanged) {
      if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
      this.container.removeAllTabs();
      const navigationExtras: NavigationExtras = {state: { isChangeRoleRequest: true, selectedUserType: this.selectedUserType }};
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
      } else {
        this.updateProfile('TabsPage');
      }
    } else if (this.appGlobalService.isProfileSettingsCompleted) {
      this.navigateToTabsAsGuest();
    } else if (this.appGlobalService.DISPLAY_ONBOARDING_SCAN_PAGE) {
      // Need to go tabsPage when scan page is ON, changeRoleRequest ON and profileSetting is OFF
      if (this.isChangeRoleRequest) {
        this.navigateToTabsAsGuest();
      } else if (isUserTypeChanged) {
        this.updateProfile('PermissionPage', { showScannerPage: true });
      } else {
        this.navigateToPermissions({ showScannerPage: true });
      }
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
  updateProfile(page, params = {}) {
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
