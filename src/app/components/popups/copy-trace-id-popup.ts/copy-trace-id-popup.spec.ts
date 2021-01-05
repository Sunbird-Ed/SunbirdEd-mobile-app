import { Events, PopoverController, Platform, NavParams } from '@ionic/angular';
import { CopyTraceIdPopoverComponent } from './copy-trace-id-popup.component';
import { CommonUtilService, UtilityService } from '@app/services';
import { Location } from '@angular/common';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

describe('CopyTraceIdPopoverComponent', () => {
    let copyTraceIdPopoverComponent: CopyTraceIdPopoverComponent;

    const mockCommonUtilService: Partial<CommonUtilService> = {
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {};
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };

    beforeAll(() => {
        copyTraceIdPopoverComponent = new CopyTraceIdPopoverComponent(
            mockPopOverController as PopoverController,
            mockSocialSharing as SocialSharing,
            mockNavParams as NavParams,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of copyTraceIdPopoverComponent', () => {
        expect(copyTraceIdPopoverComponent).toBeTruthy();
    });

    it('should dismiss the popup on closePopOver', () => {
        // arrange
        // act
        copyTraceIdPopoverComponent.close();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalledWith();
    });

    it('should dismiss the popup and call social share on copy', () => {
        // arrange
        mockSocialSharing.share = jest.fn()
        copyTraceIdPopoverComponent.traceId = 'some_trace_id'
        // act
        copyTraceIdPopoverComponent.copy();
        // assert
        expect(mockPopOverController.dismiss).toBeCalled();
        expect(mockSocialSharing.share).toHaveBeenCalledWith('some_trace_id');
    });
    

});
