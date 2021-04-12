import { SearchFilterPage } from './search-filter.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ContentService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { FilterFormConfigMapper } from '@app/app/search-filter/filter-form-config-mapper';
import { Location } from '@angular/common';
import {of} from 'rxjs';

describe('SearchFilterPage', () => {
    let searchFilterPage: SearchFilterPage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        navigate: () => Promise.resolve(),
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
    };
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: () => ({
            present: () => Promise.resolve(),
            dismiss: () => Promise.resolve(),
        }),
        translateMessage: (arg) => arg
    };
    const mockContentService: Partial<ContentService> = {};
    const mockLocation: Partial<Location> = {};
    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        searchFilterPage = new SearchFilterPage(
            mockContentService as ContentService,
            mockActivatedRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockModalController as ModalController,
            mockCommonUtilService as CommonUtilService,
            new FilterFormConfigMapper(mockCommonUtilService)
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of filterFormPage', () => {
        expect(searchFilterPage).toBeTruthy();
    });

    describe('when loaded', () => {
        it('should initialise page with appropriate configurations', () => {
            // arrange
            searchFilterPage['initialFilterCriteria'] = {
                facetFilters: [
                    {
                        name: 'board',
                        values: [ { name: 'sample_board_1', apply: true }, { name: 'sample_board_2', apply: false } ]
                    },
                    {
                        name: 'medium',
                        values: [ { name: 'sample_medium_1', apply: true }, { name: 'sample_medium_2', apply: false } ]
                    },
                    {
                        name: 'gradeLevel',
                        values: [ { name: 'sample_gradeLevel_1', apply: true }, { name: 'sample_gradeLevel_2', apply: false } ]
                    },
                    {
                        name: 'subject',
                        values: [ { name: 'sample_subject_1', apply: true }, { name: 'sample_subject_2', apply: false } ]
                    },
                    {
                        name: 'mimeType',
                        values: [ { name: 'sample_mimeType_1', apply: true }, { name: 'sample_mimeType_2', apply: false } ]
                    },
                    {
                        name: 'primaryCategory',
                        values: [ { name: 'sample_primaryCategory_1', apply: true }, { name: 'sample_primaryCategory_2', apply: false } ]
                    },
                    {
                        name: 'audience',
                        values: [ { name: 'sample_audience_1', apply: true }, { name: 'sample_audience_2', apply: false } ]
                    }
                ]
            };
            
            // act
            searchFilterPage.ngOnInit();
            
            // assert
            expect(searchFilterPage.baseSearchFilter).toEqual({
                board: 'sample_board_1',
                medium: ['sample_medium_1'],
                gradeLevel: ['sample_gradeLevel_1'],
                subject: ['sample_subject_1'],
                mimeType: ['sample_mimeType_1'],
                primaryCategory: ['sample_primaryCategory_1'],
                audience: ['sample_audience_1'],
            });
            expect(searchFilterPage.filterFormTemplateConfig).toEqual([
                expect.objectContaining({ facet: 'board' }),
                expect.objectContaining({ facet: 'medium' }),
                expect.objectContaining({ facet: 'gradeLevel' }),
                expect.objectContaining({ facet: 'subject' }),
                expect.objectContaining({ facet: 'mimeType' }),
                expect.objectContaining({ facet: 'primaryCategory' }),
                expect.objectContaining({ facet: 'audience' }),
            ]);
        });
    });

    describe('when form is reset', () => {
        it('should delegate form reset to SbSearchFacetFilterComponent', () => {
            // arrange
            searchFilterPage.searchFilterComponent = {
                resetFilter: jest.fn()
            };

            // act
            searchFilterPage.resetFilter();

            // assert
            expect(searchFilterPage.searchFilterComponent.resetFilter).toHaveBeenCalled();
        });
    });

    describe('when form is applied', () => {
        it('should dismiss current modal return selections', () => {
            // arrange
            mockModalController.dismiss = jest.fn(() => {}) as any;
            searchFilterPage['initialFilterCriteria'] = {
                facetFilters: [
                    {
                        name: 'board',
                        values: [ { name: 'sample_board_1', apply: true }, { name: 'sample_board_2', apply: false } ]
                    },
                    {
                        name: 'medium',
                        values: [ { name: 'sample_medium_1', apply: true }, { name: 'sample_medium_2', apply: false } ]
                    }
                ]
            };

            // act
            searchFilterPage.ngOnInit();
            searchFilterPage.applyFilter();
            // assert
            expect(mockModalController.dismiss).toHaveBeenCalledWith(expect.objectContaining({
                appliedFilterCriteria: {
                    facetFilters: [
                        {
                            name: 'board',
                            values: [ { name: 'sample_board_1', apply: true }, { name: 'sample_board_2', apply: false } ]
                        },
                        {
                            name: 'medium',
                            values: [ { name: 'sample_medium_1', apply: true }, { name: 'sample_medium_2', apply: false } ]
                        }
                    ]
                }
            }));
        });
    });

    describe('when form is cancelled', () => {
        it('should dismiss current modal', (done) => {
            // arrange
            mockModalController.dismiss = jest.fn(() => {}) as any;
            // act
            searchFilterPage.cancel();
            // assert
            setTimeout(() => {
                expect(mockModalController.dismiss).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('when a selection is made', () => {
        it('should refresh form with new facets from search results', (done) => {
            // arrange
            const sampleFilterCriteria = {
                facetFilters: [
                    {
                        name: 'board',
                        values: [ { name: 'sample_board_1', apply: true }, { name: 'sample_board_2', apply: false } ]
                    },
                    {
                        name: 'medium',
                        values: [ { name: 'sample_medium_1', apply: true }, { name: 'sample_medium_2', apply: false } ]
                    }
                ]
            };
            searchFilterPage['initialFilterCriteria'] = sampleFilterCriteria;
            mockContentService.searchContent = jest.fn(() => of({filterCriteria: sampleFilterCriteria}));

            // act
            searchFilterPage.ngOnInit();
            searchFilterPage.valueChanged({
                board: 'sample_board_2',
                medium: [
                    'sample_medium_2'
                ]
            });

            setTimeout(() => {
                expect(mockContentService.searchContent).toHaveBeenCalled();
                done();
            });
        });
    });
});
