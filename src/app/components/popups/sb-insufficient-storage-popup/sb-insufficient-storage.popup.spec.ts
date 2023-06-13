import { SbInsufficientStoragePopupComponent } from './sb-insufficient-storage-popup';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { Router } from '@angular/router';

describe('SbInsufficientStoragePopupComponent', () => {
    let sbInsufficientStoragePopupComponent: SbInsufficientStoragePopupComponent;

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'sbPopoverHeading':
                    value = 'sample_heading';
                    break;
                case 'sbPopoverMessage':
                    value = 'sample_message';
                    break;
            }
            return value;
        })
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    beforeAll(() => {
        sbInsufficientStoragePopupComponent = new SbInsufficientStoragePopupComponent(
            mockNavParams as NavParams,
            mockPopOverController as PopoverController,
            mockRouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbInsufficientStoragePopupComponent', () => {
        expect(sbInsufficientStoragePopupComponent).toBeTruthy();
    });

    it('should initialize the sbPopoverHeading and sbPopoverMessage', () => {
        // arrange
        // act
        sbInsufficientStoragePopupComponent.initParams();
        // assert
        expect(sbInsufficientStoragePopupComponent.sbPopoverMessage).toBeDefined();
        expect(sbInsufficientStoragePopupComponent.sbPopoverHeading).toBeDefined();
    });

    it('should navigate to  StorageSettings page', () => {
        // arrange
        // act
        sbInsufficientStoragePopupComponent.navigateToStorageSettings();
        // assert
        setTimeout(() => {
            expect(mockRouter.navigate).toHaveBeenCalledWith(['storage-settings']);
        }, 0);
    });

    it('should close popover closePopover', () => {
        // arrange
        // act
        sbInsufficientStoragePopupComponent.closePopover();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
    });

});
