import {CommonUtilService, UtilityService, TelemetryGeneratorService, AndroidPermissionsService, AppGlobalService} from '../../../../services';
import { SbAppSharePopupComponent } from '../../../../app/components/popups';
import {PopoverController, Platform, NavParams} from '@ionic/angular';
import { ImpressionType, PageId, Environment, ID, InteractType, InteractSubtype } from '../../../../services';
import { ShareMode } from '../../../../app/app.constant';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';

jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})

jest.mock('@capacitor/share', () => {
    return {
      ...jest.requireActual('@capacitor/share'),
        Share: {
            canShare: jest.fn(() => Promise.resolve({value: true})),
            share: jest.fn(() => Promise.resolve())
        }
    }
})
describe('SbAppSharePopupComponent', () => {
    let sbAppSharePopupComponent: SbAppSharePopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(),
        backButton: {
            subscribeWithPriority: jest.fn((_, fn) => {
                fn();
                return {
                    unsubscribe: jest.fn()
                };
            }),
        }
    } as any;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        getGivenPermissionStatus: jest.fn(() => Promise.resolve({ hasPermission : true} as any)),
        isAndroidVer13: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        exportApk: jest.fn(() => Promise.resolve('filePath')),
        getApkSize: jest.fn(() => Promise.resolve('12345'))
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn()
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockPermissionService: Partial<AndroidPermissionsService> = {
        checkPermissions: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        setNativePopupVisible: jest.fn()
    };

    beforeAll(() => {
        sbAppSharePopupComponent = new SbAppSharePopupComponent(
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockUtilityService as UtilityService,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPermissionService as AndroidPermissionsService,
            mockCommonUtilService as CommonUtilService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbAppSharePopupComponent', () => {
        expect(sbAppSharePopupComponent).toBeTruthy();
    });

    it('should create a instance of sbAppSharePopupComponent', () => {
        // arrange
        // act
        sbAppSharePopupComponent.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.CLOSE_CLICKED);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CLOSE_CLICKED,
            PageId.SHARE_APP_POPUP,
            Environment.SETTINGS
        );
    });

    describe('exportApk()', () => {

        it('should share the APK if shareParams.byFile=true', (done) => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            sbAppSharePopupComponent.exportApk({
                byFile: true,
            });
            // assert
            setTimeout(() => {
                // expect(mocksocialSharing.share).toHaveBeenCalledWith('', '', 'file://filePath', '');
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show TOAST if shareParams.saveFile=true', (done) => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            // act
            sbAppSharePopupComponent.exportApk({
                saveFile: true,
            });
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FILE_SAVED', '', 'green-toast');
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should dismiss the loader in case of error scenarios', (done) => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockUtilityService.exportApk = jest.fn(() => Promise.reject());
            // act
            sbAppSharePopupComponent.exportApk({
                saveFile: true,
            });
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ngOnInit', () => {
        it('should populate apk size and shareUrl', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            })) as any;
            const mockBackBtnFunc = {unsubscribe: jest.fn()};
            const subscribeWithPriorityData = jest.fn((_, fn) => {
                setTimeout(() => {
                    fn();
                });
                return mockBackBtnFunc;
            });
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            // act
            sbAppSharePopupComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockBackBtnFunc.unsubscribe).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.SHARE_APP_POPUP,
                    Environment.SETTINGS);
                expect(sbAppSharePopupComponent.shareUrl).toEqual(
                    'https://play.google.com/store/apps/details?id=org.sunbird.' +
                    'app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app');
                done()
            }, 0);
        });
    
        it('should not brek if getAPKSize() gives error response', (done) => {
            // arrange
            const mockBackBtnFunc = {unsubscribe: jest.fn()};
            const subscribeWithPriorityData = jest.fn((_, fn) => {
                setTimeout(() => {
                    fn();
                });
                return mockBackBtnFunc;
            });
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockUtilityService.getApkSize = jest.fn(() => Promise.reject({}));
            // act
            sbAppSharePopupComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.SHARE_APP_POPUP,
                    Environment.SETTINGS);
                expect(sbAppSharePopupComponent.shareUrl).toEqual(
                    'https://play.google.com/store/apps/details?id=org.sunbird.' +
                    'app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app');
                done()
            }, 0);
        });
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe back button on ngondistroy', () => {
            // arrange
            const unsubscribeFn = jest.fn();
            sbAppSharePopupComponent.backButtonFunc = {
                unsubscribe: unsubscribeFn
            } as any;
            // act
            sbAppSharePopupComponent.ngOnDestroy();
            // assert
            expect(unsubscribeFn).toHaveBeenCalled();
        });
    })

    describe('closePopover', () => {
        it('should dismiss popover on closepopover', () => {
            // arrange
            mockPopoverCtrl.dismiss = jest.fn();
            jest.spyOn(sbAppSharePopupComponent, 'generateInteractTelemetry').mockImplementation(() => {
                return 0;
            });
            // act
            sbAppSharePopupComponent.closePopover();
            // assert
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        });
    })

    describe('shareLink', () => {
        it('should call sharecontent on shareLink, platform ios', () => {
            // arrange
            App.getInfo = jest.fn(() => Promise.resolve({name: 'Sunbird'})) as any;
            mockPlatform.is = jest.fn(fn => fn === 'ios')
            mockPopoverCtrl.dismiss = jest.fn();
            sbAppSharePopupComponent.shareUrl = 'sample_url';
            const url = `Get Sunbird from the Play Store:` + '\n' + 'sample_url';
            mockCommonUtilService.translateMessage = jest.fn(() => url);
            Share.canShare = jest.fn(() => Promise.resolve({value: true})) as any
            Share.share = jest.fn(() => Promise.resolve({})) as any
            // act
            sbAppSharePopupComponent.shareLink();
            // assert
            setTimeout(() => {
                // expect(mocksocialSharing.share).toHaveBeenCalledWith(null, null, null, url);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(ShareMode.SHARE,
                    '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined, undefined, undefined, undefined,
                    ID.SHARE_CONFIRM);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    'share', '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.SHARE_CONFIRM);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
            }, 0);
        });

        it('should call sharecontent on shareLink', () => {
            // arrange
            App.getInfo = jest.fn(() => Promise.resolve({name: 'Sunbird'})) as any;
            mockPlatform.is = jest.fn(fn => fn === 'android')
            mockPopoverCtrl.dismiss = jest.fn();
            sbAppSharePopupComponent.shareUrl = 'sample_url';
            const url = `Get Sunbird from the Play Store:` + '\n' + 'sample_url';
            mockCommonUtilService.translateMessage = jest.fn(() => url);
            Share.canShare = jest.fn(() => Promise.resolve({value: true})) as any
            Share.share = jest.fn(() => Promise.resolve({})) as any
            // act
            sbAppSharePopupComponent.shareLink();
            // assert
            setTimeout(() => {
                // expect(mocksocialSharing.share).toHaveBeenCalledWith(null, null, null, url);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(ShareMode.SHARE,
                    '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined, undefined, undefined, undefined,
                    ID.SHARE_CONFIRM);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    'share', '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.SHARE_CONFIRM);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
            }, 0);
        });
    })

    describe('shareFile', () => {
        it('should call sharecontent on shareFile', () => {
            // arrange
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: true}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(ShareMode.SEND,
                    '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined, undefined, undefined, undefined,
                    ID.SHARE_CONFIRM);
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            }, 0);
        });
    
        it('should call permission popup on shareFile if not given, isAndroidVer13', () => {
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(true))
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(presentFN).toHaveBeenCalled();
            }, 0);
        });

        it('should call permission popup on shareFile if not given', () => {
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(false))
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(presentFN).toHaveBeenCalled();
            }, 0);
        });

        it('should show Error Toast in share File method if permission is given always denied and reject false', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: true}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockNavParams.get = jest.fn();
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                    1,
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                    2,
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });
        it('should not show any toast if not of the button is clicked and popup is dismissed', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockPopoverCtrl.dismiss = jest.fn();
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
                await callback(mockCommonUtilService.translateMessage = jest.fn(() => 'ALLOW1'));
                return {
                    present: jest.fn(() => Promise.resolve())
                };
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.showSettingsPageToast).not.toHaveBeenCalled();
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
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
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission true ', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({isPermissionAlwaysDenied: true}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
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
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });
    })

    describe('saveFile', () => {
        it('should call sharecontent on saveFile, isAndroidVer13', () => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(true))
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: true}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(ShareMode.SAVE,
                    '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined, undefined, undefined, undefined,
                    ID.SHARE_CONFIRM);
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
            }, 0);
        });

        it('should call sharecontent on saveFile', () => {
            // arrange
            mockCommonUtilService.isAndroidVer13 = jest.fn(() => Promise.resolve(false))
            mockPlatform.is = jest.fn(fn => fn === 'ios')
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: true}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(ShareMode.SAVE,
                    '',
                    Environment.SETTINGS,
                    PageId.SHARE_APP_POPUP,
                    undefined, undefined, undefined, undefined,
                    ID.SHARE_CONFIRM);
                expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
            }, 0);
        });
        it('should call permission popup on saveFile if not given', () => {
            // arrange
            mockPlatform.is = jest.fn(fn => fn === 'android')
            sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
            mockPopoverCtrl.dismiss = jest.fn();
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockCommonUtilService.translateMessage = jest.fn();
            const presentFN = jest.fn(() => Promise.resolve());
    
            mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
                present: presentFN
            })) as any;
            // act
            sbAppSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
                expect(presentFN).toHaveBeenCalled();
            }, 0);
        });
    
        it('should show Error Toast in save File method if permission is given always denied and reject false', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {isPermissionAlwaysDenied: true}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            mockNavParams.get = jest.fn();
            // act
            sbAppSharePopupComponent.saveFile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                    1,
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenNthCalledWith(
                    2,
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });
    
        it('should call storage permission pop-up and NOT_NOW clicked ', () => {
            // arrange
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false, isPermissionAlwaysDenied: false}));
            mockPopoverCtrl.dismiss = jest.fn();
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.translateMessage = jest.fn(() => ('NOT_NOW'))
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('NOT_NOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbAppSharePopupComponent.saveFile();
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
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });
    
        it('should call storage permission pop-up and ALLOW clicked and provide has permission true', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockPopoverCtrl.dismiss = jest.fn();
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });

        it('should call storage permission pop-up and ALLOW clicked and provide has permission false and isPermissionAlwaysDenied true', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockPopoverCtrl.dismiss = jest.fn();
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: true}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });

        it('should call storage permission pop-up and ALLOW clicked and provide has permission isPermissionAlwaysDenied true', () => {
            // arrange
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve(
                {hasPermission: false}));
            mockPopoverCtrl.dismiss = jest.fn();
    
            mockCommonUtilService.translateMessage = jest.fn(v => v);
            mockCommonUtilService.buildPermissionPopover = jest.fn((callback) => {
                callback('ALLOW'); 
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve())
                });
            }) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}));
            mockCommonUtilService.showSettingsPageToast = jest.fn();
            // act
            sbAppSharePopupComponent.shareFile();
            // assert
            setTimeout(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.PERMISSION_POPUP
                );
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalledWith(
                    'FILE_MANAGER_PERMISSION_DESCRIPTION',
                    'Sunbird',
                    undefined,
                    true
                );
            }, 0);
        });
    })


});
