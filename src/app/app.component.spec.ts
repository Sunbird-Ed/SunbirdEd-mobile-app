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
    CodePushExperimentService, SystemSettingsService, DeviceRegisterService, TelemetryAutoSyncService
} from 'sunbird-sdk';
import { Platform, Events, MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { NgZone } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Router } from '@angular/router';
import { NetworkAvailabilityToastService } from '@app/services/network-availability-toast/network-availability-toast.service';
import { NotificationService as localNotification } from '@app/services/notification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of, Subject } from 'rxjs';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';

declare const supportfile;

describe('AppComponent', () => {
    let appComponent: AppComponent;
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'sample-device-id')
    };
    const mockAppRatingService: Partial<AppRatingService> = {
        checkInitialDate: jest.fn()
    };
    const mockCodePushExperimentService: Partial<CodePushExperimentService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isDeviceLocationAvailable: jest.fn(() => Promise.resolve(true))
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockEvents: Partial<Events> = {};
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
    const mockNotificationSrc: Partial<localNotification> = {};
    const pauseData = new Subject<void>();
    const mockPlatform: Partial<Platform> = {
        ready: jest.fn(() => new Promise(() => { })),
        pause: pauseData,
        resume: pauseData
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(undefined)),
        putString: jest.fn(() => of(undefined))
    };
    const mockRouter: Partial<Router> = {};
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
    const data: Partial<TelemetryAutoSyncService> = {
        start: jest.fn(() => of({}))
    };
    const mockTelemetryService: Partial<TelemetryService> = {
        autoSync: data
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        checkForTncUpdate: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('sunbird')),
        getDeviceSpec: jest.fn(() => Promise.resolve({}))
    };
    const mockZone: Partial<NgZone> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};

    const constructComponent = () => {
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
            mockNotificationSrc as localNotification,
            mockRouter as Router,
            mockLocation as Location,
            mockMenuCtrl as MenuController,
            mockNetworkAvailability as NetworkAvailabilityToastService,
            mockSplashScreenService as SplashScreenService,
            mockLocalCourseService as LocalCourseService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate
        );
    };

    beforeAll(() => {
        constructComponent();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of appComponent', () => {
        expect(appComponent).toBeTruthy();
    });

    describe('constructor', () => {
        it('should call on platform ready', (done) => {
            mockPlatform.ready = jest.fn(() => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(), 100);
                });
            });

            constructComponent();

            jest.spyOn(appComponent, 'fcmTokenWatcher').mockImplementation();
            jest.spyOn(appComponent, 'checkForExperiment').mockImplementation();
            jest.spyOn(appComponent, 'receiveNotification').mockImplementation();
            jest.spyOn(appComponent, 'generateNetworkTelemetry').mockImplementation();
            jest.spyOn(appComponent, 'subscribeEvents').mockImplementation();
            jest.spyOn(appComponent, 'handleBackButton').mockImplementation();
            jest.spyOn(appComponent, 'checkAndroidWebViewVersion').mockImplementation();
            jest.spyOn(appComponent, 'getUtmParameter').mockImplementation();
            spyOn(supportfile, 'makeEntryInSunbirdSupportFile').and.callFake((a, b) => {
                setTimeout(() => {
                    setTimeout(() => {
                        a();
                        done();
                    }, 0);
                });
            });
            jest.spyOn(appComponent, 'checkForCodeUpdates').mockImplementation();
        });
    });

    describe('getUtmParameter', () => {
        fit('should generate utm-info telemetry if utm source is available for first time', (done) => {
            // arrange
            const utmResponse = {
                val: ''
            };
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(utmResponse));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            // act
            appComponent.getUtmParameter();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.UTM_INFO,
                    Environment.HOME,
                    PageId.HOME,
                    undefined,
                    `{'utm_source': 'sunbird'}`
                );
                expect(mockUtilityService.clearUtmInfo).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should generate utm-info telemetry if utm source is available for first time and check for utm content', (done) => {
            // arrange
            const utmResponse = {
                val: 'utm_content=https://test.com/sample/id_0000'
            };
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(utmResponse));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());
            mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent = jest.fn();
            // act
            appComponent.getUtmParameter();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.UTM_INFO,
                    Environment.HOME,
                    PageId.HOME,
                    undefined,
                    `{'utm_source': 'sunbird'}`
                );
                expect(mockSplaschreenDeeplinkActionHandlerDelegate.checkUtmContent).toHaveBeenCalled();
                expect(mockUtilityService.clearUtmInfo).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not generate utm-info telemetry for Error response', (done) => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.reject(`{'utm_source': 'sunbird'}`));
            // act
            appComponent.getUtmParameter();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
