import { Injectable, Inject } from '@angular/core';
import { Router, Resolve, NavigationExtras } from '@angular/router';
import { Platform } from '@ionic/angular';

import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { OnboardingScreenType, ProfileConstants, RouterLinks } from '../app/app.constant';
import { AppGlobalService } from '../services/app-global-service.service';
import { SplashScreenService } from '../services/splash-screen.service';
import { OnboardingConfigurationService } from '../services/onboarding-configuration.service';
import { CommonUtilService } from '../services/common-util.service';
import { Events } from '../util/events';

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
        private commonUtilService: CommonUtilService,
        private events: Events,
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
        if (await this.onboardingConfigurationService.skipOnboardingStep(OnboardingScreenType.PROFILE_SETTINGS)) {
            await this.navigateToNext();
            return false;
        }

        if (this.guardActivated) {
            return true;
        }

        this.guardActivated = true;
        const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        if (!HasNotSelectedFrameworkGuard.isProfileComplete(profile)) {
            // TODO: Capacitor temp fix 
            // await this.splashScreenService.handleSunbirdSplashScreenActions();
            return true;
        }

        await this.navigateToNext();
        return false;
    }

    private async navigateToNext() {
        this.appGlobalService.isProfileSettingsCompleted = true;
        // TODO: Capacitor temp fix 
        // await this.splashScreenService.handleSunbirdSplashScreenActions();

        if (await this.commonUtilService.isDeviceLocationAvailable()) {
            await this.appGlobalService.setOnBoardingCompleted();
            await this.router.navigate([`/${RouterLinks.TABS}`]);
        } else {
            await this.navigateToDistrictMapping();
        }
    }

    private async navigateToDistrictMapping() {
        if (await this.onboardingConfigurationService.skipOnboardingStep(OnboardingScreenType.DISTRICT_MAPPING)) {
            const navigationExtras: NavigationExtras = {
                state: {
                    loginMode: 'guest'
                }
            };
            await this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
            this.events.publish('update_header');
        } else {
            const navigationExtras: NavigationExtras = {
                state: {
                    isShowBackButton: (this.onboardingConfigurationService.initialOnboardingScreenName !== OnboardingScreenType.DISTRICT_MAPPING)
                }
            };
            await this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        }
    }
}
