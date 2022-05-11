import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ProfileType, SharedPreferences } from 'sunbird-sdk';

@Injectable()
export class UserTypeGuard implements CanActivate {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router,
        public appGlobalService: AppGlobalService,
    ) {
    }
    async canActivate(): Promise<boolean> {
        const isAdminUser = (await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise() === ProfileType.ADMIN);
        if (isAdminUser && this.appGlobalService.isUserLoggedIn()) {
            this.router.navigate([`/${RouterLinks.HOME_TAB}/admin`]);
        } else {
            this.router.navigate([`/${RouterLinks.HOME_TAB}/user`]);
        }
        return false;
    }
}
