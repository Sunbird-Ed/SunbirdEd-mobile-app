import { Router } from '@angular/router';
import { Component,EventEmitter, Inject } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { InteractType, InteractSubtype, Environment, PageId } from 'src/services/telemetry-constants';
import {
  AppHeaderService,
  TelemetryGeneratorService,
  CommonUtilService,
  AppGlobalService,
  UtilityService,
  FormAndFrameworkUtilService,
  ContainerService
} from 'src/services';
import { ProfileService, AuthService, SharedPreferences, ProfileType } from 'sunbird-sdk';
import { PreferenceKey, GenericAppConfig, ProfileConstants } from './app.constant';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home',
      data: ''
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list',
      data: ''
    },
    {
      title: 'Language Settings',
      url: '/language-settings',
      icon: 'globe',
      data: 'true'
    },
    {
      title: 'User Type Selection',
      url: '/user-type-selection',
      icon: 'list',
      data: 'false'
    }
  ];
  public headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search'],
  };
  public sideMenuEvent = new EventEmitter
    ;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private utilityService: UtilityService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private containerService: ContainerService,
    private router: Router,
  ) {
    this.initializeApp();
    platform.ready().then(async () => {
      this.telemetryGeneratorService.genererateAppStartTelemetry(await utilityService.getDeviceSpec());
      await this.navigateToAppropriatePage();
    });
  }

  initializeApp() {
    this.headerService.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  handleHeaderEvents($event) {
    /*if ($event.name === 'back') {
      let navObj = this.app.getRootNavs()[0];
      let activeView: ViewController = this.nav.getActive();
      if (activeView != null && ((<any>activeView).instance instanceof TabsPage)) {
        navObj = this.app.getActiveNavs()[0];
        activeView = navObj.getActive();
      }
      if (((<any>activeView).instance instanceof UserTypeSelectionPage)
        || ((<any>activeView).instance instanceof EnrolledCourseDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsEtbPage)
        || ((<any>activeView).instance instanceof ContentDetailsPage)
        || ((<any>activeView).instance instanceof OnboardingPage)
        || ((<any>activeView).instance instanceof QrCodeResultPage)
        || ((<any>activeView).instance instanceof FaqPage)
        || ((<any>activeView).instance['pageId'] === 'ProfileSettingsPage')
      ) {
        this.headerServie.sidebarEvent($event);
        return;
      }
      if (navObj.canGoBack()) {
        return navObj.pop();
      } else {
        this.commonUtilService.showExitPopUp(this.activePageService.computePageId((<any>activeView).instance), Environment.HOME, false);
      }
    } else {*/
      this.headerService.sidebarEvent($event);
    //}
  }

  private async navigateToAppropriatePage() {
    const session = await this.authService.getSession().toPromise();
    console.log(`Platform Session`, session);
    if (!session) {
      console.log(`Success Platform Session`, session);
      this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
        .then(async (profileType: ProfileType | undefined) => {
          if (!profileType) {
            this.appGlobalService.isProfileSettingsCompleted = false;
            // migration-TODO
            // this.rootPage = LanguageSettingsPage;
            this.router.navigate(['settings/language-setting', false]);
            return;
          }

          switch (profileType.toLocaleLowerCase()) {
            case ProfileType.TEACHER: {
              await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
              // migration-TODO
              // initTabs(this.containerService, GUEST_TEACHER_TABS);
              break;
            }
            case ProfileType.STUDENT: {
              await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise();
              // migration-TODO
              // initTabs(this.containerService, GUEST_STUDENT_TABS);
              break;
            }
          }

          const display_cat_page: string = await this.utilityService
            .getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE);

          if (display_cat_page === 'false') {
            // migration-TODO
            // await this.nav.setRoot(TabsPage);
          } else {
            const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
              .toPromise();
            if (
              profile
              && profile.syllabus && profile.syllabus[0]
              && profile.board && profile.board.length
              && profile.grade && profile.grade.length
              && profile.medium && profile.medium.length
            ) {
              this.appGlobalService.isProfileSettingsCompleted = true;
              // migration-TODO
              // await this.nav.setRoot(TabsPage);
            } else {
              this.appGlobalService.isProfileSettingsCompleted = false;
              try {
                if ((await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise()) === 'true') {
                  this.getProfileSettingConfig(true);
                } else {
                  // migration-TODO
                  // await this.nav.insertPages(0, [{ page: LanguageSettingsPage }, { page: UserTypeSelectionPage }]);
                  this.router.navigate(['settings/language-setting', 'false']);
                }
              } catch (e) {
                this.getProfileSettingConfig();
              }
            }
          }
        });
    } else {
      console.log(`Failure Session`, session);
      this.profileService.getActiveSessionProfile({
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      }).toPromise()
        .then(async (profile: any) => {
          if (profile
            && profile.syllabus && profile.syllabus[0]
            && profile.board && profile.board.length
            && profile.grade && profile.grade.length
            && profile.medium && profile.medium.length) {

            // migration-TODO
            // initTabs(this.containerService, LOGIN_TEACHER_TABS);

            if ((await this.preferences.getString('SHOW_WELCOME_TOAST').toPromise()) === 'true') {
              this.preferences.putString('SHOW_WELCOME_TOAST', 'false').toPromise().then();

              const serverProfile = await this.profileService.getServerProfilesDetails({
                userId: session.userToken,
                requiredFields: ProfileConstants.REQUIRED_FIELDS,
              }).toPromise();

              this.commonUtilService
                .showToast(this.commonUtilService.translateMessage('WELCOME_BACK', serverProfile.firstName));
            }
            // migration-TODO
            // this.rootPage = TabsPage;
          } else {
            const serverProfile = await this.profileService.getServerProfilesDetails({
              userId: session.userToken,
              requiredFields: ProfileConstants.REQUIRED_FIELDS,
            }).toPromise();

            this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, profile)
              .then((value) => {
                if (value['status']) {
                  // migration-TODO
                  // this.nav.setRoot(TabsPage);
                  // initTabs(this.containerService, LOGIN_TEACHER_TABS);
                } else {
                  // migration-TODO
                  // this.nav.setRoot(CategoriesEditPage, {
                  //   showOnlyMandatoryFields: true,
                  //   profile: value['profile']
                  // });
                }
              });
          }
        });
    }
  }

  getProfileSettingConfig(hideBackButton = false) {
    this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE)
      .then(response => {
        if (response === 'true') {
          // migration-TODO
          // this.nav.setRoot('ProfileSettingsPage', { hideBackButton: hideBackButton });
        } else {
          // migration-TODO
          // this.nav.setRoot(TabsPage);
        }
      })
      .catch(error => {
        // migration-TODO
        // this.nav.setRoot(TabsPage);
      });
  }

  menuItemAction(menuName) {
    switch (menuName.menuItem) {
      case 'USERS_AND_GROUPS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.USER_GROUP_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );

        this.router.navigateByUrl('/user-and-groups');
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(UserAndGroupsPage, { profile: this.profile });
        // }
        break;

      case 'REPORTS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.REPORTS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO Add new routing
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(ReportsPage, { profile: this.profile });
        // }
        break;

      case 'SETTINGS': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SETTINGS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(SettingsPage);
        // }
        break;
      }
      case 'LANGUAGE': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.LANGUAGE_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(LanguageSettingsPage, {
        //     isFromSettings: true
        //   });
          this.router.navigate(['settings/language-setting', 'false']);
        /*if (this.app.getRootNavs().length > 0) {
          this.app.getRootNavs()[0].push(LanguageSettingsPage, {
            isFromSettings: true
          });
        }*/
        break;
      }
        break;

      case 'HELP':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.HELP_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(FaqPage, {
        //     isFromSettings: true
        //   });

        break;

      case 'LOGOUT':
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        } else {
          // migration-TODO
          // this.logoutHandlerService.onLogout();
        }
        break;

    }
  }
}
