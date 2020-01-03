import {DistrictMappingPage} from '@app/app/district-mapping/district-mapping.page';
import {AppGlobalService, AppHeaderService, CommonUtilService, FormAndFrameworkUtilService, TelemetryGeneratorService} from '@app/services';
import {ProfileSwitchHandler} from '@app/services/user-groups/profile-switch-handler';
import {DeviceRegisterService} from '../../../../sunbird-mobile-sdk/src/device-register';
import {DeviceInfo} from '../../../../sunbird-mobile-sdk/src/util/device';
import {Router} from '@angular/router';
import { Location } from '@angular/common';
import {Events, Platform} from '@ionic/angular';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {ExternalIdVerificationService} from '@app/services/externalid-verification.service';
import {SharedPreferences} from '../../../../sunbird-mobile-sdk/src/util/shared-preferences';
import {EMPTY} from 'rxjs';

describe('DistrictMappingPage', () => {
    let districtMappingPage: DistrictMappingPage;
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockProfileSwitchHandler: Partial<ProfileSwitchHandler> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockRouter: Partial<Router> = {};
    const mockLocation: Partial<Location> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockEvents: Partial<Events> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {};

    beforeAll(() => {
        mockRouter.getCurrentNavigation = jest.fn(() => {
            return {
                extras: {}
            };
        });

        mockDeviceInfo.isKeyboardShown = jest.fn(() => {
           return EMPTY;
        });

        districtMappingPage = new DistrictMappingPage(
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockProfileSwitchHandler as ProfileSwitchHandler,
            mockPreferences as SharedPreferences,
            mockDeviceRegisterService as DeviceRegisterService,
            mockDeviceInfo as DeviceInfo,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockRouter as Router,
            mockLocation as Location,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockChangeDetectionRef as ChangeDetectorRef,
            mockNgZone as NgZone,
            mockExternalIdVerificationService as ExternalIdVerificationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of DistrictMappingPage', () => {
        expect(districtMappingPage).toBeTruthy();
    });

    it('should open select overlay when showStates is set', () => {
        // arrange
        districtMappingPage.stateSelect = { open: jest.fn(() => {}) };

        // act
        districtMappingPage.showStates = true;

        // assert
        expect(districtMappingPage.stateSelect.open).toHaveBeenCalled();
    });

    it('should open select overlay when showDistrict is set', () => {
        // arrange
        districtMappingPage.districtSelect = { open: jest.fn(() => {}) };

        // act
        districtMappingPage.showDistrict = true;

        // assert
        expect(districtMappingPage.districtSelect.open).toHaveBeenCalled();
    });
});
