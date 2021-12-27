import { Injectable, Inject } from '@angular/core';
import { Router, Resolve } from '@angular/router';
import { ProfileService } from 'sunbird-sdk';
import { GenericAppConfig, ProfileConstants } from '@app/app/app.constant';
import { UtilityService } from '@app/services/utility-service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { Platform } from '@ionic/angular';

@Injectable()
export class HasNotSelectedFrameworkGuard implements Resolve<any> {
    guardActivated: boolean;
    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private appGlobalService: AppGlobalService,
        private utilityService: UtilityService,
        private router: Router,
        private platform: Platform,
        private splashScreenService: SplashScreenService
    ) {
    }

    private static isProfileComplete(profile?): boolean {
        return profile
            && profile.syllabus && profile.syllabus[0]
            && profile.board && profile.board.length
            && profile.grade && profile.grade.length
            && profile.medium && profile.medium.length;
    }

    resolve(): any {
        if (this.guardActivated) {
            return true;
        }
        if(this.platform.is('ios')) {
            this.router.navigate(['/', 'user-type-selection']);
            return false;
        }
        this.guardActivated = true;
        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE).then((shouldDisplay) => {
            this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
                .then((profile) => {
                    if (shouldDisplay && !HasNotSelectedFrameworkGuard.isProfileComplete(profile)) {
                        this.splashScreenService.handleSunbirdSplashScreenActions();
                        return true;
                    } else {
                        this.appGlobalService.isProfileSettingsCompleted = true;
                        this.splashScreenService.handleSunbirdSplashScreenActions();
                        this.router.navigate(['/', 'tabs']);
                    }
                });
        });
    }
}
