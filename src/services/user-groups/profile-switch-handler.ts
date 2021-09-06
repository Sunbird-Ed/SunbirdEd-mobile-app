import { Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { Events } from '@app/util/events';
import { ProfileType, SharedPreferences, AuthService } from 'sunbird-sdk';

import { PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { initTabs, GUEST_STUDENT_TABS, GUEST_TEACHER_TABS } from '@app/app/module.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { ContainerService } from '@app/services//container.services';

@Injectable({
    providedIn: 'root'
})
export class ProfileSwitchHandler {
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('AUTH_SERVICE') private authService: AuthService,
        private container: ContainerService,
        private events: Events,
        private appGlobalService: AppGlobalService,
        private router: Router
    ) {
    }
    public switchUser(selectedProfile) {
        if (this.appGlobalService.isUserLoggedIn()) {
            this.authService.resignSession().subscribe();
            if(splashscreen){
                splashscreen.clearPrefs();
            }
        }
        setTimeout(() => {
            if (selectedProfile.profileType === ProfileType.STUDENT) {
                initTabs(this.container, GUEST_STUDENT_TABS);
            } else {
                initTabs(this.container, GUEST_TEACHER_TABS);
            }
            this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, selectedProfile.profileType).toPromise().then();
            this.events.publish('refresh:profile');
            this.events.publish(AppGlobalService.USER_INFO_UPDATED);
            this.appGlobalService.setSelectedUser(undefined);
            this.router.navigate([RouterLinks.TABS]);
        }, 1000);
    }
}
