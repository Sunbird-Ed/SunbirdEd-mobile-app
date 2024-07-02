import { LoginNavigationHandlerService } from './login-navigation-handler.service';
import {
    AuthService,
    ProfileService, ProfileSource,
    ProfileType,
    SharedPreferences,
    SignInError,
    SystemSettingsService
} from '@project-sunbird/sunbird-sdk';
import { SbProgressLoader } from '../services/sb-progress-loader.service';
import { Events } from '../util/events';
import { AppGlobalService } from '../services/app-global-service.service';
import { TelemetryGeneratorService } from '../services/telemetry-generator.service';
import { ContainerService } from '../services/container.services';
import { NgZone } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { CommonUtilService } from '../services/common-util.service';
import { FormAndFrameworkUtilService } from '../services/formandframeworkutil.service';
import { of, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { PreferenceKey } from '../app/app.constant';

jest.mock('@project-sunbird/sunbird-sdk', () => {
    const actual = jest.requireActual('@project-sunbird/sunbird-sdk');
    return {
        ...actual,
        WebviewStateSessionProvider() {
        },
        NativeGoogleSessionProvider() {
        },
        WebviewLoginSessionProvider() {
        }
    };
});

jest.mock('../app/module.service', () => {
    const actual = jest.requireActual('../app/module.service');
    return {
        ...actual,
        initTabs: jest.fn().mockImplementation(() => {
        })
    };
});

describe('LoginNavigationHandlerService', () => {
    let loginNavigationHandlerService: LoginNavigationHandlerService;
    const mockUserProfile = {
        board: ['statekarnataka'],
        createdAt: 1594741466334,
        grade: ['class10'],
        gradeValue: '',
        handle: 'Guest1',
        medium: ['english'],
        profileType: 'teacher',
        source: 'local',
        subject: [],
        syllabus: ['ka_k-12_1'],
        uid: 'ca20b97e-9c88-456c-ad1e-4418c65f6dee'
    }
    const mockProfileService: Partial<ProfileService> = {
        getActiveProfileSession: jest.fn(() => of({uid: 'some_uid'})),
        deleteProfile: jest.fn((id) => of()),
        getAllProfiles: jest.fn(() => of([mockUserProfile])),
        setActiveSessionForProfile: jest.fn(() => of())
    };
    const mockAuthService: Partial<AuthService> = {
        resignSession: jest.fn()
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getBoolean: jest.fn(() => of(true)),
        putBoolean: jest.fn(() => of()),
        getString: jest.fn(() => of('')),
        putString: jest.fn(() => of())
    };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        limitedShareQuizContent: true,
        setEnrolledCourseList: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({ id: 'googleClientId' }))
    };
    const mockGooglePlus: Partial<GooglePlus> = {
        trySilentLogin: jest.fn(() => Promise.resolve('resolve')),
        disconnect: jest.fn(() => Promise.reject())
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };

    beforeAll(() => {
        loginNavigationHandlerService = new LoginNavigationHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockSystemSettingsService as SystemSettingsService,
            mockSbProgressLoader as SbProgressLoader,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainerService as ContainerService,
            mockNgZone as NgZone,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockPlatform as Platform,
            mockGooglePlus as GooglePlus
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of LoginNavigationHandlerService', () => {
        // assert
        expect(loginNavigationHandlerService).toBeTruthy();
    });

    describe('setSession', () => {
        it('should set session and refresh tenant data ', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => of());
            mockSharedPreferences.getString = jest.fn(() => of('false'));
            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true, componentData: ''}, 'sub')
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                done()
            }, 0);
        })

        it('should set session and check onbarding completed false', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => of(undefined));
            mockSbProgressLoader.show = jest.fn(() => Promise.resolve());
            mockSharedPreferences.getString = jest.fn(() => of('false'));
            mockAppGlobalService.limitedShareQuizContent = true;
            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true, componentData: ''}, 'sub')
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockAppGlobalService.limitedShareQuizContent).toBeTruthy();
                done()
            }, 0);
        })

        it('should catch error on set session and handle logout process ', (done) => {
            // arrange
            const signInError = {err: {error_msg:'ERROR_WHILE_LOGIN'}};
            mockAuthService.setSession = jest.fn(() => throwError(signInError));
            mockSbProgressLoader.hide = jest.fn()
            mockSharedPreferences.getString = jest.fn(() => of(''));
            const clientId = mockSystemSettingsService.getSystemSettings = jest.fn(() => of());
            mockGooglePlus.trySilentLogin = jest.fn(() => Promise.resolve({
                webClientId: clientId.value
            }));
            mockGooglePlus.disconnect = jest.fn();
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockAuthService.resignSession = jest.fn(() => Promise.resolve())

            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true, componentData: ''}, 'sub');
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockAuthService.resignSession).toHaveBeenCalled()
                done()
            }, 0);
        })

        it('should catch error on set session and handle logout process ', (done) => {
            // arrange
            const signInError = new SignInError('ERROR_WHILE_LOGIN');
            mockAuthService.setSession = jest.fn(() => throwError(signInError));
            mockSbProgressLoader.hide = jest.fn()
            mockSharedPreferences.getString = jest.fn(() => of(''));
            const clientId = mockSystemSettingsService.getSystemSettings = jest.fn(() => of());
            mockGooglePlus.trySilentLogin = jest.fn(() => Promise.resolve({
                webClientId: clientId.value
            }));
            mockGooglePlus.disconnect = jest.fn();
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockAuthService.resignSession = jest.fn(() => Promise.resolve())

            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true, componentData: ''}, 'sub');
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockAuthService.resignSession).toHaveBeenCalled()
                done()
            }, 0);
        })

        it('should catch error on set session and handle logout process for guest userid', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => throwError({message: "Error on login"}));
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getBoolean = jest.fn(() => of(false));
            mockPlatform.is = jest.fn(platform => platform === "android");
            mockSharedPreferences.getString = jest.fn(() => of());
            const clientId = mockSystemSettingsService.getSystemSettings = jest.fn(() => of());
            mockGooglePlus.trySilentLogin = jest.fn(() => Promise.resolve({
                webClientId: clientId.value
            }));
            mockGooglePlus.disconnect = jest.fn();
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockAuthService.resignSession = jest.fn(() => Promise.resolve())
            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true, componentData: ''}, 'sub');
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockSharedPreferences.getBoolean).toHaveBeenCalled();
                done()
            }, 0);
        })

        it('should create setSession and fetch and refresh the profileData', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => of(undefined));
            mockSbProgressLoader.show = jest.fn(() => Promise.resolve());
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));

            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockSharedPreferences.putString = jest.fn(() => of('administrator'))

            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                id: '',
                profileUserType: {
                    type: 'TEACHER'
                },
                rootOrg: {
                    slug: '',
                    orgName: ''
                }
            }));
            jest.spyOn(loginNavigationHandlerService, 'generateLoginInteractTelemetry').getMockImplementation();
            mockProfileService.createProfile = jest.fn(() => of());
            mockSharedPreferences.putString = jest.fn(() => of('administrator'));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
            mockNgZone.run = jest.fn((fn) => fn());
            mockEvents.publish = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockProfileService.getTenantInfo = jest.fn(() => of({
                title: '',
                logo: ''
            }));
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(true));

            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true });
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE)
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockProfileService.createProfile).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should catch error create profile', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => of(undefined));
            mockSbProgressLoader.show = jest.fn(() => Promise.resolve());
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
            mockNgZone.run = jest.fn((fn) => fn());
            mockEvents.publish = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockProfileService.getTenantInfo = jest.fn(() => of({
                title: '',
                logo: ''
            }));
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(false));

            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: true });
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should create setSession and fetch and refresh the profileData and for tenant data with no default channel', (done) => {
            // arrange
            mockAuthService.setSession = jest.fn(() => of(undefined));
            mockSbProgressLoader.show = jest.fn(() => Promise.resolve());
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                id: '',
                profileUserType: {
                },
                rootOrg: {
                    slug: '',
                    orgName: ''
                }
            }));
            jest.spyOn(loginNavigationHandlerService, 'generateLoginInteractTelemetry').getMockImplementation();
            mockProfileService.createProfile = jest.fn(() => throwError());
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve());
            mockNgZone.run = jest.fn((fn) => fn());
            mockEvents.publish = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockProfileService.getTenantInfo = jest.fn(() => of({
                title: '',
                logo: ''
            }));
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(false));

            // act
            loginNavigationHandlerService.setSession({}, { source: 'profile', redirectUrlAfterLogin: false });
            // assert
            setTimeout(() => {
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockProfileService.createProfile).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('setProfileDetails', () => {
        it('should fetch Current user details and update the profile and set current profile as active and publish the events', () => {
            // arrange
            const mockProfile = {
                uid: 'sample_uid',
                handle: '',
                medium: [''],
                board: [''],
                subject: [''],
                profileType: ProfileType.TEACHER,
                grade: [''],
                syllabus: [''],
                source: ProfileSource.SERVER
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => of(mockProfile));
            mockProfileService.updateProfile = jest.fn(() => of(mockProfile));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfile));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            loginNavigationHandlerService.setDefaultProfileDetails().then(() => {
                // assert
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
            });
        });
        it('should fetch Current user details and update the profile for null user id', () => {
            // arrange
            const mockProfile = {
                uid: 'null',
                handle: '',
                medium: [''],
                board: [''],
                subject: [''],
                profileType: ProfileType.TEACHER,
                grade: [''],
                syllabus: [''],
                source: ProfileSource.SERVER
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => of(mockProfile));
            mockProfileService.updateProfile = jest.fn(() => of(mockProfile));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfile));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            loginNavigationHandlerService.setDefaultProfileDetails().then(() => {
                // assert
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
            });
        });
        it('should catch error on getActiveSessionProfile', () => {
            // arrange
            const mockProfile = {
                uid: 'sample_uid',
                handle: '',
                medium: [''],
                board: [''],
                subject: [''],
                profileType: ProfileType.TEACHER,
                grade: [''],
                syllabus: [''],
                source: ProfileSource.SERVER
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => of(mockProfile));
            mockProfileService.updateProfile = jest.fn(() => of(mockProfile));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => throwError({ Error: "" }));
            // act
            loginNavigationHandlerService.setDefaultProfileDetails().then(() => {
                // assert
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            });
        })
    });
});
