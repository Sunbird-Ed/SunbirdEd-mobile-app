import { LogoutHandlerService } from './logout-handler.service';
import {
    AuthService, ProfileService, SharedPreferences, ProfileType, InteractType, SystemSettingsService
} from '@project-sunbird/sunbird-sdk';
import { Events } from '../../util/events';
import { ContainerService } from '../container.services';
import { Router } from '@angular/router';
import { CommonUtilService, AppGlobalService, TelemetryGeneratorService } from '../../services';
import { of, from } from 'rxjs';
import { InteractSubtype, Environment, PageId } from '../telemetry-constants';
import { PreferenceKey, RouterLinks, SystemSettingsIds } from '../../app/app.constant';
import { SegmentationTagService } from '../segmentation-tag/segmentation-tag.service';
import { Platform } from '@ionic/angular';
import {GooglePlus} from '@awesome-cordova-plugins/google-plus/ngx';

describe('LogoutHandlerService', () => {
    let logoutHandlerService: LogoutHandlerService;
    const mockProfileService: Partial<ProfileService> = {
        setActiveSessionForProfile: jest.fn(() => of(true)),
        getAllProfiles: jest.fn(() => of([])),
        getActiveProfileSession: jest.fn(() => of({})),
        deleteProfile: jest.fn((id) => of({}))
    };
    const mockAuthService: Partial<AuthService> = {
        resignSession: jest.fn(() => from(new Promise<void>((resolve) => {
            resolve();
        })))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('123244')),
        getBoolean: jest.fn(() => of(true)),
        putString: jest.fn(() => of(undefined)),
        putBoolean: jest.fn(() => of(undefined))
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
    const mockSegmentationTagService: Partial<SegmentationTagService> = {
        persistSegmentation: jest.fn(),
        getPersistedSegmentaion: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };

    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({id: 'googleClientId'}))
    };

    const mockGooglePlus: Partial<GooglePlus> = {
        trySilentLogin: jest.fn(() => Promise.resolve('resolve')),
    };

    beforeAll(() => {
        logoutHandlerService = new LogoutHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockSystemSettingsService as SystemSettingsService,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockContainerService as ContainerService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRoute as Router,
            mockSegmentationTagService as SegmentationTagService,
            mockPlatform as Platform,
            mockGooglePlus as GooglePlus
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

        it('should persist segmentation', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSegmentationTagService.persistSegmentation = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockSegmentationTagService.persistSegmentation).toHaveBeenCalled();
                expect(mockCommonUtilService.isDeviceLocationAvailable).toHaveBeenCalled();
                done();
            })
        });

        it('should generare LOGOUT_INITIATE telemetry', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            const valuesMap = {};
            valuesMap['UID'] = "";
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                    InteractSubtype.LOGOUT_INITIATE,
                    Environment.HOME,
                    PageId.LOGOUT,
                    undefined,
                    valuesMap);
                expect(mockCommonUtilService.isDeviceLocationAvailable).toHaveBeenCalled();
                done();
            });
        });


        it('should logout_google', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.putBoolean = jest.fn(() => of(undefined));
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getBoolean).toHaveBeenCalledWith(PreferenceKey.IS_GOOGLE_LOGIN);
                expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.IS_GOOGLE_LOGIN, false);
                expect(mockCommonUtilService.isDeviceLocationAvailable).toHaveBeenCalled();
                done();
            });
        });

        it ('should disconnect a googlePlus', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const res = mockSharedPreferences.getBoolean = jest.fn(() => of(PreferenceKey.IS_GOOGLE_LOGIN));
            mockGooglePlus.disconnect = jest.fn();
            // act
            logoutHandlerService.onLogout();
            // assert
            expect(res).toBeTruthy();
            setTimeout(() => {
                expect(mockGooglePlus.disconnect).toHaveBeenCalled();
                done();
            })
        });
        
        it ('should try silent login catch error while disconnecting google plus', (done) => {
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const clientId = mockSystemSettingsService.getSystemSettings = jest.fn(() => of());
            mockGooglePlus.trySilentLogin = jest.fn(() => Promise.resolve({
                webClientId: clientId.value
            }));
            mockGooglePlus.disconnect = jest.fn();
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockGooglePlus.disconnect).toHaveBeenCalled();
                done();
            }, 0)
        });
        
        it('should clear the splashscreen preferences', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
            })
        });

        it('should not clear the splashscreen preferences if not present and check for different platforms', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockPlatform.is = jest.fn(platform => platform === 'android');
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            window['splashscreen'] = false
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: '1234567890',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }]));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
            })
        });

        it('should resign previuos session', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'))
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockAuthService.resignSession).toHaveBeenCalled();
            })
        });

        it('should not call preferences put boolean if return value is false ', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getBoolean = jest.fn(() => of(false));
            mockSharedPreferences.putBoolean = jest.fn(() => of());
            // act
            logoutHandlerService.onLogout();
            // assert
            expect(mockSharedPreferences.putBoolean).not.toHaveBeenCalled();
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
                expect(mockSegmentationTagService.getPersistedSegmentaion).toHaveBeenCalled();
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
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    InteractSubtype.LOGOUT_SUCCESS,
                    Environment.HOME,
                    PageId.LOGOUT,
                    undefined,
                    { UID: '' });
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

        it('should get user info', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockAppGlobalService.getGuestUserInfo = jest.fn();
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
                done();
            })
        })

        it('should navigate to user type selection route if onboarding id false and type is admin', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            jest.spyOn(mockSharedPreferences, 'getString').mockImplementation((arg) => {
                let value;
                switch (arg) {
                    case PreferenceKey.SELECTED_USER_TYPE:
                        value = 'administrator';
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
                expect(mockRoute.navigate).toHaveBeenCalledWith([`${RouterLinks.USER_TYPE_SELECTION}`]);
                done();
            }, 0);
        });

        it('should publish otehr tabs for other user type and not onboarded', (done) => {
        // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
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
                expect(mockEvents.publish).toHaveBeenCalledWith(`UPDATE_TABS`);
                done();
            }, 0);
        });

        it('should put string as user type teacher if userId is not present', (done) =>{
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of(undefined));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
                done();
            });
        });

        it('should put string as user type guest if userId is present', (done) =>{
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'));
            mockSharedPreferences.putString = jest.fn(() => of(PreferenceKey.SELECTED_USER_TYPE, '1234567890'));
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            // act
            logoutHandlerService.onLogout();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
