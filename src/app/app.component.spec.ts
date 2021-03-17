import { AppComponent } from './app.component';
import { Location } from '@angular/common';
import {
    FormAndFrameworkUtilService, AppGlobalService,
    CommonUtilService, TelemetryGeneratorService, UtilityService, AppHeaderService,
    LogoutHandlerService, AppRatingService, ActivePageService, SplashScreenService,
    InteractType, InteractSubtype, Environment, PageId,
    LocalCourseService, ImpressionType, CorReleationDataType, LoginHandlerService
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
import {
    NetworkAvailabilityToastService
} from '@app/services/network-availability-toast/network-availability-toast.service';
import { NotificationService as LocalNotification } from '@app/services/notification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of, Subject, EMPTY } from 'rxjs';
import { PreferenceKey, EventTopics, RouterLinks } from './app.constant';
import { BackButtonEmitter } from '@ionic/angular/dist/providers/platform';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CsClientStorage } from '@project-sunbird/client-services/core';
import { ProfileType } from '@project-sunbird/sunbird-sdk';

declare const supportfile;
declare const plugins;

describe('AppComponent', () => {
    let appComponent: AppComponent;
    window.cordova.plugins = {
        notification: {
            local: {
                launchDetails: {
                    action: 'click'
                }
            }
        },
        InAppUpdateManager: {
            checkForImmediateUpdate: jest.fn()
        }
    };
    const mockActivePageService: Partial<ActivePageService> = {
        computePageId: jest.fn(() => 'sample-page-id')
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'some_user_id'),
        getProfileSettingsStatus: jest.fn()
    };
    const mockAppRatingService: Partial<AppRatingService> = {
        checkInitialDate: jest.fn()
    };
    const mockCodePushExperimentService: Partial<CodePushExperimentService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isDeviceLocationAvailable: jest.fn(() => Promise.resolve(true))
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn()
    };
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
        addListener: jest.fn(() => { })
    };
    const mockRouter: Partial<Router> = {
        events: EMPTY,
        navigate: jest.fn()
    };
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockStatusBar: Partial<StatusBar> = {
        styleBlackTranslucent: jest.fn()
    };
    const mockSystemSettingsService: Partial<SystemSettingsService> = {
        getSystemSettings: jest.fn(() => of({}))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        genererateAppStartTelemetry: jest.fn(),
        generateNotificationClickedTelemetry: jest.fn()
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
    const mockUtilityService: Partial<UtilityService> = {
        clearUtmInfo: jest.fn(() => Promise.resolve())
    };
    const mockZone: Partial<NgZone> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {
        checkCourseRedirect: jest.fn(() => Promise.resolve())
    };
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};

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
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockLoginHandlerService as LoginHandlerService
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOYFUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(false);
                }
            });
            mockPreferences.putBoolean = jest.fn(() => of(false));
            mockHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
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
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            setTimeout(() => {
                expect(appComponent.headerConfig).toBe(mockConfig);
                expect(mockUtilityService.clearUtmInfo).toHaveBeenCalled();
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
        it('should listen if traceId is changed', (done) => {
            // arrange
            mockHeaderService.headerConfigEmitted$ = EMPTY;
            mockCommonUtilService.networkAvailability$ = of(false);
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            mockPreferences.addListener = jest.fn(() => 'some_trace_id');
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            setTimeout(() => {
                expect(mockPreferences.addListener).toHaveBeenCalledWith(CsClientStorage.TRACE_ID, expect.any(Function));
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('DEFAULT');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.hideStatusBar = jest.fn();
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
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenCalledTimes(9);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not generate utm-info telemetry if utm source is not available', (done) => {
            // arrange
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            mockPreferences.getString = jest.fn(() => of(undefined));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    InteractType.LOCAL,
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.nthCalledWith(2,
                    InteractType.OTHER,
                    InteractSubtype.UTM_INFO,
                    Environment.HOME,
                    PageId.HOME,
                    undefined,
                    { utm_data: { utm_source: 'sunbird' } }
                );
                done();
            }, 0);
        });

        it('should not generate utm-info telemetry for Error response', (done) => {
            // arrange
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    InteractType.LOCAL,
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOYFUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOYFUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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

        it('should go to catch block if response is not stringify', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            const hotCodePushKey = {
                deploymentKey: ''
            };
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({ value: hotCodePushKey }));

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalled();
                // expect(mockPreferences.putString).not.toHaveBeenCalled();
                done();
            });
        });
        it('should not set DEPLOYMENT_KEY if hotCodePushKey is empty', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({ value: '{ \"deploymentKey\": \"\"}' }));

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalled();
                // expect(mockPreferences.putString).not.toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should set DEPLOYMENT_KEY if hotCodePushKey not empty', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({ value: '{ \"deploymentKey\": \"some_key\"}' }));
            mockPreferences.putString = jest.fn(() => of(undefined));

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalled();
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.DEPLOYMENT_KEY, 'some_key');
                done();
            }, 0);
        });
    });
    describe('checkForCodeUpdates', () => {
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
                        return of('some_deployment_key');
                    case PreferenceKey.SYNC_CONFIG:
                        return of('some_config');
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOYFUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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

        it('should call codePush sync', (done) => {
            // arrange
            mockPlatform.ready = jest.fn(() => {
                return {
                    then: jest.fn((cb) => cb('ready'))
                } as any;
            });
            codePush.sync = jest.fn((status, deploymentKey, downloadProgress) => {
                status(SyncStatus.DOWNLOADING_PACKAGE);
                downloadProgress({ receivedBytes: 10, totalBytes: 100 });
                downloadProgress({ receivedBytes: 20, totalBytes: 100 });
                downloadProgress({ receivedBytes: 50, totalBytes: 100 });
                downloadProgress({ receivedBytes: 100, totalBytes: 100 });
                status(SyncStatus.INSTALLING_UPDATE);
                status(SyncStatus.ERROR);
            });

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.sync).toHaveBeenCalledWith(expect.any(Function),
                    expect.objectContaining({ deploymentKey: 'some_deployment_key' }),
                    expect.any(Function));
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('DEFAULT');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.hideStatusBar = jest.fn();
            FCMPlugin.getToken = jest.fn((callback) => callback('some_token'));
            mockPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(SunbirdSdk.instance, 'updateDeviceRegisterConfig').mockImplementation();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.getToken).toHaveBeenCalled();
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    InteractType.LOCAL,
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('DEFAULT');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.hideStatusBar = jest.fn();
            FCMPlugin.onTokenRefresh = jest.fn((callback) => callback('some_token'));
            mockPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(SunbirdSdk.instance, 'updateDeviceRegisterConfig').mockImplementation();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    InteractType.LOCAL,
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOFYUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.showStatusBar = jest.fn();
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
                id: 'some_id',
                wasTapped: true,
                actionData: '{\"key\":\"value\"}'
            };
            FCMPlugin.onNotification = jest.fn((callback, success, error) => {
                callback(mockData);
                success({});
                error('');
            });
            mockActivePageService.computePageId = jest.fn(() => 'some_page_id');
            mockNotificationServices.addNotification = jest.fn(() => of(mockData as any));
            mockNotificationSrc.setNotificationParams = jest.fn();

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(FCMPlugin.onNotification).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).nthCalledWith(2,
                    InteractType.FCM,
                    'some_page_id',
                    { notification_id: 'some_id' },
                    [{ id: 'some_id', type: 'NotificationId' }]
                );
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toBeCalledWith(
                    InteractType.LOCAL,
                    'some_page_id',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('DEFAULT');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.hideStatusBar = jest.fn();
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
            mockRouter.events = of({
                subscribe: jest.fn()
            }) as any;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockRouter.url = RouterLinks.LIBRARY_TAB;
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
            mockMenuCtrl.isOpen = jest.fn(() => Promise.resolve(true));
            mockMenuCtrl.close = jest.fn(() => Promise.resolve(true));

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.getCurrentPackage).toHaveBeenCalled();
                expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockMenuCtrl.isOpen).toHaveBeenCalled();
                expect(mockMenuCtrl.close).toHaveBeenCalled();
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
            mockRouter.events = of({
                subscribe: jest.fn()
            }) as any;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockRouter.url = RouterLinks.LIBRARY_TAB;
            // TODO:
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_app_name'));
            appComponent.appVersion = 'some_app_name';
            mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_key'));
            mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
            mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());
            mockMenuCtrl.isOpen = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.showExitPopUp = jest.fn(() => Promise.resolve());

            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(codePush.getCurrentPackage).toHaveBeenCalled();
                expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockMenuCtrl.isOpen).toHaveBeenCalled();
                expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalled();
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
                mockRouter.events = of({
                    subscribe: jest.fn()
                }) as any;
                const subscribeWithPriorityData = jest.fn((_, fn) => fn());
                mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData
                } as any;
                mockRouter.url = 'sample-page';
                appComponent.rootPageDisplayed = false;
                // TODO:
                mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('some_current_app_name'));
                appComponent.appVersion = 'some_current_app_name';
                mockCodePushExperimentService.getDefaultDeploymentKey = jest.fn(() => of('some_default_key'));
                mockCodePushExperimentService.setExperimentKey = jest.fn(() => of());
                mockCodePushExperimentService.setExperimentAppVersion = jest.fn(() => of());
                mockLocation.back = jest.fn();

                // act
                appComponent.ngOnInit();
                // assert
                setTimeout(() => {
                    expect(codePush.getCurrentPackage).toHaveBeenCalled();
                    expect(mockCodePushExperimentService.getDefaultDeploymentKey).toHaveBeenCalled();
                    expect(mockPlatform.backButton).not.toBeUndefined();
                    expect(appComponent.rootPageDisplayed).toBeFalsy();
                    expect(mockLocation.back).toHaveBeenCalled();
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
            mockPreferences.getString = jest.fn(() => of(ProfileType.ADMIN));
            mockAppGlobalService.isGuestUser = true;
            mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('DEFAULT');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
                }
            });
            mockHeaderService.hideStatusBar = jest.fn();
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
        it('should subscribe tab change event with pageId library '
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
                            return fn('library');
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
                    'library');
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    'library',
                    Environment.HOME,
                    undefined, undefined, undefined, undefined,
                    corRelationList);
                jest.useRealTimers();
                jest.clearAllTimers();
                setTimeout(() => {
                    done();
                });
            });

        it('should subscribe tab change event with pageId courses '
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
                            return fn('courses');
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
                mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
                const corRelationList: Array<CorrelationData> = [];
                corRelationList.push({ id: 'mock_channel_id', type: CorReleationDataType.SOURCE });
                mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
                mockTranslate.use = jest.fn();
                // act
                jest.useFakeTimers();
                appComponent.ngOnInit();
                // assert
                jest.advanceTimersByTime(2100);
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.TAB_CLICKED,
                    Environment.HOME,
                    'courses');
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

        it('should get errorEvent for planned maintenance and display it ', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEventsBusService.events = jest.fn(() => of({
                type: 'PLANNED_MAINTENANCE_PERIOD',
                payload: {}
            }));
            mockEvents.subscribe = jest.fn();
            const mockButtonSubscription = {
                unsubscribe: jest.fn()
            };
            const subscribeWithPriorityData = jest.fn((_, fn) => {
                setTimeout(() => {
                    fn();
                });
                return mockButtonSubscription;
            });
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            // act
            jest.useFakeTimers();
            appComponent.ngOnInit();
            // assert
            jest.advanceTimersByTime(2100);
            jest.useRealTimers();
            jest.clearAllTimers();
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(subscribeWithPriorityData).toBeTruthy();
                done();
            }, 0);
        });
    });

    describe('checkDeviceLocation()', () => {

        it('shouldn\'t show location selection page if location available', (done) => {
            // arrange
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            mockPreferences.getString = jest.fn(() => of(ProfileType.ADMIN));
            mockAppGlobalService.isGuestUser = true;
            mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
            // act
            appComponent.reloadGuestEvents();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).not.toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenCalled();
                expect(mockAppGlobalService.isGuestUser).toBeTruthy();
                done();
            }, 0);
        });

        it('shouldn\'t show location selection page if BMC value is not selected', (done) => {
            // arrange
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(false));
            mockPreferences.getString = jest.fn(() => of(ProfileType.ADMIN));
            mockAppGlobalService.isGuestUser = false;
            // act
            appComponent.reloadGuestEvents();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).not.toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenCalled();
                expect(mockAppGlobalService.isGuestUser).toBeFalsy();
                done();
            }, 0);
        });

        it('should show location selection page if BMC value is not selected', (done) => {
            // arrange
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve({})) as any;
            mockPreferences.getString = jest.fn(() => of(ProfileType.ADMIN));
            // act
            appComponent.reloadGuestEvents();
            // assert

            setTimeout(() => {
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'district-mapping'], {
                    state: {
                        isShowBackButton: false
                    }
                });
                done();
            }, 0);

        });
    });

    describe('menuItemAction', () => {
        it('should navigate to groups page when my group is clicked in menu', () => {
            // arrange
            const menuName = {
                menuItem: 'MY_GROUPS'
            };
            const routeUrl = [`/${RouterLinks.MY_GROUPS}`];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            appComponent.menuItemAction(menuName);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(routeUrl, expect.anything());
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.MY_GROUPS_CLICKED,
                Environment.USER,
                PageId.PROFILE
            );
        });

        it('should navigate to SETTINGS page when settings is clicked in menu', () => {
            // arrange
            const menuName = {
                menuItem: 'SETTINGS'
            };
            const routeUrl = [`/${RouterLinks.SETTINGS}`];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            appComponent.menuItemAction(menuName);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(routeUrl);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.SETTINGS_CLICKED,
                Environment.USER,
                PageId.PROFILE
            );
        });

        it('should navigate to LANGUAGE page when language is clicked in menu', () => {
            // arrange
            const menuName = {
                menuItem: 'LANGUAGE'
            };
            const routeUrl = [`/${RouterLinks.LANGUAGE_SETTING}`, true];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            appComponent.menuItemAction(menuName);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(routeUrl);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.LANGUAGE_CLICKED,
                Environment.USER,
                PageId.PROFILE
            );
        });

        it('should navigate to HELP page when help is clicked in menu', () => {
            // arrange
            const menuName = {
                menuItem: 'HELP'
            };
            const routeUrl = [`/${RouterLinks.FAQ_HELP}`];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            appComponent.menuItemAction(menuName);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(routeUrl);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.HELP_CLICKED,
                Environment.USER,
                PageId.PROFILE
            );
        });

        it('should return a toast for internet changes', () => {
            // arrange
            const menuName = {
                menuItem: 'LOGOUT'
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            appComponent.menuItemAction(menuName);
            // assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
        });

        it('should handle logout', () => {
            // arrange
            const menuName = {
                menuItem: 'LOGOUT'
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockLogoutHandlerService.onLogout = jest.fn();
            // act
            appComponent.menuItemAction(menuName);
            // assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
            expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
        });

        it('should handle inappupdate', () => {
            // arrange
            const menuName = {
                menuItem: 'UPDATE'
            };
            // act
            appComponent.menuItemAction(menuName);
            // assert
            expect(cordova.plugins.InAppUpdateManager.checkForImmediateUpdate).toHaveBeenCalled();
        });
    });

    describe('checkAndroidWebViewVersion', () => {
        it('should generate a impression event for webviewConfig', (done) => {
            mockFormAndFrameworkUtilService.getWebviewConfig = jest.fn(() => Promise.resolve(1));
            document.getElementById = jest.fn(() => ({ style: { display: 'auto' } })) as any;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            appComponent.checkAndroidWebViewVersion();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.getWebviewConfig).toHaveBeenCalled();
                expect(document.getElementById).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.UPDATE_WEBVIEW_POPUP,
                    Environment.HOME
                );
                done();
            }, 0);
        });

        it('should generate a impression event for webviewConfig', (done) => {
            mockFormAndFrameworkUtilService.getWebviewConfig = jest.fn(() => Promise.reject({ error: 'error' }));
            document.getElementById = jest.fn(() => ({ style: { display: 'auto' } })) as any;
            // act
            appComponent.checkAndroidWebViewVersion();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.getWebviewConfig).toHaveBeenCalled();
                expect(document.getElementById).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should return GooglePlayPage', () => {
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        appComponent.openPlaystore();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.UPDATE_WEBVIEW_CLICKED,
            Environment.HOME,
            PageId.UPDATE_WEBVIEW_POPUP
        );
    });

    describe('ngAfterViewInit', () => {
        it('should return downloadProgress for platform resume', (done) => {
            mockPlatform.resume = of({
                subscribe: jest.fn()
            }) as any;
            const value = new Map();
            mockTelemetryGeneratorService.generateInterruptTelemetry = jest.fn();
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve()) as any;
            mockPreferences.getString = jest.fn(() => of('{key: "sample-ke"}'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockNotificationSrc.handleNotification = jest.fn(() => Promise.resolve());
            // act
            appComponent.ngAfterViewInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInterruptTelemetry).toHaveBeenCalledWith('resume', '');
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    InteractSubtype.HOTCODE_PUSH_INITIATED,
                    Environment.HOME, PageId.HOME, null, value);
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.DEPLOYMENT_KEY);
                expect(mockNotificationSrc.handleNotification).toHaveBeenCalled();
                expect(appComponent.isForeground).toBeTruthy();
                done();
            }, 0);
        });

        it('should generate a event for for platform pause', (done) => {
            mockPlatform.pause = of({
                subscribe: jest.fn()
            }) as any;
            const value = new Map();
            mockTelemetryGeneratorService.generateInterruptTelemetry = jest.fn();
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve()) as any;
            mockPreferences.getString = jest.fn(() => of(undefined));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockNotificationSrc.handleNotification = jest.fn(() => Promise.resolve());
            // act
            appComponent.ngAfterViewInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInterruptTelemetry).toHaveBeenCalledWith('background', '');
                expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
                    InteractSubtype.HOTCODE_PUSH_KEY_NOT_DEFINED,
                    Environment.HOME, PageId.HOME);
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.DEPLOYMENT_KEY);
                expect(mockNotificationSrc.handleNotification).toHaveBeenCalled();
                expect(appComponent.isForeground).toBeFalsy();
                done();
            }, 0);
        });

        it('should not generate a event for for platform pause', (done) => {
            mockPlatform.pause = of({
                subscribe: jest.fn()
            }) as any;
            mockAppGlobalService.isNativePopupVisible = true;
            const value = new Map();
            mockTelemetryGeneratorService.generateInterruptTelemetry = jest.fn();
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve()) as any;
            mockPreferences.getString = jest.fn(() => of(undefined));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockNotificationSrc.handleNotification = jest.fn(() => Promise.resolve());
            // act
            appComponent.ngAfterViewInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInterruptTelemetry).not.toHaveBeenCalledWith('background', '');
                mockAppGlobalService.isNativePopupVisible = false;
                done();
            }, 0);
        });
    });

    describe('startOpenrapDiscovery', () => {
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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

        it('shouldreturn openRapDiscovery', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                done();
            }, 0);
        });
    });

    it('should handle headerService and statusbar', () => {
        // arrange
        mockHeaderService.headerConfigEmitted$ = of({
            subscribe: jest.fn(() => 'config')
        });
        mockPlatform.ready = jest.fn(() => Promise.resolve({})) as any;
        mockStatusBar.styleDefault = jest.fn();
        // act
        appComponent.initializeApp();
        // assert
        expect(mockHeaderService.headerConfigEmitted$).not.toBeUndefined();
        expect(mockPlatform.ready).toHaveBeenCalled();
    });

    describe('handleHeaderEvents', () => {
        it('should return sidebarEvent', () => {
            const request = {
                name: 'back'
            };
            mockRouter.url = RouterLinks.USER_TYPE_SELECTION;
            mockHeaderService.sidebarEvent = jest.fn();
            // act
            appComponent.handleHeaderEvents(request);
            // assert
            expect(mockRouter.url).toBeTruthy();
            expect(mockHeaderService.sidebarEvent).toHaveBeenCalled();
        });

        it('should return ExitPopUp', () => {
            const request = {
                name: 'back'
            };
            mockRouter.url = RouterLinks.LIBRARY_TAB;
            mockActivePageService.computePageId = jest.fn(() => 'sample-page-id');
            mockCommonUtilService.showExitPopUp = jest.fn(() => Promise.resolve());
            // act
            appComponent.handleHeaderEvents(request);
            // assert
            expect(mockRouter.url).toBeTruthy();
            expect(mockActivePageService.computePageId).toHaveBeenCalled();
            expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalled();
        });

        it('should back to previous page', () => {
            const request = {
                name: 'back'
            };
            mockRouter.url = 'sampl-url';
            mockLocation.back = jest.fn();
            // act
            appComponent.handleHeaderEvents(request);
            // assert
            expect(mockRouter.url).toBeTruthy();
            expect(mockLocation.back).toHaveBeenCalled();
        });

        it('should return sidebar event if request is not back', () => {
            const request = {
                name: 'go'
            };
            mockRouter.url = 'sampl-url';
            mockHeaderService.sidebarEvent = jest.fn();
            // act
            appComponent.handleHeaderEvents(request);
            // assert
            expect(mockRouter.url).toBeTruthy();
            expect(mockHeaderService.sidebarEvent).toHaveBeenCalled();
        });
    });

    describe('handleAuthAutoMigrateEvents', () => {
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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

        it('should return a toast for auto migrate success', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockEventsBusService.events = jest.fn(() => of({ type: 'AUTO_MIGRATE_SUCCESS' }));
            mockCommonUtilService.showToast = jest.fn();
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('AUTO_MIGRATION_SUCCESS_MESSAGE');
                done();
            }, 0);
        });

        it('should return a toast for auto migrate fail', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockEventsBusService.events = jest.fn(() => of({ type: 'AUTO_MIGRATE_FAIL' }));
            mockCommonUtilService.showToast = jest.fn();
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('AUTO_MIGRATION_FAIL_MESSAGE');
                done();
            }, 0);
        });

        it('should return a toast for auto migrate fail', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockEventsBusService.events = jest.fn(() => of({ type: 'AUTH_TOKEN_REFRESH_ERROR' }));
            mockLogoutHandlerService.onLogout = jest.fn();
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should generate a event for walkthrough-backdrop-click', () => {
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        appComponent.qrWalkthroughBackdropClicked();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.WALKTHROUGH_BACKDROP_CLICKED,
            Environment.ONBOARDING,
            PageId.LIBRARY,
        );
    });

    it('should generate event for onConfirmationClicked on walkthrough', () => {
        const event = {
            stopPropagation: jest.fn(() => 'stop-propagation')
        };
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        appComponent.onConfirmationClicked(event);
        // assert
        expect(appComponent.showWalkthroughBackDrop).toBeFalsy();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.WALKTHROUGH_CONFIRMATION_CLICKED,
            Environment.ONBOARDING,
            PageId.LIBRARY
        );
    });

    describe('getDeviceProfile', () => {
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case 'notification_received_at':
                        return of('sample');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
                }
            });
            mockPreferences.getBoolean = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.COACH_MARK_SEEN:
                    return of(true);
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

        it('should return userDeclaredLocation', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockDeviceRegisterService.getDeviceProfile = jest.fn(() => of({
                userDeclaredLocation: {
                    state: 'karnataka',
                    district: 'bangalore'
                }
            }));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.DEVICE_LOCATION,
                    JSON.stringify({
                        state: 'karnataka',
                        district: 'bangalore'
                    })
                );
                done();
            }, 0);
        });

        it('should return ipLocation', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockDeviceRegisterService.getDeviceProfile = jest.fn(() => of({
                userDeclaredLocation: undefined,
                ipLocation: {
                    state: 'karnataka',
                    district: 'bangalore'
                }
            }));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.IP_LOCATION,
                    '[]'
                );
                done();
            }, 0);
        });

        it('should return ipLocation', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockDeviceRegisterService.getDeviceProfile = jest.fn(() => of({
                userDeclaredLocation: undefined,
                ipLocation: {
                    state: 'karnataka'
                }
            }));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.IP_LOCATION,
                    '[]'
                );
                done();
            }, 0);
        });

        it('should not return ipLocation if state is undefined', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockDeviceRegisterService.getDeviceProfile = jest.fn(() => of({
                userDeclaredLocation: undefined,
                ipLocation: {
                    state: undefined
                }
            }));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.IP_LOCATION,
                    '[]'
                );
                done();
            }, 0);
        });


        it('should not return ipLocation if its undefined', (done) => {
            // arrange
            const value = new Map();
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockTelemetryGeneratorService.generateNotificationClickedTelemetry = jest.fn();
            mockPreferences.getString = jest.fn(() => of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]'));
            mockTranslate.use = jest.fn(() => of({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ skipRootNavigation: false }));
            // mockPreferences.getString = jest.fn(() => of('sample-batch-details'));
            mockAppGlobalService.limitedShareQuizContent = false;
            mockZone.run = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(appComponent, 'reloadSigninEvents').mockImplementation(() => {
                return;
            });
            mockAppGlobalService.OPEN_RAPDISCOVERY_ENABLED = true;
            (window as any).openrap = {
                startDiscovery: jest.fn((fn) => fn({}))
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(SunbirdSdk.instance, 'updateContentServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updatePageServiceConfig').mockImplementation();
            jest.spyOn(SunbirdSdk.instance, 'updateTelemetryConfig').mockImplementation();
            mockTelemetryAutoSyncService.start = jest.fn(() => of(undefined));
            mockTelemetryAutoSyncService.pause = jest.fn();
            mockPlatform.pause = of(1, 2) as any;
            mockPlatform.resume = of(1, 2) as any;
            mockTelemetryAutoSyncService.continue = jest.fn();
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockDeviceRegisterService.getDeviceProfile = jest.fn(() => of({
                userDeclaredLocation: undefined,
                ipLocation: undefined
            }));
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            appComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateNotificationClickedTelemetry).toHaveBeenCalledWith(
                    'local',
                    'sample-page',
                    undefined,
                    [{ id: '', type: 'NotificationId' }]
                );
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(7, PreferenceKey.CAMPAIGN_PARAMETERS);
                expect(mockTranslate.use).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    'networkStatus',
                    Environment.HOME,
                    'splash',
                    undefined,
                    value
                );
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY);
                expect(appComponent.toggleRouterOutlet).toBeTruthy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.OPENRAP_DEVICE_DISCONNECTED,
                    Environment.HOME,
                    Environment.HOME, undefined,
                    new Map()
                );
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    'sunbirdcontent_context',
                    ''
                );
                done();
            }, 0);
        });
    });

    it('should navigate to downloads if user clicked on it', () => {
        // arrange
        appComponent.isPlannedMaintenanceStarted = false;
        mockRouter.navigate = jest.fn();
        // act
        appComponent.navigateToDownloads();
        // assert
        expect(appComponent.isPlannedMaintenanceStarted).toBeFalsy();
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.DOWNLOAD_TAB]);
    });

    it('should set plannedMaintenanceBanner to false when user clicks on close icon', () => {
        // arrange
        appComponent.isPlannedMaintenanceStarted = false;
        // act
        appComponent.closePlannedMaintenanceBanner();
        // assert
        expect(appComponent.isPlannedMaintenanceStarted).toBeFalsy();
    });

    describe('checkTheme', () => {
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
                    case PreferenceKey.CAMPAIGN_PARAMETERS:
                        return of('[{"utmSource": "playstore"}, {"utmMedium": "sample"}]');
                    case PreferenceKey.CURRENT_SELECTED_THEME:
                        return of('JOYFUL');
                    case PreferenceKey.SELECTED_USER_TYPE:
                        return of(ProfileType.ADMIN);
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

        it('should check for theme at start of application', () => {
            expect(appComponent).toBeTruthy();
        });
    });
});
