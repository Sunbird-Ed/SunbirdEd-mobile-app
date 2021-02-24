import { DistrictMappingPage } from '../district-mapping/district-mapping.page';
import {
    AppGlobalService, AppHeaderService, CommonUtilService,
    FormAndFrameworkUtilService, TelemetryGeneratorService, InteractType, ID, CorReleationDataType
} from '../../services';
import { InteractSubtype, PageId, Environment } from '@app/services/telemetry-constants';
import { DeviceRegisterService } from '../../../../sunbird-mobile-sdk/src/device-register';
import { DeviceInfo } from '../../../../sunbird-mobile-sdk/src/util/device';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Events, Platform } from '@ionic/angular';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';
import { SharedPreferences } from '../../../../sunbird-mobile-sdk/src/util/shared-preferences';
import { EMPTY, of, throwError } from 'rxjs';
import { LocationSearchResult } from '../../../../sunbird-mobile-sdk/src/profile/def/location-search-result';
import { ProfileService, Profile, ProfileType, ProfileSource, DeviceRegisterResponse } from 'sunbird-sdk';
import { PreferenceKey } from '@app/app/app.constant';
import { FormLocationFactory } from '../../services/form-location-factory/form-location-factory';
import { LocationHandler } from '../../services/location-handler';

describe('DistrictMappingPage', () => {
    let districtMappingPage: DistrictMappingPage;
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const presentFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => ''),
        showToast: jest.fn(),
        isDeviceLocationAvailable: jest.fn(() => undefined)
    };
    const profile: Profile = {
        uid: '12345',
        handle: 'sample_profile',
        source: ProfileSource.SERVER,
        profileType: ProfileType.TEACHER
    };
    const mockProfileService: Partial<ProfileService> = {
        searchLocation: jest.fn(() => of([])),
        updateServerProfile: jest.fn(() => of(profile))
    };
    const mockPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of(undefined))
    };
    const mockDeviceRegisterService: Partial<DeviceRegisterService> = {
        registerDevice: jest.fn(() => of({} as DeviceRegisterResponse))
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {
        isKeyboardShown: jest.fn(() => of(true))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockRouter: Partial<Router> = {
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: true
            }
        })) as any
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => profile),
        closeSigninOnboardingLoader: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn()
    };
    const mockFormLocationFactory: Partial<FormLocationFactory> = {};
    const mockLocationHandler: Partial<LocationHandler> = {
    };
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
        showExternalIdVerificationPopup: jest.fn()
    };
    mockRouter.getCurrentNavigation = jest.fn(() => {
        return {
            extras: { state: {}}
        };
    }) as any;

    beforeAll(() => {
        districtMappingPage = new DistrictMappingPage(
            mockProfileService as ProfileService,
            mockPreferences as SharedPreferences,
            mockDeviceRegisterService as DeviceRegisterService,
            mockDeviceInfo as DeviceInfo,
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockRouter as Router,
            mockLocation as Location,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormLocationFactory as FormLocationFactory,
            mockLocationHandler as LocationHandler
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of DistrictMappingPage', () => {
        expect(districtMappingPage).toBeTruthy();
    });
});
