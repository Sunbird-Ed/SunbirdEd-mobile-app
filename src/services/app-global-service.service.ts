import {Inject, Injectable, OnDestroy} from '@angular/core';
import {Environment, InteractSubtype, InteractType, PageId} from './telemetry-constants';
import {Events, PopoverController} from '@ionic/angular';
import {PopoverOptions} from '@ionic/core';
// import {UpgradePopover} from '../pages/upgrade/upgrade-popover';
import {GenericAppConfig, PreferenceKey} from '../app/app.constant';
import {TelemetryGeneratorService} from './telemetry-generator.service';
import {
  AuthService,
  Course,
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  OAuthSession,
  Profile,
  ProfileService,
  ProfileType,
  SharedPreferences
} from 'sunbird-sdk';
import {UtilityService} from './utility-service';
import {ProfileConstants} from '../app/app.constant';
import { Observable, Observer } from 'rxjs-compat';
import { PermissionAsked } from './android-permissions/android-permission';
import { UpgradePopoverComponent } from '../app/components/popups/upgrade-popover/upgrade-popover.component';

declare const buildconfigreader;

@Injectable({
  providedIn: 'root'
})
export class AppGlobalService implements OnDestroy {

  public static readonly USER_INFO_UPDATED = 'user-profile-changed';
  public static readonly PROFILE_OBJ_CHANGED = 'app-global:profile-obj-changed';
  public static isPlayerLaunched = false;

  session: OAuthSession;

  /**
  * This property stores the courses enrolled by a user
  */
  courseList: Array<Course>;

  /**
  * This property stores the course filter configuration at the app level for a particular app session
  */
  courseFilterConfig: Array<any> = [];

  /**
  * This property stores the library filter configuration at the app level for a particular app session
  */
  libraryFilterConfig: Array<any> = [];

  /**
  * This property stores the organization at the app level for a particular app session
  */
  rootOrganizations: Array<any>;
  courseFrameworkId: string;

  currentPageId: string;

  guestUserProfile: Profile;
  isGuestUser = false;
  guestProfileType: ProfileType;
  isProfileSettingsCompleted: boolean;
  isOnBoardingCompleted = false;
  selectedUser;
  selectedBoardMediumGrade: string;
  isPermissionAsked: PermissionAsked =  {
    isCameraAsked: false,
    isStorageAsked: false,
    isRecordAudioAsked: false,
};

  constructor(
      @Inject('PROFILE_SERVICE') private profile: ProfileService,
      @Inject('AUTH_SERVICE') public authService: AuthService,
      @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
      private event: Events,
      private popoverCtrl: PopoverController,
      private telemetryGeneratorService: TelemetryGeneratorService,
      @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
      private utilityService: UtilityService
  ) {

      this.initValues();
      this.listenForEvents();
  }
  public averageTime = 0;
  public averageScore = 0;
  private frameworkData = [];
  public DISPLAY_ONBOARDING_CARDS = false;
  public DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = false;
  public DISPLAY_ONBOARDING_PAGE = false;
  public DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = false;
  public DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = false;
  public DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = false;
  public DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = false;
  public DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = false;
  public TRACK_USER_TELEMETRY = false;
  public CONTENT_STREAMING_ENABLED = false;
  public DISPLAY_ONBOARDING_SCAN_PAGE = false;
  public DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
  public OPEN_RAPDISCOVERY_ENABLED = false;
  public SUPPORT_EMAIL = 'support@sunbird.com';

  isUserLoggedIn(): boolean {
      return !this.isGuestUser;
  }

  getGuestUserType(): ProfileType {
      return this.guestProfileType;
  }

  getCurrentUser(): Profile {
      return this.guestUserProfile;
  }

  getSessionData(): any {
      return this.session;
  }

  getSelectedUser() {
      return this.selectedUser;
  }

 setSelectedUser(selectedUser) {
      this.selectedUser = selectedUser;
  }

  getNameForCodeInFramework(category, code) {
      let name;

      if (this.frameworkData[category]
          && this.frameworkData[category].terms
          && this.frameworkData[category].terms.length > 0) {
          const matchingTerm = this.frameworkData[category].terms.find((term) => {
              return term.code === code;
          });

          if (matchingTerm) {
              name = matchingTerm.name;
          }
      }

      return name;
  }

  /**
  * This method stores the list of courses enrolled by user, and is updated every time
  * getEnrolledCourses is called.
  * @param courseList
  */
  setEnrolledCourseList(courseList: Array<any>) {
      this.courseList = courseList;
  }

  /**
  * This method returns the list of enrolled courses
  *
  * @param courseList
  *
  */
  getEnrolledCourseList(): Array<any> {
      return this.courseList;
  }

  /**
  * This method stores the course filter config, for a particular session of the app
  *
  * @param courseFilterConfig
  *
  */
  setCourseFilterConfig(courseFilterConfig: Array<any>) {
      this.courseFilterConfig = courseFilterConfig;
  }

  /**
  * This method returns the course filter config cache, for a particular session of the app
  *
  * @param syllabusList
  *
  */
  getCachedCourseFilterConfig(): Array<any> {
      return this.courseFilterConfig;
  }

  /**
  * This method stores the library filter config, for a particular session of the app
  *
  */
  setLibraryFilterConfig(libraryFilterConfig: Array<any>) {
      this.libraryFilterConfig = libraryFilterConfig;
  }

  /**
  * This method returns the library filter config cache, for a particular session of the app
  *
  */
  getCachedLibraryFilterConfig(): Array<any> {
      return this.libraryFilterConfig;
  }

  /**
  * This method stores the rootOrganizations, for a particular session of the app
  *
  */
  setRootOrganizations(rootOrganizations: Array<any>) {
      this.rootOrganizations = rootOrganizations;
  }

  /**
  * This method returns the rootOrganizations cache, for a particular session of the app
  *
  */
  getCachedRootOrganizations(): Array<any> {
      return this.rootOrganizations;
  }

  /**
 * This method stores the courseFrameworkId, for a particular session of the app
 *
 */
  setCourseFrameworkId(courseFrameworkId: string) {
      this.courseFrameworkId = courseFrameworkId;
  }

  /**
  * This method returns the courseFrameworkId cache, for a particular session of the app
  *
  */
  getCachedCourseFrameworkId(): string {
      return this.courseFrameworkId;
  }

  /**
   * @returns {string} UserId or empty string if not available
   */
  getUserId(): string | undefined {
      if (!this.session) {
        this.authService.getSession().toPromise()
          .then((session) => {
              this.session = session;
          });
      }

    if (this.session) {
      return this.session.userToken;
    }

    return undefined;
  }

  readConfig() {
      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CARDS)
          .then(response => {
              this.DISPLAY_ONBOARDING_CARDS = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_ONBOARDING_CARDS = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE)
          .then(response => {
              this.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_PAGE)
          .then(response => {
              this.DISPLAY_ONBOARDING_PAGE = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_ONBOARDING_PAGE = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER)
          .then(response => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER)
          .then(response => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER)
          .then(response => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT)
          .then(response => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT)
          .then(response => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = false;
          });
      this.utilityService.getBuildConfigValue(GenericAppConfig.TRACK_USER_TELEMETRY)
          .then(response => {
              this.TRACK_USER_TELEMETRY = response === 'true' ? true : false;
          })
          .catch(error => {
              this.TRACK_USER_TELEMETRY = false;
          });
      this.utilityService.getBuildConfigValue(GenericAppConfig.CONTENT_STREAMING_ENABLED)
          .then(response => {
              this.CONTENT_STREAMING_ENABLED = response === 'true' ? true : false;
          })
          .catch(error => {
              this.CONTENT_STREAMING_ENABLED = false;
          });

      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_SCAN_PAGE)
          .then(response => {
              this.DISPLAY_ONBOARDING_SCAN_PAGE = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_ONBOARDING_SCAN_PAGE = false;
          });
      this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE)
          .then(response => {
              this.DISPLAY_ONBOARDING_CATEGORY_PAGE = response === 'true' ? true : false;
          })
          .catch(error => {
              this.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
          });
      this.utilityService.getBuildConfigValue(GenericAppConfig.OPEN_RAPDISCOVERY_ENABLED)
          .then(response => {
              this.OPEN_RAPDISCOVERY_ENABLED = response === 'true' ? true : false;
          })
          .catch(error => {
              this.OPEN_RAPDISCOVERY_ENABLED = false;
          });
      this.utilityService.getBuildConfigValue(GenericAppConfig.SUPPORT_EMAIL)
          .then(response => {
              this.SUPPORT_EMAIL = response;
          })
          .catch(() => {
              this.SUPPORT_EMAIL = '';
          });
  }

  setOnBoardingCompleted() {
      this.isOnBoardingCompleted = true;
      this.preferences.putString(PreferenceKey.IS_ONBOARDING_COMPLETED, 'true').toPromise().then();
  }

  private initValues() {
      this.readConfig();

      this.authService.getSession().toPromise().then((session) => {
          if (!session) {
              this.getGuestUserInfo();
          } else {
              this.guestProfileType = undefined;
              this.isGuestUser = false;
              this.session = session;
          }
          this.getCurrentUserProfile();
      });

      this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise()
          .then((result) => {
              this.isOnBoardingCompleted = (result === 'true') ? true : false;
          });
  }

  private getCurrentUserProfile() {
      this.profile.getActiveSessionProfile({requiredFields: ProfileConstants.REQUIRED_FIELDS}).toPromise()
          .then((response: any) => {
              this.guestUserProfile = response;
              if (this.guestUserProfile.syllabus && this.guestUserProfile.syllabus.length > 0) {
                  this.getFrameworkDetails(this.guestUserProfile.syllabus[0])
                      .then((categories) => {
                          categories.forEach(category => {
                              this.frameworkData[category.code] = category;
                          });

                          this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                      }).catch(() => {
                          this.frameworkData = [];
                          this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                      });
                  this.getProfileSettingsStatus();
              } else {
                  this.frameworkData = [];
                  this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
              }
          })
          .catch((error) => {
              console.error(error);
              this.guestUserProfile = undefined;
              this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
          });
  }

  // Remove this method after refactoring formandframeworkutil.service
  private getFrameworkDetails(frameworkId: string): Promise<any> {
      return new Promise((resolve, reject) => {
          const frameworkDetailsRequest: FrameworkDetailsRequest = {
              frameworkId: frameworkId || '',
              requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
          };
          this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
              .then((framework: Framework) => {
                  resolve(framework.categories);
              })
              .catch(error => {
                  reject(error);
              });
      });
  }

  public getGuestUserInfo(): Promise<string> {
      return new Promise((resolve, reject) => {
          this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
              .then(val => {
                  if (val) {
                      if (val === ProfileType.STUDENT) {
                          this.guestProfileType = ProfileType.STUDENT;
                      } else if (val === ProfileType.TEACHER) {
                          this.guestProfileType = ProfileType.TEACHER;
                      } else if (val === 'student') {
                          this.guestProfileType = ProfileType.STUDENT;
                      } else if (val === 'teacher') {
                          this.guestProfileType = ProfileType.TEACHER;
                      }
                      this.isGuestUser = true;
                      resolve(this.guestProfileType);
                  }
              }).catch(() => {
            reject()
          });
      });
  }

  private listenForEvents() {
      this.event.subscribe(AppGlobalService.USER_INFO_UPDATED, () => {
          this.initValues();
      });

      this.event.subscribe('refresh:profile', () => {
          this.initValues();
      });

      this.event.subscribe('refresh:loggedInProfile', () => {
          this.initValues();
      });

  }

async openPopover(upgradeType: any) {
    let shouldDismissAlert = true;

    if (upgradeType.upgrade.type === 'force') {
        shouldDismissAlert = false;
    }

    const options: PopoverOptions = {
        component: UpgradePopoverComponent,
        componentProps: { type: upgradeType },
        cssClass: 'upgradePopover',
        showBackdrop: true,
        backdropDismiss: shouldDismissAlert
    };

    const popover = await this.popoverCtrl.create(options);
    await popover.present();
}

  generateConfigInteractEvent(pageId: string, isOnBoardingCompleted?: boolean) {
      if (this.isGuestUser) {
          const paramsMap = new Map();
          if (pageId !== PageId.PROFILE) {
              paramsMap['isOnBoardingPageConfigEnabled'] = this.DISPLAY_ONBOARDING_PAGE;
              paramsMap['isOnBoardingCardsConfigEnabled'] = this.DISPLAY_ONBOARDING_CARDS;
              paramsMap['isProfileSettingsCompleted'] = isOnBoardingCompleted;
          }
          const profileType = this.getGuestUserType();
          if (profileType === ProfileType.TEACHER) {
              switch (pageId) {
                  case PageId.LIBRARY: {
                      paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER;
                      break;
                  }
                  case PageId.COURSES: {
                      paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER;
                      break;
                  }
                  case PageId.GUEST_PROFILE: {
                      paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER;
                      break;
                  }
              }

          } else {
              switch (pageId) {
                  case PageId.LIBRARY: {
                      paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT;
                      break;
                  }
                  case PageId.GUEST_PROFILE: {
                      paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT;
                      break;
                  }
              }
          }

          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
              InteractSubtype.INITIAL_CONFIG,
              Environment.HOME,
              pageId,
              undefined,
              paramsMap
          );
      }
  }

  generateAttributeChangeTelemetry(oldAttribute, newAttribute, pageId, env?) {
    if (this.TRACK_USER_TELEMETRY) {
        const values = new Map();
        values['oldValue'] = oldAttribute;
        values['newValue'] = newAttribute;

        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.PROFILE_ATTRIBUTE_CHANGED,
            env ? env : Environment.USER,
            pageId,
            undefined,
            values);
    }
}

  generateSaveClickedTelemetry(profile, validation, pageId, interactSubtype) {
      if (this.TRACK_USER_TELEMETRY) {
          const values = new Map();
          values['profile'] = profile;
          values['validation'] = validation;

          this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
              interactSubtype,
              Environment.USER,
              pageId,
              undefined,
              values);
      }
  }

  setAverageTime(time) {
      this.averageTime = time;
  }

  getAverageTime() {
      return this.averageTime;
  }

  setAverageScore(averageScore: any): any {
      this.averageScore = averageScore;
  }

  getAverageScore() {
      return this.averageScore;
  }

  getProfileSettingsStatus(): Promise<any> {
      return new Promise((resolve, reject) => {
          const profile = this.getCurrentUser();
          this.isProfileSettingsCompleted = Boolean(this.isGuestUser
              && profile
              && profile.syllabus && profile.syllabus[0]
              && profile.board && profile.board.length
              && profile.grade && profile.grade.length
              && profile.medium && profile.medium.length);
          resolve(this.isProfileSettingsCompleted);
      });
  }


  ngOnDestroy() {
      this.event.unsubscribe(AppGlobalService.USER_INFO_UPDATED);
      this.event.unsubscribe('refresh:profile');
  }

  setSelectedBoardMediumGrade(selectedBoardMediumGrade: string): void {
      this.selectedBoardMediumGrade = selectedBoardMediumGrade;
  }

  getSelectedBoardMediumGrade(): string {
      return this.selectedBoardMediumGrade;
  }
    
  getIsPermissionAsked(key: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {

    this.preferences.getString(PreferenceKey.APP_PERMISSION_ASKED).subscribe(
        (permissionAsked: string | undefined) => {
           if (!permissionAsked) {
            this.preferences.putString(PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(this.isPermissionAsked)).toPromise().then();
            observer.next(false);
            observer.complete();
            return;
           } else {
               observer.next(JSON.parse(permissionAsked)[key]);
               observer.complete();
               return;
           }
       });
    });
}

setIsPermissionAsked(key: string, value: boolean): void {

    this.preferences.getString(PreferenceKey.APP_PERMISSION_ASKED).subscribe(
        (permissionAsked: string | undefined) => {
            if (!permissionAsked) {
            this.preferences.putString(PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(this.isPermissionAsked)).toPromise().then();
            return;
            } else {
                permissionAsked = JSON.parse(permissionAsked);
                permissionAsked[key] = value;
                this.preferences.putString(PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(permissionAsked)).toPromise().then();
                return;
            }
        });
}

}
