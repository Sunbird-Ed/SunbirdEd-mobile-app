import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationExtras, Resolve, Router } from '@angular/router';
import { OnboardingScreenType, PreferenceKey } from '../app/app.constant';
import { OnboardingConfigurationService } from '../services/onboarding-configuration.service';
import { SplashScreenService } from '../services/splash-screen.service';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';

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
            await this.navigateToUserTypeSelection();
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
            await this.navigateToUserTypeSelection();
            return false;
        }
        await this.splashScreenService.handleSunbirdSplashScreenActions();
        return true;
    }

    private async navigateToUserTypeSelection(){
        const navigationExtras: NavigationExtras = {
            state: {
                forwardMigration: true
            }
        };
        await this.router.navigate(['/', 'user-type-selection'], navigationExtras);
    }
}
