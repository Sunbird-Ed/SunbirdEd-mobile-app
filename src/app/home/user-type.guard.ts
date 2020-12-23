import { Injectable, Inject } from '@angular/core';
import { SharedPreferences, ProfileType } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { CanActivate, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Injectable()
export class UserTypeGuard implements CanActivate {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router
    ) {
    }

    async canActivate(): Promise<boolean> {
        const isAdminUser = (await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise() === ProfileType.ADMIN);
        if (isAdminUser) {
            this.router.navigate([`/${RouterLinks.HOME_TAB}/admin`]);
        } else {
            this.router.navigate([`/${RouterLinks.HOME_TAB}/user`]);
        }
        return false;
    }
}
