import { PopoverController, NavParams } from '@ionic/angular';
import { NewExperiencePopupComponent } from './new-experience-popup.component';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Events } from '../../../../util/events';
import { TelemetryGeneratorService, CommonUtilService, InteractSubtype, PageId } from '../../../../services';
import { of } from 'rxjs';
import { PreferenceKey, SwitchableTabsConfig } from '../../../app.constant';

describe('NewExperiencePopupComponent', () => {
    let newExperiencePopupComponent: NewExperiencePopupComponent;
    const mockEvents: Partial<Events> = {};
    const mockNavParams: Partial<NavParams> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreference: Partial<SharedPreferences> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        newExperiencePopupComponent = new NewExperiencePopupComponent(
            mockPreference as SharedPreferences,
            mockPopoverCtrl as PopoverController,
            mockNavParams as NavParams,
            mockEvents as Events,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance for newExperiencePopupComponent', () => {
        expect(newExperiencePopupComponent).toBeTruthy();
    });

    it('should open popup', () => {
        mockNavParams.get = jest.fn(() => 'sample-app') as any;
        newExperiencePopupComponent.ngOnInit();
    });

    it('should close the popup', (done) => {
        // arrange
        mockPreference.getString = jest.fn(() => of('sample-userType'));
        mockPreference.getBoolean = jest.fn(() => of(true));
        mockPreference.putString = jest.fn(() => of(undefined));
        mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
        mockTelemetryGeneratorService.generateNewExprienceSwitchTelemetry = jest.fn();
        // act
        newExperiencePopupComponent.closePopover();
        // assert
        setTimeout(() => {
            expect(mockPreference.putString).toHaveBeenCalledWith(
                PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
                SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG);
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should switch to new experience theme', (done) => {
        // arrange
        mockPreference.getString = jest.fn(() => of('sample-userType'));
        mockPreference.getBoolean = jest.fn(() => of(true));
        mockTelemetryGeneratorService.generateNewExprienceSwitchTelemetry = jest.fn();
        mockPreference.putString = jest.fn(() => of(undefined));
        mockEvents.publish = jest.fn(() => []);
        mockPreference.putBoolean = jest.fn(() => of(true));
        mockCommonUtilService.populateGlobalCData = jest.fn(() => Promise.resolve());
        mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
        // act
        newExperiencePopupComponent.switchToNewTheme();
        // assert
        setTimeout(() => {
            expect(mockPreference.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
            expect(mockPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.IS_NEW_USER);
            expect(mockTelemetryGeneratorService.generateNewExprienceSwitchTelemetry).toHaveBeenCalledWith(
                PageId.NEW_EXPERIENCE_POPUP,
                InteractSubtype.OPTED_IN,
                {
                    userType: 'sample-userType',
                    isNewUser: true
                }
            );
            expect(mockPreference.putString).toHaveBeenCalledWith(
                PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
                SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG
            );
            expect(mockEvents.publish).toHaveBeenCalled();
            expect(mockPreference.putBoolean).toHaveBeenCalledWith(PreferenceKey.IS_NEW_USER, false);
            expect(mockCommonUtilService.populateGlobalCData).toHaveBeenCalled();
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });
});
