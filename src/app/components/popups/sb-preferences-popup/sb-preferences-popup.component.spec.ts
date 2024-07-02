import {SbPreferencePopupComponent} from '../../../../app/components/popups/sb-preferences-popup/sb-preferences-popup.component';
import {ModalController} from '@ionic/angular';
import {TelemetryGeneratorService} from '../../../../services';
import {AppVersion} from '@awesome-cordova-plugins/app-version/ngx';

describe('SbPreferencesPopupComponent', () => {
    let sbPreferencesPopupComponent: SbPreferencePopupComponent;
    const mockModalController: Partial<ModalController> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };

    beforeAll(() => {
        sbPreferencesPopupComponent = new SbPreferencePopupComponent(
            mockModalController as ModalController,
            mockAppVersion as AppVersion
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
