import { LoginHandlerService } from './login-handler.service';
import { AppGlobalService } from './app-global-service.service';
import { Events, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { NgZone } from '@angular/core';
import { ContainerService } from './../services/container.services';
import { CommonUtilService } from './../services/common-util.service';
import { FormAndFrameworkUtilService } from './../services/formandframeworkutil.service';
import {
    ProfileService,
    AuthService,
    ApiService,
    SdkConfig,
    SharedPreferences,
    ProfileType,
    ProfileSource,
} from 'sunbird-sdk';
import { isRegExp } from 'util';
import { of } from 'rxjs';

jest.mock('sunbird-sdk', () => {
    const actual = require.requireActual('sunbird-sdk');
    return {
        ...actual,
        WebviewLoginSessionProvider: function () {}
    };
});

jest.mock('@app/app/module.service', () => {
    const actual = require.requireActual('@app/app/module.service');
    return {
        ...actual,
        initTabs: jest.fn().mockImplementation(() => { })
    };
});

describe('LoginHandlerService', () => {
    let loginHandlerService: LoginHandlerService;
    const loader = {
        dismiss: jest.fn(),
        present: jest.fn()
    };
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(),
        setActiveSessionForProfile: jest.fn(),
        getActiveSessionProfile: jest.fn()
    };
    const mockAuthService: Partial<AuthService> = {
        setSession: jest.fn()
    };
    const mockApiService: Partial<ApiService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn()
    };
    const mockNavController: Partial<NavController> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('version'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(),
        showToast: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getWebviewSessionProviderConfig: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockRouter: Partial<Router> = {};
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn()
    };

    beforeAll(() => {
        loginHandlerService = new LoginHandlerService(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockApiService as ApiService,
            mockSdkConfig as SdkConfig,
            mockSharedPreferences as SharedPreferences,
            mockNavController as NavController,
            mockContainerService as ContainerService,
            mockNgZone as NgZone,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRouter as Router,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    describe('LoginHandlerService', () => {
        it('should be able to create an instance', () => {
            expect(loginHandlerService).toBeDefined();
        });
    });

    describe('signIn()', () => {
        it('should in-memory preference skipCoachScreenForDeeplink if limitedShareQuizContent', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
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
            mockSharedPreferences.getString = jest.fn(() => of('false'));
            jest.spyOn(loginHandlerService, 'setDefaultProfileDetails').mockImplementation(() => {
                return Promise.resolve('profile');
            });
            jest.spyOn(loginHandlerService, 'refreshProfileData').mockImplementation(() => {
                return Promise.resolve({ slug: 'SOME_SLUG', title: 'SOME_TITLE' });
            });
            jest.spyOn(loginHandlerService, 'refreshTenantData').mockImplementation(() => {
                return Promise.resolve(undefined);
            });
            mockAppGlobalService.limitedShareQuizContent = 'limit';
            // act
            loginHandlerService.signIn().then(() => {
                // assert
                expect(dismissFn).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockAppGlobalService.limitedShareQuizContent).toEqual("limit");
                done();
            });
        });

        it('should in-memory preference showCoachScreenForDeeplink if nolimitedShareQuizContent', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
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
            mockSharedPreferences.getString = jest.fn(() => of('false'));
            jest.spyOn(loginHandlerService, 'setDefaultProfileDetails').mockImplementation(() => {
                return Promise.resolve('profile');
            });
            jest.spyOn(loginHandlerService, 'refreshProfileData').mockImplementation(() => {
                return Promise.resolve({ slug: 'SOME_SLUG', title: 'SOME_TITLE' });
            });
            jest.spyOn(loginHandlerService, 'refreshTenantData').mockImplementation(() => {
                return Promise.resolve(undefined);
            });
            mockAppGlobalService.limitedShareQuizContent = undefined;
            // act
            loginHandlerService.signIn().then(() => {
                // assert
                expect(dismissFn).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(mockAuthService.setSession).toHaveBeenCalled();
                expect(mockAppGlobalService.limitedShareQuizContent).toEqual(undefined);
                done();
            });
        });
    });

    describe('getDefaultProfileRequest()', () => {
        it('should return profile', () => {
            // arrange
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockReturnValue({ uid: 'uid' });
            // act
            const response = loginHandlerService.getDefaultProfileRequest();
            // assert
            expect(response).toEqual({
                uid: 'uid',
                handle: 'Guest1',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.LOCAL
            });
        });
    });

    describe('setDefaultProfileDetails()', () => {
        it('should call publish and putString methods', (done) => {
            // arrange
            jest.spyOn(loginHandlerService, 'getDefaultProfileRequest').mockReturnValue({ uid: 'uid' });
            jest.spyOn(mockProfileService, 'updateProfile').mockReturnValue(of({}));
            jest.spyOn(mockProfileService, 'setActiveSessionForProfile').mockReturnValue(of({}));
            jest.spyOn(mockProfileService, 'getActiveSessionProfile').mockReturnValue(of(Promise.resolve({ uid: 'uid' })));
            jest.spyOn(mockEvents, 'publish');
            jest.spyOn(mockSharedPreferences, 'putString');

            // act
            loginHandlerService.setDefaultProfileDetails().then(() => {
                // assert
                expect(mockEvents.publish).toBeCalledTimes(1);
                expect(mockSharedPreferences.putString).toBeCalled();
                done();
            });
        });

        it('should call publish, not putString', (done) => {
            // arrange
            jest.spyOn(loginHandlerService, 'getDefaultProfileRequest').mockReturnValue({ uid: 'uid' });
            jest.spyOn(mockProfileService, 'updateProfile').mockReturnValue(of({}));
            jest.spyOn(mockProfileService, 'setActiveSessionForProfile').mockReturnValue(of({}));
            jest.spyOn(mockProfileService, 'getActiveSessionProfile').mockReturnValue(of({ uid: 'null' }));
            jest.spyOn(mockEvents, 'publish');
            jest.spyOn(mockSharedPreferences, 'putString');

            // act
            loginHandlerService.setDefaultProfileDetails().then(() => {
                // assert
                expect(mockEvents.publish).toBeCalledTimes(1);
                expect(mockSharedPreferences.putString).not.toBeCalled();
                done();
            });
        });
    });
});
