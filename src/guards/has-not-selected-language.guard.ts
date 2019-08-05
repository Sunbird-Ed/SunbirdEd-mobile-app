import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';

@Injectable()
export class HasNotSelectedLanguageGuard implements CanLoad {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router
    ) {
    }

    async canLoad(): Promise<boolean> {
        if (!(await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise())) {
            return true;
        }

        this.router.navigate(['/', 'user-type-selection']);
    }
}
