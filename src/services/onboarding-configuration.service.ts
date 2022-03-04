import { Inject, Injectable } from "@angular/core";
import { PreferenceKey, SwitchableTabsConfig } from '@app/app/app.constant';
import { ProfileType, SharedPreferences } from 'sunbird-sdk';
import { AppGlobalService } from '@app/services';
import onboarding from './../assets/configurations/config.json';

interface OnBoardingConfig {
    name: string;
    required: boolean;
    skip: boolean;
    default: any;
}
interface ICON {
    active: string;
    inactive: string;
    disabled?: string;
  }
interface TabConfig {
    name: string;
    root: string;
    icon?: ICON;
    label: string;
    index: number;
    isSelected?: boolean;
    status: string;
    disabled: boolean;
    theme: string;
    userTypeAdmin?: string;
  }

@Injectable({
    providedIn: 'root'
})
export class OnboardingConfigurationService {

    onBoardingConfig: { onboarding: Array<OnBoardingConfig> };
    tabList: { tab: Array<TabConfig> };

    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private appGlobalService: AppGlobalService
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

    initializedTabs(theme: string, userType: string) {
        if (userType === ProfileType.ADMIN) {
            return this.tabList = onboarding.tabs.filter((tab) => tab && tab.userTypeAdmin);
          } else if (theme === SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG) {
            if (this.appGlobalService.isUserLoggedIn()) {
              return this.findAllTabs('NEW', 'logIn');
            } else {
              return this.findAllTabs('NEW', 'guest');
            }
          } else {
            if (this.appGlobalService.isUserLoggedIn()) {
              return this.findAllTabs('OLD', 'logIn');
            } else {
              return this.findAllTabs('OLD', 'guest');
            }
          }
    }

    findAllTabs(theme: string, status: string) {
        return this.tabList = onboarding.tabs.filter((tab) =>
        (tab.theme === theme || tab.theme === 'ALL') && (tab.status === 'ALL' || tab.status === status));
      }

}
