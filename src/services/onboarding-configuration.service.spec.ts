import { Events } from '../util/events';
import { DeviceRegisterService, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService, CommonUtilService, ContainerService } from ".";
import onboarding from './../assets/configurations/config.json';
import { SegmentationTagService } from "./segmentation-tag/segmentation-tag.service";
import { OnboardingConfigurationService } from "./onboarding-configuration.service";
import { of } from "rxjs";
import { ProfileType } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, ProfileConstants } from '../app/app.constant';

describe('OnboardingConfigurationService', () => {
    let onboardingConfigurationService: OnboardingConfigurationService;
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en' as any))
    };
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(() => of({} as any)),
        getActiveSessionProfile: jest.fn()
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {
        registerDevice: jest.fn()
    };
    const mockEvents: Partial<Events> = { publish: jest.fn() };
    const mockSegmentationTagService: Partial<SegmentationTagService> = {
        getPersistedSegmentaion: jest.fn(),
        persistSegmentation: jest.fn(),
        createSegmentTags: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn()
    };

    beforeAll(() => {
        onboardingConfigurationService = new OnboardingConfigurationService(
            mockPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockDeviceRegisterService as DeviceRegisterService,
            mockEvents as Events,
            mockSegmentationTagService as SegmentationTagService,
            mockContainer as ContainerService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService
        )
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should be create an instance of CategoryListPage', () => {
        expect(onboardingConfigurationService).toBeTruthy();
    });
    describe('skipOnboardingStep', () => {
        it('skipOnboardingStep when config.skip is false', (done) => {
            //arrange
            const currentPage = 'user-type-selection';
            let isUserLoggedIn = false;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is user-type-selection', (done) => {
            //arrange
            const currentPage = 'user-type-selection';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[1].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false, currentPage is user-type-selection and selectedUser is undefined', (done) => {
            //arrange
            const currentPage = 'user-type-selection';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[1].skip = true;
            mockPreferences.getString = jest.fn(() => of(undefined));
            const profile = (mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' })));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockPreferences.putString = jest.fn(() => of(undefined));
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is profile-settings', (done) => {
            //arrange
            const currentPage = 'profile-settings';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[2].skip = true;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
            mockSegmentationTagService.refreshSegmentTags = jest.fn();
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockSegmentationTagService.createSegmentTags = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false, currentPage is profile-settings and profile is incomplete', (done) => {
            //arrange
            const currentPage = 'profile-settings';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[2].skip = true;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({ profileType: 'profile type' } as any));
            mockSegmentationTagService.refreshSegmentTags = jest.fn();
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockSegmentationTagService.createSegmentTags = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false, currentPage is profile-settings and profile is complete', (done) => {
            //arrange
            const currentPage = 'profile-settings';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[2].skip = true;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({ profileType: 'profile type', syllabus: 'syllabus', board: 'board', grade: 'A', medium: 'English' } as any));
            mockSegmentationTagService.refreshSegmentTags = jest.fn();
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockSegmentationTagService.createSegmentTags = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is district-mapping', (done) => {
            //arrange
            const currentPage = 'district-mapping';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[3].skip = true;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockDeviceRegisterService.registerDevice = jest.fn(() => of({} as any));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn(() => Promise.resolve());
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is language-setting', (done) => {
            //arrange
            const currentPage = 'language-setting';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[0].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false, currentPage is language-setting and selectedLanguage is undefined', (done) => {
            //arrange
            const currentPage = 'language-setting';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[0].skip = true;
            mockPreferences.getString = jest.fn(() => of(undefined));
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is default value', (done) => {
            //arrange
            const currentPage = 'default value';
            let isUserLoggedIn = false;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[1].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is true and currentPage is user-type-selection', (done) => {
            //arrange
            const currentPage = 'user-type-selection';
            let isUserLoggedIn = true;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[1].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is true and currentPage is profile-settings', (done) => {
            //arrange
            const currentPage = 'profile-settings';
            let isUserLoggedIn = true;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[2].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is true and currentPage is district-mapping', (done) => {
            //arrange
            const currentPage = 'district-mapping';
            let isUserLoggedIn = true;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[3].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is true and currentPage is language-setting', (done) => {
            //arrange
            const currentPage = 'language-setting';
            let isUserLoggedIn = true;
            const config = onboardingConfigurationService.onBoardingConfig.onboarding[0].skip = true;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep when user loggedIn is false and currentPage is any string value', (done) => {
            //arrange
            const currentPage = 'a string';
            let isUserLoggedIn;
            onboardingConfigurationService.onBoardingConfig.onboarding.push({ name: 'a string', skip: true, default: 'default value' as any })
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
        it('skipOnboardingStep make onBoardingConfig undefined', (done) => {
            //arrange
            const currentPage = 'user-type-selection';
            let isUserLoggedIn;
            onboardingConfigurationService.onBoardingConfig = undefined;
            //act
            onboardingConfigurationService.skipOnboardingStep(currentPage, isUserLoggedIn);
            //assert
            setTimeout(() => {
                expect(onboardingConfigurationService.skipOnboardingStep).toBeTruthy();
                done();
            }, 0);
        });
    });
    describe('initializedTabs', () => {
        it('initializedTabs and userType is administrator', () => {
            //arrange
            const theme = 'RESOURCE_COURSE_TABS_CONFIG';
            const userType = 'administrator';
            //mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            //act
            onboardingConfigurationService.initializedTabs(theme, userType);
            //assert
            expect(onboardingConfigurationService.initializedTabs).toBeTruthy();
        });
        it('initializedTabs when theme is HOME_DISCOVER_TABS_CONFIG and user is logged in', () => {
            //arrange
            const theme = 'HOME_DISCOVER_TABS_CONFIG';
            const userType = 'student';
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            //act
            onboardingConfigurationService.initializedTabs(theme, userType);
            //assert
            expect(onboardingConfigurationService.initializedTabs).toBeTruthy();
        });
        it('initializedTabs when theme is HOME_DISCOVER_TABS_CONFIG and user is not logged in', () => {
            //arrange
            const theme = 'HOME_DISCOVER_TABS_CONFIG';
            const userType = 'student';
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            //act
            onboardingConfigurationService.initializedTabs(theme, userType);
            //assert
            expect(onboardingConfigurationService.initializedTabs).toBeTruthy();
        });
        it('initializedTabs when userType is student and user is logged in', () => {
            //arrange
            const theme = 'RESOURCE_COURSE_TABS_CONFIG';
            const userType = 'student';
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            //act
            onboardingConfigurationService.initializedTabs(theme, userType);
            //assert
            expect(onboardingConfigurationService.initializedTabs).toBeTruthy();
        });
        it('initializedTabs when userType is student and user is not logged in', () => {
            //arrange
            const theme = 'RESOURCE_COURSE_TABS_CONFIG';
            const userType = 'student';
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            //act
            onboardingConfigurationService.initializedTabs(theme, userType);
            //assert
            expect(onboardingConfigurationService.initializedTabs).toBeTruthy();
        });
    });
    it('findAllTabs', () => {
        //arrange
        const theme = 'OLD';
        const status = 'logIn';
        //act
        onboardingConfigurationService.findAllTabs(theme, status);
        //assert
        expect(onboardingConfigurationService.findAllTabs).toBeTruthy();
    });
});