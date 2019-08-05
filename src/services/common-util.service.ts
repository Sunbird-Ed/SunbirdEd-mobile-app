import { Injectable, NgZone, OnDestroy, Inject } from '@angular/core';
import {
    ToastController,
    LoadingController,
    Events,
    PopoverController,
    Platform,
    AlertController,
} from '@ionic/angular';
import { ToastOptions } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { SharedPreferences } from 'sunbird-sdk';

import { PreferenceKey } from '@app/app/app.constant';
import { appLanguages } from '@app/app/app.constant';

import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractType, InteractSubtype } from '@app/services/telemetry-constants';
import { SbGenericPopoverComponent } from '@app/app/components/popups';
import { QRAlertCallBack, QRScannerAlert } from '@app/app/qrscanner-alert/qrscanner-alert.page';

export interface NetworkInfo {
    isNetworkAvailable: boolean;
}
@Injectable()
export class CommonUtilService implements OnDestroy {
    public networkAvailability$: Observable<boolean>;

    networkInfo: NetworkInfo = {
        isNetworkAvailable: false
    };

    connectSubscription: any;

    disconnectSubscription: any;
    private alert?: any;
    private _currentTabName: string;

    constructor(
        private toastCtrl: ToastController,
        private translate: TranslateService,
        private loadingCtrl: LoadingController,
        private events: Events,
        private popOverCtrl: PopoverController,
        private network: Network,
        private zone: NgZone,
        private platform: Platform,
        private alertCtrl: AlertController,
        private telemetryGeneratorService: TelemetryGeneratorService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    ) {
        this.listenForEvents();

        this.networkAvailability$ = Observable.merge(
            this.network.onConnect().mapTo(true),
            this.network.onDisconnect().mapTo(false)
        );
    }

    listenForEvents() {
        this.handleNetworkAvailability();
    }

    showToast(translationKey, isInactive?, cssToast?, duration?, position?) {
        if (Boolean(isInactive)) {
            return;
        }

        this.translate.get(translationKey).subscribe(
            async (translatedMsg: any) => {
                const toastOptions: ToastOptions = {
                    message: translatedMsg,
                    duration: duration ? duration : 3000,
                    position: position ? position : 'bottom',
                    cssClass: cssToast ? cssToast : ''
                };

                const toast = await this.toastCtrl.create(toastOptions);
                await toast.present();
            }
        );
    }

    /**
     * Used to Translate message to current Language
     * @param messageConst - Message Constant to be translated
     * @returns translatedMsg - Translated Message
     */
    translateMessage(messageConst: string, fields?: string | any): string {
        let translatedMsg = '';
        let replaceObject: any = '';

        if (typeof (fields) === 'object') {
            replaceObject = fields;
        } else {
            replaceObject = { '%s': fields };
        }

        this.translate.get(messageConst, replaceObject).subscribe(
            (value: any) => {
                translatedMsg = value;
            }
        );
        return translatedMsg;
    }

    /**
     * @param {string} translations Stringified object of translations
     * @param {string} defaultValue Fallback value if does not have translations
     * @returns {string} Translated values or fallback value
     */
    getTranslatedValue(translations: string, defaultValue: string) {
        const availableTranslation = JSON.parse(translations);
        if (availableTranslation.hasOwnProperty(this.translate.currentLang)) {
            return availableTranslation[this.translate.currentLang];
        }
        return defaultValue;
    }

    /**
     * Returns Loading object with default config
     * @returns {object} Loading object
     */
    // migration-TODO correct type later either use Promise<HTMLIonLoadingElement> or any
    getLoader(): any {
        return this.loadingCtrl.create({
            duration: 30000,
            spinner: 'crescent'
        });
    }

    /**
     * Method to convert Array to Comma separated string
     * @param {Array<string>} stringArray
     * @returns {string}
     */
    arrayToString(stringArray: Array<string>): string {
        return stringArray.join(', ');
    }

    /**
     * It will change the app language to given code/name if it available locally
     * @param {string} name Name of the language
     * @param {string} code language code
     */
    changeAppLanguage(name, code?) {
        if (!Boolean(code)) {
            const foundValue = appLanguages.filter(language => language.name === name);

            if (foundValue.length) {
                code = foundValue[0].code;
            }
        }

        if (code) {
            this.translate.use(code);
            this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, code).toPromise().then();
            this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, name).toPromise().then();
        }
    }

    /**
     * Show popup with Try Again and Skip button.
     * @param source Page from alert got called
     */
    async  showContentComingSoonAlert(source) {
        if (source !== 'user-type-selection') {
            this.afterOnBoardQRErrorAlert('ERROR_CONTENT_NOT_FOUND', 'CONTENT_IS_BEING_ADDED');
            return;
        }
        // migration-TODO check for the type 
        let popOver: any;
        const self = this;
        // migration-TODO
        const callback: QRAlertCallBack = {
            tryAgain() {
                self.events.publish('event:showScanner', { pageName: source });
                popOver.dismiss();
            },
            cancel() {
                popOver.dismiss();
            }
        };
        popOver = await this.popOverCtrl.create({
            component: QRScannerAlert,
            componentProps: {
                callback,
                icon: './assets/imgs/ic_coming_soon.png',
                messageKey: 'CONTENT_IS_BEING_ADDED',
                cancelKey: 'hide',
                tryAgainKey: 'TRY_DIFF_QR',
            },
            cssClass: 'qr-alert-invalid'
        });
        popOver.present();
    }
    /**
     * Show popup with Close.
     * @param heading Alert heading
     * @param message Alert message
     */
    async afterOnBoardQRErrorAlert(heading, message) {
        const qrAlert = await this.popOverCtrl.create({
            component: SbGenericPopoverComponent,
            componentProps: {
                sbPopoverHeading: this.translateMessage(heading),
                sbPopoverMainTitle: this.translateMessage(message),
                actionsButtons: [
                    {
                        btntext: this.translateMessage('OKAY'),
                        btnClass: 'sb-btn sb-btn-sm  sb-btn-tertiary'
                    }
                ],
                icon: null
            },
            cssClass: 'sb-popover warning',
        });
        await qrAlert.present();
    }
    /**
     * Its check for the network availability
     * @returns status of the network
     */
    private handleNetworkAvailability(): boolean {
        const updateNetworkAvailabilityStatus = (status: boolean) => {
            this.zone.run(() => {
                this.networkInfo.isNetworkAvailable = status;
            });
        };

        if (this.network.type === 'none') {
            updateNetworkAvailabilityStatus(false);
        } else {
            updateNetworkAvailabilityStatus(true);
        }

        this.connectSubscription = this.network.onDisconnect().subscribe(() => {
            updateNetworkAvailabilityStatus(false);
        });

        this.disconnectSubscription = this.network.onConnect().subscribe(() => {
            updateNetworkAvailabilityStatus(true);
        });

        return this.networkInfo.isNetworkAvailable;
    }

    ngOnDestroy() {
        this.connectSubscription.unsubscribe();
        this.disconnectSubscription.unsubscribe();
    }

    /**
     * Opens In-app Browser
     * @param url - URL to open in browser or system apps
     */
    openLink(url: string): void {
        const options
            = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,clearsessioncache=no,closebuttoncaption=Done,disallowoverscroll=yes';

        (window as any).cordova.InAppBrowser.open(url, '_system', options);
    }

    /**
     * @returns App direction 'rtl' || 'ltr'
     */
    getAppDirection() {
        return this.platform.isRTL ? 'rtl' : 'ltr';
    }

    /**
     * It returns whether it is RTL or not
     */
    isRTL() {
        return this.platform.isRTL;
    }

    /**
     * Creates a popup asking whether to exit from app or not
     */
    async showExitPopUp(pageId: string, environment: string, isNavBack: boolean) {
        //if (!this.alert) {
        const alert = await this.popOverCtrl.create({
            component: SbGenericPopoverComponent,
            componentProps: {
                sbPopoverHeading: this.translateMessage('BACK_TO_EXIT'),
                sbPopoverMainTitle: '',
                actionsButtons: [
                    {
                        btntext: this.translateMessage('YES'),
                        btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
                    }, {
                        btntext: this.translateMessage('NO'),
                        btnClass: 'popover-color'
                    }
                ],
                icon: null
            },
            cssClass: 'sb-popover',
        });
        await alert.present();
        const response = await alert.onDidDismiss();
        if (response.data.isLeftButtonClicked == null) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.NO_CLICKED,
                environment,
                pageId
            );
            return;
        }
        if (!response.data.isLeftButtonClicked) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.NO_CLICKED,
                environment,
                pageId
            );
        } else {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.YES_CLICKED,
                environment,
                pageId
            );
            (navigator as any).app.exitApp();
            this.telemetryGeneratorService.generateEndTelemetry('app', '', '', environment);
        }
        await this.alert.present();
        this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
        return;
        /*} else {
            this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
            if (this.alert) {
                await this.alert.dismiss();
                this.alert = undefined;
            }
        }*/
    }

    fileSizeInMB(bytes) {
        if (!bytes) {
            return '0.00';
        }
        return (bytes / 1048576).toFixed(2);
    }

    set currentTabName(tabName: string) {
        this._currentTabName = tabName;
    }

    get currentTabName() {
        return this._currentTabName;
    }
}
