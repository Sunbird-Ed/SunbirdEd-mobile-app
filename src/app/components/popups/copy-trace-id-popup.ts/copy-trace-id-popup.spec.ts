import { Events, PopoverController, Platform } from '@ionic/angular';
import { CopyTraceIdPopoverComponent } from './copy-trace-id-popup.component';
import { CommonUtilService, UtilityService } from '@app/services';
import { Location } from '@angular/common';

describe('CopyTraceIdPopoverComponent', () => {
    let copyTraceIdPopoverComponent: CopyTraceIdPopoverComponent;

    const mockCommonUtilService: Partial<CommonUtilService> = {
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };

    beforeAll(() => {
        copyTraceIdPopoverComponent = new CopyTraceIdPopoverComponent(
            mockPopOverController as PopoverController,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of copyTraceIdPopoverComponent', () => {
        expect(copyTraceIdPopoverComponent).toBeTruthy();
    });

    it('should check network conectivity on ionview will enter', () => {
        // arrange
        mockCommonUtilService.networkInfo = {
            isNetworkAvailable: true
        }
        // act
        copyTraceIdPopoverComponent.ionViewWillEnter();
        // assert
        expect(copyTraceIdPopoverComponent.isOnline).toBe( true );
    });

    it('should dismiss the popup on closePopOver', () => {
        // arrange
        // act
        copyTraceIdPopoverComponent.close();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith();
    });

    

});
