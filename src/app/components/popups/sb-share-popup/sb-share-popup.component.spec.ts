import {
    ContentShareHandlerService,
    UtilityService,
    TelemetryGeneratorService,
    CommonUtilService,
    AndroidPermissionsService, InteractType, InteractSubtype
} from '../../../../services';
import { SbSharePopupComponent } from './sb-share-popup.component';
import { ContentService } from 'sunbird-sdk';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import {
    Environment,
    ImpressionType,
    ID,
    PageId,
} from '@app/services/telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { of } from 'rxjs';

describe('SbSharePopupComponent', () => {
    let sbSharePopupComponent: SbSharePopupComponent;
    const mockContentService: Partial<ContentService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn()),
    } as any;
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {
        shareContent: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('baseurl'))
    };
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        identifier: 'do_123',
                        contentData: {
                            contentType: 'Resource',
                            pkgVersion: '1'
                        }
                    } as any;
                    break;
                case 'pageId':
                    value = 'content-detail';
                    break;
                case 'objRollup':
                    value = { l1: 'do_1', l2: 'do_12' };
                    break;
                case 'shareItemType':
                    value = 'root-content';
                    break;
            }
            return value;
        })
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(),
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockPermissionService: Partial<AndroidPermissionsService> = {
        checkPermissions: jest.fn()
    };
    beforeAll(() => {
        sbSharePopupComponent = new SbSharePopupComponent(
            mockContentService as ContentService,
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockContentShareHandler as ContentShareHandlerService,
            mockUtilityService as UtilityService,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockPermissionService as AndroidPermissionsService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(sbSharePopupComponent).toBeTruthy();
    });

    it('should generate telemetry on ngOninit', () => {
        // arrange
        const unsubscribeFn = jest.fn();
        sbSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        jest.spyOn(sbSharePopupComponent, 'getContentEndPoint').mockImplementation();
        // act
        sbSharePopupComponent.ngOnInit();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith('root-content',
            '',
            Environment.HOME,
            'content-detail',
            { id: 'do_123', type: 'Resource', version: '1' },
            undefined,
            { l1: 'do_1', l2: 'do_12' },
            undefined,
            ID.SHARE);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW, '',
            PageId.SHARE_CONTENT_POPUP,
            Environment.HOME,
            'do_123',
            'Resource',
            '1',
            { l1: 'do_1', l2: 'do_12' },
            undefined);
    });


    it('should unsubscribe back button on ngondistroy', () => {
        // arrange
        // jest.spyOn(sbSharePopupComponent, 'closePopover').mockImplementation();
        const unsubscribeFn = jest.fn();
        sbSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        sbSharePopupComponent.ngOnDestroy();
        // assert
        expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('should call sharecontent on saveFile', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbSharePopupComponent.closePopover();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should call sharecontent on shareLink', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbSharePopupComponent.shareLink();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
    });

    it('should call sharecontent on shareFile', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: true }));
        // act
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call sharecontent on saveFile', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: true }));
        // act
        sbSharePopupComponent.saveFile();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should show Error Toast in share File method if permission is given always denied and reject false', (done) => {
        // arrange
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { isPermissionAlwaysDenied: true }));
        mockCommonUtilService.showSettingsPageToast = jest.fn();
        // act
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                1,
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                2,
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            done();
        }, 0);
    });

    it('should show Error Toast in save File method if permission is given always denied and reject false', (done) => {
        // arrange
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { isPermissionAlwaysDenied: true }));
        mockCommonUtilService.showSettingsPageToast = jest.fn();
        // act
        sbSharePopupComponent.saveFile();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                1,
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                2,
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            done();
        }, 0);
    });

    it('should call permission popup on shareFile if not given', (done) => {
        sbSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
        mockPopoverCtrl.dismiss = jest.fn();
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: false }));
        mockCommonUtilService.translateMessage = jest.fn();
        const presentFN = jest.fn(() => Promise.resolve());

        mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
            present: presentFN
        }));
        // act
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
            expect(presentFN).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call storage permission pop-up and NOT_NOW clicked ', (done) => {
        // arrange
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: false }));
        mockPopoverCtrl.dismiss = jest.fn();

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
        sbSharePopupComponent.saveFile();
        // assert
        setTimeout(() => {
            // assert
            expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.NOT_NOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP
            );
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            done();
        }, 0);
    });

    it('should call storage permission pop-up and ALLOW clicked and provide has permission false', (done) => {
        // arrange
        mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: false }));
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: false }));
        mockPopoverCtrl.dismiss = jest.fn();

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
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.ALLOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP
            );
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            done();
        }, 0);
    });


    it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', (done) => {
        // arrange
        mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: true }));
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: false }));
        mockPopoverCtrl.dismiss = jest.fn();

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
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.ALLOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP
            );
            done();
        }, 0);
    });

    it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', (done) => {
        // arrange
        mockPermissionService.requestPermission = jest.fn(() => of({ isPermissionAlwaysDenied: true }));
        mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
            { hasPermission: false }));
        mockPopoverCtrl.dismiss = jest.fn();

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
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.ALLOW_CLICKED,
                Environment.HOME,
                PageId.PERMISSION_POPUP
            );
            expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                'FILE_MANAGER_PERMISSION_DESCRIPTION',
                undefined,
                'content-detail',
                true
            );
            done();
        }, 0);
    });

});
