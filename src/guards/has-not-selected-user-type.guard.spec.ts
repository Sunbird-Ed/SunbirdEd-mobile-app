import { HasNotSelectedUserTypeGuard } from './has-not-selected-user-type.guard';
import { SplashScreenService } from '@app/services';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

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



    beforeAll(() => {
        hasNotSelectedUserTypeGuard = new HasNotSelectedUserTypeGuard(
            mockSharedPreference as SharedPreferences,
            mockRouter as Router,
            mockActivatedRoute as ActivatedRoute,
            mockSplashScreenService as SplashScreenService
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

        it('should return true if route has onReload property true', () => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: false } } as any;
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            expect(response).toBeTruthy();
            expect(hasNotSelectedUserTypeGuard['guardActivated']).toBeTruthy();

        });

        it('should return true if route has comingFrom property UserTypeSelection', () => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: 'UserTypeSelection' } } as any;
            hasNotSelectedUserTypeGuard['guardActivated'] = false;
            // act
            const response = hasNotSelectedUserTypeGuard.resolve({ queryParams: { onReload: 'false' } } as any);
            // assert
            expect(response).toBeTruthy();
            expect(hasNotSelectedUserTypeGuard['guardActivated']).toBeTruthy();

        });

        it('should  navigate to profile settings page if selected user type is available', (done) => {
            // arrange
            mockActivatedRoute.snapshot = { params: { comingFrom: 'UserTypeSelection1' } } as any;
            hasNotSelectedUserTypeGuard['guardActivated'] = false;
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
