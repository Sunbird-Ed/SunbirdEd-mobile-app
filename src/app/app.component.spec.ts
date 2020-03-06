import { AppComponent } from './app.component';
import { Location } from '@angular/common';
import {
    FormAndFrameworkUtilService, AppGlobalService,
    CommonUtilService, TelemetryGeneratorService, UtilityService, AppHeaderService,
    LogoutHandlerService, AppRatingService, ActivePageService, SplashScreenService,
    InteractType, InteractSubtype, Environment, PageId, LocalCourseService, ImpressionType, CorReleationDataType
} from '../services';
import {
    EventsBusService, SharedPreferences,
    TelemetryService, NotificationService,
    CodePushExperimentService, SystemSettingsService, DeviceRegisterService,
    TelemetryAutoSyncService, SunbirdSdk, CorrelationData, ProfileService
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
import { of, Subject, EMPTY, Observable, Subscription } from 'rxjs';
import { PreferenceKey, EventTopics } from './app.constant';
import { BackButtonEmitter } from '@ionic/angular/dist/providers/platform';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';

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
    const mockProfileService: Partial<ProfileService> = {};
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
    class MockTranslateService {
        public get onLangChange() {
            return new EventEmitter<LangChangeEvent>();
        }
    }
    const mockTranslate: Partial<TranslateService> = new MockTranslateService() as any;
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
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};

    beforeAll(() => {
        appComponent = new AppComponent(
            mockTelemetryService as TelemetryService,
            mockPreferences as SharedPreferences,
            mockEventsBusService as EventsBusService,
            mockNotificationServices as NotificationService,
            mockSystemSettingsService as SystemSettingsService,
            mockCodePushExperimentService as CodePushExperimentService,
            mockDeviceRegisterService as DeviceRegisterService,
            mockProfileService as ProfileService,
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
            mockLocalCourseService as LocalCourseService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate
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

    describe('ngOnInit', () => {
        beforeEach(() => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    resolve('ready');
                });
            });
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
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });
        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should subscribe and set header config', (done) => {
            // arrange
            mockCommonUtilService.networkAvailability$ = EMPTY;
            const mockConfig = {
                showHeader: true,
                showBurgerMenu: true,
                actionButtons: ['search'],
            };
            mockHeaderService.headerConfigEmitted$ = of(mockConfig);
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            setTimeout(() => {
                expect(appComponent.headerConfig).toBe(mockConfig);
                done();
            }, 0);
        });
        it('should generate interact telemetry internet-connected in network availability is true', (done) => {
            // arrange
            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = of(true);
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(1,
                    InteractType.OTHER,
                    InteractSubtype.INTERNET_CONNECTED,
                    Environment.HOME,
                    'some_page_id'
                );
                done();
            }, 0);
        });
        it('should generate interact telemetry internet-disconnected in network availability is true', (done) => {
            // arrange
            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = of(false);
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(1,
                    InteractType.OTHER,
                    InteractSubtype.INTERNET_DISCONNECTED,
                    Environment.HOME,
                    'some_page_id'
                );
                done();
            }, 0);
        });
    });

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
    describe('getSystemConfig', () => {
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
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
        });

        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should get the hotCodePush', (done) => {
            // arrange
            // mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => {
            //     return {
            //         then: jest.fn((cb) => {
            //             cb(result);
            //             return {
            //                 catch: jest.fn()
            //             };
            //         })
            //     } as any;
            // });
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({value: '{ \"deploymentKey\": \"\"}'}));

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(5500);
            // assert
            expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalled();
            jest.useRealTimers();
            jest.clearAllTimers();
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

    describe('subscribeEvents', () => {
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
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            mockSystemSettingsService.getSystemSettings = jest.fn(() => EMPTY);
            mockTelemetryAutoSyncService.start = jest.fn(() => EMPTY);
            mockPreferences.putString = jest.fn(() => EMPTY);
            mockFormAndFrameworkUtilService.checkNewAppVersion = jest.fn(() => Promise.resolve(''));
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            mockUtilityService.getDeviceSpec = jest.fn(() => Promise.resolve(mockDeviceSpec));
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(''));
        });
        afterEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should subscribe coach_mark_seen event', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const mockData = {
                showWalkthroughBackDrop: true,
                appName: 'some_app_name'
            };
            mockEvents.subscribe = jest.fn((topic, fn) => {
                switch (topic) {
                    case EventTopics.COACH_MARK_SEEN:
                        return fn(mockData);
                }
            });
            const getBoundingClientRect = {
                getBoundingClientRect: jest.fn(() => {
                    const left = 0;
                    return left;
                }),
                getElementsByClassName: jest.fn(() => {
                    return [{
                        className: 'bg',
                        setAttribute: jest.fn()
                    }];
                })
            } as any;
            jest.spyOn(document, 'getElementById').mockReturnValue(getBoundingClientRect);

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(document.getElementById).toHaveBeenCalled();
            expect(document.getElementById('qrScannerIcon').getBoundingClientRect).toHaveBeenCalled();
            expect(document.getElementById('qrScannerIcon').getElementsByClassName).toHaveBeenCalled();
            // expect(document.getElementById('backdrop').getElementsByClassName('bg')[0].setAttribute).toHaveBeenCalled();
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                done();
            });
        });
        it('should subscribe tab change event', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockEvents.subscribe = jest.fn((topic, fn) => {
                switch (topic) {
                    case EventTopics.TAB_CHANGE:
                        return fn('some_page_id');
                }
            });
            mockZone.run = jest.fn((fn) => fn());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const corRelationList: Array<CorrelationData> = [];
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(2,
                InteractType.TOUCH,
                InteractSubtype.TAB_CLICKED,
                Environment.HOME,
                'some_page_id');
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).nthCalledWith(1,
                ImpressionType.VIEW,
                '',
                'some_page_id',
                Environment.HOME,
                undefined, undefined, undefined, undefined,
                corRelationList);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                done();
            });
        });
        it('should subscribe tab change event with pageId undefined or empty', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockEvents.subscribe = jest.fn((topic, fn) => {
                switch (topic) {
                    case EventTopics.TAB_CHANGE:
                        return fn('');
                }
            });
            mockZone.run = jest.fn((fn) => fn());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const corRelationList: Array<CorrelationData> = [];
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(2,
                InteractType.TOUCH,
                InteractSubtype.TAB_CLICKED,
                Environment.HOME,
                PageId.QRCodeScanner);
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).nthCalledWith(1,
                ImpressionType.VIEW,
                '',
                PageId.HOME,
                Environment.HOME,
                undefined, undefined, undefined, undefined,
                corRelationList);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                done();
            });
        });
        it('should subscribe tab change event with pageId resources '
            + 'and no board, medium and class is assigned to current profile', (done) => {
                // arrange
                mockPlatform.ready = jest.fn(() => {
                    return {
                        then: jest.fn((cb) => cb('ready'))
                    } as any;
                });
                mockEvents.subscribe = jest.fn((topic, fn) => {
                    switch (topic) {
                        case EventTopics.TAB_CHANGE:
                            return fn('resources');
                    }
                });
                mockZone.run = jest.fn((fn) => fn());
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                const mockCurrentProfile = {
                    profileType: 'some_type'
                } as any;
                mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);

                const corRelationList: Array<CorrelationData> = [];
                corRelationList.push({ id: '', type: CorReleationDataType.BOARD });
                corRelationList.push({ id: '', type: CorReleationDataType.MEDIUM });
                corRelationList.push({ id: '', type: CorReleationDataType.CLASS });
                corRelationList.push({ id: mockCurrentProfile.profileType, type: CorReleationDataType.USERTYPE });
                mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();

                // act
                jest.useFakeTimers();
                appComponent.ngOnInit();
                // assert
                jest.advanceTimersByTime(2100);
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.TAB_CLICKED,
                    Environment.HOME,
                    'resources');
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).nthCalledWith(1,
                    ImpressionType.VIEW,
                    '',
                    'resources',
                    Environment.HOME,
                    undefined, undefined, undefined, undefined,
                    corRelationList);
                jest.useRealTimers();
                jest.clearAllTimers();
                setTimeout(() => {
                    done();
                });
            });
        it('should subscribe tab change event with pageId library '
            + 'and board, medium and class is assigned to current profile', (done) => {
                // arrange
                mockPlatform.ready = jest.fn(() => {
                    return {
                        then: jest.fn((cb) => cb('ready'))
                    } as any;
                });
                mockEvents.subscribe = jest.fn((topic, fn) => {
                    switch (topic) {
                        case EventTopics.TAB_CHANGE:
                            return fn('resources');
                    }
                });
                mockZone.run = jest.fn((fn) => fn());
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                const mockCurrentProfile = {
                    profileType: 'some_type',
                    board: ['some_board'],
                    medium: ['some_medium'],
                    grade: ['some_grade']
                } as any;
                mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);

                const corRelationList: Array<CorrelationData> = [];
                corRelationList.push({ id: mockCurrentProfile.board.join(','), type: CorReleationDataType.BOARD });
                corRelationList.push({ id: mockCurrentProfile.medium.join(','), type: CorReleationDataType.MEDIUM });
                corRelationList.push({ id: mockCurrentProfile.grade.join(','), type: CorReleationDataType.CLASS });
                corRelationList.push({ id: mockCurrentProfile.profileType, type: CorReleationDataType.USERTYPE });
                mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();

                // act
                jest.useFakeTimers();
                appComponent.ngOnInit();
                // assert
                jest.advanceTimersByTime(2100);
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).nthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.TAB_CLICKED,
                    Environment.HOME,
                    'resources');
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).nthCalledWith(1,
                    ImpressionType.VIEW,
                    '',
                    'resources',
                    Environment.HOME,
                    undefined, undefined, undefined, undefined,
                    corRelationList);
                jest.useRealTimers();
                jest.clearAllTimers();
                setTimeout(() => {
                    done();
                });
            });
        it('should set document direction to rtl for ltr language change to ur', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockEvents.subscribe = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // jest.spyOn(mockPlatform, 'isRTL', 'get')
            //     .mockImplementation(() => false);
            jest.spyOn(mockTranslate, 'onLangChange', 'get')
                .mockImplementation(() => of({ lang: 'ur' }) as any);

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                expect(document.documentElement.dir).toEqual('rtl');
                done();
            });
        });
        it('should set document direction to ltr for rtl language change to en', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockEvents.subscribe = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // jest.spyOn(mockPlatform, 'isRTL', 'get')
            //     .mockImplementation(() => false);
            jest.spyOn(mockTranslate, 'onLangChange', 'get')
                .mockImplementation(() => of({ lang: 'en' }) as any);

            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                expect(document.documentElement.dir).toEqual('ltr');
                done();
            });
        });
    });

});
