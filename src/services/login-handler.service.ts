import {Inject, Injectable} from '@angular/core';
import {
    SharedPreferences,
    WebviewLoginSessionProvider,
    WebviewSessionProviderConfig
} from 'sunbird-sdk';

import {PreferenceKey} from '@app/app/app.constant';
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
import {Router} from '@angular/router';

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
        // clean the preferences to avoid unnecessary enrolment
        if (!skipNavigation.fromEnrol) {
            this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
            this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, '').toPromise();
        }

        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        } else {
            this.generateLoginInteractTelemetry(InteractType.TOUCH, InteractSubtype.LOGIN_INITIATE, '');

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

            await this.loginNavigationHandlerService.setSession(webViewLoginSession, skipNavigation);
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
