import { LogoutHandlerService } from './logout-handler.service';
import {
    AuthService, ProfileService, SharedPreferences, ProfileType, InteractType
} from 'sunbird-sdk';
import { Events } from '@app/util/events';
import { ContainerService } from '../container.services';
import { Router } from '@angular/router';
import { CommonUtilService, AppGlobalService, TelemetryGeneratorService } from '../../services';
import { of, from } from 'rxjs';
import { InteractSubtype, Environment, PageId } from '../telemetry-constants';
import { PreferenceKey, RouterLinks } from '../../app/app.constant';

describe('LogoutHandlerService', () => {
    let logoutHandlerService: LogoutHandlerService;
    const mockProfileService: Partial<ProfileService> = {
        setActiveSessionForProfile: jest.fn(() => of(true)),
        getAllProfiles: jest.fn(() => of([]))
    };
    const mockAuthService: Partial<AuthService> = {
        resignSession: jest.fn(() => from(new Promise<void>((resolve) => {
            resolve();
        })))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(),
        putString: jest.fn(() => of(undefined))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        isAccessibleForNonStudentRole: jest.fn(() => true)
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getGuestUserInfo: jest.fn(() => Promise.resolve(ProfileType.TEACHER)),
        setEnrolledCourseList: jest.fn()
    };
    const mockContainerService: Partial<ContainerService> = {
        removeAllTabs: jest.fn(),
        addTab: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockRoute: Partial<Router> = {
        navigate: jest.fn()
    };

    beforeAll(() => {
        logoutHandlerService = new LogoutHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockContainerService as ContainerService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRoute as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize LogoutHandlerService', () => {
        expect(logoutHandlerService).toBeDefined();
    });

    describe('onLogout', () => {
        it('should show Network error toast incase of no Network', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            // act
            logoutHandlerService.onLogout();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
        });

        it('should generare LOGOUT_INITIATE telemetry', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            // act
            logoutHandlerService.onLogout();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.LOGOUT_INITIATE,
                Environment.HOME,
                PageId.LOGOUT,
                undefined,
                { UID: '' });
        });

        it('should clear the splashscreen preferences', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            jest.spyOn(splashscreen, 'clearPrefs');
            // act
            logoutHandlerService.onLogout();
            // assert
           // expect(splashscreen.clearPrefs).toHaveBeenCalled();
        });

        it('should resign previuos session', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            // act
            logoutHandlerService.onLogout();
            // assert
            expect(mockAuthService.resignSession).toHaveBeenCalled();
        });

        it('should publish USER_INFO_UPDATED event', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            if (mockCommonUtilService.networkInfo.isNetworkAvailable) {
                mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            }
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalledWith([]);
                expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should initialize the TABS if onboarding is completed ', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            jest.spyOn(mockSharedPreferences, 'getString').mockImplementation((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.SELECTED_USER_TYPE:
                        value = 'teacher';
                        break;
                    case PreferenceKey.IS_ONBOARDING_COMPLETED:
                        value = 'true';
                        break;
                    case PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockRoute.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS}`], { state: { loginMode: 'guest' } });
                done();
            }, 0);
        });

        it('should navigate to profile-settings page if onboarding is not completed ', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            jest.spyOn(mockSharedPreferences, 'getString').mockImplementation((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.SELECTED_USER_TYPE:
                        value = 'student';
                        break;
                    case PreferenceKey.IS_ONBOARDING_COMPLETED:
                        value = 'false';
                        break;
                    case PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockRoute.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`], { queryParams: { reOnboard: true } });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    InteractSubtype.LOGOUT_SUCCESS,
                    Environment.HOME,
                    PageId.LOGOUT,
                    undefined,
                    { UID: '' });
                done();
            }, 0);
        });

        it('should navigate to profile-settings page  for profile types other than student and teacher', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            jest.spyOn(mockSharedPreferences, 'getString').mockImplementation((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.SELECTED_USER_TYPE:
                        value = 'other';
                        break;
                    case PreferenceKey.IS_ONBOARDING_COMPLETED:
                        value = 'false';
                        break;
                    case PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockRoute.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`], { queryParams: { reOnboard: true } });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    InteractSubtype.LOGOUT_SUCCESS,
                    Environment.HOME,
                    PageId.LOGOUT,
                    undefined,
                    { UID: '' });
                done();
            }, 0);
        });
    });
});
