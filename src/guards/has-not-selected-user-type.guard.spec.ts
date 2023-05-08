import { HasNotSelectedUserTypeGuard } from './has-not-selected-user-type.guard';
import { SplashScreenService } from '../services';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { OnboardingConfigurationService } from '../services/onboarding-configuration.service';


describe('HasNotSelectedUserTypeGuard', () => {
    let hasNotSelectedUserTypeGuard: HasNotSelectedUserTypeGuard;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('teacher'))
    };

    const mockActivatedRoute: Partial<ActivatedRoute> = {
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
        handleSunbirdSplashScreenActions: jest.fn()
    };

    const mockOnBoardingConfigurationService: Partial<OnboardingConfigurationService> = {
        skipOnboardingStep: jest.fn(()=> Promise.resolve(false))
    }



    beforeAll(() => {
        hasNotSelectedUserTypeGuard = new HasNotSelectedUserTypeGuard(
            mockSharedPreference as SharedPreferences,
            mockRouter as Router,
            mockActivatedRoute as ActivatedRoute,
            mockSplashScreenService as SplashScreenService,
            mockOnBoardingConfigurationService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of HasNotSelectedUserTypeGuard', () => {
        // arrange
        // assert
        expect(hasNotSelectedUserTypeGuard).toBeTruthy();
    });

    describe('resolve', () => {
        it('should return false if route has onReload property true and skip onboard for Admin', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: false } } as any;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn(() => true);
            mockSharedPreference.getString = jest.fn(() => of("administrator"))
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            setTimeout(() => {
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(response).toBeTruthy();
                done()
            }, 0);

        });

        it('should return false if route has onReload property true and skip onboard and naviagte to profile settings page', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: false } } as any;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn(() => true);
            mockSharedPreference.getString = jest.fn(() => of("teacher"))
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            setTimeout(() => {
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(response).toBeTruthy();
                done()
            }, 0);

        });

        it('should return true if route has onReload property true', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: false } } as any;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            setTimeout(() => {
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(hasNotSelectedUserTypeGuard['guardActivated']).toBeTruthy();
                expect(response).toBeTruthy();
                done()
            }, 0);

        });

        it('should return true if route has comingFrom property UserTypeSelection', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: 'UserTypeSelection' } } as any;
            hasNotSelectedUserTypeGuard['guardActivated'] = false;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'false' } } as any);
            // assert
            setTimeout(() => {
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(hasNotSelectedUserTypeGuard['guardActivated']).toBeTruthy();
                expect(response).toBeTruthy();
                done();
            }, 0);

        });

        it('should  navigate to profile settings page if selected user type is available', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: 'UserTypeSelection1' } } as any;
            hasNotSelectedUserTypeGuard['guardActivated'] = false;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();

            // act
            hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'false' } } as any);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'profile-settings'], {
                    state: {
                        forwardMigration: true
                    }
                });
                done();
            }, 0);
        });

        it('should return true if usertype is undefined', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: 'UserTypeSelection1' } } as any;
            hasNotSelectedUserTypeGuard['guardActivated'] = false;
            mockSharedPreference.getString = jest.fn(() => of(undefined));
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();

            // act
            hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'false' } } as any);

            setTimeout(() => {
                // assert
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
