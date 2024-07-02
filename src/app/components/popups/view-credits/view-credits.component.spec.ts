import { ViewCreditsComponent } from './view-credits.component';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { PageId, InteractSubtype, Environment, InteractType } from '../../../../services/telemetry-constants';

describe('ViewCreditsComponent', () => {
    let viewCreditsComponent: ViewCreditsComponent;

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        identifier: 'do_123',
                        pkgVersion: '1',
                        contentType: 'Resource',
                        primaryCategory: 'Learning Resource',
                        creator: 'SAMPLE_CREATOR',
                        creators: 'SAMPLE_CREATORS'
                    };
                    break;
                case 'pageId':
                    value = PageId.CONTENT_DETAIL;
                    break;
                case 'rollUp':
                    value = { l1: 'do_1', l2: 'do_2'};
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    const subscribeWithPriorityData = jest.fn((_, fn) => fn());
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData
    } as any;

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };


    beforeAll(() => {
        viewCreditsComponent = new ViewCreditsComponent(
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockPopOverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of ViewCreditsComponent', () => {
        expect(viewCreditsComponent).toBeTruthy();
    });

    it('should dismiss the popup and unsubscribe back Function', () => {
        // arrange
        viewCreditsComponent.backButtonFunc = {
            unsubscribe: jest.fn()
        };
        // act
        viewCreditsComponent.ngOnInit();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
        // expect(viewCreditsComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();

    });

    it('should generate INTERACT telemetry on ionViewDidload', () => {
        // arrange
        // act
        viewCreditsComponent.ionViewDidLoad();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
            InteractSubtype.CREDITS_CLICKED,
            Environment.HOME,
            PageId.CONTENT_DETAIL,
            { id: 'do_123', type: 'Learning Resource', version: '1'},
            undefined,
            {l1: 'do_1', l2: 'do_2'},
            undefined);
    });

    it('should dissmiss popup on cancel', () => {
        // arrange
        viewCreditsComponent.backButtonFunc = {
            unsubscribe: jest.fn()
        };
        // act
        viewCreditsComponent.cancel();
        // assert
        expect(mockPopOverController.dismiss).toHaveBeenCalled();
        setTimeout(() => {
            expect(viewCreditsComponent.backButtonFunc.unsubscribe).toHaveBeenCalled();
        }, 0);
    });

    it('should dissmiss popup on cancel', () => {
        // arrange
        viewCreditsComponent.backButtonFunc = undefined;
        // act
        viewCreditsComponent.cancel();
        // assert
        expect(viewCreditsComponent.backButtonFunc).toBeFalsy();
    });

    it('should return merged properties ', () => {
        // arrange
        // act
        // assert
        expect(viewCreditsComponent.mergeProperties(['creator', 'creators'])).toEqual('SAMPLE_CREATOR, SAMPLE_CREATORS');
    });

});
