import {LoginNavigationHandlerService} from './login-navigation-handler.service';
import {
    AuthService,
    ProfileService, ProfileSource,
    ProfileType,
    SharedPreferences,
    SignInError,
    SystemSettingsService,
    WebviewStateSessionProvider
} from '@project-sunbird/sunbird-sdk';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {Events} from '@app/util/events';
import {AppGlobalService} from '@app/services/app-global-service.service';
import {TelemetryGeneratorService} from '@app/services/telemetry-generator.service';
import {ContainerService} from '@app/services/container.services';
import {NgZone} from '@angular/core';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {CommonUtilService} from '@app/services/common-util.service';
import {FormAndFrameworkUtilService} from '@app/services/formandframeworkutil.service';
import {of, throwError} from 'rxjs';
import { Platform } from '@ionic/angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AppHeaderService } from './app-header.service';
import { PreferenceKey, SystemSettingsIds } from '../app/app.constant';

const mockUserProfile = {
    board: ['statekarnataka'],
    createdAt: 1594741466334,
    grade: ['class10'],
    gradeValue: '',
    handle: 'Guest1',
    medium: ['english'],
    profileType: 'TEACHER',
    source: 'local',
    subject: [],
    syllabus: ['ka_k-12_1'],
    uid: 'ca20b97e-9c88-456c-ad1e-4418c65f6dee'
}

jest.mock('@project-sunbird/sunbird-sdk', () => {
    const actual = require.requireActual('@project-sunbird/sunbird-sdk');
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

jest.mock('@app/app/module.service', () => {
    const actual = require.requireActual('@app/app/module.service');
    return {
        ...actual,
        initTabs: jest.fn().mockImplementation(() => {
        })
    };
});

describe('LoginNavigationHandlerService', () => {
    let loginNavigationHandlerService: LoginNavigationHandlerService;
    const mockProfileService: Partial<ProfileService> = {
        createProfile: jest.fn(),
        getTenantInfo: jest.fn(),
        isDefaultChannelProfile: jest.fn(() => of()),
        updateProfile: jest.fn(),
        setActiveSessionForProfile: jest.fn(),
        getActiveSessionProfile: jest.fn(),
        getActiveProfileSession: jest.fn(() => of({})),
        deleteProfile: jest.fn((id) => of({})),
        getAllProfiles: jest.fn(() => of([mockUserProfile]))
    };
    const mockAuthService: Partial<AuthService> = {
        setSession: jest.fn(() => of(undefined)),
        getSession: jest.fn(() => of(undefined)),
        resignSession: jest.fn()
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('123244')),
        getBoolean: jest.fn(() => of(true)),
        putString: jest.fn(() => of()),
        putBoolean: jest.fn(() => of(undefined))
    };
    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of())
    };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        limitedShareQuizContent: true,
        getCurrentUser: jest.fn(() => mockUserProfile),
        setEnrolledCourseList: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockContainerService: Partial<ContainerService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        updateLoggedInUser: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockGooglePlus: Partial<GooglePlus> = {
        trySilentLogin: jest.fn(() => Promise.resolve('resolve')),
        disconnect: jest.fn()
    };
    const mockAppHeader: Partial<AppHeaderService> = {
        showStatusBar: jest.fn()
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
            mockGooglePlus as GooglePlus,
            mockAppHeader as AppHeaderService
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
            // jest.spyOn(loginNavigationHandlerService, 'generateLoginInteractTelemetry').getMockImplementation();
            mockProfileService.createProfile = jest.fn(() => of());
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
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(true));
        
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, '');
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
        
        it('should go to error part if setSession throws error', (done) => {
            // arrange
            const signInError = new SignInError('error');
            mockAuthService.setSession = jest.fn(() => throwError(signInError));
            mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
            mockCommonUtilService.showToast = jest.fn();
            // act
            loginNavigationHandlerService.setSession({},{}, 'sub');
            // assert
            setTimeout(() => {
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(signInError.message);
                done();
            }, 0);
        });

        it('should resign previuos session', () => {
            // arrange
            mockSharedPreferences.getString = jest.fn(() => of('1234567890'))
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, '');
            // assert
            setTimeout(() => {
                expect(mockAuthService.resignSession).toHaveBeenCalled();
            })
        });
        
        it('should not call preferences put boolean if return value is false ', () => {
            // arrange
            mockSharedPreferences.getBoolean = jest.fn(() => of(false));
            mockSharedPreferences.putBoolean = jest.fn(() => of());
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, '');
            // assert
            expect(mockSharedPreferences.putBoolean).not.toHaveBeenCalled();
        });
       
        it('should logout google', () => {
            const res = mockSharedPreferences.getBoolean = jest.fn(() => of(true));
            mockGooglePlus.disconnect = jest.fn();
            mockSharedPreferences.putBoolean = jest.fn(() => of(true));
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, '');
            // assert
            expect(res).toBeTruthy();
            setTimeout(() => {  
                expect(mockGooglePlus.disconnect).toHaveBeenCalled()
                expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.IS_GOOGLE_LOGIN, false);
            })
        });
        
        it('should catch error on disconnect and do try silent login', () => {
            const res = mockSharedPreferences.getBoolean = jest.fn(() => of(true));
            mockGooglePlus.disconnect = jest.fn(() => throwError({}));
            mockSharedPreferences.putBoolean = jest.fn(() => of(true));
            const clientId = {
                value: "some_id"
            }
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of(clientId));
            mockGooglePlus.trySilentLogin = jest.fn(() => Promise.resolve({
                webClientId: clientId.value
            }));
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, '');
            // assert
            expect(res).toBeTruthy();
            setTimeout(() => {  
                expect(mockGooglePlus.disconnect).toHaveBeenCalled();
                expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.IS_GOOGLE_LOGIN, false);
                expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalledWith({ id: SystemSettingsIds.GOOGLE_CLIENT_ID })
            })
        });
        
        it('should catch error on refresh tenant data', () => {
            // arrange
            mockProfileService.getTenantInfo = jest.fn(() => throwError("error"));
            // act
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true}, 'sub');
            // assert
            setTimeout(() => {
                expect(mockProfileService.getTenantInfo).toHaveBeenCalled();
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
                profileType: ProfileType.TEACHER.toUpperCase(),
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

        it('should fetch Current user details and update the profile and set current profile as active and publish the events', () => {
            // arrange
            const mockProfile = {
                uid: 'sample_uid',
                handle: '',
                medium: [''],
                board: [''],
                subject: [''],
                profileType: ProfileType.TEACHER.toUpperCase(),
                grade: [''],
                syllabus: [''],
                source: ProfileSource.SERVER
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => of(mockProfile));
            mockProfileService.updateProfile = jest.fn(() => of(mockProfile));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => throwError({}));
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
    });
})