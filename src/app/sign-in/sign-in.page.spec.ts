import {SignInPage} from './sign-in.page';
import {
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    InteractSubtype,
    InteractType,
    LoginNavigationHandlerService
} from '../../services';
import {Router} from '@angular/router';
import {SbProgressLoader} from '../../services/sb-progress-loader.service';
import {GooglePlus} from '@awesome-cordova-plugins/google-plus/ngx';
import {SystemSettingsService, AuthService, SharedPreferences, SignInError} from '@project-sunbird/sunbird-sdk';
import {Location} from '@angular/common';
import {of} from 'rxjs';
import {PreferenceKey, SystemSettingsIds} from '../../app/app.constant';
import {AppleSignInResponse, SignInWithApple} from '@awesome-cordova-plugins/sign-in-with-apple/ngx';
import {Platform} from '@ionic/angular';
import { AppGlobalService, LoginHandlerService } from '../../services';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

jest.mock('@project-sunbird/sunbird-sdk', () => {
    const actual = jest.requireActual('@project-sunbird/sunbird-sdk');
    return {
        ...actual,
        WebviewStateSessionProvider() {
        },
        NativeGoogleSessionProvider() {
        },
        WebviewLoginSessionProvider() {
        },
        NativeAppleSessionProvider() {
        },
        NativeKeycloakSessionProvider() {
        }
    };
});

describe('SignInPage', () => {
    let signInPage: SignInPage;
    const mockSystemSettingService: Partial<SystemSettingsService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putBoolean: jest.fn(),
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn(),
        showStatusBar: jest.fn(),
        hideStatusBar: jest.fn(),
        showHeaderWithHomeButton: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(),
        getLoader:  jest.fn(),
        showToast: jest.fn(),
        networkInfo: {
            isNetworkAvailable: false
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {}
            }
        }))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockSbProgressLoaderService: Partial<SbProgressLoader> = {
        hide: jest.fn(),
        show: jest.fn()
    };
    const mockLoginNavigationHandlerService: Partial<LoginNavigationHandlerService> = {
        setSession: jest.fn(),
        generateLoginInteractTelemetry: jest.fn()
    };
    const mockGooglePlusLogin: Partial<GooglePlus> = {
        login: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockSignInWithApple: Partial<SignInWithApple> = {
        signin: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {is: jest.fn(platform => platform === 'ios')};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        resetSavedQuizContent: jest.fn()
    }
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    window.cordova.plugins = {
        Keyboard: { hideKeyboardAccessoryBar: jest.fn() }
    };

    beforeAll(() => {
        signInPage = new SignInPage(
            mockSystemSettingService as SystemSettingsService,
            mockSharedPreferences as SharedPreferences,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockSbProgressLoaderService as SbProgressLoader,
            mockLoginNavigationHandlerService as LoginNavigationHandlerService,
            mockGooglePlusLogin as GooglePlus,
            mockLocation as Location,
            mockSignInWithApple as SignInWithApple,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService
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
        setTimeout(() => {
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('ionViewWillEnter', () => {
        it('should set status bar background white and default style', () => {
            // arrange
            mockAppHeaderService.hideStatusBar = jest.fn()
            // act
            signInPage.ionViewWillEnter();
            // assert
            expect(mockAppHeaderService.hideStatusBar).toHaveBeenCalled();
        })
    });

    describe('ionViewWillLeave', () => {
        it('should show status bar before view will leave', () => {
            // arrange
            mockAppHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
            mockAppHeaderService.showHeaderWithHomeButton = jest.fn(() => Promise.resolve());
            // act
            signInPage.ionViewWillLeave();
            // assert
            expect(mockAppHeaderService.showStatusBar).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            }, 0);
        })
    });

    describe('onFormLoginChange', () => {
        it('should set a data for login', () => {
            // arrange
            signInPage.loginDet = {username: 'test', password: "yasfd"};
            signInPage.loginButtonValidation = true;
            // act
            signInPage.onFormLoginChange({});
        })
    });

    describe('onLabelClickEvent', () => {
        it('should create a forgotpassword session provider,  fetch the loader, ' +
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
            signInPage.onLabelClickEvent().then(() => {
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalled();
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
            });
        });

        it('should goto catch block if webViewSessionProvideConfig throws error for forgot password', () => {
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
            signInPage.onLabelClickEvent().catch(() => {
                // assert
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                expect(mockSbProgressLoaderService.hide).toHaveBeenCalledWith({id: 'login'});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
            });
        });
    })

    describe('loginWithKeyCloak', () => {
        it('should do  nothing if the network is unavailable', () => {
            //arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            //act
            signInPage.loginWithKeyCloak();
            //assert
            setTimeout(() => {
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(!mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
            }, 0)
        });
        it('should fetch from form configuration for login session ', () => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
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
            signInPage.loginWithKeyCloak()
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig).toHaveBeenCalledWith('login');
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
            });
        });
        it('should execute catch block ', () => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.showToast = jest.fn();
            mockFormAndFrameworkUtilService.getWebviewSessionProviderConfig = jest.fn(() => Promise.reject());
            mockLoginNavigationHandlerService.setSession = jest.fn();
            mockSbProgressLoaderService.hide = jest.fn();
            // act
            signInPage.loginWithKeyCloak()
            // assert
            setTimeout(() => {
            }, 0);
        });
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
        it('should generate telemetry and fetchClientId, googleLogin initiated, show progressLoader and put preference boolean', () => {
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

    describe('appleSignIn', () => {
        it('should generate telemetry and initiate login process for apple', () => {
            // arrange
            const mockAppleResponse: AppleSignInResponse = {
                email: 'sampleEmailId',
                state: 'sampleState',
                identityToken: 'sampleToken',
                authorizationCode: 'sampleCode'
            };
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSignInWithApple.signin = jest.fn(() => Promise.resolve(mockAppleResponse));
            mockSbProgressLoaderService.show = jest.fn();
            mockSharedPreferences.putBoolean = jest.fn(() => of());
            mockSharedPreferences.putBoolean = jest.fn(() => of(true));
            mockLoginNavigationHandlerService.setSession = jest.fn(() => Promise.resolve());

            // act
            signInPage.appleSignIn().then(() => {
                expect(mockSbProgressLoaderService.show).toHaveBeenCalledWith({id: 'login'});
                expect(mockSharedPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.IS_APPLE_LOGIN, true);
                expect(mockLoginNavigationHandlerService.setSession).toHaveBeenCalled();
            });
            expect(mockLoginNavigationHandlerService.generateLoginInteractTelemetry).toHaveBeenCalled();
            // assert
        });

        it('should show toast if setSession fails', () => {
            // arrange
            const mockAppleResponse: AppleSignInResponse = {
                email: 'sampleEmailId',
                state: 'sampleState',
                identityToken: 'sampleToken',
                authorizationCode: 'sampleCode'
            };
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSignInWithApple.signin = jest.fn(() => Promise.resolve(mockAppleResponse));
            mockSbProgressLoaderService.show = jest.fn();
            mockSharedPreferences.putBoolean = jest.fn(() => of());
            mockSharedPreferences.putBoolean = jest.fn(() => of(true));
            mockLoginNavigationHandlerService.setSession = jest.fn(() => Promise.reject());
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInPage.appleSignIn().then(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
            });
            // assert
        });

        it('should check if error response in due to apple login', () => {
            // arrange
            mockLoginNavigationHandlerService.generateLoginInteractTelemetry = jest.fn();
            mockSignInWithApple.signin = jest.fn(() => Promise.reject());
            mockCommonUtilService.showToast = jest.fn();
            // act
            signInPage.appleSignIn().then(() => {
                // assert
                expect(mockLoginNavigationHandlerService.generateLoginInteractTelemetry).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_LOGIN');
            });
        });
    });
});