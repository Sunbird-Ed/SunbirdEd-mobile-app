import { HasNotSelectedFrameworkGuard } from './has-not-selected-framework.guard';
import { AppGlobalService, SplashScreenService, UtilityService } from '@app/services';
import { AuthService, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('HasNotSelectedFrameworkGuard', () => {
    let hasNotSelectedFrameworkGuard: HasNotSelectedFrameworkGuard;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn()
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
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



    beforeAll(() => {
        hasNotSelectedFrameworkGuard = new HasNotSelectedFrameworkGuard(
            mockProfileService as ProfileService,
            mockAppGlobalService as AppGlobalService,
            mockUtilityService as UtilityService,
            mockRouter as Router,
            mockSplashScreenService as SplashScreenService
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
            hasNotSelectedFrameworkGuard['guardActivated'] = false;
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
                expect(mockRouter.navigate).toBeCalledWith(['/', 'tabs']);
                done();
            }, 0);
        });

        it('should not navigate to tabs page if onboarding is not complete', (done) => {
            // arrange
            hasNotSelectedFrameworkGuard['guardActivated'] = false;
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
