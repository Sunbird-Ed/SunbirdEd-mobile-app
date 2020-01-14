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
    };
    const mockAppversion: Partial<AppVersion> = {};

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

    // it('should get content detail on ngoninit', (done) => {
    //     // arrange
    //     const subscribeWithPriorityFn = jest.fn((_, fn) => fn());
    //     mockPlatform.backButton = {
    //         subscribeWithPriority: subscribeWithPriorityFn
    //     } as any;
    //     const unsubscribeFn = jest.fn();
    //     sbAppSharePopupComponent.backButtonFunc = {
    //         unsubscribe: unsubscribeFn
    //     } as any;
    //     mockPopoverCtrl.dismiss = jest.fn();
    //     const mockContentDetailResponse = {
    //         identifier: 'sampleId'
    //     };
    //     mockContentService.getContentDetails = jest.fn(() => of(mockContentDetailResponse));
    //     const contentDetail = {
    //         hierarchyInfo: [{identifier: 'sampleid'}]
    //     };
    //     sbAppSharePopupComponent.contentDetail = contentDetail;
    //     // act
    //     sbAppSharePopupComponent.ngOnInit();
    //     // assert
    //     setTimeout(() => {
    //         expect(mockContentService.getContentDetails).toHaveBeenCalled();
    //         expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    //         expect(sbAppSharePopupComponent.shareUrl).toEqual('baseurl/play/content/sampleId');
    //         expect(subscribeWithPriorityFn).toHaveBeenCalled();
    //         done();
    //     }, 0);
    // });

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
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.shareFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should call sharecontent on saveFile', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbAppSharePopupComponent.saveFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

});
