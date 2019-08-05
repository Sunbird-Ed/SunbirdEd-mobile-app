import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';

@Injectable()
export class HasNotBeenOnboardedGuard implements CanLoad {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private router: Router
    ) {
    }

    async canLoad(): Promise<boolean> {
        if (!(await this.sharedPreferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true')) {
            this.appGlobalService.isProfileSettingsCompleted = false;
            return true;
        }

        this.appGlobalService.isProfileSettingsCompleted = true;
        this.router.navigate(['/', 'tabs']);

        return false;
    }
}
