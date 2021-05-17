import { SearchFilterPage } from './search-filter.page';
import { ModalController } from '@ionic/angular';
import { ContentService, FrameworkService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { FilterFormConfigMapper } from '@app/app/search-filter/filter-form-config-mapper';
import { of } from 'rxjs';

describe('SearchFilterPage', () => {
    let searchFilterPage: SearchFilterPage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {
        searchOrganization: jest.fn(() => of([]))
    };
    const mockFilterFormConfigMapper: Partial<FilterFormConfigMapper> = {};
    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        searchFilterPage = new SearchFilterPage(
            mockContentService as ContentService,
            mockFrameworkService as FrameworkService,
            mockModalController as ModalController,
            mockCommonUtilService as CommonUtilService,
            mockFilterFormConfigMapper as FilterFormConfigMapper
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of filterFormPage', () => {
        expect(searchFilterPage).toBeTruthy();
    });

    it('should reset filter', (done) => {
        // arrange
        const filterCriteria = { facetFilters: [{ name: 'channel',  values: ['sample-value'] }] };
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return filterCriteria;
        });
        const dismissFn = jest.fn(() => Promise.resolve());
        const presentFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        mockFrameworkService.searchOrganization = jest.fn(() => of([]));
        mockFilterFormConfigMapper.map = jest.fn(() => []);
        // act
        searchFilterPage.resetFilter(false).then(() => {
            // assert
            expect(mockFilterFormConfigMapper.map).toHaveBeenCalled();
            done();
        });
    });

    it('should dismiss modalController', () => {
        // arrange
        mockModalController.dismiss = jest.fn(() => { }) as any;
        // act
        searchFilterPage.applyFilter();
        // assert
        expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should cacel modalController', () => {
        // arrange
        mockModalController.dismiss = jest.fn(() => { }) as any;
        // act
        searchFilterPage.cancel();
        // assert
        expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        it('should invoked resetFilter', () => {
            jest.spyOn(searchFilterPage, 'resetFilter').mockImplementation();
            searchFilterPage.ngOnInit();
            expect(searchFilterPage.resetFilter).toHaveBeenCalled();
        });
    });
});
