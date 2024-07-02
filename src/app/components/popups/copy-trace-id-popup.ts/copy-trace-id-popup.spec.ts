import { PopoverController, NavParams } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { CopyTraceIdPopoverComponent } from './copy-trace-id-popup.component';
import { CommonUtilService } from '../../../../services/common-util.service';
import { Location } from '@angular/common';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

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
        setTimeout(() => {
            expect(mockSocialSharing.share).toHaveBeenCalledWith('some_trace_id');
        }, 0);
    });

    it('ionViewWillEnter', () => {
        //arrange
        mockNavParams.get = jest.fn(() => 'traceId') as any;
        //act
        copyTraceIdPopoverComponent.ionViewWillEnter();
        //assert
        expect(mockNavParams.get).toHaveBeenCalledWith('traceId');
    });
});
