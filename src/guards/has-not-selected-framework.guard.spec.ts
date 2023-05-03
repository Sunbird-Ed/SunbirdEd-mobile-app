import { HasNotSelectedFrameworkGuard } from './has-not-selected-framework.guard';
import { AppGlobalService, SplashScreenService, UtilityService } from '../services';
import { AuthService, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Platform } from '@ionic/angular';
import { CommonUtilService, OnboardingConfigurationService } from '../services';
import { Events } from '../util/events';
import { RouterLinks } from '../app/app.constant';

describe('HasNotSelectedFrameworkGuard', () => {
    let hasNotSelectedFrameworkGuard: HasNotSelectedFrameworkGuard;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn()
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
        setOnBoardingCompleted: jest.fn()
    };

    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('true'))
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
        handleSunbirdSplashScreenActions: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'android')
    };
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        skipOnboardingStep: jest.fn(()=> Promise.resolve(false))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isDeviceLocationAvailable: jest.fn(()=>Promise.resolve(true))
    };
    const mockEvents: Partial<Events> = {};


    beforeAll(() => {
        hasNotSelectedFrameworkGuard = new HasNotSelectedFrameworkGuard(
            mockProfileService as ProfileService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockPlatform as Platform,
            mockSplashScreenService as SplashScreenService,
            mockOnboardingConfigurationService as OnboardingConfigurationService,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of HasNotSelectedFrameworkGuard', () => {
        // arrange
        // assert
        expect(hasNotSelectedFrameworkGuard).toBeTruthy();
    });

    describe('resolve', () => {

        it('should return true if guard is already activated', () => {
            // arrange
            hasNotSelectedFrameworkGuard['guardActivated'] = true;
            // act
            const response = hasNotSelectedFrameworkGuard.resolve();
            // assert
            expect(response).toBeTruthy();
        });

        it('should navigate to tabs page if onboarding is complete', (done) => {
            // arrange
            mockOnboardingConfigurationService.skipOnboardingStep = jest.fn(()=>Promise.resolve(true));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(()=>Promise.resolve(false));
            mockEvents.publish = jest.fn()
            // act
            hasNotSelectedFrameworkGuard.resolve();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toBeCalledWith(['/tabs'], {"state": {"loginMode": "guest"}});
                expect(mockEvents.publish).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should check for profile and handle splashscreen if onboarding is complete false', (done) => {
            // arrange
            hasNotSelectedFrameworkGuard['guardActivated'] = false;
            mockOnboardingConfigurationService.skipOnboardingStep = jest.fn(()=>Promise.resolve(false));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(()=>Promise.resolve(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                syllabus: ['od_k12'],
                board: ['State(Odisha)'],
                grade: ['Class1'],
                medium: ['English']
            } as any));
            // act
            hasNotSelectedFrameworkGuard.resolve();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toBeCalledWith(['/tabs']);
                done();
            }, 0);
        });

        it('should navigate to district mapping if onboarding is complete false and device location is not avilable', (done) => {
            // arrange
            hasNotSelectedFrameworkGuard['guardActivated'] = false;
            mockOnboardingConfigurationService.skipOnboardingStep = jest.fn(()=>Promise.resolve(false));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(()=>Promise.resolve(false));
            // act
            hasNotSelectedFrameworkGuard.resolve();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toBeCalledWith([RouterLinks.DISTRICT_MAPPING], {"state": {"isShowBackButton": true}});
                done();
            }, 0);
        });

        it('should not navigate to tabs page if onboarding is not complete', (done) => {
            // arrange
            hasNotSelectedFrameworkGuard['guardActivated'] = false;
            mockOnboardingConfigurationService.skipOnboardingStep = jest.fn();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                syllabus: ['od_k12']
            } as any));
            // act
            const response = hasNotSelectedFrameworkGuard.resolve();
            setTimeout(() => {
                // assert
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                expect(mockRouter.navigate).not.toBeCalledWith(['/', 'tabs']);
                done();
            }, 0);
        });
    });

});
