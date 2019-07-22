import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router, ActivatedRoute } from '@angular/router';
import { SharedPreferences, ProfileService } from 'sunbird-sdk';
import { GenericAppConfig, ProfileConstants } from '@app/app/app.constant';
import { UtilityService, AppGlobalService } from '@app/services';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class HasNotSelectedFrameworkGuard implements CanLoad, CanDeactivate<any> {
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

    async canLoad(): Promise<boolean> {
        const shouldDisplay: boolean = (await this.utilityService
            .getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE)) === 'true';

        const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
              .toPromise();

        if (shouldDisplay && !HasNotSelectedFrameworkGuard.isProfileComplete(profile)) {
            return true;
        }

        this.appGlobalService.isProfileSettingsCompleted = true;
        this.router.navigate(['/', 'tabs']);

        return false;
    }

    async canDeactivate(): Promise<boolean> {
        return false;
    }
}
