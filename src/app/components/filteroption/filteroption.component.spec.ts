import { FilteroptionComponent } from './filteroption.component'
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { Environment, InteractSubtype, PageId } from '../../../services/telemetry-constants';

describe('FilterOptionComponent', () => {
    let filteroptionComponent: FilteroptionComponent;

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'facet':
                    value = {
                        values : {
                            map : jest.fn()
                        }
                    }
                    break;
                case 'source':
                    value = 'source';
                    break;
            }
            return value;
        })
    };
    const mockPopoverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
    };
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn({
            unsubscribe: jest.fn()
        })),
    } as any;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    

    beforeAll(() => {
        filteroptionComponent = new FilteroptionComponent(
            mockNavParams as NavParams,
            mockPopoverController as PopoverController,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService
            
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of filteroptionComponent', () => {
        // act
        expect(filteroptionComponent).toBeTruthy();
    });

        describe('ngOnDestroy', () =>{
            it('should unsubscribe backButtonFunc', () => {
                // arrange
                filteroptionComponent['backButtonFunc'] = {
                    unsubscribe: jest.fn(),
                } as any;
                // act
                filteroptionComponent.ngOnDestroy();
                // assert
                expect(filteroptionComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
            });
        });
        describe('confirm', () =>{
            it('should generate Interact telemetry', () =>{
                //arrange
                const values = new Map();
                values['facet'] = filteroptionComponent.facets.name;
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                //act
                filteroptionComponent.confirm();
                //assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                    InteractSubtype.APPLY_FILTER_CLICKED,
                    Environment.HOME,
                    (filteroptionComponent.source && filteroptionComponent.source.match('courses')) ? PageId.COURSE_SEARCH_FILTER : PageId.LIBRARY_SEARCH_FILTER,
                    undefined,
                    values);
                    expect(mockPopoverController.dismiss).toHaveBeenCalled();
            })
        })
});

    