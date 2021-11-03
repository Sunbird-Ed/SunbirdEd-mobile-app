import {AboutUsComponent} from '@app/app/settings/about-us/about-us.component';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {
    CommonUtilService,
    Environment,
    ImpressionType, InteractSubtype, InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import {Router} from '@angular/router';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {AppHeaderService, UtilityService} from '../../../services';
import {ContentService, DeviceInfo, ProfileService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of, Subscription} from 'rxjs';

describe('AboutUsComponent', () => {
    let aboutUsComponent: AboutUsComponent;

    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {};
    const mockLocation: Partial<Location> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn((_, fn) => {
                fn();
                return {
                    unsubscribe: jest.fn()
                };
            }),
        }
    } as any;

    beforeAll(() => {
        aboutUsComponent = new AboutUsComponent(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockDeviceInfo as DeviceInfo,
            mockSocialSharing as SocialSharing,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockSharedPreferences as SharedPreferences,
            mockUtilityService as UtilityService,
            mockAppHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockAppVersion as AppVersion,
            mockPlatform as Platform,
        );
    });

    it('should be able to create an instance', () => {
        expect(aboutUsComponent).toBeTruthy();
    });

    describe('generateImpressionEvent()', () => {

        it('should generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            aboutUsComponent.generateImpressionEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.SETTINGS_ABOUT_US,
                Environment.SETTINGS, '', '', ''
            );
        });
    });

    describe('goBack()', () => {

        it('should generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            // act
            aboutUsComponent.goBack();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, true
            );

        });
    });

    it('ionViewWillEnter will get the default config and register backButton', () => {
        // arrange
        const mockConfig = {
            showHeader: true,
            showBurgerMenu: true,
            actionButtons: [],
        };
        mockAppHeaderService.headerConfigEmitted$ = of(mockConfig);
        mockAppHeaderService.getDefaultPageConfig = jest.fn(() => {
            return mockConfig;
        });
        mockAppHeaderService.updatePageConfig = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        const unsubscribeFn = jest.fn();
        aboutUsComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        };
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        aboutUsComponent.ionViewWillEnter();
        // assert
        expect(mockAppHeaderService.getDefaultPageConfig).toHaveBeenCalled();
        expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should fetch deviceId, getAppName and versionName', () => {
        // arrange
        mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample_appName'));
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample_build_value'));
        // act
        aboutUsComponent.ngOnInit();
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        expect(mockAppVersion.getAppName).toHaveBeenCalled();
    });

    it('should generate Interact telemetry ', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        aboutUsComponent.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_CLICKED);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
    });

        describe('ionViewWillLeave()', () => {
            it('should unsubscribe to the backbutton events', () => {
            // arrange
            const mockbackButtonFuncSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
            aboutUsComponent['backButtonFunc'] = mockbackButtonFuncSubscription as any;
            // act
            aboutUsComponent.ionViewWillLeave();
            // assert
            expect(aboutUsComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
            });
        
        });

        describe('handleBackButton()', () => {
            it('should ', () => {
                // arrange
                aboutUsComponent.ShouldGenerateBackClickedTelemetry = true;
                mockPlatform.backButton = {
                    subscribeWithPriority: jest.fn((x, callback) => callback()),
                    is: jest.fn()
                };
                mockLocation.back = jest.fn();
                const unsubscribeFn = jest.fn();
                aboutUsComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn,
                } as any;
                // act
                aboutUsComponent.handleBackButton();
                // assert
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, false);

            });
        });
});
