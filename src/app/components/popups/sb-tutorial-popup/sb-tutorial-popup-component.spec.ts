import {SbTutorialPopupComponent} from '@app/app/components/popups/sb-tutorial-popup/sb-tutorial-popup.component';
import {NavParams, PopoverController} from '@ionic/angular';

describe('SbTutorialComponentPopup', () => {
    let sbTutorialPopupComponent: SbTutorialPopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockNavParams: Partial<NavParams> = {};
    beforeAll(() => {
        sbTutorialPopupComponent = new SbTutorialPopupComponent(
            mockPopoverCtrl as PopoverController,
            mockNavParams as NavParams
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of sbTutorialComponent', () => {
        // assert
        expect(sbTutorialPopupComponent).toBeTruthy();
    });

    it('should get appLabel from navParams and setData in appName and set isPopover Present to true', (done) => {
        // arrange
        mockNavParams.get = jest.fn(() => 'Sunbird');
        // act
        sbTutorialPopupComponent.ngOnInit();
        // assert
        expect(sbTutorialPopupComponent.appName).toEqual('Sunbird');
        setTimeout(() => {
            expect(sbTutorialPopupComponent.isPopoverPresent).toBe(true);
            done();
        }, 2000);
    });

    it('should handle dismiss popover ', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbTutorialPopupComponent.closePopover(true);
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({continueClicked: true});
    });
});
