import {ApplicationHeaderComponent} from '@app/app/components/application-header/application-header.component';
import {DownloadService, EventsBusService, ProfileService, SharedPreferences} from 'sunbird-sdk';
import {NotificationService as PushNotificationService} from 'sunbird-sdk/notification/def/notification-service';
import {MenuController, Platform, PopoverController} from '@ionic/angular';
import { Events } from '@app/util/events';
import {
    ActivePageService,
    AppGlobalService, AppHeaderService,
    CommonUtilService,
    NotificationService,
    TelemetryGeneratorService,
    UtilityService
} from '@app/services';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TncUpdateHandlerService} from '@app/services/handlers/tnc-update-handler.service';
import {of} from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { Environment, InteractSubtype } from '../../../services';
import { EventTopics } from '../../app.constant';

describe('ApplicationHeaderComponent', () => {
    let applicationHeaderComponent: ApplicationHeaderComponent;

    window.cordova.plugins = {
        InAppUpdateManager: {
            isUpdateAvailable: jest.fn((fn) => fn(Promise.resolve('22')))
        }
    };

    const param = {selectedLanguage: 'en'};
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en' as any))
    };
    const mockDownloadService: Partial<DownloadService> = {};
    const mockPushNotificationService: Partial<PushNotificationService> = {
        getAllNotifications: jest.fn(() => of([{}]))
    };
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockMenuController: Partial<MenuController> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn((_, fn) => fn(param))
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockNotification: Partial<NotificationService> = {
        setupLocalNotification: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockRouter: Partial<Router> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockPopoverController: Partial<PopoverController> = {};
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};

    beforeAll(() => {
        applicationHeaderComponent = new ApplicationHeaderComponent(
            mockPreferences as SharedPreferences,
            mockDownloadService as DownloadService,
            mockPushNotificationService as PushNotificationService,
            mockEventBusService as EventsBusService,
            mockProfileService as ProfileService,
            mockMenuController as MenuController,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockUtilityService as UtilityService,
            mockChangeDetectionRef as ChangeDetectorRef,
            mockNotification as NotificationService,
            mockTranslate as TranslateService,
            mockPlatform as Platform,
            mockRouter as Router,
            mockNgZone as NgZone,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockActivePageService as ActivePageService,
            mockPopoverController as PopoverController,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockAppHeaderService as AppHeaderService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of application header component', () => {
        expect(applicationHeaderComponent).toBeTruthy();
    });

    describe('onInit', () => {
        it('should check for app update when returns true', (done) => {
            // arrange
            jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample_version_name'));
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (topic === 'user-profile-changed') {
                    fn();
                } else if (topic === 'app-global:profile-obj-changed') {
                    fn();
                } else if (topic === 'notification-status:update') {
                    fn({isUnreadNotifications: true});
                } else if (topic === 'header:decreasezIndex') {
                    applicationHeaderComponent.decreaseZindex = true;
                } else if (topic === 'header:setzIndexToNormal') {
                    applicationHeaderComponent.decreaseZindex = false;
                }
            });
            mockNgZone.run = jest.fn((fn) => fn());
            mockTranslate.onLangChange = of(true);
            jest.spyOn(applicationHeaderComponent, 'listenDownloads').mockImplementation();
            mockPushNotificationService.notifications$ = of([]);
            mockCommonUtilService.networkAvailability$ = of(true);
            mockPreferences.getString = jest.fn(() => of('en'));
            mockNotification.setupLocalNotification = jest.fn();
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('setAppLogo', () => {
        it('if part', (done) => {
            //arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => ('false'));
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve(''));
            var appLogo = '';
            //act
            applicationHeaderComponent.setAppLogo();
            //assert
            setTimeout(() => {
                done();
            },0)
        })
  
        it('else part', (done) => {
            //arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => ('true'));
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve(''));
            var appLogo = '';
            //act
            applicationHeaderComponent.setAppLogo();
            //assert
            setTimeout(() => {
                done();
            })
        })
    })

});
