import {CertificateVerificationPopoverComponent} from './certificate-verification-popup.component';
import { PopoverController, Platform } from '@ionic/angular';
import { CommonUtilService } from '../../../../services';
import { Events } from '@app/util/events';

describe('CertificateVerificationPopoverComponent', () => {

    let certificateVerificationPopoverComponent: CertificateVerificationPopoverComponent;

    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockPopOverCtrl: Partial<PopoverController> = {}; { };
    const mockPlatform: Partial<Platform> = {};
    const mockEvents: Partial<Events> = { publish: jest.fn() }; 

    beforeAll(() => {
        certificateVerificationPopoverComponent = new CertificateVerificationPopoverComponent(
            mockCommonUtilService as CommonUtilService,
            mockPopOverCtrl as PopoverController,
            mockPlatform as Platform,
            mockEvents as Events
        );
    }); 
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    it('should create a instance of certificateVerificationPopoverComponent', () => {
        expect(certificateVerificationPopoverComponent).toBeTruthy();
    });     
    it('should subscribe to back button subscription and get the App Name', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPopOverCtrl.dismiss = jest.fn();
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        certificateVerificationPopoverComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird')); 
        // act
        certificateVerificationPopoverComponent.ngOnInit();
        // assert           
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
        expect(unsubscribeFn).toHaveBeenCalled();
    });
    it('should unsubscribe to back button ngOnDestroy', () => {
        // arrange
        certificateVerificationPopoverComponent.backButtonFunc = {
            unsubscribe: jest.fn(),
        } as any;
        // act
        certificateVerificationPopoverComponent.ngOnDestroy();
        // assert
        expect(certificateVerificationPopoverComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });
    it('should close the popover on click', () => {
        //arrange  
        mockPopOverCtrl.dismiss = jest.fn();     
        //act
        certificateVerificationPopoverComponent.closePopover();
        // assert 
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: null });
    });
    it('should close the popover on deleteContent', () => {
        //arrange  
         mockPopOverCtrl.dismiss = jest.fn();         
        //act
        certificateVerificationPopoverComponent.deleteContent(1);
        // assert 
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalledWith({ isLeftButtonClicked: false });
    });  
});
