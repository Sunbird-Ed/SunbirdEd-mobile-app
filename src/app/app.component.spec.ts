import { AppComponent } from './app.component';
import { Location } from '@angular/common';
import {
    FormAndFrameworkUtilService, AppGlobalService,
    CommonUtilService, TelemetryGeneratorService, UtilityService, AppHeaderService,
    LogoutHandlerService, AppRatingService, ActivePageService, SplashScreenService, InteractType, InteractSubtype, Environment, PageId
} from '../services';
import {
    EventsBusService, SharedPreferences,
    TelemetryService, NotificationService,
    CodePushExperimentService, SystemSettingsService, DeviceRegisterService,
} from 'sunbird-sdk';
import { Platform, Events, MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { NgZone } from '@angular/core';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { Network } from '@ionic-native/network/ngx';
import { Router } from '@angular/router';
import { NetworkAvailabilityToastService } from '@app/services/network-availability-toast/network-availability-toast.service';
import { NotificationService as localNotification } from '@app/services/notification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
    let appComponent: AppComponent;
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppRatingService: Partial<AppRatingService> = {};
    const mockCodePushExperimentService: Partial<CodePushExperimentService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockEvents: Partial<Events> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockLogoutHandlerService: Partial<LogoutHandlerService> = {};
    const mockMenuCtrl: Partial<MenuController> = {};
    const mockNetwork: Partial<Network> = {};
    const mockNetworkAvailability: Partial<NetworkAvailabilityToastService> = {};
    const mockNotificationServices: Partial<NotificationService> = {};
    const mockNotificationSrc: Partial<localNotification> = {};
    const mockPlatform: Partial<Platform> = {
        ready: jest.fn(() => Promise.resolve('ready'))
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(''))
    };
    const mockRouter: Partial<Router> = {};
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockStatusBar: Partial<StatusBar> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};
    const mockTranslate: Partial<TranslateService> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockZone: Partial<NgZone> = {};


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
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
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
            mockSplashScreenService as SplashScreenService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of appComponent', () => {
        expect(appComponent).toBeTruthy();
    });

    describe('getUtmParameter', () => {
        it('should generate utm-info telemetry if utm source is available for first time', () => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.resolve(`{'utm_source': 'diksha'}`));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockUtilityService.clearUtmInfo = jest.fn(() => Promise.resolve());
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
                    `{'utm_source': 'diksha'}`
                );
                expect(mockUtilityService.clearUtmInfo).toHaveBeenCalled();
            }, 0);
        });

        it('should not generate utm-info telemetry for Error response', () => {
            // arrange
            mockUtilityService.getUtmInfo = jest.fn(() => Promise.reject(`{'utm_source': 'diksha'}`));
            // act
            appComponent.getUtmParameter();
            // assert
            expect(mockUtilityService.getUtmInfo).toHaveBeenCalled();
        });
    });

});
