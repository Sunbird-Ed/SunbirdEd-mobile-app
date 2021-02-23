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

    describe('onFormInitialize', () => {
        it('should applied required filter', (done) => {
            // arrange
            const formGroup = {
                valueChanges: of({
                    value: ['value-1']
                })
            } as any;
            const searchCriteria: ContentSearchCriteria = {
                limit: 0,
                mode: 'hard',
                searchType: SearchType.FILTER,
                fields: [],
            };
            searchCriteria.facetFilters = [{
                name: 'value',
                values: [{ name: 'sample-name' }]
            }];
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchCriteria;
            });
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.searchContent = jest.fn(() => of({
                filterCriteria: {
                    facetFilters: [{ name: 'sample-name' }, { values: 'sample-value' }]
                }
            }));
            mockFilterFormConfigMapper.map = jest.fn(() => []);
            // act
            searchFilterPage.onFormInitialize(formGroup);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.searchContent).toHaveBeenCalledWith(searchCriteria);
                expect(mockFilterFormConfigMapper.map).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not applied required filter for catch part', (done) => {
            // arrange
            const formGroup = {
                valueChanges: of({
                    value: { closed: true, value: ['sample-value'] }
                })
            } as any;
            const searchCriteria: ContentSearchCriteria = {
                limit: 0,
                mode: 'hard',
                searchType: SearchType.FILTER,
                fields: [],
            };
            searchCriteria.facetFilters = [{
                name: 'value',
                values: [{ name: 'sample-name' }]
            }];
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchCriteria;
            });
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.searchContent = jest.fn(() => throwError({
                filterCriteria: {
                    facetFilters: [{ name: 'sample-name' }, { values: 'sample-value' }]
                }
            }));
            mockFilterFormConfigMapper.map = jest.fn(() => []);
            // act
            searchFilterPage.onFormInitialize(formGroup);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toBeTruthy();
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.searchContent).toHaveBeenCalledWith(searchCriteria);
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ngOnInit', () => {
        it('should invoked resetFilter', () => {
            jest.spyOn(searchFilterPage, 'resetFilter').mockImplementation();
            searchFilterPage.ngOnInit();
            expect(searchFilterPage.resetFilter).toHaveBeenCalled();
        });
    });
});
