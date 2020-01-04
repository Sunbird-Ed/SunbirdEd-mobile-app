import { DistrictMappingPage } from '../district-mapping/district-mapping.page';
import { AppGlobalService, AppHeaderService, CommonUtilService,
    FormAndFrameworkUtilService, TelemetryGeneratorService } from '../../services';
import { DeviceRegisterService } from '../../../../sunbird-mobile-sdk/src/device-register';
import { DeviceInfo } from '../../../../sunbird-mobile-sdk/src/util/device';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Events, Platform } from '@ionic/angular';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';
import { SharedPreferences } from '../../../../sunbird-mobile-sdk/src/util/shared-preferences';
import { EMPTY, of } from 'rxjs';
import { LocationSearchResult } from '../../../../sunbird-mobile-sdk/src/profile/def/location-search-result';
import { ProfileService } from 'sunbird-sdk';

describe('DistrictMappingPage', () => {
    let districtMappingPage: DistrictMappingPage;
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const presentFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
    };
    const mockProfileService: Partial<ProfileService> = {
        searchLocation: jest.fn(() => of([]))
    };
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockRouter: Partial<Router> = {};
    const mockLocation: Partial<Location> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockEvents: Partial<Events> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockNgZone: Partial<NgZone> = {
        run : jest.fn((fn) => fn())

    };
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
            mockProfileService as ProfileService,
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
        districtMappingPage.stateSelect = { open: jest.fn(() => { }) };

        // act
        districtMappingPage.showStates = true;

        // assert
        expect(districtMappingPage.stateSelect.open).toHaveBeenCalled();
    });

    it('should open select overlay when showDistrict is set', () => {
        // arrange
        districtMappingPage.districtSelect = { open: jest.fn(() => { }) };

        // act
        districtMappingPage.showDistrict = true;

        // assert
        expect(districtMappingPage.districtSelect.open).toHaveBeenCalled();
    });

    it('should populate the state name when getStates() is invoked ', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = [{ code: '2', name: 'Odisha', id: '12345', type: 'state'}];
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        districtMappingPage.availableLocationState = 'Odisha';
        districtMappingPage.availableLocationDistrict = 'Odisha';
        districtMappingPage.isAutoPopulated = true;
        // act
        districtMappingPage.getStates();

        // assert
        setTimeout(() => {
            expect(districtMappingPage.stateList).toBeDefined();
            expect(districtMappingPage.stateName).toBeDefined();
         }, 0);

    });

    it('shouldn\'t populate district when state value is not available  ', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = [];
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        // act
        districtMappingPage.getStates();

        // assert
        setTimeout(() => {
            expect(districtMappingPage.districtList).toEqual([]);
            expect(districtMappingPage.showDistrict).toBeFalsy();
         }, 0);

    });

    it('should generate IMPRESSION telemetry when ionViewWillEnter', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        jest.spyOn(districtMappingPage, 'handleDeviceBackButton').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationMandatory').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationAvailability').mockImplementation();
        jest.spyOn(districtMappingPage, 'getStates').mockImplementation();

        // act
        districtMappingPage.ionViewWillEnter();

        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
    });

    it('should return true if isShowBackButton is not set ', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');

        // act
        // assert
        expect(districtMappingPage.isShowBackButton).toBeTruthy();
    });

    it('should return the value set in isShowBackButton ', () => {
        // arrange
        window.history.replaceState({ isShowBackButton: false }, 'MOCK');

        // act
        // assert
        expect(districtMappingPage.isShowBackButton).toBeFalsy();
    });

    it('should return valid profile if its set in the state', () => {
        // arrange
        window.history.replaceState({ profile: { uid: '12345' } }, 'MOCK');

        // act
        // assert
        expect(districtMappingPage.profile).toBeDefined();
    });

    it('should open district overlay when _showDistrict value is set', () => {
        // arrange
        districtMappingPage.showStates = false;
        districtMappingPage.districtSelect = { open: jest.fn(() => { }) };
        // act
        districtMappingPage.showDistrict = true;

        // assert
        expect(districtMappingPage.showStates).toBeFalsy();
        expect(districtMappingPage.showDistrict).toBeTruthy();
        expect(districtMappingPage.districtSelect.open).toHaveBeenCalled();
    });

});
