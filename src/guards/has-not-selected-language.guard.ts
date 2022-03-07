import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationExtras, Resolve, Router } from '@angular/router';
import { OnboardingScreenType, PreferenceKey } from '@app/app/app.constant';
import { OnboardingConfigurationService } from '@app/services/onboarding-configuration.service';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { SharedPreferences } from 'sunbird-sdk';

@Injectable()
export class HasNotSelectedLanguageGuard implements Resolve<any> {
    private guardActivated: boolean;
    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        private router: Router,
        private splashScreenService: SplashScreenService,
        private onboardingConfigurationService: OnboardingConfigurationService
    ) { }

    async resolve(route: ActivatedRouteSnapshot): Promise<any> {

        if(await this.onboardingConfigurationService.skipOnboardingStep(OnboardingScreenType.LANGUAGE_SETTINGS)){
            this.navigateToUserTypeSelection();
            return false;
        }

        if (route.queryParams.onReload === 'true') {
            this.guardActivated = true;
        }

        if (this.guardActivated) {
            return true;
        }

        this.guardActivated = true;
        const selectedLanguage = await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
        if (selectedLanguage) {
            this.navigateToUserTypeSelection();
            return false;
        }
        this.splashScreenService.handleSunbirdSplashScreenActions();
        return true;
    }

    private navigateToUserTypeSelection(){
        const navigationExtras: NavigationExtras = {
            state: {
                forwardMigration: true
            }
        };
        this.router.navigate(['/', 'user-type-selection'], navigationExtras);
    }
}
