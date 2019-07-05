import { Injectable, Inject } from '@angular/core';
import { Router, CanLoad, ActivatedRouteSnapshot } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { GenericAppConfig, PreferenceKey, ProfileConstants } from '../app/app.constant';
import {
  AuthService, ErrorEventType, EventNamespace, EventsBusService, ProfileService, ProfileType, SharedPreferences,
  SunbirdSdk, TelemetryAutoSyncUtil, TelemetryService, NotificationService
} from 'sunbird-sdk';
import { AppGlobalService } from './app-global-service.service';
import { UtilityService } from './utility-service';
import { CommonUtilService } from './common-util.service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { Observable } from 'rxjs-compat';
import { threadId } from 'worker_threads';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad {

  constructor(
    private router: Router,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appGlobalService: AppGlobalService,
    private utilityService: UtilityService,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
  ) {

  }

  canLoad(route: Route): boolean {
    console.log('route : ', route);
    return true;
    // const session = Observable.from(this.routeToAppropriatePage().then((result) => {
    //   console.log('route result', result);
    //   if (!result) {
    //     return false;
    //   }
    // }, (err) => {
    //   console.log('route result error', err);
    //   return true;
    // });
  }

  async routeToAppropriatePage() {
    console.log('inside routeToAppropriatePage');
    const session = await this.authService.getSession().toPromise();
    let returnval;
    if (!session) {
      console.log('inside !session, before await');
      returnval = await this.handleNoSession(session);
      console.log('inside !session, after await');
    } else {
      console.log('inside !session- else, before await');
      returnval = await this.handleSession(session);
      console.log('inside !session- else, after await');
    }
    return returnval;
  }

  handleNoSession(session) {
    console.log(`Success Platform Session`, session);
    this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
      .then(async (profileType: ProfileType | undefined) => {
        console.log('handleNoSession inside profile service-------result');
        if (!profileType) {
          this.appGlobalService.isProfileSettingsCompleted = false;
          // migration-TODO
          // this.rootPage = LanguageSettingsPage;
          this.router.navigate(['./language-settings']);
          return true;
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
          this.router.navigate(['/tabs']);
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
            this.router.navigate(['/tabs']);
          } else {
            this.appGlobalService.isProfileSettingsCompleted = false;
            try {
              if ((await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise()) === 'true') {
                this.getProfileSettingConfig(true);
              } else {
                // migration-TODO
                // await this.nav.insertPages(0, [{ page: LanguageSettingsPage }, { page: UserTypeSelectionPage }]);
              }
            } catch (e) {
              this.getProfileSettingConfig();
            }
          }
        }
      });
  }
  handleSession(session) {
    console.log(`Failure Session`, session);
    this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise()
      .then(async (profile: any) => {
        console.log('handleSession inside profile service-------result');
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
                this.router.navigate(['/tabs']);
                // migration-TODO
                // initTabs(this.containerService, LOGIN_TEACHER_TABS);
              } else {
                // migration-TODO
                // this.nav.setRoot(CategoriesEditPage, {
                //   showOnlyMandatoryFields: true,
                //   profile: value['profile']
                // });
                this.router.navigate(['categories-edit'],
                  {
                    state: {
                      showOnlyMandatoryFields: true,
                      profile: value['profile']
                    }
                  });
              }
            });
        }
      });
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
}
