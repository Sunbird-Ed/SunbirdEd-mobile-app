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
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())

    };
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
        showExternalIdVerificationPopup: jest.fn()
    };

    beforeAll(() => {
        mockRouter.getCurrentNavigation = jest.fn(() => {
            return {
                extras: { state: {}}
            };
        }) as any;
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

    it('should open select overlay when showStates is set', (done) => {
        // arrange
        districtMappingPage.stateSelect = { open: jest.fn(() => { }) };

        // act
        districtMappingPage.showStates = true;

        // assert
        setTimeout(() => {
            expect(districtMappingPage.stateSelect.open).toHaveBeenCalledTimes(1);
            done();
        }, 510);
    });

    it('should open select overlay when showDistrict is set', (done) => {
        // arrange
        districtMappingPage.districtSelect = { open: jest.fn(() => { }) };

        // act
        districtMappingPage.showDistrict = true;

        // assert
        setTimeout(() => {
            expect(districtMappingPage.districtSelect.open).toHaveBeenCalledTimes(1);
            done();
        }, 510);
    });

    it('should populate the state name when getStates() is invoked ', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = [{ code: '2', name: 'Odisha', id: '12345', type: 'state' }];
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        districtMappingPage.availableLocationState = 'Odisha';
        districtMappingPage.availableLocationDistrict = 'Odisha';
        districtMappingPage.isAutoPopulated = true;
        jest.spyOn(districtMappingPage, 'generateTelemetryForCategorySelect').mockImplementation(() => {
            return;
        });
        // act
        districtMappingPage.getStates();

        // assert
        setTimeout(() => {
            expect(districtMappingPage.stateList).toBeDefined();
            expect(districtMappingPage.stateName).toBeDefined();
        }, 0);

    });

    it('should generate TELEMETRY when device back clicked', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        window.history.replaceState({ source: 'guest-profile', isShowBackButton: true }, 'MOCK');
        mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
        // act
        districtMappingPage.handleDeviceBackButton();
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.DISTRICT_MAPPING, Environment.USER, false);
        expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
            true, 'user', 'location'
        );
    });

    it('should unsubscribe backButtonFunc in ionViewWillLeave', () => {
        // arrange
        districtMappingPage.backButtonFunc = {
            unsubscribe: jest.fn(),

        } as any;
        // act
        districtMappingPage.ionViewWillLeave();
        // assert
        expect(districtMappingPage.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('shouldn\'t populate district when state value is not available  ', (done) => {
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
            expect(districtMappingPage.showDistrict).toBeTruthy();
            done();
        }, 1);

    });

    it('shouldn\'t populate district when state value is not available  ', (done) => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = [{ code: '2', name: 'Karnataka', id: '12345', type: 'state' }];
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        districtMappingPage.availableLocationDistrict = 'Cuttack';
        // act
        districtMappingPage.getDistrict('');

        // assert
        setTimeout(() => {
            expect(districtMappingPage.districtName).toEqual('');
            done();
        }, 1);

    });

    it('should show districtList if availableLocationDistrict is not available ', (done) => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = [{ code: '2', name: 'Odisha', id: '12345', type: 'state' }];
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        districtMappingPage.availableLocationDistrict = undefined;
        // act
        districtMappingPage.getDistrict('');

        // assert
        setTimeout(() => {
            expect(districtMappingPage.showDistrict).toBeTruthy();
            done();
        }, 1);

    });

    it('should show  NODATA toast if district list is not available', (done) => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        const locationSearchResult: LocationSearchResult[] = undefined;
        jest.spyOn(mockProfileService, 'searchLocation').mockReturnValue(of(locationSearchResult));
        districtMappingPage.availableLocationDistrict = undefined;
        // act
        districtMappingPage.getDistrict('');

        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_DATA_FOUND');
            expect(districtMappingPage.districtList).toEqual([]);
            expect(districtMappingPage.showDistrict).toBeFalsy();
            done();
        }, 1);

    });

    it('should show NO NETWORK Toast if network is not available on click of submit', () => {
        // arrange
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };

        // act
        districtMappingPage.submit();
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
    });

    it('should invoke device register API and save it in the preference', (done) => {
        // arrange
        districtMappingPage.stateList = [{ type: 'state', name: 'Odisha', id: 'od_123' }];
        districtMappingPage.districtList = [{ type: 'district', name: 'Cuttack', id: 'ct_123' }];
        districtMappingPage.stateName = 'Odisha';
        districtMappingPage.districtName = 'Cuttack';
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        const req = {
            userDeclaredLocation: {
                state: 'Odisha',
                stateId: 'od_123',
                district: 'Cuttack',
                districtId: 'ct_123',
                declaredOffline: false
            }
        };
        mockCommonUtilService.handleToTopicBasedNotification = jest.fn();

        // act
        districtMappingPage.saveDeviceLocation();
        // assert
        setTimeout(() => {
            expect(mockDeviceRegisterService.registerDevice).toHaveBeenCalledWith(req);
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.DEVICE_LOCATION, JSON.stringify(req.userDeclaredLocation));
            expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
            expect(mockCommonUtilService.getLoader().dismiss).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should invoke updateServerProfile when submit clicked', (done) => {
        // arrange
        window.history.replaceState({ profile }, 'MOCK');
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        districtMappingPage.name = 'sample_name';
        mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
        jest.spyOn(districtMappingPage, 'saveDeviceLocation').mockImplementation();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: jest.fn(),
            dismiss: jest.fn()
        }));
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(mockProfileService.updateServerProfile).toHaveBeenCalledTimes(1);
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_SUCCESS');
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            expect(mockEvents.publish).toHaveBeenCalledWith('loggedInProfile:update',
                { firstName: 'samplename', lastName: '', locationCodes: ['2', '2'], userId: '12345' });
            expect(mockLocation.back).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.SELECT_SUBMIT, '',
                'onboarding',
                PageId.LOCATION,
                undefined,
                undefined,
                undefined,
                [{ id: 'Odisha', type: 'State' }, { id: 'Cuttack', type: 'District' }]
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                InteractType.LOCATION_CHANGED,
                'dist-changed',
                'onboarding',
                PageId.DISTRICT_MAPPING,
                undefined, { isPopulatedLocation: true }, undefined,
                [{ id: 'user:location_capture', type: 'Feature' }, { id: 'SB-14682', type: 'Task' }], 'submit-clicked'
            );
            done();
        }, 1);
    });

    it('should go 2 pages back  when submit clicked and profile is not available', (done) => {
        // arrange
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        districtMappingPage.name = 'sample_name';
        mockAppGlobalService.isJoinTraningOnboardingFlow = true;
        jest.spyOn(window.history, 'go');
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(mockProfileService.updateServerProfile).toHaveBeenCalledTimes(1);
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_SUCCESS');
            expect(window.history.go).toHaveBeenCalledWith(-2);
            done();
        }, 1);
    });

    it('should navigate to TAB page  when submit clicked and profile is not available', (done) => {
        // arrange
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        districtMappingPage.name = 'sample_name';
        mockAppGlobalService.isJoinTraningOnboardingFlow = false;
        jest.spyOn(window.history, 'go');
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(mockProfileService.updateServerProfile).toHaveBeenCalledTimes(1);
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_SUCCESS');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs']);
            done();
        }, 1);
    });

    it('should naviigate to TABS page if API fails and profile is not available ', (done) => {
        // arrange
        mockProfileService.updateServerProfile = jest.fn(() => throwError(''));
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        districtMappingPage.name = 'sample_name';
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_FAILED');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs']);
            expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should go back if API fails and profile  available ', (done) => {
        // arrange
        window.history.replaceState({ profile }, 'MOCK');
        mockProfileService.updateServerProfile = jest.fn(() => throwError(''));
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        districtMappingPage.name = 'sample_name';
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_FAILED');
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should save location if user is trying to edit the location', (done) => {
        // arrange
        window.history.replaceState({ source: 'guest-profile' }, 'MOCK');
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        jest.spyOn(districtMappingPage, 'saveDeviceLocation').mockImplementation();
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(districtMappingPage.saveDeviceLocation).toHaveBeenCalled();
            expect(mockLocation.back).toHaveBeenCalled();
            expect(mockEvents.publish).toHaveBeenCalledWith('refresh:profile');
            done();
        }, 1);
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();

    });

    it('should save location in case of normal usecase', (done) => {
        // arrange
        window.history.replaceState({ source: 'profile-setting' }, 'MOCK');
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
        jest.spyOn(districtMappingPage, 'saveDeviceLocation').mockImplementation();
        mockAppGlobalService.setOnBoardingCompleted = jest.fn();
        mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
        // act
        districtMappingPage.submit();
        // assert
        setTimeout(() => {
            expect(districtMappingPage.saveDeviceLocation).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockAppGlobalService.setOnBoardingCompleted).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs'], {
                state: {
                    loginMode: 'guest'
                }
            });
            expect(mockTelemetryGeneratorService.generateAuditTelemetry).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should populate availableLocationState and availableLocationDistrict', () => {
        // arrange
        profile['userLocations'] = [{ type: 'state', name: 'Odisha' }, { type: 'district', name: 'Cuttack' }];
        window.history.replaceState({ profile }, 'MOCK');
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        // act
        districtMappingPage.checkLocationAvailability();
        // assert
        expect(districtMappingPage.availableLocationState).toEqual('Odisha');
        expect(districtMappingPage.availableLocationDistrict).toEqual('Cuttack');
        districtMappingPage.availableLocationDistrict = '';
        districtMappingPage.availableLocationState = '';

    });

    it('should populate availableLocationState and availableLocationDistrict if device location is already avaiable', () => {
        // arrange
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
        mockPreferences.getString = jest.fn(() => of('{\"state\":\"Odisha\",\"district\":\"Cuttack\"}'));
        // act
        districtMappingPage.checkLocationAvailability();
        // assert
        expect(districtMappingPage.availableLocationState).toEqual('');
        expect(districtMappingPage.availableLocationDistrict).toEqual('');
        districtMappingPage.availableLocationDistrict = '';
        districtMappingPage.availableLocationState = '';

    });

    it('should populate availableLocationState and availableLocationDistrict if IP location is already avaiable', () => {
        // arrange
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
        mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(true));
        mockPreferences.getString = jest.fn(() => of('{\"state\":\"Odisha\",\"district\":\"Cuttack\"}'));
        // act
        districtMappingPage.checkLocationAvailability();
        // assert
        expect(districtMappingPage.availableLocationState).toEqual('Odisha');
        expect(districtMappingPage.availableLocationDistrict).toEqual('Cuttack');
        districtMappingPage.availableLocationState = '';
        districtMappingPage.availableLocationDistrict = '';

    });

    it('should populate availableLocationState and availableLocationDistrict if state info is not available', () => {
        // arrange
        profile['userLocations'] = [{ type: 'district', name: 'Cuttack' }, { type: 'block', name: 'CMC' }];
        window.history.replaceState({ profile }, 'MOCK');
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
        mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
        // act
        districtMappingPage.checkLocationAvailability();
        // assert
        expect(districtMappingPage.availableLocationState).toEqual('Odisha');
        expect(districtMappingPage.availableLocationDistrict).toEqual('Cuttack');
        districtMappingPage.availableLocationDistrict = '';

    });

    it('shouldn\'t show  NOTNOW flag', () => {
        // arrange
        const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip', values: [] }];
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        // act
        districtMappingPage.checkLocationMandatory();
        // assert
        expect(districtMappingPage.showNotNowFlag).toBeFalsy();

    });

    it('should show  NOTNOW flag if profile is undefined', (done) => {
        // arrange
        const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip', values: ['user'] }];
        window.history.replaceState({ profile: undefined }, 'MOCK');
        mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        // act
        districtMappingPage.checkLocationMandatory();
        // assert
        setTimeout(() => {
            expect(districtMappingPage.showNotNowFlag).toBeTruthy();
            done();
        }, 1);

    });

    it('should show  NOTNOW flag if source is not guest profile', () => {
        // arrange
        const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip', values: ['device'] }];
        window.history.replaceState({ profile, source: 'profile-settings' }, 'MOCK');
        mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        // act
        districtMappingPage.checkLocationMandatory();
        // assert
        expect(districtMappingPage.showNotNowFlag).toBeTruthy();

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

    it('should open district overlay when _showDistrict value is set', (done) => {
        // arrange
        districtMappingPage.showStates = false;
        districtMappingPage.districtSelect = { open: jest.fn(() => { }) };
        // act
        districtMappingPage.showDistrict = true;

        // assert
        setTimeout(() => {
            expect(districtMappingPage.showDistrict).toBeTruthy();
            expect(districtMappingPage.districtSelect.open).toHaveBeenCalled();
            done();
        }, 1000);

    });

    it('should generate IMPRESSION telemetry when ionViewWillEnter without any cdata', (done) => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        jest.spyOn(districtMappingPage, 'handleDeviceBackButton').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationMandatory').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationAvailability').mockImplementation();
        jest.spyOn(districtMappingPage, 'getStates').mockImplementation();
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockHeaderService.hideHeader = jest.fn();
        jest.spyOn(districtMappingPage, 'checkLocationAvailability').mockImplementation(() => {
            return Promise.resolve();
        });
        jest.spyOn(districtMappingPage, 'getStates').mockImplementation(() => {
            return Promise.resolve();
        });
        districtMappingPage.stateName = '';
        districtMappingPage.districtName = 'bangalore';
        mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
        // act
        districtMappingPage.ionViewWillEnter();

        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            'view', '', 'district-mapping', 'onboarding', '', '', '', undefined,
            [{ id: 'user:location_capture', type: 'Feature' }, { id: 'SB-14682', type: 'Task' }]
        );
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(PageId.LOCATION,
                'onboarding',
                undefined,
                undefined,
                undefined,
                undefined,
                []);
            done();
        });
    });

    it('should generate IMPRESSION telemetry when ionViewWillEnter', () => {
        // arrange
        window.history.replaceState({ source: 'profile-settings' }, 'MOCK');
        jest.spyOn(districtMappingPage, 'handleDeviceBackButton').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationMandatory').mockImplementation();
        jest.spyOn(districtMappingPage, 'checkLocationAvailability').mockImplementation();
        jest.spyOn(districtMappingPage, 'getStates').mockImplementation();
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockHeaderService.hideHeader = jest.fn();
        jest.spyOn(districtMappingPage, 'checkLocationAvailability').mockImplementation(() => {
            return Promise.resolve();
        });
        jest.spyOn(districtMappingPage, 'getStates').mockImplementation(() => {
            return Promise.resolve();
        });
        districtMappingPage.stateName = 'karnataka';
        districtMappingPage.districtName = 'bangalore';
        mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
        // act
        districtMappingPage.ionViewWillEnter();

        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            'view', '', 'district-mapping', 'onboarding', '', '', '', undefined,
            [{ id: 'user:location_capture', type: 'Feature' }, { id: 'SB-14682', type: 'Task' }]
        );
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        // expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith('')
    });


    it('should populate the stateName and reset the districtName', () => {
        // arrange
        districtMappingPage.isAutoPopulated = true;
        districtMappingPage.isPopulatedLocationChanged = true;
        // act
        districtMappingPage.selectState('Odisha', '1234', 'code_1234');

        // assert
        expect(districtMappingPage.stateName).toEqual('Odisha');
        expect(districtMappingPage.stateCode).toEqual('code_1234');
        expect(districtMappingPage.districtName).toEqual('');
        expect(districtMappingPage.districtCode).toEqual('');
        expect(districtMappingPage.isPopulatedLocationChanged).toBeTruthy();
        expect(districtMappingPage.availableLocationDistrict).toEqual('');

        // act
        districtMappingPage.stateIconClicked();
        // assert
        expect(districtMappingPage.stateName).toEqual('');

        // act
        districtMappingPage.districtIconClicked();
        // assert
        expect(districtMappingPage.districtName).toEqual('');
        expect(districtMappingPage.districtCode).toEqual('');

        // act
        districtMappingPage.resetDistrictCode();
        // assert
        expect(districtMappingPage.districtCode).toEqual('');
    });

    it('should validate isValid method', () => {

        // assert
        expect(districtMappingPage.isValid('sample', [{ name: 'sample' }], 'name')).toBeTruthy();
        expect(districtMappingPage.isValid('sample', undefined, 'name')).toBeFalsy();
    });

    it('should naviagte to TABS page', () => {

        // act
        districtMappingPage.skipLocation();
        // assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs']);
    });

    it('should return proper INTERACT subtype', () => {

        // arrange
        districtMappingPage.availableLocationState = 'Odisha';
        districtMappingPage.stateName = 'Karnataka';
        districtMappingPage.availableLocationDistrict = 'Cuttack';
        districtMappingPage.districtName = 'Cuttack';

        // act
        // assert
        expect(districtMappingPage.isStateorDistrictChanged()).toEqual(InteractSubtype.STATE_CHANGED);

        // arrange
        districtMappingPage.availableLocationState = 'Odisha';
        districtMappingPage.stateName = 'Odisha';
        districtMappingPage.availableLocationDistrict = 'Cuttack';
        districtMappingPage.districtName = 'Koppal';
        // act
        // assert
        expect(districtMappingPage.isStateorDistrictChanged()).toEqual(InteractSubtype.DIST_CHANGED);

        // arrange
        districtMappingPage.availableLocationState = 'Odisha';
        districtMappingPage.stateName = 'Karnataka';
        districtMappingPage.availableLocationDistrict = 'Cuttack';
        districtMappingPage.districtName = 'Koppal';
        // act
        // assert
        expect(districtMappingPage.isStateorDistrictChanged()).toEqual(InteractSubtype.STATE_DIST_CHANGED);

        // arrange
        districtMappingPage.name = 'sample_name';
        // act
        // assert
        expect(districtMappingPage.validateName()).toBeFalsy();
        districtMappingPage.availableLocationDistrict = '';
        districtMappingPage.availableLocationState = '';
    });

    it('should goBack from device or UI', () => {
        mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
        jest.spyOn(districtMappingPage, 'getEnvironment').mockImplementation(() => {
            return 'onboarding';
        });
        mockLocation.back = jest.fn();
        // act
        districtMappingPage.goBack(false);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
            true,
            'onboarding',
            PageId.LOCATION
        );
    });

    it('should generate telemetry for cancel event', () => {
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        districtMappingPage.cancelEvent();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CANCEL, '',
            'onboarding',
            PageId.LOCATION,
            undefined, undefined, undefined, [{ id: 'popup-category', type: 'ChildUi' }]
        );
    });

    it('should generate telemetry for on state CategoryCliked', () => {
        districtMappingPage.stateList = ['AP', 'rajasthan'];
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        districtMappingPage.onCategoryCliked('state');
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CATEGORY, '',
            'onboarding',
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            [{ id: '2', type: 'State' }]
        );
    });

    it('should generate telemetry for on district CategoryCliked', () => {
        districtMappingPage.districtList = ['dist-1', 'dist-2'];
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        districtMappingPage.onCategoryCliked('district');
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_CATEGORY, '',
            'onboarding',
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            [{ id: '2', type: 'District' }]
        );
    });

    describe('showStates', () => {
        it('should update the showStates variable', () => {
            // arrange
            // act
            // assert
            expect(districtMappingPage.showStates).toBeFalsy();
        });
    });


    describe('stateName', () => {
        it('should not select the stateSelect value ', () => {
            // arrange
            // act
            districtMappingPage.stateName = '';
            districtMappingPage.stateSelect = undefined;
            // assert
            expect(districtMappingPage.stateName).toBeFalsy();
        });
    });

    describe('districtName', () => {
        it('should not select the districtSelect value ', () => {
            // arrange
            // act
            districtMappingPage.districtName = '';
            districtMappingPage.districtSelect = undefined;
            // assert
            expect(districtMappingPage.districtName).toBeFalsy();
        });
    });

    describe('selectState', () => {
        it('should mark isPopulatedLocationChanged as false and availableLocationDistrict as empty  ', () => {
            // arrange
            districtMappingPage.isAutoPopulated = false;
            districtMappingPage.isPopulatedLocationChanged = false;
            // act
            districtMappingPage.selectState('', '', '');
            // assert
            expect(districtMappingPage.isPopulatedLocationChanged).toBeFalsy();
            expect(districtMappingPage.availableLocationDistrict).toBeFalsy();
        });
    });

    describe('selectState', () => {
        it('should mark isPopulatedLocationChanged as false', () => {
            // arrange
            districtMappingPage.isAutoPopulated = false;
            // act
            districtMappingPage.selectDistrict('', '');
            // assert
            expect(districtMappingPage.isPopulatedLocationChanged).toBeFalsy();
        });
    });

});

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
        navigate: jest.fn()
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
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())

    };
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
        showExternalIdVerificationPopup: jest.fn()
    };

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

    describe('checkLocationAvailability', () => {
        mockRouter.getCurrentNavigation = jest.fn(() => {
            return {
                extras: { state: {}}
            };
        }) as any;
        it('should populate availableLocationState and availableLocationDistrict to undefined if profile is empty', () => {
            // arrange
            window.history.replaceState({ profile: undefined }, 'MOCK');
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            mockCommonUtilService.isIpLocationAvailable = jest.fn(() => Promise.resolve(false));
            // act
            districtMappingPage.checkLocationAvailability();
            // assert
            expect(districtMappingPage.availableLocationState).toBeFalsy();
            expect(districtMappingPage.availableLocationDistrict).toBeFalsy();
        });

        it('should populate availableLocationState and availableLocationDistrict to undefined if userlocation is not available', () => {
            // arrange
            profile['lastName'] = 'sample_last_name';
            profile['userLocations'] = undefined;
            window.history.replaceState({ profile }, 'MOCK');
            // act
            districtMappingPage.checkLocationAvailability();
            // assert
            expect(districtMappingPage.availableLocationState).toBeFalsy();
            expect(districtMappingPage.availableLocationDistrict).toBeFalsy();
        });
    });

    describe('submit', () => {
        it('should not save loaction if location is already available', (done) => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: presentFn,
            }));
            window.history.replaceState({ profile: { uid: '123456789' } }, 'MOCK');
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: '' }));
            districtMappingPage.name = 'sample_name';
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            jest.spyOn(window.history, 'go');
            // act
            districtMappingPage.submit();
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateServerProfile).toHaveBeenCalledTimes(1);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PROFILE_UPDATE_SUCCESS');
                done();
            }, 1);
        });
    });

    describe('handleDeviceBackButton', () => {
        it('should not register for backbutton', () => {
            // arrange
            window.history.replaceState({ isShowBackButton: false }, 'MOCK');
            // act
            districtMappingPage.handleDeviceBackButton();
            // assert
            expect(mockPlatform.backButton).toBeFalsy();
        });
    });

    describe('ionViewWillLeave', () => {
        it('should not register for backbutton', () => {
            // arrange
            districtMappingPage.backButtonFunc = undefined;
            // act
            districtMappingPage.ionViewWillLeave();
            // assert
            expect(districtMappingPage.backButtonFunc).toBeFalsy();
        });
    });

    describe('validateName', () => {
        it('should not return anything', () => {
            // arrange
            districtMappingPage.name = undefined;
            // act
            districtMappingPage.validateName();
            // assert
            expect(districtMappingPage.name).toBeFalsy();
        });
    });

    describe('getStates', () => {

        it('should not populate stateName if search Location API throws error', () => {
            // arrange
            mockProfileService.searchLocation = jest.fn(() => throwError({}));
            districtMappingPage.availableLocationState = 'Karnataka';
            // act
            districtMappingPage.getStates();
            // assert
            expect(districtMappingPage.stateName).toBeFalsy();
        });

        it('should not populate stateName if availableLocationState is empty', () => {
            // arrange
            mockProfileService.searchLocation = jest.fn(() => of([{ code: '2', name: 'Odisha', id: '12345', type: 'state' }]));
            districtMappingPage.availableLocationState = '';
            // act
            districtMappingPage.getStates();
            // assert
            expect(districtMappingPage.stateName).toBeFalsy();
        });

        it('should not populate stateName if state name is not available in the location list', () => {
            // arrange
            mockProfileService.searchLocation = jest.fn(() => of([{ code: '2', name: 'Odisha', id: '12345', type: 'state' }]));
            districtMappingPage.availableLocationState = 'Karnataka';
            // act
            districtMappingPage.getStates();
            // assert
            expect(districtMappingPage.stateName).toBeFalsy();
        });
    });

    describe('getDistrict', () => {
        it('should not populate districtName if search Location API throws error', () => {
            // arrange
            mockProfileService.searchLocation = jest.fn(() => throwError({}));
            // act
            districtMappingPage.getDistrict('');
            // assert
            expect(districtMappingPage.districtName).toBeFalsy();
        });
    });

    describe('checkLocationMandatory', () => {
        it('should not mark showNotNowFlag as true if form response code is differerent', () => {
            // arrange
            const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip_new', values: [] }];
            mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
            // act
            districtMappingPage.checkLocationMandatory();
            // assert
            expect(districtMappingPage.showNotNowFlag).toBeFalsy();
        });

        it('should not mark showNotNowFlag as true if form response code is differerent', () => {
            // arrange
            const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip', values: ['not_user'] }];
            mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
            // act
            districtMappingPage.checkLocationMandatory();
            // assert
            expect(districtMappingPage.showNotNowFlag).toBeFalsy();
        });

        it('should notmark showNotNowFlag as true if form response code is differerent', () => {
            // arrange
            const locationConfigFormResponse = [{ name: 'Skip Location', code: 'skip', values: ['not_user'] }];
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockFormAndFrameworkUtilService.getLocationConfig = jest.fn(() => Promise.resolve(locationConfigFormResponse));
            // act
            districtMappingPage.checkLocationMandatory();
            // assert
            expect(districtMappingPage.showNotNowFlag).toBeFalsy();
        });
    });

    describe('generateAutoPopulatedTelemetry', () => {
        it('should generate INTERAT telemetry with type as not-visible', () => {
            // arrange
            districtMappingPage.isAutoPopulated = false;
            // act
            districtMappingPage.generateAutoPopulatedTelemetry();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.NOT_VISIBLE,
                '',
                'onboarding',
                PageId.DISTRICT_MAPPING,
                undefined,
                { isAutoPopulated: false },
                undefined,
                [{ id: 'user:location_capture', type: 'Feature' }, { id: 'SB-14682', type: 'Task' }],
                ID.IP_BASED_LOCATION_SUGGESTION);
        });
    });

    describe('generateTelemetryForCategorySelect', () => {
        it('should add state info in the cdata', () => {
            // arrange
            // act
            districtMappingPage.generateTelemetryForCategorySelect('Odisha', true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_SUBMIT, '',
            'onboarding',
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            [{ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI },
            { id: 'Odisha', type:  CorReleationDataType.STATE }]);
        });

        it('should add district info in the cdata', () => {
            // arrange
            // act
            districtMappingPage.generateTelemetryForCategorySelect('Cuttack', false);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_SUBMIT, '',
            'onboarding',
            PageId.LOCATION,
            undefined,
            undefined,
            undefined,
            [{ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI },
            { id: 'Cuttack', type:  CorReleationDataType.DISTRICT }]);
        });
    });
});
