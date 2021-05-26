import {Component, Inject, NgZone, OnInit} from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService, ContainerService,
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
    ProfileService,
    SharedPreferences,
    SignInError
} from 'sunbird-sdk';
import {Router} from '@angular/router';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {LoginNavigationHandlerService} from '@app/services/login-navigation-handler.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {EventTopics, PreferenceKey} from '@app/app/app.constant';
import {initTabs, LOGIN_TEACHER_TABS} from '@app/app/module.service';
import {Events} from '@app/util/events';
import {AuthKeys} from '../../../../sunbird-mobile-sdk/tmp/preference-keys';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.page.html',
    styleUrls: ['./sign-in.page.scss'],
    providers: [LoginNavigationHandlerService]
})
export class SignInPage implements OnInit {
    appName = '';
    skipNavigation: any;
    userData: any = {};

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private appHeaderService: AppHeaderService,
        private commonUtilService: CommonUtilService,
        private loginHandlerService: LoginHandlerService,
        private router: Router,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private sbProgressLoader: SbProgressLoader,
        private loginNavigationHandlerService: LoginNavigationHandlerService,
        private googlePlusLogin: GooglePlus,
        private events: Events,
        private appGlobalService: AppGlobalService,
        private container: ContainerService,
        private ngZone: NgZone,


    ) {
        this.skipNavigation = this.router.getCurrentNavigation().extras.state;
    }

    async ngOnInit() {
        this.appHeaderService.showHeaderWithBackButton();
        this.appName = await this.commonUtilService.getAppName();
    }

    loginWithKeyCloak() {
        this.loginHandlerService.signIn(this.skipNavigation);
    }

    async loginWithStateSystem(skipNavigation = this.skipNavigation) {
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
        await this.loginNavigationHandlerService.setSession(webViewStateSession, skipNavigation);
    }

    signInWithGoogle() {
        this.googlePlusLogin.login({
            webClientId: '525350998139-cjr1m4a2p1i296p588vff7qau924et79.apps.googleusercontent.com'
        }).then((result) => {
            this.userData = result;
            const nativeSessionGoogleProvider = new NativeGoogleSessionProvider(() => result);
            nativeSessionGoogleProvider.provide()
                .then(async (sessionData) => {
                    await this.preferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData)).toPromise();
                    await this.sbProgressLoader.show(this.loginNavigationHandlerService.generateIgnoreTelemetryContext());
                    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
                    // set default guest user for Quiz deeplink
                    const isOnboardingCompleted =
                        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true');
                    if (!isOnboardingCompleted) {
                        await this.loginNavigationHandlerService.setDefaultProfileDetails();

                        // To avoid race condition
                        if (this.appGlobalService.limitedShareQuizContent) {
                            this.appGlobalService.skipCoachScreenForDeeplink = true;
                        }
                    }
                    if (this.skipNavigation && this.skipNavigation.redirectUrlAfterLogin) {
                        this.appGlobalService.redirectUrlAfterLogin = this.skipNavigation.redirectUrlAfterLogin;
                    }
                    this.appGlobalService.preSignInData = (this.skipNavigation && this.skipNavigation.componentData) || null;
                    initTabs(this.container, LOGIN_TEACHER_TABS);
                    return this.loginNavigationHandlerService.refreshProfileData();
                })
                .then(value => {
                    return this.loginNavigationHandlerService.refreshTenantData(value.slug, value.title);
                })
                .then(async () => {
                    this.ngZone.run(() => {
                        this.preferences.putString(PreferenceKey.NAVIGATION_SOURCE, this.skipNavigation && this.skipNavigation.source).toPromise();
                        this.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
                        this.events.publish(EventTopics.SIGN_IN_RELOAD, this.skipNavigation);
                        this.sbProgressLoader.hide({id: 'login'});
                    });
                })
                .catch(async (err) => {
                    this.sbProgressLoader.hide({id: 'login'});
                    if (err instanceof SignInError) {
                        this.commonUtilService.showToast(err.message);
                    } else {
                        this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
                    }
                });
        }).catch((result) => {
            console.log('error in google sign in', result);
        });
    }

    async register(skipNavigation = this.skipNavigation) {
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
        await this.loginNavigationHandlerService.setSession(webViewRegisterSession, skipNavigation);
    }

}
