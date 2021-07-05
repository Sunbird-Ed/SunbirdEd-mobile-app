import {SignInPage} from './sign-in.page';
import {
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    LoginHandlerService,
    LoginNavigationHandlerService
} from '@app/services';
import {Router} from '@angular/router';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {SystemSettingsService, AuthService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {Location} from '@angular/common';

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
                state: {}
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
});
