import { Inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Events } from '@app/util/events';
import { Platform } from '@ionic/angular';
import { mergeMap, tap } from 'rxjs/operators';
import {
  AuthService, ProfileService, ProfileType, SharedPreferences
} from 'sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../../app/app.constant';
import { ContainerService } from '../container.services';
import { SegmentationTagService } from '../segmentation-tag/segmentation-tag.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '../telemetry-constants';

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
    private router: Router,
    private segmentationTagService: SegmentationTagService,
    private platform: Platform
  ) {
  }

  public onLogout() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      return this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }

    if(this.platform.is('ios')){
      this.profileService.getActiveProfileSession().toPromise()
      .then((profile) => {
        this.profileService.deleteProfile(profile.uid).subscribe()
      });
    }

    this.segmentationTagService.persistSegmentation();

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
        if(window.splashscreen && splashscreen){
          splashscreen.clearPrefs();
        }
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
        this.segmentationTagService.getPersistedSegmentaion();
      })
    ).subscribe();
  }

  private async navigateToAptPage() {
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();

    await this.appGlobalService.getGuestUserInfo();

    const isOnboardingCompleted = (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ?
      true : false;
    if (selectedUserType === ProfileType.ADMIN && !isOnboardingCompleted) {
      this.router.navigate([RouterLinks.USER_TYPE_SELECTION]);
    } else {
      this.events.publish('UPDATE_TABS');
    }

    if (selectedUserType === ProfileType.STUDENT) {
      initTabs(this.containerService, GUEST_STUDENT_TABS);
    } else if (this.commonUtilService.isAccessibleForNonStudentRole(selectedUserType) && selectedUserType !== ProfileType.ADMIN) {
      initTabs(this.containerService, GUEST_TEACHER_TABS);
    }

    if (isOnboardingCompleted) {
      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    } else if (selectedUserType !== ProfileType.ADMIN) {
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
