import {Component, Inject, NgZone, ViewChild, OnInit} from '@angular/core';
import {Events, NavController, NavParams} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// import {GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs, Map, PreferenceKey} from '../app.constant';
// migration-TODO
import {PreferenceKey} from '../app.constant';
import {AppGlobalService, CommonUtilService, TelemetryGeneratorService, AppHeaderService, SunbirdQRScanner} from '../../services/index';
// import {SunbirdQRScanner} from '@app/pages/qrscanner';
// import {ProfileSettingsPage} from '@app/pages/profile-settings/profile-settings';
// import {LanguageSettingsPage} from '@app/pages/language-settings/language-settings';
import {Profile, ProfileService, ProfileSource, ProfileType, SharedPreferences, } from 'sunbird-sdk';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '../../services/telemetry-constants';
import { ContainerService } from '../../services/container.services';
// import { TabsPage } from '../tabs/tabs';
import {ProfileConstants} from '../app.constant';

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
  backButtonFunc = undefined;
  headerObservable: any;

  /**
   * Contains paths to icons
   */
  studentImageUri = 'assets/imgs/ic_student.png';
  teacherImageUri = 'assets/imgs/ic_teacher.png';
  isChangeRoleRequest = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public navCtrl: NavController,
    // public navParams: NavParams,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private zone: NgZone,
    private event: Events,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private scannerService: SunbirdQRScanner,
    // private platform: Platform,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.isChangeRoleRequest = Boolean( params['isChangeRoleRequest'] );
      console.log('inside route paramas ', this.isChangeRoleRequest, typeof(this.isChangeRoleRequest));
    });
  }

  ionViewDidLoad() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.USER_TYPE_SELECTION,
      Environment.HOME, '', '', '');

    this.event.subscribe('event:showScanner', (data) => {
      if (data.pageName === PageId.USER_TYPE_SELECTION) {
        this.scannerService.startScanner(PageId.USER_TYPE_SELECTION, true);
      }
    });
    
  }

  ionViewWillEnter() {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithBackButton();
    this.profile = this.appGlobalService.getCurrentUser();
    // this.isChangeRoleRequest = Boolean(this.navParams.get('isChangeRoleRequest'));
    // migration-TODO
    // this.backButtonFunc = this.platform.registerBackButtonAction(() => {
    //   this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, false);
    //   this.handleBackButton();
    //   this.backButtonFunc();
    // }, 10);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    // Unregister the custom back button action for this page
    this.event.unsubscribe('back');
    if (this.backButtonFunc) {
      this.backButtonFunc();
    }
  }

  handleBackButton() {
    if (this.isChangeRoleRequest) {
      this.navCtrl.pop();
    } else {
      // this.navCtrl.setRoot(LanguageSettingsPage);
    }
  }
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.USER_TYPE_SELECTION, Environment.HOME, true);
      // this.handleBackButton();
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
  }

  continue() {
    this.generateInteractEvent(this.selectedUserType);
    // When user is changing the role via the Guest Profile screen
    if (this.profile !== undefined && this.profile.handle) {
      // if role types are same
      if (this.profile.profileType === this.selectedUserType) {
        this.gotoTabsPage();
      } else {
        this.gotoTabsPage(true);
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
        return this.profileService.getActiveSessionProfile({requiredFields: ProfileConstants.REQUIRED_FIELDS}).toPromise()
          .then((success: any) => {
            const userId = success.uid;
            this.event.publish(AppGlobalService.USER_INFO_UPDATED);
            if (userId !== 'null') {
              this.preferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, userId).toPromise().then();
            }
            this.profile = success;
            this.gotoTabsPage();
          }).catch(() => {
            return 'null';
          });
      }).catch(() => {
      });
    });
  }

  /**
   * It will initializes tabs based on the user type and navigates to respective page
   * @param {boolean} isUserTypeChanged
   */
  gotoTabsPage(isUserTypeChanged: boolean = false) {
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
        // this.navCtrl.push(ProfileSettingsPage, { isChangeRoleRequest: true, selectedUserType: this.selectedUserType });
      } else {
        this.profile.profileType = this.selectedUserType;
        this.profileService.updateProfile(this.profile).toPromise()
          .then(() => {
            // this.navCtrl.push(TabsPage, {
            //   loginMode: 'guest'
            // });
          }).catch(() => {
        });
        // this.navCtrl.setRoot(TabsPage);
      }
    } else if (this.appGlobalService.isProfileSettingsCompleted) {
      // this.navCtrl.push(TabsPage, {
      //   loginMode: 'guest'
      // });
    } else if (this.appGlobalService.DISPLAY_ONBOARDING_SCAN_PAGE) {
      // Need to go tabspage when scan page is ON, changeRoleRequest ON and profileSetting is OFF
      if (this.isChangeRoleRequest) {
        // this.navCtrl.push(TabsPage, {
        //   loginMode: 'guest'
        // });
      } else {
        if (isUserTypeChanged) {
          this.profile.profileType = this.selectedUserType;
          this.profileService.updateProfile(this.profile).toPromise()
            .then((res: any) => {
              // this.scannerService.startScanner(PageId.USER_TYPE_SELECTION, true);
            }).catch(error => {
              console.error('Error=');
            });
        } else {
          // this.scannerService.startScanner(PageId.USER_TYPE_SELECTION, true);
        }
      }
    } else if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
      if (isUserTypeChanged) {
        this.profile.profileType = this.selectedUserType;
        this.profileService.updateProfile(this.profile).toPromise()
          .then((res: any) => {
            // this.navCtrl.push(ProfileSettingsPage);
          }).catch(error => {
            console.error('Error=');
          });
      } else {
        // this.navCtrl.push(ProfileSettingsPage);
      }
    } else {
      this.profile.profileType = this.selectedUserType;
      this.profileService.updateProfile(this.profile).toPromise()
        .then(() => {
          // this.navCtrl.push(TabsPage, {
          //   loginMode: 'guest'
          // });
        }).catch(() => {
      });
    }
  }

  generateInteractEvent(userType) {
    const values = new Map();
    values['UserType'] = userType;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTINUE_CLICKED,
      Environment.HOME,
      PageId.USER_TYPE_SELECTION,
      undefined,
      values);
  }
}
