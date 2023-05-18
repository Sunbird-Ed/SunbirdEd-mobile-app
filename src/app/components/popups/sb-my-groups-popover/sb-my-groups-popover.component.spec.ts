import { MyGroupsPopoverComponent } from '../../../../app/components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import {
    CommonUtilService,
    Environment, ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '../../../../services';

describe('MyGroupsPopoverComponent', () => {
    let myGroupsPopoverComponent: MyGroupsPopoverComponent;

    const mockPopoverController: Partial<PopoverController> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'title':
                    value = 'mock_title';
                    break;
                case 'body':
                    value = 'mock_body';
                    break;
                case 'buttonText':
                    value = 'mock_button_text';
                    break;
                case 'isFromAddMember':
                    value = true;
                    break;
            }
            return value;
        })
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        myGroupsPopoverComponent = new MyGroupsPopoverComponent(
            mockPopoverController as PopoverController,
            mockNavParams as NavParams,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of myGroupspopoverComponent', () => {
        // act
        expect(myGroupsPopoverComponent).toBeTruthy();
    });

    it('should subscribe to back button ', () => {
        // arrange
        mockPopoverController.dismiss = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        myGroupsPopoverComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;

        // act
        myGroupsPopoverComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(unsubscribeFn).toHaveBeenCalled();
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
        }, 0);
    });

    describe('ionViewWillEnter scenarios', () => {

        it('should get appName and set it and generate telemetry if isFromAddMember returns true', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockNavParams.get = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'isFromAddMember':
                        value = true;
                }
                return value;
            });
            // act
            myGroupsPopoverComponent.ionViewWillEnter();
            // assert
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    ImpressionSubtype.DISPLAY_SUNBIRD_ID_TUTORIAL, PageId.ADD_MEMBER, Environment.GROUP
                );
            }, 0);
        });

        it('should get appName and set it and generate telemetry if isFromAddMember returns false', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
            mockNavParams.get = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'isFromAddMember':
                        value = false;
                }
                return value;
            });
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            myGroupsPopoverComponent.ionViewWillEnter();
            // assert
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    ImpressionSubtype.GROUP_TUTORIAL, PageId.MY_GROUP, Environment.GROUP
                );
            }, 0);
        });
    });

    describe('close function scenarios', () => {
        it('should call interact telemetry and popoverController when close() called upon with true', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPopoverController.dismiss = jest.fn();
            // act
            myGroupsPopoverComponent.close(true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.TUTORIAL_CONTINUE_CLICKED,
                Environment.GROUP,
                PageId.MY_GROUP
            );
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
        });

        it('should call interact telemetry and popoverController when close() called upon with false', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPopoverController.dismiss = jest.fn();
            // act
            myGroupsPopoverComponent.close(false);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CLOSE_CLICKED,
                Environment.GROUP,
                PageId.MY_GROUP
            );
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
        });

        it('should call interact telemetry and popoverController when close() called upon with false and from add member flow', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPopoverController.dismiss = jest.fn();
            myGroupsPopoverComponent.isFromAddMember = true;
            // act
            myGroupsPopoverComponent.close(false);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CLOSE_CLICKED,
                Environment.GROUP,
                PageId.ADD_MEMBER
            );
            expect(mockPopoverController.dismiss).toHaveBeenCalled();
        });
    });

    it('should call close() with true parameters when  getStarted() called upon', () => {
        // arrange
        jest.spyOn(myGroupsPopoverComponent, 'close').mockImplementation();
        // act
        myGroupsPopoverComponent.getStarted();
        // assert
        expect(myGroupsPopoverComponent.close).toHaveBeenCalledWith(true);
    });
});
