import { Inject, Injectable } from "@angular/core";
import { PreferenceKey } from "@app/app/app.constant";
import { SharedPreferences } from 'sunbird-sdk';
import onboarding from './../assets/configurations/config.json';

interface OnBoardingConfig {
    name: string;
    required: boolean;
    skip: boolean;
    default: any;
}

@Injectable({
    providedIn: 'root'
})
export class OnboardingConfigurationService {

    onBoardingConfig: { onboarding: Array<OnBoardingConfig> };

    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    ) {
        this.onBoardingConfig = onboarding;
    }

    nextOnboardingStep(currentPage) {
        const config = this.onBoardingConfig.onboarding.find(obj => {
            return obj.name === currentPage;
        });
        console.log('Configuration :', config);
        switch(config.name) {
            case 'language-setting':
                if (config) {
                    console.log('Configuration inside if', config.required);
                    if (config.skip) {
                        this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, config.default.code).toPromise();
                        this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, config.default.label).toPromise();
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
                break;
            case 'user-type-selection':
                if (config) {
                    console.log('Configuration inside if', config.required);
                    if (config.skip) {
                        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, config.default).toPromise()
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
                break;
            default:
                return true;
                break;
        }
    }

}
