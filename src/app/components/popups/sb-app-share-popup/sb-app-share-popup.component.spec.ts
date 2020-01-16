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
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        exportApk: jest.fn(() => Promise.resolve('filePath')),
        getApkSize: jest.fn(() => Promise.resolve('12345'))
    };
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app'))
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
                'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3D0123456789%26utm_campaign%3Dshareapp');
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

    it('should call sharecontent on shareLink', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.shareLink();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
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

    // it('should get packagename on getPackageName', (done) => {
    //     // arrange
    //     // act
    //     sbAppSharePopupComponent.getPackageName();
    //     // assert
    //     setTimeout(() => {
    //         expect(sbAppSharePopupComponent.shareUrl).toBeDefined();
    //         // expect(sbAppSharePopupComponent.shareUrl.indexOf('packagename')).toBeGreaterThan(0);
    //         done();
    //     }, 100 );
    // });

});
