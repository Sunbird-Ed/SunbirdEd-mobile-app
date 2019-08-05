import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router, ActivatedRoute } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';

@Injectable()
export class HasNotSelectedUserTypeGuard implements CanLoad {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
    }

    async canLoad(): Promise<boolean> {
        if (this.activatedRoute.snapshot.params['comingFrom'] === 'UserTypeSelection') {
            return true;
        }

        if (!(await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise())) {
            return true;
        }

        this.router.navigate(['/', 'profile-settings']);
    }
}
