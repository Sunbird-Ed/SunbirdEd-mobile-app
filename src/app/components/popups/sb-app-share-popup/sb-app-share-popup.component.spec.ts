import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CommonUtilService, UtilityService } from '../../../../services';
import { DeviceInfo } from 'sunbird-sdk';
import { SbAppSharePopupComponent } from './sb-app-share-popup.component';
import { PopoverController, Platform } from '@ionic/angular';
import { FileService } from 'sunbird-sdk/dist/util/file/def/file-service';

describe('SbAppSharePopupComponent', () => {
    let sbAppSharePopupComponent: SbAppSharePopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockFileService: Partial<FileService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {
        getDeviceID: jest.fn(() => '0123456789')
    };
    const mockPlatform: Partial<Platform> = {};
    const mocksocialSharing: Partial<SocialSharing> = {
        share: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        exportApk: jest.fn(() => Promise.resolve('filePath')),
        getApkSize: jest.fn(() => Promise.resolve('12345'))
    };
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app')),
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    beforeAll(() => {
        sbAppSharePopupComponent = new SbAppSharePopupComponent(
            mockFileService as FileService,
            mockDeviceInfo as DeviceInfo,
            mockPopoverCtrl as PopoverController,
            mocksocialSharing as SocialSharing,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockUtilityService as UtilityService,
            mockAppversion as AppVersion);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbAppSharePopupComponent', () => {
        expect(sbAppSharePopupComponent).toBeTruthy();
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
                expect(mocksocialSharing.share).toHaveBeenCalledWith('', '', 'file://filePath' , '');
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

    it('should populate apk size and shareUrl', (done) => {
        // arrange
        const unsubscribeFn = jest.fn();
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn()),
        } as any;
        sbAppSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        sbAppSharePopupComponent.ngOnInit();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(unsubscribeFn).toHaveBeenCalled();
        setTimeout(() => {
            expect(sbAppSharePopupComponent.shareUrl).toEqual(
            'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3D0123456789%26utm_campaign%3Dshare_app');
            done();
        }, 0);
    });

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

    it('should dismiss popover on closepopover', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.closePopover();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should call sharecontent on shareLink', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        sbAppSharePopupComponent.shareUrl = 'sample_url';
        // act
        sbAppSharePopupComponent.shareLink();
        // assert
        setTimeout(() => {
            const url = '\n' + `Get Sunbird from the Play Store:` + '\n' + 'sample_url';
            expect(mocksocialSharing.share).toHaveBeenCalledWith(null, null, null, url);
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call sharecontent on shareFile', () => {
        // arrange
        sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.shareFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should call sharecontent on saveFile', () => {
        // arrange
        sbAppSharePopupComponent.exportApk = jest.fn(() => Promise.resolve());
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.saveFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });


});
