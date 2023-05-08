import {JoyfulThemePopupComponent} from '../../../../app/components/popups/joyful-theme-popup/joyful-theme-popup.component';
import {SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {NavParams, PopoverController} from '@ionic/angular';
import {AppHeaderService} from '../../../../services';
import {of} from 'rxjs';

describe('JoyfulThemePopup', () => {
    let joyfulThemePopupComponent: JoyfulThemePopupComponent;
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockPopoverController: Partial<PopoverController> = {};
    const mockNavparams: Partial<NavParams> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    beforeAll(() => {
        joyfulThemePopupComponent = new JoyfulThemePopupComponent(
            mockSharedPreferences as SharedPreferences,
            mockPopoverController as PopoverController,
            mockNavparams as NavParams,
            mockAppHeaderService as AppHeaderService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of JoyfulThemePopupComponent', () => {
        // assert
        expect(joyfulThemePopupComponent).toBeTruthy();
    });

    it('should fetch appTheme and appName ', () => {
        // arrange
        mockNavparams.get = jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'appLabel':
                    value = 'sampleAppLabel';
                    break;
            }
        });
        // act
        joyfulThemePopupComponent.ngOnInit();
        // assert
        expect(mockNavparams.get).toHaveBeenCalledWith('appLabel');
    });

    it('should dismiss the popover and call joyful theme method', (done) => {
        // arrange
        jest.spyOn(joyfulThemePopupComponent, 'switchToJoyfulTheme').getMockImplementation();
        mockPopoverController.dismiss = jest.fn();
        const mHeader = {getAttribute: jest.fn(() => 'DEFAULT')};
        jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
            switch (selector) {
                case 'html':
                    return mHeader as any;
            }
        });
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
        mockAppHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
        // act
        joyfulThemePopupComponent.closePopover();
        // assert
        expect(joyfulThemePopupComponent.switchToJoyfulTheme).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should switch to new theme and dismiss popup', () => {
        // arrange
        // arrange
        jest.spyOn(joyfulThemePopupComponent, 'switchToJoyfulTheme').getMockImplementation();
        mockPopoverController.dismiss = jest.fn();
        const mHeader = {getAttribute: jest.fn(() => 'JOYFUL')};
        jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
            switch (selector) {
                case 'html':
                    return mHeader as any;
            }
        });
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
        mockAppHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
        // act
        joyfulThemePopupComponent.switchToNewTheme();
        // assert
        expect(joyfulThemePopupComponent.switchToJoyfulTheme).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });
});
