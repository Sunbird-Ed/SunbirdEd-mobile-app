import {SunbirdQRScanner} from './sunbirdqrscanner.service';
import {TranslateService} from '@ngx-translate/core';
import {Platform, PopoverController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {CommonUtilService} from './common-util.service';
import {AndroidPermissionsService} from './android-permissions/android-permissions.service';
import {ContainerService} from './container.services';
import {AppGlobalService} from './app-global-service.service';
import {TelemetryGeneratorService} from './telemetry-generator.service';
import {QRScannerResultHandler} from './qrscanresulthandler.service';
import {of} from 'rxjs';
import {
    CorReleationDataType,
    Environment,
    ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType, Mode,
    PageId
} from './telemetry-constants';
import {AndroidPermission, PermissionAskedEnum} from '@app/services/android-permissions/android-permission';
import {Profile, ProfileType} from 'sunbird-sdk';

describe('SunbirdQRScanner', () => {
    let sunbirdQRScanner: SunbirdQRScanner;

    const mockTranslateService: Partial<TranslateService> = {
        get: jest.fn(() => of('sample_translation')),
        instant: jest.fn(() => 'sample_translation'),
    };
    mockTranslateService.onLangChange = {
        subscribe: jest.fn((fn) => {
            return fn({});
        })
    } as any;
    const mockPlatform: Partial<Platform> = {};
    const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockContainerService: Partial<ContainerService> = {};
    const mockAndroidPermissionsService: Partial<AndroidPermissionsService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockToastController: Partial<ToastController> = {};
    const mockPopoverController: Partial<PopoverController> = {};
    const mockRouter: Partial<Router> = {};

    beforeAll(() => {
        sunbirdQRScanner = new SunbirdQRScanner(
            mockTranslateService as TranslateService,
            mockPlatform as Platform,
            mockQRScannerResultHandler as QRScannerResultHandler,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockContainerService as ContainerService,
            mockAndroidPermissionsService as AndroidPermissionsService,
            mockCommonUtilService as CommonUtilService,
            mockAppVersion as AppVersion,
            mockToastController as ToastController,
            mockPopoverController as PopoverController,
            mockRouter as Router,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create an instance of SunbirdQRScanner', () => {
        expect(sunbirdQRScanner).toBeTruthy();
    });

    describe('startScanner test cases', () => {

        it('should check for permission if hasPermission if false then show popover for permission will be called', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppGlobalService.setIsPermissionAsked = jest.fn(() => true);
            mockAndroidPermissionsService.requestPermissions = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sunbirdQRScanner.startScanner(PageId.COURSES, true);
            // assert
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.SCAN, Environment.HOME);
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.QRCodeScanInitiate, 'courses', Environment.HOME);
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toHaveBeenCalledWith(
                PageId.QRCodeScanner, {id: '', type: 'qr', version: undefined});
            setTimeout(() => {
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalledWith(AndroidPermission.CAMERA);
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED, Environment.HOME, PageId.PERMISSION_POPUP);
                expect(mockAppGlobalService.setIsPermissionAsked).toHaveBeenCalledWith(PermissionAskedEnum.isCameraAsked, true);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DENY_CLICKED, Environment.HOME, PageId.APP_PERMISSION_POPUP);
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'CAMERA_PERMISSION_DESCRIPTION', 'sunbird', PageId.QRCodeScanner, true);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should check for permission and if not then call for popup and then click allow ', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            const permissionStatusStack = [{hasPermission: true}, {hasPermission: false, isPermissionAlwaysDenied: false}];
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve(permissionStatusStack.pop()));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppGlobalService.setIsPermissionAsked = jest.fn(() => true);
            mockAndroidPermissionsService.requestPermissions = jest.fn(() => of({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('some_data');
            });
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve('some_data'));
            mockQRScannerResultHandler.handleDialCode = jest.fn();
            jest.spyOn(sunbirdQRScanner, 'stopScanner').mockImplementation();
            // act
            sunbirdQRScanner.startScanner(PageId.ONBOARDING_PROFILE_PREFERENCES, true);
            // assert
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.SCAN, Environment.ONBOARDING);
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.QRCodeScanInitiate, PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING);
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toHaveBeenCalledWith(
                PageId.QRCodeScanner, {id: '', type: 'qr', version: undefined});
            setTimeout(() => {
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalledWith(AndroidPermission.CAMERA);
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED, Environment.ONBOARDING, PageId.PERMISSION_POPUP);
                expect(mockAppGlobalService.setIsPermissionAsked).toHaveBeenCalledWith(PermissionAskedEnum.isCameraAsked, true);
                expect(mockAndroidPermissionsService.requestPermissions).toHaveBeenCalledWith([AndroidPermission.CAMERA]);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.ONBOARDING,
                    PageId.APP_PERMISSION_POPUP);
                expect(global.qrScanner.startScanner).toHaveBeenCalled();
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith('some_data');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(3,
                    InteractType.QR_CAPTURED,
                    '', Environment.ONBOARDING, PageId.SCAN,
                    undefined,
                    undefined,
                    undefined,
                    [{id: 'some_data', type: CorReleationDataType.QR}]
                );
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.QR_REQUEST, '',
                    PageId.SCAN, Environment.ONBOARDING, '', '', '',
                    undefined,
                    [{id: 'some_data', type: CorReleationDataType.QR}]
                );
                done();
            }, 0);
        });

        it('should check for permission and popover comes and user clicks on not now', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            const permissionStatusStack = [{hasPermission: true}, {hasPermission: false, isPermissionAlwaysDenied: false}];
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve(permissionStatusStack.pop()));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sunbirdQRScanner.startScanner('courses', false);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.NOT_NOW_CLICKED,
                    Environment.HOME,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'CAMERA_PERMISSION_DESCRIPTION', 'sunbird', PageId.QRCodeScanner, true);
                done();
            }, 0);
        });

        it('should show settings toast if isPermissionAlwaysDenied always sets true', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            const permissionStatusStack = {hasPermission: false, isPermissionAlwaysDenied: true};
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve(permissionStatusStack));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sunbirdQRScanner.startScanner('profile-settings', true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith
                ('CAMERA_PERMISSION_DESCRIPTION', 'sunbird', PageId.QRCodeScanner, false);
                done();
            }, 0);
        });
    });

    describe('showInvalidCodeAlert', () => {
        it('should show Invalid Code Alert', () => {
            // arrange
            const scannedData = 'sample-scan-data';
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            sunbirdQRScanner.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.afterOnBoardQRErrorAlert = jest.fn(() => Promise.resolve());
            // act
            sunbirdQRScanner.showInvalidCodeAlert(scannedData);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.QR_CODE_INVALID,
                    Environment.ONBOARDING,
                    undefined
                );
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    InteractSubtype.QR_CODE_INVALID, '',
                    sunbirdQRScanner.source,
                    Environment.HOME,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined
                );
            }, 0);
        });
    });
});
