import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router, ActivatedRoute, Resolve, NavigationExtras } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { Observable } from 'rxjs';

@Injectable()
export class HasNotSelectedUserTypeGuard implements Resolve<any> {
    guardActivated:boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { 
    }

    resolve(): any {
        if(this.guardActivated) {
            return true;
        }
        this.guardActivated = true;
        if (this.activatedRoute.snapshot.params['comingFrom'] === 'UserTypeSelection') {
            return true;
        }
        this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise().then((selectedUser) => {
            if(selectedUser) {
                const navigationExtras: NavigationExtras = {
                    state: {
                      forwardMigration: true
                    }
                  };
                this.router.navigate(['/', 'profile-settings'],navigationExtras);
            } else {
                splashscreen.hide();
                return true;
            }
        });
    }
}
