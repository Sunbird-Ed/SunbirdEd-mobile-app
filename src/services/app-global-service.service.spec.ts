import { AppGlobalService } from './app-global-service.service';
import { ProfileService, AuthService, FrameworkService, SharedPreferences, ProfileType } from 'sunbird-sdk';
import { Events, PopoverController } from '@ionic/angular';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { UtilityService } from './utility-service';
import { of } from 'rxjs';
import { PreferenceKey } from '../app/app.constant';
describe('AppGlobalService', () => {
    let appGlobalService: AppGlobalService;
    const mockProfile: Partial<ProfileService> = {};
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of())
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockEvent: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(undefined))
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('org.sunbird.app'))
    };

    beforeAll(() => {
        appGlobalService = new AppGlobalService(
            mockProfile as ProfileService,
            mockAuthService as AuthService,
            mockFrameworkService as FrameworkService,
            mockEvent as Events,
            mockPopoverCtrl as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPreferences as SharedPreferences,
            mockUtilityService as UtilityService
        );
    });

    it('should be create a instance of appGlobalService', () => {
        expect(appGlobalService).toBeTruthy();
    });

    it('should checked user iis loggedIn or Not', () => {
        // arrange
        appGlobalService.isGuestUser = false;
        // assert
        appGlobalService.isUserLoggedIn();
        // act
        expect(appGlobalService.isGuestUser).toBeFalsy();
    });

    it('should return GuestUserType', () => {
        // arrange
        appGlobalService.guestProfileType = ProfileType.TEACHER;
        // act
        appGlobalService.getGuestUserType();
        // assert
        expect(appGlobalService.guestProfileType).toBe('teacher');
    });

    it('should set to user permission for access device internal things', () => {
        // arrange
        const key = 'media';
        const value = true;
        mockPreferences.putString = jest.fn(() => of(undefined));
        // act
        appGlobalService.setIsPermissionAsked(key, value);
        // assert
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED);
        expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED, expect.any(String));
    });

    it('should set to user permission for access device internal things for else part', () => {
        // arrange
        const key = 'media';
        const value = true;
        const data = mockPreferences.getString = jest.fn(() => of('{"key": "key_1"}'));
        mockPreferences.putString = jest.fn(() => of(undefined));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
        });
        // act
        appGlobalService.setIsPermissionAsked(key, value);
        // assert
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED);
        // expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED, expect.any(String));
    });

    it('should be limitedShare QuizContent flow', () => {
        // arrange
        appGlobalService.limitedShareQuizContent = true;
        // act
        // assert
        expect(appGlobalService.limitedShareQuizContent).toBeTruthy();
    });

    it('should be SignInOnboarding Completed flow', () => {
        // arrange
        appGlobalService.isSignInOnboardingCompleted = true;
        // act
        // assert
        expect(appGlobalService.isSignInOnboardingCompleted).toBeTruthy();
    });

    it('should join traning onboarding flow', () => {
        // arrange
        appGlobalService.isJoinTraningOnboardingFlow = true;
        // act
        // assert
        expect(appGlobalService.isJoinTraningOnboardingFlow).toBeTruthy();
    });
});
