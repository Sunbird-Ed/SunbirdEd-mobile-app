import {ConfirmAlertComponent} from '../../../app/components';
import {NavParams, Platform, PopoverController} from '@ionic/angular';
import {of} from 'rxjs';

describe('ConfirmAlertComponent', () => {
    let confirmAlertComponent: ConfirmAlertComponent;
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn((_, fn) => {
                fn();
                return {
                    unsubscribe: jest.fn()
                };
            }),
        }
    } as any;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'actionsButtons':
                    value = [
                        {
                            btntext: 'OKAY',
                            btnClass: 'popover-color',
                            btnDisabled$: of([])
                        }
                    ];
                    break;
                case 'icon':
                    value = 'sample_icon';
                    break;
                case 'metaInfo':
                    value = 'sample_meta_info';
                    break;
                case 'sbPopoverContent':
                    value = 'samplePopoverContent';
                    break;
                case 'sbPopoverHeading':
                    value = 'sample_heading';
                    break;
                case 'sbPopoverMainTitle':
                    value = 'sample_title';
                    break;
                case 'isUpdateAvail':
                    value = true;
                    break;
                case 'contentSize':
                    value = '200kb';
                    break;
            }
            return value;
        })
    };
    const mockPopoverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    beforeAll(() => {
        confirmAlertComponent = new ConfirmAlertComponent(
            mockPlatform as Platform,
            mockNavParams as NavParams,
            mockPopoverController as PopoverController
        );
    });

    it('should provide instance for confirmAlertComponent', () => {
        // assert
        expect(confirmAlertComponent).toBeTruthy();
    });

    it('should select can download false and dimiss popover with passing data', () => {
        mockPopoverController.dismiss = jest.fn();

        confirmAlertComponent.selectOption();

        expect(mockPopoverController.dismiss).toHaveBeenCalledWith(false);
    });

    it('should close popover when clicked', () => {
        mockPopoverController.dismiss = jest.fn();

        confirmAlertComponent.closePopover();

        expect(mockPopoverController.dismiss).toHaveBeenCalled();
    });

    it('should unsubscribe on ngOnDestroy', () => {
        confirmAlertComponent.backButtonFunc = {
            unsubscribe: jest.fn()
        }

        confirmAlertComponent.ngOnDestroy();

        expect(confirmAlertComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should return if not subscribed', () => {
        confirmAlertComponent.backButtonFunc = undefined;

        confirmAlertComponent.ngOnDestroy();

    });
});
