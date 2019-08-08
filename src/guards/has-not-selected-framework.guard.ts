import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router, ActivatedRoute, Resolve } from '@angular/router';
import { SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GenericAppConfig, ProfileConstants } from '@app/app/app.constant';
import { UtilityService } from '@app/services/utility-service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class HasNotSelectedFrameworkGuard implements Resolve<any> {
    guardActivated:boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private appGlobalService: AppGlobalService,
        private utilityService: UtilityService,
        private router: Router,
        private activatedRoute: ActivatedRoute
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
        if(this.guardActivated) {
            return true;
        }
        this.guardActivated = true;
        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE).then((shouldDisplay) => {
            this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise().then((profile)=>{
                if (shouldDisplay && !HasNotSelectedFrameworkGuard.isProfileComplete(profile)) {
                    this.appGlobalService.hideSplashScreen(1500);
                    return true;
                } else {
                    this.appGlobalService.isProfileSettingsCompleted = true;
                    this.appGlobalService.hideSplashScreen(1500);
                    this.router.navigate(['/', 'tabs']);
                }
                
            });
        });
    }
}
