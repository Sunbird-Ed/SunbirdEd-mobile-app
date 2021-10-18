import {SignInPage} from './sign-in.page';
import {
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    InteractSubtype,
    InteractType,
    LoginHandlerService,
    LoginNavigationHandlerService
} from '@app/services';
import {Router} from '@angular/router';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {SystemSettingsService, AuthService, SharedPreferences, SignInError} from '@project-sunbird/sunbird-sdk';
import {Location} from '@angular/common';
import {of} from 'rxjs';
import {SystemSettingsIds} from '@app/app/app.constant';

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

describe('SignInPage', () => {
    let signInPage: SignInPage;
    const mockAuthService: Partial<AuthService> = {};
    const mockSystemSettingService: Partial<SystemSettingsService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    navigateToCourse: true,
                    source: 'user'
                }
            }
        }))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockSbProgressLoaderService: Partial<SbProgressLoader> = {};
    const mockLoginNavigationHandlerService: Partial<LoginNavigationHandlerService> = {};
    const mockGooglePlusLogin: Partial<GooglePlus> = {};
    const mockLocation: Partial<Location> = {};

    beforeAll(() => {
        signInPage = new SignInPage(
            mockAuthService as AuthService,
            mockSystemSettingService as SystemSettingsService,
            mockSharedPreferences as SharedPreferences,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockLoginHandlerService as LoginHandlerService,
            mockRouter as Router,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockSbProgressLoaderService as SbProgressLoader,
            mockLoginNavigationHandlerService as LoginNavigationHandlerService,
            mockGooglePlusLogin as GooglePlus,
            mockLocation as Location
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of signInPage ', () => {
        // assert
        expect(signInPage).toBeTruthy();
    });

    it('should call appHeaderServiceWithBackButton and fetchAppName', (done) => {
        // arrange
        mockAppHeaderService.showHeaderWithBackButton = jest.fn();
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('SUNBIRD'));
        // act
        signInPage.ngOnInit();
        // assert
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call loginHandlerService signIn()', (done) => {
        // arrange
        mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
        mockLocation.back = jest.fn();
        // act
        signInPage.loginWithKeyCloak();
        // assert
        setTimeout(() => {
            expect(mockLoginHandlerService.signIn).toHaveBeenCalledWith({navigateToCourse: true, source: 'user'});
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('state-signIn-system', () => {
        it('should call loginInteractTelemetry and create stateSessionProvider and call signIn()', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockLocation.back = jest.fn();
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve(
                {
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }
            ));
            mockLoginNavigationHandlerService.setSession = jest.fn(() => Promise.resolve());
            // act
            signInPage.loginWithStateSystem().then(() => {
                // assert
                expect(mockLoginNavigationHandlerService.generateLoginInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.LOGIN_INITIATE,
                    InteractSubtype.STATE,
                    ''
                );
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
            });
        });

        it('should go to catch block if formAndFrameworkService.getWebviewSessionProviderConfig throws error', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSbProgressLoaderService.hide = jest.fn();
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.reject());
            // act
            signInPage.loginWithStateSystem().catch(() => {
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('state');
                expect(mockSbProgressLoaderService.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
            });
            // assert
        });
    });

    describe('signIn with Google', () => {
        it('should generate telemetry and fetchClientId, googleLogin initiated, show progressLoader and put preference boolean', (done) => {
            // arrange
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSystemSettingService.getSystemSettings = jest.fn(() => of({
                value: 'sample_client_id'
            }));
            mockGooglePlusLogin.login = jest.fn(() => Promise.resolve());
            mockSbProgressLoaderService.show = jest.fn();
            mockSharedPreferences.putBoolean = jest.fn(() => of(true));
            mockLoginNavigationHandlerService.setSession = jest.fn(() => Promise.resolve());
            mockLocation.back = jest.fn();
            // act
            signInPage.signInWithGoogle().then(() => {
                // assert
                expect(mockLoginNavigationHandlerService.generateLoginInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.LOGIN_INITIATE,
                    InteractSubtype.GOOGLE,
                    ''
                );
                expect(mockSystemSettingService.getSystemSettings).toHaveBeenCalledWith({id: SystemSettingsIds.GOOGLE_CLIENT_ID});
                expect(mockGooglePlusLogin.login).toHaveBeenCalledWith({webClientId: 'sample_client_id'});
                expect(mockSbProgressLoaderService.show).toHaveBeenCalledWith({id: 'login'});
            });
            setTimeout(() => {
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
                expect(mockSharedPreferences.putBoolean).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should go to catch part if google login initiated result failed and close the progressBar and show toast', () => {
            // arrange
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSystemSettingService.getSystemSettings = jest.fn(() => of({
                value: 'sample_client_id'
            }));
            mockGooglePlusLogin.login = jest.fn(() => Promise.reject());
            mockSbProgressLoaderService.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInPage.signInWithGoogle().catch(() => {
                // assert
                expect(mockSbProgressLoaderService.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith({translationKey: 'ERROR_WHILE_LOGIN'});
            });
        });

        it('should go to catch part if google login initiated result failed and close the progressBar and show if error instance is sign in error', () => {
            // arrange
            const signInError = new SignInError('error');
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSystemSettingService.getSystemSettings = jest.fn(() => of({
                value: 'sample_client_id'
            }));
            mockGooglePlusLogin.login = jest.fn(() => Promise.reject(signInError));
            mockSbProgressLoaderService.hide = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInPage.signInWithGoogle().catch(() => {
                // assert
                expect(mockSbProgressLoaderService.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(signInError.message);
            });
        });
    });

    describe('register', () => {
        it('should create new registerSessionProvider,  fetch the loader, ' +
            'webviewSessionProviderConfig setSession for loginNavigation', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockLocation.back = jest.fn();
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.resolve(
                {
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }
            ));
            mockLoginNavigationHandlerService.setSession = jest.fn(() => Promise.resolve());
            // act
            signInPage.register().then(() => {
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalled();
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
            });
        });

        it('should goto catch block if webViewSessionProvideConfig throws error', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockSbProgressLoaderService.hide = jest.fn();
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.reject());
            // act
            signInPage.register().catch(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('register');
                expect(mockSbProgressLoaderService.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
            });
        });
    });
});
