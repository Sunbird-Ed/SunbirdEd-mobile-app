import { Injectable, Inject } from '@angular/core';
import { Router, ActivatedRoute, Resolve, NavigationExtras, ActivatedRouteSnapshot } from '@angular/router';
import { ProfileType, SharedPreferences } from 'sunbird-sdk';
import { OnboardingScreenType, PreferenceKey, RouterLinks } from '@app/app/app.constant';
import {SplashScreenService} from '@app/services';
import { OnboardingConfigurationService } from '@app/services/onboarding-configuration.service';

@Injectable()
export class HasNotSelectedUserTypeGuard implements Resolve<any> {
    private guardActivated: boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private splashScreenService: SplashScreenService,
        private onboardingConfigurationService: OnboardingConfigurationService
    ) { }

    async resolve(route: ActivatedRouteSnapshot): Promise<any> {

        if (await this.onboardingConfigurationService.skipOnboardingStep(OnboardingScreenType.USER_TYPE_SELECTION)) {
            if (await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise() === ProfileType.ADMIN) {
                this.router.navigate([RouterLinks.SIGN_IN], { state: { hideBackBtn: true } });
                this.splashScreenService.handleSunbirdSplashScreenActions();
            } else {
                this.navigateToProfileSettings();
            }
            return false;
        }

        if (route.queryParams.onReload === 'true') {
            this.guardActivated = true;
        }

        if (this.guardActivated) {
            return true;
        }

        this.guardActivated = true;
        if (this.activatedRoute.snapshot.params['comingFrom'] === 'UserTypeSelection') {
            return true;
        }

        const selectedUser = await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        if (selectedUser) {
            this.navigateToProfileSettings()
            return false;
        }
        this.splashScreenService.handleSunbirdSplashScreenActions();
        return true;
    }

    private navigateToProfileSettings(){
        const navigationExtras: NavigationExtras = {
            state: {
                forwardMigration: true
            }
        };
        this.router.navigate(['/', RouterLinks.PROFILE_SETTINGS], navigationExtras);
    }
}
