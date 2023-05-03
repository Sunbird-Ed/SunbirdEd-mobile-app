import { Injectable, Inject } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { SharedPreferences, AuthService } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { SplashScreenService} from '@app/services/splash-screen.service';

@Injectable()
export class HasNotBeenOnboardedGuard implements CanLoad {
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        @Inject('AUTH_SERVICE') public authService: AuthService,
        private appGlobalService: AppGlobalService,
        private router: Router,
        private splashScreenService: SplashScreenService
    ) {
    }

    async canLoad(): Promise<boolean> {
        const isOnboardCompleted = (await this.sharedPreferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true');
        const session = await this.authService.getSession().toPromise();
        if (!isOnboardCompleted && !session) {
            this.appGlobalService.isProfileSettingsCompleted = false;
            return true;
        }

        this.appGlobalService.isProfileSettingsCompleted = true;
        this.router.navigate(['/', 'tabs']);
        this.splashScreenService.handleSunbirdSplashScreenActions();
        return false;
    }
}
