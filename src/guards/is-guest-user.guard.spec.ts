import { IsGuestUserGuard } from './is-guest-user.guard';
import { AuthService } from '@project-sunbird/sunbird-sdk';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('IsGuestUserGuard', () => {
    let isGuestUserGuard: IsGuestUserGuard;

    const mockAuthService: Partial<AuthService> = {
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    beforeAll(() => {
        isGuestUserGuard = new IsGuestUserGuard(
            mockAuthService as AuthService,
            mockRouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of IsGuestUserGuard', () => {
        // arrange
        // assert
        expect(isGuestUserGuard).toBeTruthy();
    });

    describe('canLoad', () => {

        it('should return true if seesion is undefined', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined as any));
            // act
            isGuestUserGuard.canLoad().then((respone) => {
                // assert
                expect(respone).toBeTruthy();
                done();
            });
        });

        it('should return false if seesion is defined', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({} as any));
            // act
            isGuestUserGuard.canLoad().then((respone) => {
                // assert
                expect(respone).toBeFalsy();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'profile-settings']);
                done();
            });
        });
    });

});
