import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { of } from 'rxjs';
import { ContentShareHandlerService, CommonUtilService, UtilityService } from '../../../../services';
import { ContentService } from 'sunbird-sdk';
import { SbAppSharePopupComponent } from './sb-app-share-popup.component';
import { PopoverController, Platform } from '@ionic/angular';
import { FileService } from 'sunbird-sdk/dist/util/file/def/file-service';

describe('SbAppSharePopupComponent', () => {
    let sbAppSharePopupComponent: SbAppSharePopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockFileService: Partial<FileService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mocksocialSharing: Partial<SocialSharing> = {
        share: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        exportApk: jest.fn(() => Promise.resolve('filePath'))
    };
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('packagename'))
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

    it('should call exportApk ngoninit', (done) => {
        // arrange
        const subscribeWithPriorityFn = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityFn
        } as any;
        const unsubscribeFn = jest.fn();
        sbAppSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        mockPopoverCtrl.dismiss = jest.fn();
        sbAppSharePopupComponent.getPackageName = jest.fn();
        // act
        sbAppSharePopupComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(subscribeWithPriorityFn).toHaveBeenCalled();
            expect(sbAppSharePopupComponent.filePath).toEqual('filePath');
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
