import { LoginHandlerService } from './login-handler.service';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CommonUtilService } from './../services/common-util.service';
import { FormAndFrameworkUtilService } from './../services/formandframeworkutil.service';
import {
    SharedPreferences,
} from 'sunbird-sdk';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { LoginNavigationHandlerService } from '@app/services/login-navigation-handler.service';
import { of } from 'rxjs';
import { UtilityService } from '@app/services/utility-service';
import { Platform } from '@ionic/angular';

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

describe('LoginHandlerService', () => {
    let loginHandlerService: LoginHandlerService;
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockRouter: Partial<Router> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockLoginNavigationHandlerService: Partial<LoginNavigationHandlerService> = {};
    const mockutilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn()
    }
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform !== 'ios')
    };


    beforeAll(() => {
        loginHandlerService = new LoginHandlerService(
            mockSharedPreferences as SharedPreferences,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockSbProgressLoader as SbProgressLoader,
            mockAppGlobalService as AppGlobalService,
            mockLoginNavigationHandlerService as LoginNavigationHandlerService,
            mockutilityService as UtilityService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('LoginHandlerService', () => {
        it('should be able to create an instance', () => {
            expect(loginHandlerService).toBeDefined();
        });

        describe('signin', () => {
            it('should do  nothing if the network is unavailable', (done) => {
                //arrange
                mockAppGlobalService.resetSavedQuizContent = jest.fn();
                mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
                //act
                loginHandlerService.signIn({ fromEnrol: false });
                //assert
                setTimeout(() => {
                    expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                    expect(!mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                    done();
                }, 0)
            });
            it('should fetch from form configuration for login session ', (done) => {
                // arrange
                mockAppGlobalService.resetSavedQuizContent = jest.fn();
                mockSharedPreferences.putString = jest.fn(() => of(undefined));
                mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                const dismissFn = jest.fn(() => Promise.resolve());
                const presentFn = jest.fn(() => Promise.resolve());
                mockCommonUtilService.getLoader = jest.fn(() => ({
                    present: presentFn,
                    dismiss: dismissFn,
                }));
                const customWebViewConfig = new Map();
                (window['device'] = {
                    manufacturer: "Jio".toLowerCase()
                })
                mockutilityService.getBuildConfigValue = jest.fn(() => "jio")
                customWebViewConfig.set('extraParams', 'com.jio.web.stbpc')
                mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }));
                mockLoginNavigationHandlerService.setSession = jest.fn();
                mockSbProgressLoader.hide = jest.fn();
                // act
                loginHandlerService.signIn({ fromEnrol: false });
                // assert
                setTimeout(() => {
                    expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                    expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                    expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                    done();
                }, 0);
            });
            it('should fetch from form configuration for login session for different devices ', (done) => {
                // arrange
                mockAppGlobalService.resetSavedQuizContent = jest.fn();
                mockSharedPreferences.putString = jest.fn(() => of(undefined));
                mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                const dismissFn = jest.fn(() => Promise.resolve());
                const presentFn = jest.fn(() => Promise.resolve());
                mockCommonUtilService.getLoader = jest.fn(() => ({
                    present: presentFn,
                    dismiss: dismissFn,
                }));
                const customWebViewConfig = new Map();
                (window['device'] = {
                    manufacturer: "OTHER".toLowerCase()
                })
                mockutilityService.getBuildConfigValue = jest.fn(() => "OTHER")
                customWebViewConfig.set('extraParams', 'com.android.chrome')
                mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve({
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }));
                mockLoginNavigationHandlerService.setSession = jest.fn();
                mockSbProgressLoader.hide = jest.fn();
                // act
                loginHandlerService.signIn({ fromEnrol: false });
                // assert
                setTimeout(() => {
                    expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                    expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                    expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                    done();
                }, 0);
            });
            it('should execute catch block ', (done) => {
                // arrange
                mockAppGlobalService.resetSavedQuizContent = jest.fn();
                mockSharedPreferences.putString = jest.fn(() => of(undefined));
                mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                const dismissFn = jest.fn(() => Promise.resolve());
                const presentFn = jest.fn(() => Promise.resolve());
                mockCommonUtilService.getLoader = jest.fn(() => ({
                    present: presentFn,
                    dismiss: dismissFn,
                }));
                mockCommonUtilService.showToast = jest.fn();
                mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.reject());
                mockLoginNavigationHandlerService.setSession = jest.fn();
                mockSbProgressLoader.hide = jest.fn();
                // act
                loginHandlerService.signIn({ fromEnrol: false });
                // assert
                setTimeout(() => {
                    expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                    expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                    expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                    done();
                }, 0);
            });
        });

    });
});
