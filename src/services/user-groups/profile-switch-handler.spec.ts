import { ProfileSwitchHandler } from './profile-switch-handler';
import { Events } from '@app/util/events';
import { AuthService, ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { ContainerService } from '../container.services';
import { AppGlobalService } from '../app-global-service.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { initTabs, GUEST_STUDENT_TABS, GUEST_TEACHER_TABS } from '@app/app/module.service';
import { PreferenceKey, RouterLinks } from '../../app/app.constant';

describe('ProfileSwitchHandler', () => {

    let profileSwitchHandler: ProfileSwitchHandler;
    const mockPreferences: Partial<SharedPreferences> = {
        addListener: jest.fn(() => { })
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = { publish: jest.fn() };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    beforeAll(() => {
        profileSwitchHandler = new ProfileSwitchHandler(
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockContainer as ContainerService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of profileSwitchHandler', () => {
        expect(profileSwitchHandler).toBeTruthy();
    });

    describe('switchUser', () => {
        it('should resign the session if user already logged in', () => {
            //arrage
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAuthService.resignSession = jest.fn(() => of());
            mockEvents.publish = jest.fn(() => []);
            const selectedProfile: any = { profileType: ProfileType.STUDENT };
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            profileSwitchHandler.switchUser(selectedProfile);
            //assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockAuthService.resignSession).toHaveBeenCalled();
                expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, selectedProfile.profileType);
                expect(mockEvents.publish).toHaveBeenCalledWith('refresh:profile');
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                expect(mockAppGlobalService.setSelectedUser).toHaveBeenCalledWith(undefined);
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.TABS]);
            }, 0);
        })

    });

});
