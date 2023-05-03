import {SbTutorialPopupComponent} from '@app/app/components/popups/sb-tutorial-popup/sb-tutorial-popup.component';
import {NavParams, PopoverController} from '@ionic/angular';
import {CommonUtilService} from '@app/services/common-util.service';
import {TelemetryGeneratorService} from '@app/services/telemetry-generator.service';
import {Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, PageId} from '@app/services/telemetry-constants';

describe('SbTutorialComponentPopup', () => {
    let sbTutorialPopupComponent: SbTutorialPopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockNavParams: Partial<NavParams> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    beforeAll(() => {
        sbTutorialPopupComponent = new SbTutorialPopupComponent(
            mockPopoverCtrl as PopoverController,
            mockNavParams as NavParams,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService
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
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockNavParams.get = jest.fn(() => 'Sunbird');
        // act
        sbTutorialPopupComponent.ngOnInit();
        // assert
        expect(sbTutorialPopupComponent.appName).toEqual('Sunbird');
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            ImpressionSubtype.TUTORIAL_WALKTHROUGH,
            PageId.LIBRARY,
            Environment.HOME
        );
        setTimeout(() => {
            expect(sbTutorialPopupComponent.isPopoverPresent).toBe(true);
            done();
        }, 2000);
    });

    it('should handle dismiss popover when onContinueClicked is true ', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbTutorialPopupComponent.closePopover(true);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'tutorial-continue-clicked',
            Environment.HOME,
            PageId.APP_TUTORIAL_POPUP
        );
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });
    it('should handle dismiss popover when onContinueClicked is false ', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbTutorialPopupComponent.closePopover(false);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CLOSE_CLICKED,
            Environment.HOME,
            PageId.APP_TUTORIAL_POPUP
        );
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

});
