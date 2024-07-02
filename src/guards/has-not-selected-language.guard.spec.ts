import { HasNotSelectedLanguageGuard } from './has-not-selected-language.guard';
import { SplashScreenService } from '../services';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { OnboardingConfigurationService } from '../services/onboarding-configuration.service';


describe('HasNotSelectedLanguageGuard', () => {
    let hasNotSelectedLanguageGuard: HasNotSelectedLanguageGuard;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en'))
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
        handleSunbirdSplashScreenActions: jest.fn()
    };

    const mockOnBoardingConfigurationService: Partial<OnboardingConfigurationService> = {
        skipOnboardingStep: jest.fn(()=> Promise.resolve(false))
    };


    beforeAll(() => {
        hasNotSelectedLanguageGuard = new HasNotSelectedLanguageGuard(
            mockSharedPreference as SharedPreferences,
            mockRouter as Router,
            mockSplashScreenService as SplashScreenService,
            mockOnBoardingConfigurationService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of HasNotSelectedLanguageGuard', () => {
        // arrange
        // assert
        expect(hasNotSelectedLanguageGuard).toBeTruthy();
    });

    describe('resolve', () => {
        it('should return false if route has onReload property true and skipOnboarding as true and navigate to user type selection page', (done) => {
            // arrange
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn(() => true);
            // act
            const response = hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
            setTimeout(() => {
                expect(response).toBeTruthy();
                done();
            }, 0);
        });

        it('should return true if route has onReload property true and skipOnboarding as false', (done) => {
            // arrange
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn(() => false);

            // act
            const response = hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
            setTimeout(() => {
                expect(hasNotSelectedLanguageGuard['guardActivated']).toBeTruthy();
                expect(response).toBeTruthy();
                done();
            }, 0);
        });


        it('should  navigate to user type selection page if selected language is available', (done) => {
            // arrange
            hasNotSelectedLanguageGuard['guardActivated'] = false;
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();
            // act
            hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'false' } } as any);
            // assert
            setTimeout(() => {
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'user-type-selection'], {
                    state: {
                        forwardMigration: true
                    }
                });
                done();
            }, 0);
        });

        it('should return true if usertype is undefined', (done) => {
            // arrange
            hasNotSelectedLanguageGuard['guardActivated'] = false;
            mockSharedPreference.getString = jest.fn(() => of(undefined));
            mockOnBoardingConfigurationService.skipOnboardingStep = jest.fn();
            // act
            hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'false' } } as any);

            setTimeout(() => {
                // assert
                expect(mockOnBoardingConfigurationService.skipOnboardingStep).toHaveBeenCalled();
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
