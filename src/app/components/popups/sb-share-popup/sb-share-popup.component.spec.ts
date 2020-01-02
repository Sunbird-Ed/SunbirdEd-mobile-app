import { of } from 'rxjs';
import { ContentShareHandlerService, CommonUtilService, UtilityService } from '../../../../services';
import { ContentService } from 'sunbird-sdk';
import { SbSharePopupComponent } from './sb-share-popup.component';
import { PopoverController, Platform } from '@ionic/angular';

describe('SbSharePopupComponent', () => {
    let sbSharePopupComponent: SbSharePopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {
        shareContent: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('baseurl'))
    };

    beforeAll(() => {
        sbSharePopupComponent = new SbSharePopupComponent(
        mockContentService as ContentService,
        mockPopoverCtrl as PopoverController,
        mockPlatform as Platform,
        mockContentShareHandler as ContentShareHandlerService,
        mockCommonUtilService as CommonUtilService,
        mockUtilityService as UtilityService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(sbSharePopupComponent).toBeTruthy();
    });

    it('should get content detail on ngoninit', (done) => {
        // arrange
        const subscribeWithPriorityFn = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityFn
        } as any;
        const unsubscribeFn = jest.fn();
        sbSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        mockPopoverCtrl.dismiss = jest.fn();
        const mockContentDetailResponse = {
            identifier: 'sampleId'
        };
        mockContentService.getContentDetails = jest.fn(() => of(mockContentDetailResponse));
        const contentDetail = {
            hierarchyInfo: [{identifier: 'sampleid'}]
        };
        sbSharePopupComponent.contentDetail = contentDetail;
        // act
        sbSharePopupComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockContentService.getContentDetails).toHaveBeenCalled();
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(sbSharePopupComponent.shareUrl).toEqual('baseurl/play/content/sampleId');
            expect(subscribeWithPriorityFn).toHaveBeenCalled();
            done();
        }, 0);
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

    it('should call sharecontent on shareFile', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbSharePopupComponent.shareFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
    });

    it('should call sharecontent on saveFile', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        const shareParams = {
            saveFile: true,
        };
        // act
        sbSharePopupComponent.saveFile();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
    });
});
