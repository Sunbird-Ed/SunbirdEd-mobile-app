import { Injectable, Inject } from '@angular/core';
import { Router, ActivatedRoute, Resolve, NavigationExtras } from '@angular/router';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey, EventTopics } from '@app/app/app.constant';
import { Events } from '@ionic/angular';

@Injectable()
export class HasNotSelectedUserTypeGuard implements Resolve<any> {
    private guardActivated: boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private events: Events
    ) {
        this.events.subscribe(EventTopics.REONBOARD_ENABLE_BACK_BTN, () => {
            this.guardActivated = true;
        });
    }

    resolve(): any {
        if (this.guardActivated) {
            return true;
        }
        this.guardActivated = true;
        if (this.activatedRoute.snapshot.params['comingFrom'] === 'UserTypeSelection') {
            return true;
        }
        this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise().then((selectedUser) => {
            if (selectedUser) {
                const navigationExtras: NavigationExtras = {
                    state: {
                        forwardMigration: true
                    }
                };
                this.router.navigate(['/', 'profile-settings'], navigationExtras);
            } else {
                return true;
            }
        });
    }
}
