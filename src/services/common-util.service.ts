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
import * as _ from 'lodash';
import { SharedPreferences } from 'sunbird-sdk';
import { Network } from '@ionic-native/network/ngx';

import { PreferenceKey } from '../app/app.constant';
// import { QRAlertCallBack } from '../pages/qrscanner/qrscanner_alert';
import { appLanguages } from './../app/app.constant';
// import { QRScannerAlert } from './../pages/qrscanner/qrscanner_alert';

import { TelemetryGeneratorService } from './telemetry-generator.service';
import { InteractType, InteractSubtype, PageId, Environment } from './telemetry-constants';
import { Subject, Observable } from 'rxjs';
// import { SbGenericPopoverComponent } from '@app/component/popups/sb-generic-popup/sb-generic-popover';

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

    showToast(translationKey, isInactive?, cssToast?, duration?) {
        if (Boolean(isInactive)) {
            return;
        }

        this.translate.get(translationKey).subscribe(
            async (translatedMsg: any) => {
                const toastOptions: ToastOptions = {
                    message: translatedMsg,
                    duration: duration ? duration : 3000,
                    position: 'bottom',
                    cssClass: cssToast ? cssToast : ''
                };

                const toast = await this.toastCtrl.create(toastOptions);
                await toast.present();
            }
        );
    }

    /**
     * Used to Translate message to current Language
     * @param {string} messageConst - Message Constant to be translated
     * @returns {string} translatedMsg - Translated Message
     */
    translateMessage(messageConst: string, field?: string): string {
        let translatedMsg = '';
        this.translate.get(messageConst, { '%s': field }).subscribe(
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
     * @param {string} str Input String that need to convert into the Array
     * @returns {array} Newly created Array
     */
    stringToArray(str: string = '') {
        return _.split(str, ', ');
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
     * @param {string} source Page from alert got called
     */
    showContentComingSoonAlert(source) {
        if (source !== 'user-type-selection') {
            this.afterOnBoardQRErrorAlert('ERROR_CONTENT_NOT_FOUND', 'CONTENT_IS_BEING_ADDED');
            return;
        }
        // migration-TODO check for the type 
        let popOver: any;
        const self = this;
        // migration-TODO
        // const callback: QRAlertCallBack = {
        //     tryAgain() {
        //         self.events.publish('event:showScanner', { pageName: source });
        //         popOver.dismiss();
        //     },
        //     cancel() {
        //         popOver.dismiss();
        //     }
        // };
        // migration-TODO
        // popOver = this.popOverCtrl.create(QRScannerAlert, {
        //     callback: callback,
        //     icon: './assets/imgs/ic_coming_soon.png',
        //     messageKey: 'CONTENT_IS_BEING_ADDED',
        //     cancelKey: 'hide',
        //     tryAgainKey: 'TRY_DIFF_QR',
        // }, {
        //         cssClass: 'qr-alert-invalid'
        //     });
        // setTimeout(() => {
        //     popOver.present();
        // }, 300);
    }
    /**
     * Show popup with Close.
     * @param {string} heading Alert heading
     * @param {string} message Alert message
     */
    afterOnBoardQRErrorAlert(heading, message) {
        // migration-TODO
        // const qrAlert = this.popOverCtrl.create(SbGenericPopoverComponent, {
        //     sbPopoverHeading: this.translateMessage(heading),
        //     sbPopoverMainTitle: this.translateMessage(message),
        //     actionsButtons: [
        //         {
        //             btntext: this.translateMessage('OKAY'),
        //             btnClass: 'sb-btn sb-btn-sm  sb-btn-tertiary'
        //         }
        //     ],
        //     icon: null
        // }, {
        //         cssClass: 'sb-popover warning',
        //     });
        // qrAlert.present();
    }

    /**
     * Its check for the network availability
     * @returns {boolean} status of the network
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

        (<any>window).cordova.InAppBrowser.open(url, '_system', options);
    }

    /**
     * @returns {string} App direction 'rtl' || 'ltr'
     */
    getAppDirection() {
        return this.platform.isRTL ? 'rtl' : 'ltr';
    }

    /**
     * It returns whether it is RTL or not
     * @returns {boolean}
     */
    isRTL() {
        return this.platform.isRTL;
    }

    /**
     * Creates a popup asking whether to exit from app or not
    */
    showExitPopUp(pageId: string, environment: string, isNavBack: boolean) {
        if (!this.alert) {
            /*this.alert = this.alertCtrl.create({
                title: this.translateMessage('BACK_TO_EXIT'),
                mode: 'wp',
                cssClass: 'confirm-alert',
                buttons: [
                    {
                        text: this.translateMessage('YES'),
                        cssClass: 'alert-btn-cancel',
                        handler: () => {
                            this.telemetryGeneratorService.generateInteractTelemetry(
                                InteractType.TOUCH,
                                InteractSubtype.YES_CLICKED,
                                environment,
                                pageId
                            );
                            this.platform.exitApp();
                            this.telemetryGeneratorService.generateEndTelemetry('app', '', '', environment);
                        }
                    },
                    {
                        text: this.translateMessage('NO'),
                        cssClass: 'alert-btn-delete',
                        handler: () => {
                            this.telemetryGeneratorService.generateInteractTelemetry(
                                InteractType.TOUCH,
                                InteractSubtype.NO_CLICKED,
                                environment,
                                pageId
                            );
                            if (this.alert) {
                                this.alert.dismiss();
                                this.alert = undefined;
                            }
                        }
                    }
                ]
            });
            this.alert.present();*/

            // migration-TODO
            // this.alert = this.popOverCtrl.create(SbGenericPopoverComponent, {
            //     sbPopoverHeading: this.translateMessage('BACK_TO_EXIT'),
            //     sbPopoverMainTitle: '',
            //     actionsButtons: [
            //         {
            //             btntext: this.translateMessage('YES'),
            //             btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
            //         }, {
            //             btntext: this.translateMessage('NO'),
            //             btnClass: 'popover-color'
            //         }
            //     ],
            //     icon: null
            // }, {
            //         cssClass: 'sb-popover',
            //     });
            this.alert.onDidDismiss((leftBtnClicked: any) => {
                if (leftBtnClicked == null) {
                    this.telemetryGeneratorService.generateInteractTelemetry(
                        InteractType.TOUCH,
                        InteractSubtype.NO_CLICKED,
                        environment,
                        pageId
                    );
                    return;
                }
                if (!leftBtnClicked) {
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
                    // migration-TODO
                    // this.platform.exitApp();
                    // navigator['app'].exitApp(); // migration-TODO need to be implemented
                    this.telemetryGeneratorService.generateEndTelemetry('app', '', '', environment);
                }
            });
            this.alert.present({
                ev: event
            });
            this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
            return;
        } else {
            this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
            if (this.alert) {
                this.alert.dismiss();
                this.alert = undefined;
            }
        }
    }

    fileSizeInMB(bytes) {
        if (!bytes) {
            return '0.00';
        }
        return (bytes / 1048576).toFixed(2);
    }

    set currentTabName(tabName: string) {
        this._currentTabName = tabName
    }

    get currentTabName() {
        return this._currentTabName;
    }
}
