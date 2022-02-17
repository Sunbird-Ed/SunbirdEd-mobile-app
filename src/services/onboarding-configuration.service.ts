import { Inject, Injectable } from "@angular/core";
import { OnboardingScreenType, PreferenceKey, ProfileConstants } from "@app/app/app.constant";
import { GUEST_TEACHER_TABS, initTabs } from "@app/app/module.service";
import { Events } from '@app/util/events';
import { Profile, ProfileService, ProfileType, SharedPreferences } from 'sunbird-sdk';
import { AppGlobalService, CommonUtilService, ContainerService } from ".";
import onboarding from './../assets/configurations/config.json';
import { SegmentationTagService } from "./segmentation-tag/segmentation-tag.service";

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
        @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private events: Events,
        private segmentationTagService: SegmentationTagService,
        private container: ContainerService,
        private appGlobalService: AppGlobalService,
        private commonUtilService: CommonUtilService,
    ) {
        this.onBoardingConfig = onboarding;
    }

    async skipOnboardingStep(currentPage) {
        const config = this.onBoardingConfig.onboarding.find(obj => {
            return obj.name === currentPage;
        });
        console.log('Configuration :', config);
        if (!config || !config.skip || !config.default) {
            return false;
        }

        return await this.nextOnboardingStep(currentPage, config);
    }

    async nextOnboardingStep(currentPage, config?) {
        let skipOnboarding = false;
        if (!config) {
            config = this.onBoardingConfig.onboarding.find(obj => {
                return obj.name === currentPage;
            });
        }

        switch (config.name) {

            case OnboardingScreenType.LANGUAGE_SETTINGS:
                const selectedLanguage = await this.sharedPreferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
                if (!selectedLanguage) {
                    this.sharedPreferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, config.default.code).toPromise();
                    this.sharedPreferences.putString(PreferenceKey.SELECTED_LANGUAGE, config.default.label).toPromise();
                }
                skipOnboarding = true;
                break;

            case OnboardingScreenType.USER_TYPE_SELECTION:
                const selectedUser = await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
                if (!selectedUser) {
                    this.sharedPreferences.putString(PreferenceKey.SELECTED_USER_TYPE, config.default).toPromise();
                }
                skipOnboarding = true;
                break;

            case OnboardingScreenType.PROFILE_SETTINGS:
                const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
                if (!this.isProfileComplete(profile)) {
                    await this.setDefaultFrameworkDetails(config.default);
                }
                skipOnboarding = true;
                break;

            default:
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

        this.segmentationTagService.refreshSegmentTags(profile);
        initTabs(this.container, GUEST_TEACHER_TABS);
        this.segmentationTagService.createSegmentTags(profile);
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

}
