import { LoginHandlerService } from './login-handler.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { CommonUtilService } from './../services/common-util.service';
import { FormAndFrameworkUtilService } from './../services/formandframeworkutil.service';
import { AppGlobalService } from '../services/app-global-service.service';
import { SbProgressLoader } from '../services/sb-progress-loader.service';
import { LoginNavigationHandlerService } from '../services/login-navigation-handler.service';
import { of } from 'rxjs';

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
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockLoginNavigationHandlerService: Partial<LoginNavigationHandlerService> = {};

    beforeAll(() => {
        loginHandlerService = new LoginHandlerService(
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockSbProgressLoader as SbProgressLoader,
            mockAppGlobalService as AppGlobalService,
            mockLoginNavigationHandlerService as LoginNavigationHandlerService
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
                    expect(!mockCommonUtilService.networkInfo?.isNetworkAvailable).toBeTruthy();
                    done();
                }, 0)
            });
            it('should fetch from form configuration for login session ', (done) => {
                // arrange
                mockAppGlobalService.resetSavedQuizContent = jest.fn();
                mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
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