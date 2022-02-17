import { Injectable, Inject } from '@angular/core';
import { Router, Resolve, NavigationExtras } from '@angular/router';
import { Platform } from '@ionic/angular';

import { ProfileService } from 'sunbird-sdk';
import { OnboardingScreenType, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import {
    AppGlobalService, 
    SplashScreenService, 
    OnboardingConfigurationService, 
    CommonUtilService
} from '@app/services';

@Injectable()
export class HasNotSelectedFrameworkGuard implements Resolve<any> {
    guardActivated: boolean;
    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private appGlobalService: AppGlobalService,
        private router: Router,
        private platform: Platform,
        private splashScreenService: SplashScreenService,
        private onboardingConfigurationService: OnboardingConfigurationService,
        private commonUtilService: CommonUtilService
    ) {
    }

    private static isProfileComplete(profile?): boolean {
        return profile
            && profile.syllabus && profile.syllabus[0]
            && profile.board && profile.board.length
            && profile.grade && profile.grade.length
            && profile.medium && profile.medium.length;
    }

    async resolve(): Promise<any> {
        if(await this.onboardingConfigurationService.skipOnboardingStep(OnboardingScreenType.PROFILE_SETTINGS)){
            this.navigateToNext();
            return false;
        }

        if (this.guardActivated) {
            return true;
        }
        if(this.platform.is('ios')) {
            this.router.navigate(['/', 'user-type-selection']);
            return false;
        }
        this.guardActivated = true;
        const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        if (!HasNotSelectedFrameworkGuard.isProfileComplete(profile)) {
            this.splashScreenService.handleSunbirdSplashScreenActions();
            return true;
        } else {
            this.navigateToNext();
            return false;
        }
    }

    async navigateToNext(){
        this.appGlobalService.isProfileSettingsCompleted = true;
        this.splashScreenService.handleSunbirdSplashScreenActions();

        if (await this.commonUtilService.isDeviceLocationAvailable()) {
            this.appGlobalService.setOnBoardingCompleted();
            this.router.navigate([`/${RouterLinks.TABS}`]);
        } else {
            const navigationExtras: NavigationExtras = {
                state: {
                    isShowBackButton: true
                }
            };
            this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        }
    }
}
