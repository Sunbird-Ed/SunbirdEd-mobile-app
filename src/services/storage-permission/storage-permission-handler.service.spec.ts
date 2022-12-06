import { of, throwError } from 'rxjs';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
    ContentService, StorageService, Content
} from 'sunbird-sdk';
import { CommonUtilService, TelemetryGeneratorService } from '../../services';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    InteractType, InteractSubtype,
    Environment, PageId
} from '../telemetry-constants';
import { AppGlobalService } from '../app-global-service.service';
import {StoragePermissionHandlerService} from './storage-permission-handler.service'
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { Platform } from '@ionic/angular';

describe('ContentShareHandlerService', () => {

    let storagePermissionHandlerService: StoragePermissionHandlerService;

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('app_name')),
        showToast: jest.fn(),
        translateMessage: jest.fn(),
        getGivenPermissionStatus: jest.fn(),
        showSettingsPageToast: jest.fn(),
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sample_app_name'))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockPermissionService: Partial<AndroidPermissionsService> = {
        requestPermission: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    beforeAll(() => {
        storagePermissionHandlerService = new StoragePermissionHandlerService(
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockPermissionService as AndroidPermissionsService,
            mockPlatform as Platform,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(storagePermissionHandlerService).toBeTruthy();
    });

    describe('checkForPermissions', () => {
        const PageName = 'some-page'
        it('should return true if platform is ios', () => {
            // arrange
            mockPlatform.is = jest.fn(platform => platform === 'ios');
            // act
            storagePermissionHandlerService.checkForPermissions(PageName).then((res) => {
                expect(res).toBe(true)
            })
        })
        it('should return true if permissions are already accepted', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}))
            // act
            storagePermissionHandlerService.checkForPermissions(PageName).then((res) => {
                expect(res).toBe(true)
            })
        })
        it('should return false if permissions are not accepted', () => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: true}))
            // act
            storagePermissionHandlerService.checkForPermissions(PageName).then((res) => {
                expect(res).toBe(false)
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName,
                    true
                )
            })
        })
    
        it('should call storage permission pop-up and NOT_NOW clicked ', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            // assert
            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.NOT_NOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                done();
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission false', (done) => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: false}));
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                done();
            }, 0);
        });
    
        it('should not show any toast if not of the button is clicked and popup is dismissed', (done) => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: false}));
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW1'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            // assert
            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.showSettingsPageToast).not.toHaveBeenCalled();
                done();
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', (done) => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: false}));
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                done();
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', (done) => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({isPermissionAlwaysDenied: true}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: false}));
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                done();
            }, 0);
        });
    })

});