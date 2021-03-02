import { SbNoNetworkPopupComponent } from './sb-no-network-popup.component';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Router } from '@angular/router';

describe('SbNoNetworkPopupComponent', () => {
    let sbNoNetworkPopupComponent: SbNoNetworkPopupComponent;
    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    beforeAll(() => {
        sbNoNetworkPopupComponent = new SbNoNetworkPopupComponent(
            mockPopOverController as PopoverController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbNoNetworkPopupComponent', () => {
        expect(sbNoNetworkPopupComponent).toBeTruthy();
    });

    it('should close popover closePopover', () => {
        // arrange
        // act
        sbNoNetworkPopupComponent.closePopover();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });

});

