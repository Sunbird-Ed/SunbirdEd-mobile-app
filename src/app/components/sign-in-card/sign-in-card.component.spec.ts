import {SignInCardComponent} from './sign-in-card.component';
import {ProfileService, AuthService, SharedPreferences, Profile, ProfileType, ProfileSource, SignInError} from 'sunbird-sdk';
import {
    CommonUtilService, AppGlobalService, TelemetryGeneratorService,
    ContainerService, FormAndFrameworkUtilService
} from '../../../services';
import {NavController} from '@ionic/angular';
import {Events} from '@app/util/events';
import {NgZone} from '@angular/core';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {of, throwError} from 'rxjs';
import {SbProgressLoader} from '../../../services/sb-progress-loader.service';
import {Router} from '@angular/router';

jest.mock('sunbird-sdk', () => {
    const actual = require.requireActual('sunbird-sdk');
    return {
        ...actual,
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

describe('SignInCardComponent', () => {
    let signInCardComponent: SignInCardComponent;
    const mockProfileService: Partial<ProfileService> = {};
    const mockAuthService: Partial<AuthService> = {
        setSession: jest.fn()
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockNavController: Partial<NavController> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockEvents: Partial<Events> = {};

    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockRouter: Partial<Router> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        signInCardComponent = new SignInCardComponent(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockNavController as NavController,
            mockContainerService as ContainerService,
            mockNgZone as NgZone,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockSbProgressLoader as SbProgressLoader
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SignInCardComponent', () => {
        expect(signInCardComponent).toBeTruthy();
    });

    describe('signIn test cases', () => {
        it('should take case scenarios from sign in flow', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            signInCardComponent.fromEnrol = false;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => of(undefined));
            mockSbProgressLoader.show = jest.fn();
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            const mockProfileData: Profile = {
                uid: 'sample_id',
                handle: 'sample_name',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                profileUserType: {
                    type: 'OTHER'
                },
                serverProfile: {
                    uid: 'sample_id',
                    handle: 'sample_name',
                    profileType: ProfileType.TEACHER,
                    source: ProfileSource.SERVER
                },
                rootOrg: {
                    slug: 'sample_slug',
                    orgName: 'sample_orgName'
                }
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData));
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            mockProfileService.createProfile = jest.fn(() => of(mockProfileData));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({}));
            mockProfileService.getTenantInfo = jest.fn(() => of({
                title: 'sample_title',
                logo: 'sample_logo',
            }));
            mockProfileService.isDefaultChannelProfile = jest.fn(() => of(true));
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(global.splashscreen, 'setContent').mockImplementation();
            mockAppGlobalService.signinOnboardingLoader = false;
            mockNgZone.run = jest.fn((cb) => {
                cb();
            }) as any;
            signInCardComponent.source = 'courses';
            mockRouter.navigateByUrl = jest.fn();
            mockEvents.publish = jest.fn();
            // act
            signInCardComponent.signIn({redirectUrlAfterLogin: true});
            // assert
            setTimeout(() => {
                expect(dismissFn).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockProfileService.createProfile).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.updateLoggedInUser).toHaveBeenCalled();
                expect(global.splashscreen.setContent).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should take error cases in refresh ProfileData error case scenarios from sign in flow', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            signInCardComponent.fromEnrol = false;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => of(undefined));
            mockSbProgressLoader.show = jest.fn();
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            const mockProfileData: Profile = {
                uid: 'sample_id',
                handle: 'sample_name',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                profileUserType: {
                    type: 'Teacher'
                },
                serverProfile: {
                    uid: 'sample_id',
                    handle: 'sample_name',
                    profileType: ProfileType.TEACHER,
                    source: ProfileSource.SERVER
                },
                rootOrg: {
                    slug: 'sample_slug',
                    orgName: 'sample_orgName'
                }
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData));
            mockProfileService.createProfile = jest.fn(() => of(mockProfileData));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => throwError('error'));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({}));
            jest.spyOn(console, 'log').mockImplementation();
            mockAppGlobalService.signinOnboardingLoader = false;
            mockNgZone.run = jest.fn((cb) => {
                cb();
            }) as any;
            signInCardComponent.source = 'courses';
            mockRouter.navigateByUrl = jest.fn();
            mockEvents.publish = jest.fn();
            // act
            signInCardComponent.signIn({redirectUrlAfterLogin: true});
            // assert
            setTimeout(() => {
                expect(dismissFn).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockProfileService.createProfile).toHaveBeenCalled();
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('signIn error test cases', () => {

        it('should go to catch part if refresh profile data and profileData returns error', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            mockRouter.navigateByUrl = jest.fn();

            const signInError = new SignInError('error');
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => throwError(signInError));
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInCardComponent.signIn();
            setTimeout(() => {
                // assert
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(signInError.message);
                done();
            }, 0);
        });

        it('should go to catch part if refresh profile data and profileData returns error other in signIn error', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockRouter.navigateByUrl = jest.fn();

            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => throwError());
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInCardComponent.signIn();
            setTimeout(() => {
                // assert
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
                done();
            }, 0);
        });

        it('should go to catch block if getWebviewSessionProviderConfig returns and error', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            signInCardComponent.fromEnrol = true;
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.reject('error'));
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInCardComponent.signIn().then(() => {
                // assert
                expect(dismissFn).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
                done();
            });
        });

        it('should go to catch block if getSession returns undefined', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            signInCardComponent.fromEnrol = false;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => of(undefined));
            mockSbProgressLoader.show = jest.fn();
            mockAuthService.getSession = jest.fn(() => of(throwError('error')));
            mockProfileService.getServerProfilesDetails = jest.fn(() => of());
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInCardComponent.signIn();

            setTimeout(() => {
                expect(mockAuthService.getSession).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
                done();
            }, 0);
        });

        it('should go to catch block if getServerProfileDetails throw error', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            signInCardComponent.fromEnrol = false;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => of(undefined));
            mockSbProgressLoader.show = jest.fn();
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            mockProfileService.getServerProfilesDetails = jest.fn(() => throwError('error'));
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();

            // act
            signInCardComponent.signIn();
            setTimeout(() => {
                expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
                done();
            }, 0);
        });

        it('should go to catch block if create profile throws error', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            signInCardComponent.fromEnrol = false;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            jest.spyOn(mockAuthService, 'setSession').mockImplementation(() => of(undefined));
            mockSbProgressLoader.show = jest.fn();
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            mockSbProgressLoader.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            const mockProfileData: Profile = {
                uid: 'sample_id',
                handle: 'sample_name',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                profileUserType: {
                    type: 'OTHER'
                },
                serverProfile: {
                    uid: 'sample_id',
                    handle: 'sample_name',
                    profileType: ProfileType.TEACHER,
                    source: ProfileSource.SERVER
                },
                rootOrg: {
                    slug: 'sample_slug',
                    orgName: 'sample_orgName'
                }
            };
            mockRouter.navigateByUrl = jest.fn();
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(mockProfileData));
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            mockProfileService.createProfile = jest.fn(() => throwError('error'));
            // act
            signInCardComponent.signIn();
            // assert
            setTimeout(() => {
                expect(mockProfileService.createProfile).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
