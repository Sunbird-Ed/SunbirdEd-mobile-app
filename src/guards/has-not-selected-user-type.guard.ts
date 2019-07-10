import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services';

@Injectable()
export class HasNotSelectedUserTypeGuard implements CanLoad {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private router: Router
    ) {
    }

    async canLoad(): Promise<boolean> {
        if (!(await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise())) {
            return true;
        }

        this.router.navigate(['/', 'profile-settings']);
    }
}
