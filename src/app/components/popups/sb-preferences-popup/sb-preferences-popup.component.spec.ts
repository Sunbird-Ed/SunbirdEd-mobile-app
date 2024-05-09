import {SbPreferencePopupComponent} from '../../../../app/components/popups/sb-preferences-popup/sb-preferences-popup.component';
import {ModalController} from '@ionic/angular';
jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})
describe('SbPreferencesPopupComponent', () => {
    let sbPreferencesPopupComponent: SbPreferencePopupComponent;
    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        sbPreferencesPopupComponent = new SbPreferencePopupComponent(
            mockModalController as ModalController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of SbpreferenceComponent', () => {
        // assert
        expect(sbPreferencesPopupComponent).toBeTruthy();
    });

    it('should change preferences with returned object as true', () => {
        // arrange
        mockModalController.dismiss = jest.fn(() => {
        }) as any;
        // act
        sbPreferencesPopupComponent.changePreference();
        // assert
        expect(mockModalController.dismiss).toHaveBeenCalledWith({showPreference: true});
    });
});
