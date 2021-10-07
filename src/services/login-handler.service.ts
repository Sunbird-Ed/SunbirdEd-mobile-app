import {Inject, Injectable} from '@angular/core';
import {
    SharedPreferences,
    WebviewLoginSessionProvider,
    WebviewSessionProviderConfig
} from 'sunbird-sdk';

import {
    FormAndFrameworkUtilService,
    CommonUtilService,
    TelemetryGeneratorService,
    AppGlobalService,
    SbProgressLoader,
    LoginNavigationHandlerService
} from '@app/services';
import {
    Environment,
    InteractSubtype,
    InteractType,
    PageId
} from '@app/services/telemetry-constants';

@Injectable()
export class LoginHandlerService {

    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private commonUtilService: CommonUtilService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private sbProgressLoader: SbProgressLoader,
        private appGlobalService: AppGlobalService,
        private loginNavigationHandlerService: LoginNavigationHandlerService
    ) {
    }

    async signIn(skipNavigation?) {
        this.appGlobalService.resetSavedQuizContent();

        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        } else {
            this.generateLoginInteractTelemetry(InteractType.LOGIN_INITIATE, InteractSubtype.KEYCLOAK, '');

            const that = this;
            const webviewSessionProviderConfigloader = await this.commonUtilService.getLoader();

            let webviewLoginSessionProviderConfig: WebviewSessionProviderConfig;
            let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;

            await webviewSessionProviderConfigloader.present();
            try {
                webviewLoginSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('login');
                webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
                await webviewSessionProviderConfigloader.dismiss();
            } catch (e) {
                this.sbProgressLoader.hide({id: 'login'});
                await webviewSessionProviderConfigloader.dismiss();
                this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
                return;
            }
            const webViewLoginSession = new WebviewLoginSessionProvider(
                webviewLoginSessionProviderConfig,
                webviewMigrateSessionProviderConfig
            );

            await this.loginNavigationHandlerService.setSession(webViewLoginSession, skipNavigation, InteractSubtype.KEYCLOAK);
        }
    }

    private generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
        const valuesMap = new Map();
        valuesMap['UID'] = uid;
        this.telemetryGeneratorService.generateInteractTelemetry(
            interactType,
            interactSubtype,
            Environment.HOME,
            PageId.LOGIN,
            undefined,
            valuesMap);
    }
}