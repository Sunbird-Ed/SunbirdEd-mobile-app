import { ProfileSettingsPage } from './profile-settings.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    SharedPreferences,
    DeviceRegisterService
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService
} from 'services';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { Scanner } from 'typescript';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
import { of, Subscription } from 'rxjs';

describe('ProfileSettingsPage', () => {
    let profileSettingsPage: ProfileSettingsPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box')
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRouter: Partial<Router> = {};
    const mockScanner: Partial<Scanner> = {};
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockTranslate: Partial<TranslateService> = {};

    beforeAll(() => {
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockPreferences as SharedPreferences,
            mockDeviceRegisterService as DeviceRegisterService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of profileSettingsPage', () => {
        expect(profileSettingsPage).toBeTruthy();
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                Environment.ONBOARDING
            );
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            done();
        });
    });

    it('should subscribe formcontrol to call ngOnDestroy()', () => {
        // arrange
        const data = jest.fn();
        const mockFormControlSubscriptions = {
            unsubscribe: data
        } as Partial<Subscription>;
        // act
        profileSettingsPage.ngOnDestroy();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
        }, 0);
    });

    it('should control Scanner to called handleActiveScanner()', () => {
        // arrange
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    stopScanner: true
                }
            }
        }));
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockPreferences as SharedPreferences,
            mockDeviceRegisterService as DeviceRegisterService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService
        );
        mockScanner.stopScanner = jest.fn();
        // act
        profileSettingsPage.handleActiveScanner();
        // assert
        setTimeout(() => {
            expect(mockRouter.getCurrentNavigation).toHaveBeenCalled();
            expect(mockScanner.stopScanner).toHaveBeenCalled();
        }, 0);
    });

    it('should handle all header events by invoked ionViewWillEnter()', () => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        };
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        expect(data).toHaveBeenCalled();
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
    });

    it('should handle hideHeader events by invoked ionViewWillEnter()', () => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        };
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    hideBackButton: true
                }
            }
        }));
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockHeaderService.hideHeader = jest.fn();
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        }, 0);
    });
});
