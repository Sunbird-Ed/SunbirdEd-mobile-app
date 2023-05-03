import { HasNotBeenOnboardedGuard } from './has-not-been-onboarded.guard';
import { AppGlobalService, SplashScreenService } from '../services';
import { AuthService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('HasNotBeenOnboardedGuard', () => {
    let hasNotBeenOnboardedGuard: HasNotBeenOnboardedGuard;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('false'))
    };

    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of(undefined))
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
        handleSunbirdSplashScreenActions: jest.fn()
    };



    beforeAll(() => {
        hasNotBeenOnboardedGuard = new HasNotBeenOnboardedGuard(
            mockSharedPreference as SharedPreferences,
            mockAuthService as AuthService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockSplashScreenService as SplashScreenService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of HasNotBeenOnboardedGuard', () => {
        // arrange
        // assert
        expect(hasNotBeenOnboardedGuard).toBeTruthy();
    });

    describe('canLoad', () => {

        it('should return true if onboarding is not complete and seesion is undefined', (done) => {
            // arrange
            // act
            hasNotBeenOnboardedGuard.canLoad().then((respone) => {
                // assert
                expect(respone).toBeTruthy();
                expect(mockAppGlobalService.isProfileSettingsCompleted).toBeFalsy();
                done();
            });
        });

        it('should return false if onboarding is complete and seesion is defined', (done) => {
            // arrange
            mockSharedPreference.getString = jest.fn(() => of('true'));
            mockAuthService.getSession = jest.fn(() => of({} as any));
            // act
            hasNotBeenOnboardedGuard.canLoad().then((respone) => {
                // assert
                expect(respone).toBeFalsy();
                expect(mockAppGlobalService.isProfileSettingsCompleted).toBeTruthy();
                done();
            });
        });
    });

});
