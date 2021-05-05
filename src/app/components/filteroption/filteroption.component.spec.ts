import { FilteroptionComponent } from "./filteroption.component";
import { NavParams, PopoverController, Platform } from "@ionic/angular";
import { TelemetryGeneratorService } from "@app/services/telemetry-generator.service";
import { mockFacets, mockFacetsBoard } from "../../page-filter/page-filter-options/page-filter-options.spec.data";
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId,
} from "@app/services/telemetry-constants";

describe("FilteroptionComponent", () => {
  let filteroptionComponent: FilteroptionComponent;
  const mockNavParams: Partial<NavParams> = {
    get: jest.fn((arg) => {
      let value;
      switch (arg) {
        case "facets":
          value = mockFacetsBoard;
          break;
      }
      return value;
    }),
  };

  const mockPopCtrl: Partial<PopoverController> = {};
  const mockPlatform: Partial<Platform> = {
  };
  let subscribeWithPriorityCallback;
    const mockBackBtnFunc = { unsubscribe: jest.fn() };
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
      subscribeWithPriority: subscribeWithPriorityData,
  } as any;



  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

  beforeAll(() => {
    filteroptionComponent = new FilteroptionComponent(
      mockNavParams as NavParams,
      mockPopCtrl as PopoverController,
      mockPlatform as Platform,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an instance of FilteroptionComponent", () => {
    expect(filteroptionComponent).toBeTruthy();
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe', () => {
        // act
        filteroptionComponent.ngOnDestroy();
        // assert
        expect(mockBackBtnFunc.unsubscribe).toBeCalled();
    });
  });


  describe("should confirm", () => {

    it("should generate interactTelemetry", () => {
      // arrange
      // const values = new Map();
      // values['option'] = undefined;
      // values['selectedFilter'] = undefined;
      filteroptionComponent.facets = {
        name: 'sample-filter',
        values: [{apply: true}]
      }

      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockPopCtrl.dismiss = jest.fn();
      // act
      filteroptionComponent.confirm();
      // assert
      expect(mockPopCtrl.dismiss).toHaveBeenCalled();
      expect(
        mockTelemetryGeneratorService.generateInteractTelemetry
      ).toHaveBeenCalledWith(
        InteractType.TOUCH,
        InteractSubtype.APPLY_FILTER_CLICKED,
        Environment.HOME,
        'library-search-filter',
        undefined,
        new Map()

      );
    });
  });
});