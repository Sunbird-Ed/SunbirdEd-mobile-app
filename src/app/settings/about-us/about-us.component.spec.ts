import {AboutUsComponent} from '@app/app/settings/about-us/about-us.component';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {
    CommonUtilService,
    Environment,
    ImpressionType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppHeaderService, UtilityService } from '../../../services';
import { ContentService, DeviceInfo, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';

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

    beforeAll(()   =>{
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
        //arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        //act
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
        //arrange
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        //act
        aboutUsComponent.goBack();
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, true
            );

       });
    });

});