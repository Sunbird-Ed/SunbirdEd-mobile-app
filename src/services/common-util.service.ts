import { Injectable, NgZone, Inject } from '@angular/core';
import {
    ToastController,
    LoadingController,
    Events,
    PopoverController,
    Platform,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { SharedPreferences, ProfileService, Profile, ProfileType, CorrelationData, CachedItemRequestSourceFrom, LocationSearchCriteria } from 'sunbird-sdk';

import { PreferenceKey, ProfileConstants, RouterLinks, appLanguages, Location as loc } from '@app/app/app.constant';

import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractType, InteractSubtype, PageId, Environment, CorReleationDataType, ImpressionType, ObjectType } from '@app/services/telemetry-constants';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { QRAlertCallBack, QRScannerAlert } from '@app/app/qrscanner-alert/qrscanner-alert.page';
import { Observable, merge } from 'rxjs';
import { distinctUntilChanged, map, share, tap } from 'rxjs/operators';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SbPopoverComponent } from '@app/app/components/popups';
import { AndroidPermissionsStatus } from './android-permissions/android-permission';
import { Router } from '@angular/router';
import { AndroidPermissionsService } from './android-permissions/android-permissions.service';
import GraphemeSplitter from 'grapheme-splitter';
import { ComingSoonMessageService } from './coming-soon-message.service';

declare const FCMPlugin;
export interface NetworkInfo {
    isNetworkAvailable: boolean;
}
@Injectable()
export class CommonUtilService {
    public networkAvailability$: Observable<boolean>;

    networkInfo: NetworkInfo = {
        isNetworkAvailable: navigator.onLine
    };

    private alert?: any;
    googleCaptchaConfig = new Map();
    private _currentTabName: string;
    appName: any;
    private toast: any;

    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private translate: TranslateService,
        private loadingCtrl: LoadingController,
        private events: Events,
        private popOverCtrl: PopoverController,
        private network: Network,
        private zone: NgZone,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private webView: WebView,
        private appVersion: AppVersion,
        private router: Router,
        private toastController: ToastController,
        private permissionService: AndroidPermissionsService,
        private comingSoonMessageService: ComingSoonMessageService
    ) {
        this.networkAvailability$ = merge(
            this.network.onChange().pipe(
                map((v) => v.type === 'online'),
            )
        ).pipe(
            distinctUntilChanged(),
            share(),
            tap((status) => {
                this.zone.run(() => {
                    this.networkInfo = {
                        isNetworkAvailable: status
                    };
                });
            })
        );
    }

    showToast(translationKey, isInactive?, cssToast?, duration?, position?, fields?: string | any) {
        if (Boolean(isInactive)) {
            return;
        }

        let replaceObject: any = '';

        if (typeof (fields) === 'object') {
            replaceObject = fields;
        } else {
            replaceObject = { '%s': fields };
        }

        this.translate.get(translationKey, replaceObject).subscribe(
            async (translatedMsg: any) => {
                const toastOptions = {
                    message: translatedMsg,
                    duration: duration ? duration : 3000,
                    position: position ? position : 'bottom',
                    cssClass: cssToast ? cssToast : ''
                };

                const toast = await this.toastController.create(toastOptions);
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
     * @param translations Stringified object of translations
     * @param defaultValue Fallback value if does not have translations
     * @returns Translated values or fallback value
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
     * @returns Loading object
     */
    getLoader(duration?, message?): any {
        return this.loadingCtrl.create({
            message,
            duration: duration ? duration : 30000,
            spinner: 'crescent',
            cssClass: message ? 'custom-loader-message-class' : 'custom-loader-class'
        });
    }

    /**
     * Method to convert Array to Comma separated string
     */
    arrayToString(stringArray: Array<string>): string {
        return stringArray.join(', ');
    }

    /**
     * It will change the app language to given code/name if it available locally
     * @param name Name of the language
     * @param code language code
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
    async showContentComingSoonAlert(source, content?, dialCode?) {
        let message;
        if (content) {
             message = await this.comingSoonMessageService.getComingSoonMessage(content);
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.QR_CODE_COMINGSOON,
            source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
            source ? source : PageId.HOME
        );
        if (source !== 'permission') {
            this.afterOnBoardQRErrorAlert('ERROR_CONTENT_NOT_FOUND', (message || 'CONTENT_IS_BEING_ADDED'), source,
            (dialCode ? dialCode : ''));
            return;
        }
        let popOver: any;
        const self = this;
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
        await popOver.present();
    }
    /**
     * Show popup with Close.
     * @param heading Alert heading
     * @param message Alert message
     */
    async afterOnBoardQRErrorAlert(heading, message, source?, dialCode?) {
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
        const corRelationList: CorrelationData[] = [{
            id: this.translateMessage(heading) === this.translateMessage('INVALID_QR') ?
                InteractSubtype.QR_CODE_INVALID : InteractSubtype.QR_NOT_LINKED,
            type: CorReleationDataType.CHILD_UI
        }];
        corRelationList.push({ id: (dialCode ? dialCode : ''), type: ObjectType.QR });
        // generate impression telemetry
        this.telemetryGeneratorService.generateImpressionTelemetry(
            InteractType.POPUP_LOADED, '',
            source === PageId.ONBOARDING_PROFILE_PREFERENCES ? PageId.SCAN_OR_MANUAL : source,
            source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
            (dialCode ? dialCode : ''),
            (dialCode ? ObjectType.QR : undefined),
            undefined,
            undefined,
            corRelationList
        );
        const { data } = await qrAlert.onDidDismiss();
        // generate interact telemetry for close popup
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SELECT_CLOSE,
            data ? (data.isLeftButtonClicked ? InteractSubtype.CTA : InteractSubtype.CLOSE_ICON) : InteractSubtype.OUTSIDE,
            source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
            source === PageId.ONBOARDING_PROFILE_PREFERENCES ? PageId.SCAN_OR_MANUAL : PageId.HOME,
            undefined,
            undefined,
            undefined,
            corRelationList
        );
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
     * Creates a popup asking whether to exit from app or not
     */
    async showExitPopUp(pageId: string, environment: string, isNavBack: boolean) {
        if (!this.alert) {
            this.alert = await this.popOverCtrl.create({
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
            await this.alert.present();
            const { data } = await this.alert.onDidDismiss();
            if (data === undefined) {
                this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.NO_CLICKED,
                    environment,
                    pageId
                );
                return;
            }
            if (data && !data.isLeftButtonClicked) {
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
            this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
            return;
        } else {
            this.telemetryGeneratorService.generateBackClickedTelemetry(pageId, environment, isNavBack);
            await this.alert.dismiss();
            this.alert = undefined;
        }
    }

    async getAppName() {
        return this.appVersion.getAppName();
    }

    openUrlInBrowser(url) {
        const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
        (window as any).cordova.InAppBrowser.open(url, '_blank', options);
    }

    fileSizeInMB(bytes) {
        if (!bytes) {
            return '0.00';
        }
        return (bytes / 1048576).toFixed(2);
    }

    public deDupe<T>(array: T[], property): T[] {
        if (!array) {
            return [];
        }
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
        });
    }

    set currentTabName(tabName: string) {
        this._currentTabName = tabName;
    }

    get currentTabName() {
        return this._currentTabName;
    }

    convertFileSrc(img) {
        if (img === null) {
            return '';
        } else {
            return this.webView.convertFileSrc(img);
        }
    }

    setGoogleCaptchaConfig(key, isEnabled) {
        this.googleCaptchaConfig.set('key', key);
        this.googleCaptchaConfig.set('isEnabled', isEnabled);
    }

    getGoogleCaptchaConfig() {
        return this.googleCaptchaConfig;
    }
    // return org location details for logged in user
    getOrgLocation(organisation: any) {
        const location = { 'state': '', 'district': '', 'block': '' };
        if (organisation.locations) {
            for (let j = 0, l = organisation.locations.length; j < l; j++) {
                if (organisation.locations[j]) {
                    switch (organisation.locations[j].type) {
                        case 'state':
                            location.state = organisation.locations[j];
                            break;

                        case 'block':
                            location.block = organisation.locations[j];
                            break;

                        case 'district':
                            location.district = organisation.locations[j];
                            break;

                        default:
                            console.log('default');
                    }
                }
            }
        }
        return location;
    }


    getUserLocation(profile: any) {
        let userLocation = {
            state: {},
            district: {}
        };
        if (profile && profile.userLocations && profile.userLocations.length) {
            for (let i = 0, len = profile.userLocations.length; i < len; i++) {
                if (profile.userLocations[i].type === 'state') {
                    userLocation.state = profile.userLocations[i];
                } else if (profile.userLocations[i].type === 'district') {
                    userLocation.district = profile.userLocations[i];
                }
            }
        }

        return userLocation;
    }

    isUserLocationAvalable(profile: any): boolean {
        const location = this.getUserLocation(profile);
        return !!(location && location.state && location.state['name'] && location.district && location.district['name']);
    }

    async isDeviceLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise();
        return !!deviceLoc;
    }

    async isIpLocationAvailable(): Promise<boolean> {
        const deviceLoc = await this.preferences.getString(PreferenceKey.IP_LOCATION).toPromise();
        return !!deviceLoc;
    }

    handleToTopicBasedNotification() {
        this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
            .then(async (response: Profile) => {
                const profile = response;
                const subscribeTopic: Array<string> = [];
                subscribeTopic.push(profile.board[0]);
                profile.medium.forEach((m) => {
                    subscribeTopic.push(profile.board[0].concat('-', m));
                    profile.grade.forEach((g) => {
                        subscribeTopic.push(profile.board[0].concat('-', g));
                        subscribeTopic.push(profile.board[0].concat('-', m.concat('-', g)));
                    });
                });
                await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).subscribe((data) => {
                    subscribeTopic.push(JSON.parse(data).state.replace(/[^a-zA-Z0-9-_.~%]/gi, '-'));
                    subscribeTopic.push(JSON.parse(data).district.replace(/[^a-zA-Z0-9-_.~%]/gi, '-'));
                });
                await this.preferences.getString(PreferenceKey.SUBSCRIBE_TOPICS).toPromise().then(async (data) => {
                    const previuslySubscribeTopics = JSON.parse(data);
                    await new Promise<undefined>((resolve, reject) => {
                        FCMPlugin.unsubscribeFromTopic(previuslySubscribeTopics.join(','), resolve, reject);
                    });
                    await new Promise<undefined>((resolve, reject) => {
                        FCMPlugin.subscribeToTopic(subscribeTopic.join(','), resolve, reject);
                    });
                }).catch(async (err) => {
                    await new Promise<undefined>((resolve, reject) => {
                        FCMPlugin.subscribeToTopic(subscribeTopic.join(','), resolve, reject);
                    });
                });
                await this.preferences.putString(PreferenceKey.CURRENT_USER_PROFILE, JSON.stringify(profile)).toPromise();
                await this.preferences.putString(PreferenceKey.SUBSCRIBE_TOPICS, JSON.stringify(subscribeTopic)).toPromise();
            });
    }

    getFormattedDate(date: string | Date) {
        const inputDate = new Date(date).toDateString();
        const [, month, day, year] = inputDate.split(' ');
        const formattedDate = [day, month, year].join('-');
        return formattedDate;
    }

    getContentImg(content) {
        const defaultImg = this.convertFileSrc('assets/imgs/ic_launcher.png');
        return this.convertFileSrc(content.courseLogoUrl) ||
            this.convertFileSrc(content.appIcon) || defaultImg;
    }

    isAccessibleForNonStudentRole(profileType) {
        return profileType === ProfileType.TEACHER || profileType === ProfileType.OTHER;
    }

    public async getGivenPermissionStatus(permissions): Promise<AndroidPermissionsStatus> {
        return (
            await this.permissionService.checkPermissions([permissions]).toPromise()
        )[permissions];
    }

    public async showSettingsPageToast(description: string, appName: string, pageId: string, isOnboardingCompleted: boolean) {
        const toast = await this.toastController.create({
            message: this.translateMessage(description, appName),
            cssClass: 'permissionSettingToast',
            showCloseButton: true,
            closeButtonText: this.translateMessage('SETTINGS'),
            position: 'bottom',
            duration: 3000
        });

        toast.present();

        toast.onWillDismiss().then((res) => {
            if (res.role === 'cancel') {
                this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.SETTINGS_CLICKED,
                    isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
                    pageId);
                this.router.navigate([`/${RouterLinks.SETTINGS}/${RouterLinks.PERMISSION}`], { state: { changePermissionAccess: true } });
            }
        });
    }

    public async buildPermissionPopover(handler: (selectedButton: string) => void,
        appName: string, whichPermission: string,
        permissionDescription: string, pageId, isOnboardingCompleted): Promise<HTMLIonPopoverElement> {
        return this.popOverCtrl.create({
            component: SbPopoverComponent,
            componentProps: {
                isNotShowCloseIcon: false,
                sbPopoverHeading: this.translateMessage('PERMISSION_REQUIRED'),
                sbPopoverMainTitle: this.translateMessage(whichPermission),
                actionsButtons: [
                    {
                        btntext: this.translateMessage('NOT_NOW'),
                        btnClass: 'popover-button-cancel',
                    },
                    {
                        btntext: this.translateMessage('ALLOW'),
                        btnClass: 'popover-button-allow',
                    }
                ],
                handler,
                img: {
                    path: './assets/imgs/ic_folder_open.png',
                },
                metaInfo: this.translateMessage(permissionDescription, appName),
            },
            cssClass: 'sb-popover sb-popover-permissions primary dw-active-downloads-popover',
        }).then((popover) => {
            this.telemetryGeneratorService.generateImpressionTelemetry(
                whichPermission === 'Camera' ? ImpressionType.CAMERA : ImpressionType.FILE_MANAGEMENT,
                pageId,
                PageId.PERMISSION_POPUP,
                isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING
            );
            return popover;
        });
    }

    async presentToastForOffline(msg: string) {
        this.toast = await this.toastController.create({
            duration: 3000,
            message: this.translateMessage(msg),
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'X',
            cssClass: ['toastHeader', 'offline']
        });
        await this.toast.present();
        this.toast.onDidDismiss(() => {
            this.toast = undefined;
        });
    }

    extractInitial(name) {
        let initial = '';
        if (name) {
            const splitter = new GraphemeSplitter();
            const split: string[] = splitter.splitGraphemes(name.trim());
            initial = split[0];
        }
        return initial;
    }

    async getStateList() {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
                type: loc.TYPE_STATE
            }
        };
        try {
            const stateList = await this.profileService.searchLocation(req).toPromise();
            return stateList || [];
        } catch {
            return [];
        }
    }

    async getDistrictList(id?: string, code?: string) {
        const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
              type: loc.TYPE_DISTRICT,
              parentId: id || undefined,
              code: code || undefined
            }
        };
        try {
            const districtList = await this.profileService.searchLocation(req).toPromise();
            return districtList || [];
        } catch {
            return [];
        }
    }
}
