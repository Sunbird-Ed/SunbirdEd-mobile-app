import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationExtras, Resolve, Router } from '@angular/router';
import { PreferenceKey } from '@app/app/app.constant';
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

    resolve(route: ActivatedRouteSnapshot): any {
        if (!this.onboardingConfigurationService.nextOnboardingStep('language-setting')) {
            const navigationExtras: NavigationExtras = {
                state: {
                    forwardMigration: true
                }
            };
            this.router.navigate(['/', 'user-type-selection'], navigationExtras);
        }

        if (route.queryParams.onReload === 'true') {
            this.guardActivated = true;
        }

        if (this.guardActivated) {
            return true;
        }

        this.guardActivated = true;
        this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise().then((selectedLanguage) => {
            if (selectedLanguage) {
                const navigationExtras: NavigationExtras = {
                    state: {
                        forwardMigration: true
                    }
                };
                this.router.navigate(['/', 'user-type-selection'], navigationExtras);
            } else {
                this.splashScreenService.handleSunbirdSplashScreenActions();
                return true;
            }
        });
    }
}
