import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router, Resolve, NavigationExtras } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { Observable } from 'rxjs';

@Injectable()
export class HasNotSelectedLanguageGuard implements Resolve<any> {
    guardActivated:boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private router: Router
    ) {
    }

    resolve(): any {
        if(this.guardActivated) {
            return true;
        }
        this.guardActivated = true;
        this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise().then((selectedLanguage) => {
            if(selectedLanguage) {
                const navigationExtras: NavigationExtras = {
                    state: {
                      forwardMigration: true
                    }
                  };
                this.router.navigate(['/', 'user-type-selection'],navigationExtras);
            } else {
                splashscreen.markImportDone();
                splashscreen.hide();
                return true;
            }
        });
    }
}
