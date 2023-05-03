import {SunbirdQRScanner} from './sunbirdqrscanner.service';
import {TranslateService} from '@ngx-translate/core';
import {ModalController, Platform, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AppVersion} from '@awesome-cordova-plugins/app-version/ngx';
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
import {AndroidPermission, PermissionAskedEnum} from '../services/android-permissions/android-permission';
import {Profile, ProfileType} from '@project-sunbird/sunbird-sdk';

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
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        setNativePopupVisible: jest.fn()
    };
    const mockContainerService: Partial<ContainerService> = {};
    const mockAndroidPermissionsService: Partial<AndroidPermissionsService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockModalCtrl: Partial<ModalController> = {};
    const mockRouter: Partial<Router> = {};

    const instantiateSunbirdQrScannerService = () => {
        mockTranslateService.onLangChange = {
            subscribe: jest.fn((fn) => {
                return fn({});
            })
        } as any;
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockTranslateService.get = jest.fn(() => of('sample_translation'));
        mockTranslateService.instant = jest.fn(() => 'sample_translation');
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
            mockRouter as Router,
            mockModalCtrl as ModalController
        );
    };
    beforeAll(() => {
        instantiateSunbirdQrScannerService();
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

    describe('skip qr code test cases', () => {

        beforeEach(() => {
            instantiateSunbirdQrScannerService();
        });

        it('should start qrScanner and get Scanned results equals skip', (done) => {
            // arrange
            const profile: Profile = {
                uid: '1234',
                handle: 'sample_name',
                profileType: ProfileType.TEACHER,
            };
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('skip');
            });
            mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            jest.spyOn(sunbirdQRScanner, 'stopScanner').mockImplementation();
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            mockContainerService.removeAllTabs = jest.fn();
            mockContainerService.addTab = jest.fn();
            // act
            sunbirdQRScanner.startScanner(PageId.PROFILE_SETTINGS, true);
            // assert
            setTimeout(() => {
                expect(global.qrScanner.startScanner).toHaveBeenCalled();
               // expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
               // expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs'], {state: {loginMode: 'guest'}});
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.NO_QR_CODE_CLICKED,
                    Environment.ONBOARDING,
                    PageId.QRCodeScanner);
                expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                    'qr',
                    Mode.PLAY,
                    PageId.QRCodeScanner,
                    Environment.HOME,
                    {id: '', type: 'qr', version: undefined}
                );
                done();
            }, 0);
        });

        it('should create student tabs if current profileType is student after clicking skip', (done) => {
            // arrange
            const profile: Profile = {
                uid: '1234',
                handle: 'sample_name',
                profileType: ProfileType.STUDENT,
            };
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('skip');
            });
            mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            jest.spyOn(global.qrScanner, 'stopScanner').mockImplementation();
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            mockContainerService.removeAllTabs = jest.fn();
            mockContainerService.addTab = jest.fn();
            // act
            sunbirdQRScanner.startScanner(undefined, true);
            setTimeout(() => {
                expect(global.qrScanner.startScanner).toHaveBeenCalled();
                // expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                // expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs'], {state: {loginMode: 'guest'}});
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.NO_QR_CODE_CLICKED,
                    Environment.ONBOARDING,
                    PageId.QRCodeScanner);
                done();
            }, 0);
        });

        it('should call stop scanner when display category page returns true', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('skip');
            });
            jest.spyOn(sunbirdQRScanner, 'stopScanner').mockImplementation();
            // act
            sunbirdQRScanner.startScanner('profile', true);
            // assert
            setTimeout(() => {
                expect(sunbirdQRScanner.stopScanner).toHaveBeenCalled();
                done();
            }, 0);
        });

    });


    describe('cancel telemetry test cases', () => {
        beforeEach(() => {
            instantiateSunbirdQrScannerService();
        });
        it('should check for scanned Data if it is cancel navback then generate telemetry', (done) => {


            mockPlatform.pause = of(1, 2) as any;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));

            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('cancel_nav_back');
            });
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve('cancel_nav_back'));
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            // act
            sunbirdQRScanner.startScanner(PageId.COURSES, false).then(() => {
                expect(global.qrScanner.startScanner).toHaveBeenCalled();
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith('cancel_nav_back');
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.SCAN,
                    Environment.HOME,
                    true
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.QRCodeScanCancelled,
                    Environment.HOME,
                    PageId.QRCodeScanner
                );
                expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                    'qr',
                    Mode.PLAY,
                    PageId.QRCodeScanner,
                    Environment.HOME,
                    {id: '', type: 'qr', version: undefined}
                );
                done();
            });
        });

        it('should check for scanned Data if it is cancel hwback then generate telemetry', (done) => {

            mockPlatform.pause = of(1, 2) as any;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));

            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('cancel_hw_back');
            });
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve('cancel_hw_back'));
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            // act
            sunbirdQRScanner.startScanner(undefined, false).then(() => {
                expect(global.qrScanner.startScanner).toHaveBeenCalled();
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith('cancel_hw_back');
                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.HOME,
                    PageId.SCAN
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.QRCodeScanCancelled,
                    Environment.HOME,
                    PageId.QRCodeScanner
                );
                done();
            });
        });
    });

    describe('scanned data conditions result handler', () => {
        beforeEach(() => {
            instantiateSunbirdQrScannerService();
        });
        it('should check if it has contentId then call handleContentId()', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('sample_content_id');
            });
            mockQRScannerResultHandler.parseDialCode = jest.fn();
            mockQRScannerResultHandler.isContentId = jest.fn(() => true);
            mockQRScannerResultHandler.handleContentId = jest.fn();
            // act
            sunbirdQRScanner.startScanner('resources', false);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.isContentId).toHaveBeenCalledWith('sample_content_id');
                expect(mockQRScannerResultHandler.handleContentId).toHaveBeenCalledWith('resources', 'sample_content_id');
                done();
            }, 0);
        });

        it('should check scanned data has certificate linked to it', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('/certs/sample_content_id');
            });
            mockQRScannerResultHandler.isContentId = jest.fn();
            mockQRScannerResultHandler.parseDialCode = jest.fn();
            mockQRScannerResultHandler.handleCertsQR = jest.fn();
            // act
            sunbirdQRScanner.startScanner('courses', false);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.handleCertsQR).toHaveBeenCalledWith('courses', '/certs/sample_content_id');
                done();
            }, 0);
        });

        it('should check if it has invalid QRCODE()', (done) => {
            // arrange
            mockPlatform.pause = of(1, 2) as any;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() =>
                Promise.resolve({hasPermission: true}));
            jest.spyOn(global.qrScanner, 'startScanner').mockImplementation((_, __, ___, ____, _____, ______, cb) => {
                cb('invalid');
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockQRScannerResultHandler.isContentId = jest.fn();
            mockQRScannerResultHandler.parseDialCode = jest.fn();
            mockQRScannerResultHandler.handleInvalidQRCode = jest.fn();
            mockCommonUtilService.afterOnBoardQRErrorAlert = jest.fn();
            // act
            sunbirdQRScanner.startScanner('resources', false);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.handleInvalidQRCode).toHaveBeenCalledWith('resources', 'invalid');
                expect(mockCommonUtilService.afterOnBoardQRErrorAlert)
                    .toHaveBeenCalledWith('INVALID_QR', 'UNKNOWN_QR', 'resources', 'invalid');
                done();
            }, 0);
        });
    });
});