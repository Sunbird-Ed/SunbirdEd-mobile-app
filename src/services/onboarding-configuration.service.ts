import { Inject, Injectable } from "@angular/core";
import { OnboardingScreenType, PreferenceKey, SwitchableTabsConfig, ProfileConstants } from "../app/app.constant";
import { GUEST_TEACHER_TABS, initTabs } from "../app/module.service";
import { Events } from '../util/events';
import { DeviceRegisterService, Profile, ProfileService, ProfileSource, ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from "./app-global-service.service";
import { CommonUtilService } from "./common-util.service";
import { ContainerService } from "./container.services";
import onboarding from './../assets/configurations/config.json';
import { SegmentationTagService } from "./segmentation-tag/segmentation-tag.service";


interface OnBoardingConfig {
    name: string;
    skip: boolean;
    default: any;
    data?: Array<any>
    params?: { [key: string]: boolean }
}

interface Category {
    code: string;
    value: string;
    translation_key: string;
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
    disabled?: boolean;
    theme: string;
    userTypeAdmin?: boolean;
  }
  interface Theme {
    name?: string;
  }

@Injectable({
    providedIn: 'root'
})
export class OnboardingConfigurationService {

    onBoardingConfig: { 
        overriddenDefaultChannelId: string,
        theme: Theme
        onboarding: Array<OnBoardingConfig> ,
        categories: Array<Category>
    };
    initialOnboardingScreenName;
    tabList: Array<TabConfig>;

    constructor(
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
        private events: Events,
        private segmentationTagService: SegmentationTagService,
        private container: ContainerService,
        private appGlobalService: AppGlobalService,
        private commonUtilService: CommonUtilService,
    ) {
        this.onBoardingConfig = onboarding;
        this.checkInitialScreen();
    }

    // checking initial onboarding screen to handle back button
    private checkInitialScreen() {
        if (this.initialOnboardingScreenName === undefined) {
            const initialScreen = this.onBoardingConfig && this.onBoardingConfig.onboarding &&
                this.onBoardingConfig.onboarding.find(obj => (obj && !obj.skip));
            if (initialScreen) {
                this.initialOnboardingScreenName = initialScreen.name;
            }
        }
    }

    public async skipOnboardingStep(currentPage, isUserLoggedIn = false) {
        if(!this.onBoardingConfig || !this.onBoardingConfig.onboarding){
            return false;
        }
        this.checkInitialScreen();

        const config = this.onBoardingConfig.onboarding.find(obj => {
            return (obj && obj.name === currentPage);
        });

        if (!config || !config.skip || !config.default) {
            return false;
        }
        if (isUserLoggedIn) {
            return await this.loggedInUserOnboardingStep(config);
        } else {
            return await this.guestOnboardingStep(config);
        }
    }

    private async guestOnboardingStep(config) {
        let skipOnboarding = true;

        switch (config.name) {

            case OnboardingScreenType.LANGUAGE_SETTINGS:
                const selectedLanguage = await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
                if (!selectedLanguage) {
                    await this.sharedPreferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, config.default.code).toPromise();
                    await this.sharedPreferences.putString(PreferenceKey.SELECTED_LANGUAGE, config.default.label).toPromise();
                }
                break;

            case OnboardingScreenType.USER_TYPE_SELECTION:
                const selectedUser = await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
                if (!selectedUser) {
                    const profile = this.appGlobalService.getCurrentUser();
                    const profileRequest: Profile = {
                        uid: profile.uid,
                        handle: 'Guest1',
                        profileType: config.default,
                        source: ProfileSource.LOCAL
                    };
                    await this.profileService.updateProfile(profileRequest).toPromise();
                    await this.profileService.setActiveSessionForProfile(profileRequest.uid).toPromise();
                    await this.sharedPreferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, profile.uid).toPromise();
                    await this.sharedPreferences.putString(PreferenceKey.SELECTED_USER_TYPE, config.default).toPromise();
                }
                break;

            case OnboardingScreenType.PROFILE_SETTINGS:
                const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
                if (!this.isProfileComplete(profile)) {
                    await this.setDefaultFrameworkDetails(config.default);
                }
                break;

            case OnboardingScreenType.DISTRICT_MAPPING:
                await this.setDistrictMappingDetails(config);
                break;

            default:
                skipOnboarding = false;
                break;
        }

        return skipOnboarding;
    }

    private async loggedInUserOnboardingStep(config) {
        let skipOnboarding = true;

        switch (config.name) {
            case OnboardingScreenType.USER_TYPE_SELECTION:
                //todo
                break;

            case OnboardingScreenType.PROFILE_SETTINGS:
                //todo
                break;

            case OnboardingScreenType.DISTRICT_MAPPING:
                //todo
                break;

            default:
                skipOnboarding = false;
                break;
        }

        return skipOnboarding;
    }

    private async setDefaultFrameworkDetails(defaultVal) {
        const activeSessionProfile = await this.profileService.getActiveSessionProfile({
            requiredFields: ProfileConstants.REQUIRED_FIELDS
        }).toPromise();

        let profileType;
        if (activeSessionProfile.profileType) {
            profileType = activeSessionProfile.profileType
        } else if (!(profileType = await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise())) {
            profileType = ProfileType.NONE;
        }

        const updateProfileRequest: Profile = {
            ...activeSessionProfile,
            ...defaultVal,
            profileType
        };

        let profile: Profile;
        profile = await this.profileService.updateProfile(updateProfileRequest).toPromise();

        await this.segmentationTagService.refreshSegmentTags(profile);
        initTabs(this.container, GUEST_TEACHER_TABS);
        await this.segmentationTagService.createSegmentTags(profile);
        await this.commonUtilService.handleToTopicBasedNotification();
        this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = profile;

    }

    private isProfileComplete(profile?): boolean {
        return profile
            && profile.syllabus && profile.syllabus[0]
            && profile.board && profile.board.length
            && profile.grade && profile.grade.length
            && profile.medium && profile.medium.length;
    }

    private async setDistrictMappingDetails(config) {
        const req = {
            userDeclaredLocation: {
                ...config.default, 
                declaredOffline: !this.commonUtilService.networkInfo.isNetworkAvailable
            }
        };
        await this.deviceRegisterService.registerDevice(req).toPromise();
        await this.sharedPreferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(req.userDeclaredLocation)).toPromise();
        this.commonUtilService.handleToTopicBasedNotification();
        await this.appGlobalService.setOnBoardingCompleted();
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

    getCategoryTranslationKey(category: string): string {
            return this.onBoardingConfig.categories.find((element) => (element.code === category)).translation_key
      }

    getOnboardingConfig(page: String): OnBoardingConfig {
        return this.onBoardingConfig.onboarding.find((element) => (element.name === page))
    }  

    getAppConfig(): any {
        return this.onBoardingConfig
    }

}
