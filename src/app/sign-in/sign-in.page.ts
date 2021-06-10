import {Component, Inject, OnInit} from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    LoginHandlerService
} from '@app/services';
import {
    WebviewStateSessionProviderConfig,
    WebviewRegisterSessionProviderConfig,
    WebviewStateSessionProvider,
    WebviewSessionProviderConfig,
    WebviewLoginSessionProvider,
    NativeGoogleSessionProvider,
    AuthService,
    SystemSettingsService,
    SignInError
} from 'sunbird-sdk';
import {Router} from '@angular/router';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {LoginNavigationHandlerService} from '@app/services/login-navigation-handler.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {SystemSettingsIds} from '@app/app/app.constant';
import {Location} from '@angular/common';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.page.html',
    styleUrls: ['./sign-in.page.scss'],
    providers: [LoginNavigationHandlerService]
})
export class SignInPage implements OnInit {
    appName = '';
    skipNavigation: any;

    constructor(
        @Inject('AUTH_SERVICE') private authService: AuthService,
        @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
        private appHeaderService: AppHeaderService,
        private commonUtilService: CommonUtilService,
        private loginHandlerService: LoginHandlerService,
        private router: Router,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private sbProgressLoader: SbProgressLoader,
        private loginNavigationHandlerService: LoginNavigationHandlerService,
        private googlePlusLogin: GooglePlus,
        private location: Location
    ) {
        this.skipNavigation = this.router.getCurrentNavigation().extras.state;
    }

    async ngOnInit() {
        this.appHeaderService.showHeaderWithBackButton();
        this.appName = await this.commonUtilService.getAppName();
    }

    loginWithKeyCloak() {
        this.loginHandlerService.signIn(this.skipNavigation).then(() => {
            this.navigateBack(this.skipNavigation);
        });
    }

    async loginWithStateSystem() {
        const webviewSessionProviderConfigLoader = await this.commonUtilService.getLoader();
        let webviewStateSessionProviderConfig: WebviewStateSessionProviderConfig;
        let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;
        await webviewSessionProviderConfigLoader.present();
        try {
            webviewStateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('state');
            webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
            await webviewSessionProviderConfigLoader.dismiss();
        } catch (e) {
            await this.sbProgressLoader.hide({id: 'login'});
            await webviewSessionProviderConfigLoader.dismiss();
            this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
            return;
        }
        const webViewStateSession = new WebviewStateSessionProvider(
            webviewStateSessionProviderConfig,
            webviewMigrateSessionProviderConfig
        );
        await this.loginNavigationHandlerService.setSession(webViewStateSession, this.skipNavigation).then(() => {
            this.navigateBack(this.skipNavigation);
        });
    }

    async signInWithGoogle() {
        const clientId = await this.systemSettingsService.getSystemSettings({id: SystemSettingsIds.GOOGLE_CLIENT_ID}).toPromise();
        this.googlePlusLogin.login({
            webClientId: clientId.value
        }).then(async (result) => {
            await this.sbProgressLoader.show({id: 'login'});
            const nativeSessionGoogleProvider = new NativeGoogleSessionProvider(() => result);
            await this.loginNavigationHandlerService.setSession(nativeSessionGoogleProvider, this.skipNavigation).then(() => {
                this.navigateBack(this.skipNavigation);
            });
        }).catch(async (err) => {
            this.sbProgressLoader.hide({id: 'login'});
            if (err instanceof SignInError) {
                this.commonUtilService.showToast(err.message);
            } else {
                this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
            }
        });
    }

    async register() {
        const webviewSessionProviderConfigLoader = await this.commonUtilService.getLoader();
        let webviewRegisterSessionProviderConfig: WebviewRegisterSessionProviderConfig;
        let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;
        await webviewSessionProviderConfigLoader.present();
        try {
            webviewRegisterSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('register');
            webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
            await webviewSessionProviderConfigLoader.dismiss();
        } catch (e) {
            await this.sbProgressLoader.hide({id: 'login'});
            await webviewSessionProviderConfigLoader.dismiss();
            this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
            return;
        }
        const webViewRegisterSession = new WebviewLoginSessionProvider(
            webviewRegisterSessionProviderConfig,
            webviewMigrateSessionProviderConfig
        );
        await this.loginNavigationHandlerService.setSession(webViewRegisterSession, this.skipNavigation).then(() => {
            this.navigateBack(this.skipNavigation);
        });
    }

    private navigateBack(skipNavigation) {
        if (skipNavigation.navigateToCourse) {
            this.location.back();
        }
    }
}
