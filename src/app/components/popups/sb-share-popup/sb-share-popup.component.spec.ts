import {
    ContentShareHandlerService,
    UtilityService,
    TelemetryGeneratorService,
    CommonUtilService,
    AndroidPermissionsService, InteractType, InteractSubtype, AppGlobalService
} from '../../../../services';
import { SbSharePopupComponent } from './sb-share-popup.component';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import {
    Environment,
    ImpressionType,
    ID,
    PageId,
} from '../../../../services/telemetry-constants';
import { of } from 'rxjs';
import { MimeType } from '../../../app.constant';
import { CsContentType, CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { App } from '@capacitor/app';

jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})
describe('SbSharePopupComponent', () => {
    let sbSharePopupComponent: SbSharePopupComponent;
    const mockContentService: Partial<ContentService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        identifier: 'do_123',
                        contentType: 'Resource',
                        primaryCategory: 'learning resource',
                        contentData: {
                            contentType: 'Resource',
                            pkgVersion: '1',
                            primaryCategory: 'Learning Resource'
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
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        isAndroidVer13: jest.fn(() => Promise.resolve(true))
    };
    const mockPermissionService: Partial<AndroidPermissionsService> = {
        checkPermissions: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        setNativePopupVisible: jest.fn()
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
            mockCommonUtilService as CommonUtilService,
            mockPermissionService as AndroidPermissionsService,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(sbSharePopupComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should generate telemetry on ngOninit', (done) => {
            // arrange
            const unsubscribeFn = jest.fn();
            sbSharePopupComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('baseurl'));
            mockContentService.getContentDetails = jest.fn(() => of({
                identifier: 'do_1', mimeType: MimeType.COLLECTION, contentType: CsContentType.TEXTBOOK,
                primaryCategory: CsPrimaryCategory.DIGITAL_TEXTBOOK.toLowerCase()
            })) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, cb) => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                    return {
                        unsubscribe: jest.fn()
                    };
                }),
            } as any;
            mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
            App.getInfo = jest.fn(() => Promise.resolve({name: "Sunbird", 'id': "", build: 0})) as any
            // act
            sbSharePopupComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith('root-content',
                    '',
                    Environment.HOME,
                    'content-detail',
                    { id: 'do_123', type: 'Learning Resource', version: '1' },
                    undefined,
                    { l1: 'do_1', l2: 'do_12' },
                    undefined,
                    ID.SHARE);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.SHARE_CONTENT_POPUP,
                    Environment.HOME,
                    'do_123',
                    'Learning Resource',
                    '1',
                    { l1: 'do_1', l2: 'do_12' },
                    undefined);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('BASE_URL');
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith({
                    contentId: 'do_1',
                    attachFeedback: false,
                    attachContentAccess: false,
                    emitUpdateIfAny: false
                });
                done();
            }, 0);
        });
        it('should generate telemetry on ngOninit, for primary category', (done) => {
            // arrange
            const unsubscribeFn = jest.fn();
            sbSharePopupComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('baseurl'));
            mockContentService.getContentDetails = jest.fn(() => of({
                identifier: 'do_1', mimeType: MimeType.COLLECTION, contentType: CsContentType.TEXTBOOK,
                primaryCategory: CsPrimaryCategory.COURSE.toLowerCase()
            })) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, cb) => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                    return {
                        unsubscribe: jest.fn()
                    };
                }),
            } as any;
            mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
            App.getInfo = jest.fn(() => Promise.resolve({name: "Sunbird", 'id': "", build: 0})) as any
            // act
            sbSharePopupComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith('root-content',
                    '',
                    Environment.HOME,
                    'content-detail',
                    { id: 'do_123', type: 'Learning Resource', version: '1' },
                    undefined,
                    { l1: 'do_1', l2: 'do_12' },
                    undefined,
                    ID.SHARE);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.SHARE_CONTENT_POPUP,
                    Environment.HOME,
                    'do_123',
                    'Learning Resource',
                    '1',
                    { l1: 'do_1', l2: 'do_12' },
                    undefined);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('BASE_URL');
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith({
                    contentId: 'do_1',
                    attachFeedback: false,
                    attachContentAccess: false,
                    emitUpdateIfAny: false
                });
                done();
            }, 0);
        });

        it('should generate telemetry on ngOninit', (done) => {
            // arrange
            const unsubscribeFn = jest.fn();
            sbSharePopupComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('baseurl'));
            mockContentService.getContentDetails = jest.fn(() => of({
                identifier: 'do_1', mimeType: MimeType.AUDIO, contentType: CsContentType.TEXTBOOK,
                primaryCategory: CsPrimaryCategory.DIGITAL_TEXTBOOK.toLowerCase()
            })) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, cb) => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                    return {
                        unsubscribe: jest.fn()
                    };
                }),
            } as any;
            mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
            App.getInfo = jest.fn(() => Promise.resolve({name: "Sunbird", 'id': "", build: 0})) as any
            // act
            sbSharePopupComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith('root-content',
                    '',
                    Environment.HOME,
                    'content-detail',
                    { id: 'do_123', type: 'Learning Resource', version: '1' },
                    undefined,
                    { l1: 'do_1', l2: 'do_12' },
                    undefined,
                    ID.SHARE);
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.SHARE_CONTENT_POPUP,
                    Environment.HOME,
                    'do_123',
                    'Learning Resource',
                    '1',
                    { l1: 'do_1', l2: 'do_12' },
                    undefined);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('BASE_URL');
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith({
                    contentId: 'do_1',
                    attachFeedback: false,
                    attachContentAccess: false,
                    emitUpdateIfAny: false
                });
                done();
            }, 0);
        });
    })


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
        mockContentShareHandler.shareContent = jest.fn();
        // act
        sbSharePopupComponent.shareLink();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
        }, 0);
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

    describe('shareFile', () => {
        it('should show Error Toast in share File method if permission is given always denied and reject false', (done) => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(true))
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                { isPermissionAlwaysDenied: true }));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    
        it('should show Error Toast in save File method if permission is given always denied and reject false, platform ios', (done) => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(true))
            mockPlatform.is = jest.fn((fn) => fn == 'ios')
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                { isPermissionAlwaysDenied: true }));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
        it('should show Error Toast in save File method if permission is given always denied and reject false, platform ios', (done) => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(false))
            mockPlatform.is = jest.fn((fn) => fn == 'ios')
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                { isPermissionAlwaysDenied: true }));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
        it('should show Error Toast in save File method if permission is given always denied and reject false', (done) => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(false))
            mockPlatform.is = jest.fn((fn) => fn == 'android')
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
                    "Sunbird",
                    'content-detail',
                    true
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                    2,
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    "Sunbird",
                    'content-detail',
                    true
                );
                done();
            }, 0);
        });
    
        it('should call permission popup on shareFile if not given', (done) => {
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(false))
            mockPlatform.is = jest.fn((fn) => fn == 'android')
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                { hasPermission: false, isPermissionAlwaysDenied: false }));
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('NOT_NOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            const presentFN = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                done();
            }, 0);
        });
    
        it('should call storage permission pop-up and NOT_NOW clicked ', (done) => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                { hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}))
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            sbSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
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
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: true}))
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
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
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}))
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            
            // act
            sbSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
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
                await callback(mockCommonUtilService.translateMessage = jest.fn(() => 'ALLOW'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                done();
            }, 0);
        });
    })

});
