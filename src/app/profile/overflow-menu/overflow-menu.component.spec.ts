import { NavParams, PopoverController } from '@ionic/angular';
import {OverflowMenuComponent} from './overflow-menu.component'

describe('OverflowMenuComponent', () => {
    let overflowMenuComponent: OverflowMenuComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'list':
                    value = 'list';
                    break;
                case 'profile':
                    value = 'profile';
                    break;
            }
            return value;
        })
    };
    const mockPopoverController: Partial<PopoverController> = {};

    beforeAll(() => {
        overflowMenuComponent = new OverflowMenuComponent(
            mockNavParams as NavParams,
            mockPopoverController as PopoverController
            );
        }
    );
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create instance of showCertificateComponent', () => {
        // assert
        expect(overflowMenuComponent).toBeTruthy();
    });

    it('should populate the property', () => {
        // arrange
        // act
        overflowMenuComponent. showToast();
        // assert
        expect(overflowMenuComponent.items).toEqual('list');
    });
});