import { Inject, Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import {
  AuthService, ProfileService, ProfileType, SharedPreferences
} from 'sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../../app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '../telemetry-constants';
import { ContainerService } from '../container.services';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class LogoutHandlerService {
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private containerService: ContainerService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router
  ) {
  }

  public onLogout() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      return this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }

    this.generateLogoutInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.LOGOUT_INITIATE, '');

    this.preferences.getString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN).pipe(
      tap(async (guestUserId: string) => {
        if (!guestUserId) {
          await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
        } else {
          const allProfileDetais = await this.profileService.getAllProfiles().toPromise();
          const currentProfile = allProfileDetais.find(ele => ele.uid === guestUserId);
          const guestProfileType = (currentProfile && currentProfile.profileType) ? currentProfile.profileType : ProfileType.NONE;
          await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, guestProfileType).toPromise();
        }

        splashscreen.clearPrefs();
      }),
      mergeMap((guestUserId: string) => {
        return this.profileService.setActiveSessionForProfile(guestUserId);
      }),
      mergeMap(() => {
        return this.authService.resignSession();
      }),
      tap(async () => {
        await this.navigateToAptPage();
        this.events.publish(AppGlobalService.USER_INFO_UPDATED);
        this.appGlobalService.setEnrolledCourseList([]);
      })
    ).subscribe();
  }

  private async navigateToAptPage() {
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();

    await this.appGlobalService.getGuestUserInfo();

    if (selectedUserType === ProfileType.STUDENT) {
      initTabs(this.containerService, GUEST_STUDENT_TABS);
    } else if (this.commonUtilService.isAccessibleForNonStudentRole(selectedUserType)) {
      initTabs(this.containerService, GUEST_TEACHER_TABS);
    }

    this.events.publish('UPDATE_TABS');

    const isOnboardingCompleted = (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ?
      true : false;
    if (isOnboardingCompleted) {
      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = { queryParams: { reOnboard: true } };
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    }

    this.generateLogoutInteractTelemetry(InteractType.OTHER, InteractSubtype.LOGOUT_SUCCESS, '');
  }

  private generateLogoutInteractTelemetry(interactType: InteractType, interactSubtype: InteractSubtype, uid: string) {
    const valuesMap = {};
    valuesMap['UID'] = uid;
    this.telemetryGeneratorService.generateInteractTelemetry(interactType,
      interactSubtype,
      Environment.HOME,
      PageId.LOGOUT,
      undefined,
      valuesMap
    );
  }
}
