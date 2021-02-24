import { HasNotSelectedLanguageGuard } from './has-not-selected-language.guard';
import { SplashScreenService } from '@app/services';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('HasNotSelectedLanguageGuard', () => {
    let hasNotSelectedLanguageGuard: HasNotSelectedLanguageGuard;

    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('teacher'))
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
        handleSunbirdSplashScreenActions: jest.fn()
    };



    beforeAll(() => {
        hasNotSelectedLanguageGuard = new HasNotSelectedLanguageGuard(
            mockSharedPreference as SharedPreferences,
            mockRouter as Router,
            mockSplashScreenService as SplashScreenService
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

        it('should return true if route has onReload property true', () => {
            // arrange
            // act
            const response = hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'true' } } as any);
            // assert
            expect(response).toBeTruthy();
            expect(hasNotSelectedLanguageGuard['guardActivated']).toBeTruthy();

        });


        it('should  navigate to user type selection page if selected user type is available', (done) => {
            // arrange
            hasNotSelectedLanguageGuard['guardActivated'] = false;
            // act
            hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'false' } } as any);
            // assert
            setTimeout(() => {
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
            // act
            hasNotSelectedLanguageGuard.resolve({ queryParams: { onReload: 'false' } } as any);

            setTimeout(() => {
                // assert
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
