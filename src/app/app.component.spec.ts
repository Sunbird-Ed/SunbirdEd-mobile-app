import { AppComponent } from './app.component';
import { Location } from '@angular/common';
import {
    FormAndFrameworkUtilService, AppGlobalService,
    CommonUtilService, TelemetryGeneratorService, UtilityService, AppHeaderService,
    LogoutHandlerService, AppRatingService, ActivePageService, SplashScreenService,
    InteractType, InteractSubtype, Environment, PageId, LocalCourseService
} from '../services';
import {
    EventsBusService, SharedPreferences,
    TelemetryService, NotificationService,
    CodePushExperimentService, SystemSettingsService, DeviceRegisterService, TelemetryAutoSyncService, SunbirdSdk
} from 'sunbird-sdk';
import { Platform, Events, MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NgZone, EventEmitter } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Router } from '@angular/router';
import { NetworkAvailabilityToastService } from '@app/services/network-availability-toast/network-availability-toast.service';
import { NotificationService as LocalNotification } from '@app/services/notification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of, Subject, EMPTY } from 'rxjs';
import { PreferenceKey } from './app.constant';
import { BackButtonEmitter } from '@ionic/angular/dist/providers/platform';

declare const supportfile;

describe('AppComponent', () => {
    let appComponent: AppComponent;
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'some_user_id')
    };
    const mockAppRatingService: Partial<AppRatingService> = {
        checkInitialDate: jest.fn()
    };
    const mockCodePushExperimentService: Partial<CodePushExperimentService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isDeviceLocationAvailable: jest.fn(() => Promise.resolve(true))
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockEvents: Partial<Events> = { publish: jest.fn() };
    const mockEventsBusService: Partial<EventsBusService> = {
        events: jest.fn(() => of({}))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({}))
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockLogoutHandlerService: Partial<LogoutHandlerService> = {};
    const mockMenuCtrl: Partial<MenuController> = {};
    const mockNetwork: Partial<Network> = {};
    const mockNetworkAvailability: Partial<NetworkAvailabilityToastService> = {
        init: jest.fn(() => '')
    };
    const mockNotificationServices: Partial<NotificationService> = {};
    const mockNotificationSrc: Partial<LocalNotification> = {};
    const pauseData = new Subject<void>();
    const mockPlatform: Partial<Platform> = {
        ready: jest.fn(() => new Promise(() => { })),
        pause: pauseData,
        resume: pauseData,
        backButton: {
            subscribeWithPriority: jest.fn()
        } as Partial<BackButtonEmitter> as BackButtonEmitter
    };
    const mockPreferences: Partial<SharedPreferences> = {
        // getString: jest.fn(() => of(undefined)),
        // putString: jest.fn(() => of(undefined))
    };
    const mockRouter: Partial<Router> = {
        events: EMPTY
    };
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockStatusBar: Partial<StatusBar> = {
        styleBlackTranslucent: jest.fn()
    };
    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({}))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        genererateAppStartTelemetry: jest.fn()
    };
    const mockTelemetryAutoSyncService: Partial<TelemetryAutoSyncService> = {
        // start: jest.fn(() => of({}))
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        autoSync: mockTelemetryAutoSyncService
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        checkForTncUpdate: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {
        onLangChange: new EventEmitter<LangChangeEvent>()
    };
    const mockDeviceSpec = {
        os: 'some_os',
        make: 'some_make',
        id: 'some_id',
        mem: 0,
        idisk: 0,
        edisk: 0,
        scrn: 0,
        camera: 'some_camera',
        cpu: 'some_cpu',
        sims: 0,
        cap: ['some_cap']
    };
    const mockUtilityService: Partial<UtilityService> = {};
    const mockZone: Partial<NgZone> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};

    beforeAll(() => {
        appComponent = new AppComponent(
            mockTelemetryService as TelemetryService,
            mockPreferences as SharedPreferences,
            mockEventsBusService as EventsBusService,
            mockNotificationServices as NotificationService,
            mockSystemSettingsService as SystemSettingsService,
            mockCodePushExperimentService as CodePushExperimentService,
            mockDeviceRegisterService as DeviceRegisterService,
            mockPlatform as Platform,
            mockStatusBar as StatusBar,
            mockTranslate as TranslateService,
            mockEvents as Events,
            mockZone as NgZone,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockUtilityService as UtilityService,
            mockHeaderService as AppHeaderService,
            mockLogoutHandlerService as LogoutHandlerService,
            mockNetwork as Network,
            mockAppRatingService as AppRatingService,
            mockActivePageService as ActivePageService,
            mockNotificationSrc as LocalNotification,
            mockRouter as Router,
            mockLocation as Location,
            mockMenuCtrl as MenuController,
            mockNetworkAvailability as NetworkAvailabilityToastService,
            mockSplashScreenService as SplashScreenService,
            mockLocalCourseService as LocalCourseService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of appComponent', () => {
        expect(appComponent).toBeTruthy();
    });

    // describe('constructor', () => {
    //     it('should call on platform ready', (done) => {
    //         spyOn(supportfile, 'makeEntryInSunbirdSupportFile').and.callFake((a, b) => {
    //             setTimeout(() => {
    //                 setTimeout(() => {
    //                     a();
    //                     done();
    //                 }, 0);
    //             });
    //         });
    //     });
    // });

    describe('getUtmParameter', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });
            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = EMPTY;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockEventsBusService.events = jest.fn(() => EMPTY);
            mockNotificationSrc.setupLocalNotification = jest.fn();
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockEvents.subscribe = jest.fn();
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('some_token');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                }
            });
            mockPreferences.putString = jest.fn(() => EMPTY);
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        });
        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should generate utm-info telemetry if utm source is available for first time', (done) => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve({ utm_source: 'sunbird' }));
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(2,
                    InteractType.OTHER,
                    InteractSubtype.UTM_INFO,
                    Environment.HOME,
                    PageId.HOME,
                    undefined,
                    { utm_data: { utm_source: 'sunbird' } }
                );
                expect(mockUtilityService.clearUtmInfo).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not generate utm-info telemetry if utm source is not available', (done) => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.nthCalledWith(2,
                    InteractType.OTHER,
                    InteractSubtype.UTM_INFO,
                    Environment.HOME,
                    PageId.HOME,
                    undefined,
                    { utm_data: { utm_source: 'sunbird' } }
                );
                expect(mockUtilityService.clearUtmInfo).not.toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not generate utm-info telemetry for Error response', (done) => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.reject('some_error'));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('checkAppUpdateAvailable', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });
            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = EMPTY;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockEventsBusService.events = jest.fn(() => EMPTY);
            mockNotificationSrc.setupLocalNotification = jest.fn();
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockEvents.subscribe = jest.fn();
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('some_token');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                    default:
                        return of('');
                }
            });
            mockPreferences.putString = jest.fn(() => EMPTY);
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });

        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should check the app version', (done) => {
            // arrange
            const result = {
                type: 'optional',
                title: 'UPDATE_APP_SUPPORT_TITLE',
                actionButtons: [
                    {
                        action: 'yes',
                        label: 'UPDATE_APP_BTN_ACTION_YES',
                        link: 'playStoreLink'
                    }
                ]
            };
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => {
                return {
                    then: jest.fn((cb) => {
                        cb(result);
                        return {
                            catch: jest.fn()
                        };
                    })
                } as any;
            });
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockEvents.publish = jest.fn();

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(5500);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith('force_optional_upgrade', result);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                done();
            });
        });

        it('should not publish event if result is undefined', (done) => {
            // arrange
            const result = undefined;
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(result));
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(5100);
            expect(mockEvents.publish).not.toHaveBeenCalled();
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                done();
            });
        });

        it('should go to catch block if checkNewAppVersion reject', (done) => {
            // arrange
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.reject('error'));
            // act
            appComponent.ngOnInit();
            setTimeout(() => {
                done();
            });
        });
    });

    describe('fcmTokenWatcher', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });

            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = EMPTY;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockEventsBusService.events = jest.fn(() => EMPTY);
            mockNotificationSrc.setupLocalNotification = jest.fn();
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockEvents.subscribe = jest.fn();
            mockPreferences.putString = jest.fn(() => EMPTY);
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });
        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should get fcm token if not available', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                }
            });
            FCMPlugin.getToken = jest.fn((callback) => callback('some_token'));
            mockPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(SunbirdSdk.instance, 'updateDeviceRegisterConfig').mockImplementation();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.getToken).toHaveBeenCalled();
                expect(SunbirdSdk.instance.updateDeviceRegisterConfig).toHaveBeenCalledWith({ fcmToken: 'some_token' });
                done();
            });
        });

        it('should refresh fcm token if already available', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('some_token');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                }
            });
            FCMPlugin.onTokenRefresh = jest.fn((callback) => callback('some_token'));
            mockPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(SunbirdSdk.instance, 'updateDeviceRegisterConfig').mockImplementation();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.onTokenRefresh).toHaveBeenCalled();
                expect(SunbirdSdk.instance.updateDeviceRegisterConfig).toHaveBeenCalledWith({ fcmToken: 'some_token' });
                done();
            });
        });
    });

    describe('receiveNotification', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });

            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('some_token');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                }
            });

            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = EMPTY;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockEventsBusService.events = jest.fn(() => EMPTY);
            mockNotificationSrc.setupLocalNotification = jest.fn();
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockEvents.subscribe = jest.fn();
            mockPreferences.putString = jest.fn(() => EMPTY);
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });
        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should receive notification data when notification was tapped', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const mockData = {
                'id': 'some_id',
                "wasTapped": true,
                "actionData": '{\"key\":\"value\"}'
            };
            FCMPlugin.onNotification = jest.fn((callback, success, error) => {
                callback(mockData);
                success({});
                error('');
            });
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            mockNotificationServices.addNotification = jest.fn(() => of(mockData as any));
            mockNotificationSrc.setNotificationDetails = jest.fn();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.onNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(1,
                    InteractType.OTHER,
                    InteractSubtype.NOTIFICATION_RECEIVED,
                    Environment.HOME,
                    'some_page_id',
                    undefined,
                    { notification_id: 'some_id' }
                );
                done();
            });
        });

        it('should receive notification data when notification was not tapped', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const mockData = {
                'id': 'some_id',
                "wasTapped": false,
                "actionData": '{\"key\":\"value\"}'
            };
            FCMPlugin.onNotification = jest.fn((callback, success, error) => {
                callback(mockData);
                success({});
                error('');
            });
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            mockNotificationServices.addNotification = jest.fn(() => of(mockData as any));
            mockNotificationSrc.setNotificationDetails = jest.fn();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.onNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(1,
                    InteractType.OTHER,
                    InteractSubtype.NOTIFICATION_RECEIVED,
                    Environment.HOME,
                    'some_page_id',
                    undefined,
                    { notification_id: 'some_id' }
                );
                done();
            });
        });
    });

    describe('checkForExperiment', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });

            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.SELECTED_LANGUAGE_CODE:
                        return of('');
                    case PreferenceKey.FCM_TOKEN:
                        return of('some_token');
                    case PreferenceKey.DEPLOYMENT_KEY:
                        return of('');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                }
            });

            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = EMPTY;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockEventsBusService.events = jest.fn(() => EMPTY);
            mockNotificationSrc.setupLocalNotification = jest.fn();
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockEvents.subscribe = jest.fn();
            mockPreferences.putString = jest.fn(() => EMPTY);
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });
        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should set emperiment_key and experiemnt_app_version when update is set', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const mockUpdateData = {
                deploymentKey: 'some_key',
                appVersion: 'some_app_name'
            };
            codePush.getCurrentPackage = jest.fn((callback) => {
                callback(mockUpdateData);
            });
            // TODO:
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            appComponent.appVersion = 'some_app_name';
            mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_default_key'));
            mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
            mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.getCurrentPackage).toHaveBeenCalled();
                expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                done();
            });
        });
        it('should remove emperiment_key when update is set and key is same as default key', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const mockUpdateData = {
                deploymentKey: 'some_key',
                appVersion: 'some_app_name'
            };
            codePush.getCurrentPackage = jest.fn((callback) => {
                callback(mockUpdateData);
            });
            // TODO:
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            appComponent.appVersion = 'some_app_name';
            mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_key'));
            mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
            mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.getCurrentPackage).toHaveBeenCalled();
                expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                done();
            });
        });
        it('should remove emperiment_key when update is set and key and is' +
            ' not same as default key and app version is not same as current app version', (done) => {
                // arrange
                mockPlatform.ready = jest.fn(() => {
                    return {
                        then: jest.fn((cb) => cb('ready'))
                    } as any;
                });
                const mockUpdateData = {
                    deploymentKey: 'some_key',
                    appVersion: 'some_app_name'
                };
                codePush.getCurrentPackage = jest.fn((callback) => {
                    callback(mockUpdateData);
                });
                // TODO:
                mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_current_app_name'));
                appComponent.appVersion = 'some_current_app_name';
                mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_default_key'));
                mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
                mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());

                // act
                appComponent.ngOnInit();
                // assert
                setTimeout(() => {
                    expect(codePush.getCurrentPackage).toHaveBeenCalled();
                    expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                    done();
                });
            });
        it('should remove emperiment_key when update is set and key is' +
            ' same as default key and app version is same as current app version', (done) => {
                // arrange
                mockPlatform.ready = jest.fn(() => {
                    return {
                        then: jest.fn((cb) => cb('ready'))
                    } as any;
                });
                const mockUpdateData = {
                    deploymentKey: 'some_key',
                    appVersion: 'some_app_name'
                };
                codePush.getCurrentPackage = jest.fn((callback) => {
                    callback(mockUpdateData);
                });
                // TODO:
                mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
                appComponent.appVersion = 'some_app_name';
                mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_key'));
                mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
                mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());

                // act
                appComponent.ngOnInit();
                // assert
                setTimeout(() => {
                    expect(codePush.getCurrentPackage).toHaveBeenCalled();
                    expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                    done();
                });
            });
        it('should remove emperiment_key and experiemnt_app_version when update is not set', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            codePush.getCurrentPackage = jest.fn((callback) => {
                callback();
            });
            // TODO:
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            // mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of());
            mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
            mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.getCurrentPackage).toHaveBeenCalled();
                expect(mockCodePushExperimentService.getDefaultDeploymentKey).not.toHaveBeenCalled();
                done();
            });
        });
    });

});
