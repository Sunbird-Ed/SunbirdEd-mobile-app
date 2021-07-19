import {LoginNavigationHandlerService} from '@app/services/login-navigation-handler.service';
import {
    AuthService,
    ProfileService, ProfileSource,
    ProfileType,
    SharedPreferences,
    SignInError,
    WebviewStateSessionProvider
} from '../../../sunbird-mobile-sdk/tmp';
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
    const mockProfileService: Partial<ProfileService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockEvents: Partial<Events> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};


    beforeAll(() => {
        loginNavigationHandlerService = new LoginNavigationHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockSbProgressLoader as SbProgressLoader,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainerService as ContainerService,
            mockNgZone as NgZone,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
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
            jest.spyOn(loginNavigationHandlerService, 'generateLoginInteractTelemetry').getMockImplementation();
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
            loginNavigationHandlerService.setSession({}, {source: 'profile', redirectUrlAfterLogin: true});
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

        it('should go to error part if setSession throws error', () => {
            // arrange
            const signInError = new SignInError('error');
            mockAuthService.setSession = jest.fn(() => throwError(signInError));
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            loginNavigationHandlerService.setSession({}, {}).catch(() => {
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(signInError.message);
            });
            // assert
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
    });
});
