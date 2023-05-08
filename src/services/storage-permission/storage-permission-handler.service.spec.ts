import { of } from 'rxjs';
import { CommonUtilService, TelemetryGeneratorService } from '../../services';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import {StoragePermissionHandlerService} from './storage-permission-handler.service'
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { Platform } from '@ionic/angular';

describe('ContentShareHandlerService', () => {

    let storagePermissionHandlerService: StoragePermissionHandlerService;

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('app_name')),
        showToast: jest.fn(),
        translateMessage: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sample_app_name'))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockPermissionService: Partial<AndroidPermissionsService> = {};
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
            mockPlatform.is = jest.fn((platform) => platform == 'ios');
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

        it('should show settinngs toast when user doesnt give permission', (done) => {
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
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                )
                done()
            });
        })
        it('should return true if user gives permission', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}))
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
                done()
            });
        })

        it('should show toast when permissions not set', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockPermissionService.requestPermission = jest.fn(() => of({isPermissionAlwaysDenied: true}))
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                )
                done()
            });
        })

        it('should show toast when request permission is undefined', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage('ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            mockPermissionService.requestPermission = jest.fn(() => of({}))
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                )
                done()
            });
        })

        it('should handle else case for selected button is undefined or empty', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: false}))
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage(''));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            });
            // act
            storagePermissionHandlerService.checkForPermissions(PageName)
            setTimeout(() => {
                done()
            });
        })
    })

});
