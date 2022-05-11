import {PopoverController} from '@ionic/angular';
import { ApplicationHeaderKebabMenuComponent, KebabMenuOption } from './application-header-kebab-menu.component';

describe('ApplicationHeaderKebabMenuComponent', () => {
    let applicationHeaderKebabMenuComponent: ApplicationHeaderKebabMenuComponent;
    const mockPopOverController: Partial<PopoverController> = {};

    beforeAll(() => {
        applicationHeaderKebabMenuComponent = new ApplicationHeaderKebabMenuComponent(
            mockPopOverController as PopoverController
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(applicationHeaderKebabMenuComponent).toBeTruthy();
    });

    describe('onOptionSelect', () => {
        it('onOptionSelect', () => {
            //arrange
            const option : KebabMenuOption = {label: 'A string', value: []};
            const event = 'Event' as any;
            mockPopOverController.dismiss= jest.fn(() => Promise.resolve(true));
            //act
            applicationHeaderKebabMenuComponent.onOptionSelect(
                event, option
            )
            //assert
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith({option});
        })
    })
});