import { of, throwError } from 'rxjs';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
    ContentService, StorageService, Content
} from 'sunbird-sdk';
import { CommonUtilService, TelemetryGeneratorService } from '../../services';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    InteractType, InteractSubtype,
    Environment, PageId, ImpressionSubtype
} from '../telemetry-constants';
import { AppGlobalService } from '../app-global-service.service';
import { StoragePermissionHandlerService } from './storage-permission-handler.service'
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
        const PageName = 'some-page';
        it('should return true for ios', (done) => {
            mockPlatform.is = jest.fn((key) => {
                let isIos = false;
                switch (key) {
                    case 'ios':
                        isIos = true;
                        break;
                }
                return isIos;
            });
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should return true if permissions are already accepted', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ hasPermission: true }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName).then((res) => {
                expect(res).toBe(true);
            });
        });
        it('should return false if permissions are not accepted', () => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: true }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName).then((res) => {
                expect(res).toBe(false);
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName,
                    true
                );
            });
        });

        it('should show settinngs toast when user doesnt give permission', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: false }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                let msg = '';
                switch (key) {
                    case 'NOT_NOW':
                        msg = 'Not Now';
                        break;
                }
                return msg;
            });
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('Not Now');
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                );
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH, InteractSubtype.NOT_NOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FILE_MANAGER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NOT_NOW');
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should return true if user gives permission', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: false }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                let msg = '';
                switch (key) {
                    case 'ALLOW':
                        msg = 'Allow';
                        break;
                }
                return msg;
            });
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('Allow');
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: true }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP
                );
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FILE_MANAGER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NOT_NOW');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'ALLOW');
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show toast when permissions not set', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: false }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                let msg = '';
                switch (key) {
                    case 'ALLOW':
                        msg = 'Allow';
                        break;
                }
                return msg;
            });
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('Allow');
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockPermissionService.requestPermission = jest.fn(() => of({ isPermissionAlwaysDenied: true }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                );
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FILE_MANAGER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NOT_NOW');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'ALLOW');
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show toast when permissions not set for else part', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: false }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                let msg = '';
                switch (key) {
                    case 'ALLOW':
                        msg = 'Allow';
                        break;
                }
                return msg;
            });
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('Allow');
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockPermissionService.requestPermission = jest.fn(() => of({ isPermissionAlwaysDenied: false }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    undefined,
                    PageName, true
                );
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH, InteractSubtype.DENY_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP
                );
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FILE_MANAGER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NOT_NOW');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'ALLOW');
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not show toast for default value', (done) => {
            // arrange
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({ isPermissionAlwaysDenied: false }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                let msg = '';
                switch (key) {
                    case 'default':
                        msg = 'default';
                        break;
                }
                return msg;
            });
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('default');
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockPermissionService.requestPermission = jest.fn(() => of({ isPermissionAlwaysDenied: false }));
            // act
            storagePermissionHandlerService.checkForPermissions(PageName);
            setTimeout(() => {
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'FILE_MANAGER');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'NOT_NOW');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'ALLOW');
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
