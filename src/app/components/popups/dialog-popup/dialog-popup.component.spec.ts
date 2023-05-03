import { DialogPopupComponent } from './dialog-popup.component';
import { UtilityService } from '../../../../services/utility-service';
import { PopoverController, NavParams } from '@ionic/angular';
import {XwalkConstants } from '../../../../app/app.constant';

describe('DialogPopupComponent', () => {
    let dialogPopupComponent: DialogPopupComponent;

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'title':
                    value = 'sample_title';
                    break;
                case 'body':
                    value = 'sample_body';
                    break;
                case 'buttonText':
                    value = 'sample_buttonText';
                    break;
            }
            return value;
        })
    };

    const mockUtilityService: Partial<UtilityService> = {
        openPlayStore: jest.fn()
    };

    beforeAll(() => {
        dialogPopupComponent = new DialogPopupComponent(
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockUtilityService as UtilityService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of DialogPopupComponent', () => {
        expect(dialogPopupComponent).toBeTruthy();
    });

    it('should populate all properties', () => {
        // arrange
        // act
        dialogPopupComponent.ionViewWillEnter();
        // assert
        expect(dialogPopupComponent.title).toEqual('sample_title');
        expect(dialogPopupComponent.body).toEqual('sample_body');
        expect(dialogPopupComponent.buttonText).toEqual('sample_buttonText');
    });

    it('should dismiss the popoverController', () => {
        // arrange
        // act
        dialogPopupComponent.close();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });

    it('should invoke openPlayStore method', () => {
        // arrange
        // act
        dialogPopupComponent.redirectToPlaystore();
        // assert
        expect(mockUtilityService.openPlayStore).toHaveBeenCalledWith(XwalkConstants.APP_ID);
    });

});
