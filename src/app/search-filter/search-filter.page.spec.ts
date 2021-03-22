import { SearchFilterPage } from './search-filter.page';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ContentService, ContentSearchCriteria, ContentSearchResult, SearchType } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { FilterFormConfigMapper } from '@app/app/search-filter/filter-form-config-mapper';
import { Location, TitleCasePipe } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('SearchFilterPage', () => {
    let searchFilterPage: SearchFilterPage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockFilterFormConfigMapper: Partial<FilterFormConfigMapper> = {};
    const mockLocation: Partial<Location> = {};
    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        searchFilterPage = new SearchFilterPage(
            mockContentService as ContentService,
            mockRouter as Router,
            mockLocation as Location,
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

    it('should reset filter', () => {
        // arrange
        const filterCriteria = { facetFilters: [{ name: 'sample-name' }, { values: 'sample-value' }] };
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return filterCriteria;
        });
        mockFilterFormConfigMapper.map = jest.fn(() => []);
        // act
        searchFilterPage.resetFilter();
        // assert
        expect(mockFilterFormConfigMapper.map).toHaveBeenCalled();
    });

    it('should dismiss modalController', () => {
        // arrange
        mockModalController.dismiss = jest.fn(() => {}) as any;
        // act
        searchFilterPage.applyFilter();
        // assert
        expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should cacel modalController', () => {
        // arrange
        mockModalController.dismiss = jest.fn(() => {}) as any;
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
