import { SearchFilterPage } from './search-filter.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../services';
import { FilterFormConfigMapper } from '../../app/search-filter/filter-form-config-mapper';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { Environment, FormAndFrameworkUtilService, InteractSubtype, PageId, SearchFilterService, TelemetryGeneratorService } from '../../services';
import { FilterCriteriaData } from './search-filter.page.spec.data';
import { InteractType } from '@project-sunbird/sunbird-sdk';

describe('SearchFilterPage', () => {
    let searchFilterPage: SearchFilterPage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
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
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        changeChannelIdToName: jest.fn(() => Promise.resolve(FilterCriteriaData)),
        changeChannelNameToId: jest.fn(() => Promise.resolve(FilterCriteriaData))
    };
    const mockSearchFilterService: Partial<SearchFilterService> = {
        getFacetFormAPIConfig: jest.fn(() => Promise.resolve('string' as any))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFilterFormConfigMapper: Partial<FilterFormConfigMapper> = {};
    window.console.error = jest.fn()

    JSON.parse = jest.fn().mockImplementationOnce(() => {
        return FilterCriteriaData;
    });

    beforeAll(() => {
        searchFilterPage = new SearchFilterPage(
            mockContentService as ContentService,
            mockActivatedRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockModalController as ModalController,
            mockCommonUtilService as CommonUtilService,
            mockFilterFormConfigMapper as FilterFormConfigMapper,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockSearchFilterService as SearchFilterService,
            mockTelemetryGeneratorService as TelemetryGeneratorService
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
        it('should initialise page with appropriate configurations', (done) => {
            // arrange
            searchFilterPage['isPageLoadedFirstTime'] = true;
            searchFilterPage['initialFilterCriteria'] = {
                facetFilters: [
                    {
                        name: 'se_mediums', values: [
                            {
                                name: 'english', count: 30408, apply: false, values: [{
                                    name: 'english'
                                }]
                            },
                            {
                                name: 'hindi', count: 2107, apply: false, values: [{
                                    name: 'hindi'
                                }]
                            }
                        ]
                    },
                    {
                        name: 'se_gradeLevels', values: [
                            {
                                name: 'class 10', count: 6446, apply: false, values: [{
                                    name: 'class 10'
                                }]
                            },
                            {
                                name: 'class 1', count: 23017, apply: false, values: [{
                                    name: 'class 1'
                                }]
                            }
                        ]
                    }
                ],
                facets: ['se_mediums', 'se_gradeLevels']
            };
            mockFilterFormConfigMapper.map = jest.fn(() => Promise.resolve({
                config: [{
                    facet: 'board',
                    type: 'dropdown',
                }],
                defaults: {
                    values: ['english', 'hindi']
                }
            }))
            mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.resolve(searchFilterPage['initialFilterCriteria']));
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchFilterPage['initialFilterCriteria'];
            });
            mockSearchFilterService.getFacetFormAPIConfig = jest.fn(() => Promise.resolve('string' as any));
            // act
            searchFilterPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.changeChannelIdToName).toHaveBeenCalled();
                expect(searchFilterPage.baseSearchFilter).toEqual({
                    values: ['english', 'hindi']
                });
                expect(searchFilterPage.filterFormTemplateConfig).toEqual([
                    {
                        facet: 'board',
                        type: 'dropdown',
                    }
                ]);
                done();
            }, 0);
        });

        it('should handle else case if filterFormTemplateConfig is present', (done) => {
            // arrange
            searchFilterPage['isPageLoadedFirstTime'] = true;
            searchFilterPage['initialFilterCriteria'] = {
                facetFilters: [
                    {
                        name: 'se_mediums', values: [
                            {
                                name: 'english', count: 30408, apply: false, values: [{
                                    name: 'english'
                                }]
                            },
                            {
                                name: 'hindi', count: 2107, apply: false, values: [{
                                    name: 'hindi'
                                }]
                            }
                        ]
                    },
                    {
                        name: 'se_gradeLevels', values: [
                            {
                                name: 'class 10', count: 6446, apply: false, values: [{
                                    name: 'class 10'
                                }]
                            },
                            {
                                name: 'class 1', count: 23017, apply: false, values: [{
                                    name: 'class 1'
                                }]
                            }
                        ]
                    }
                ],
                facets: ['se_mediums', 'se_gradeLevels']
            };
            mockFilterFormConfigMapper.map = jest.fn(() => Promise.resolve({
                config: [{
                    facet: 'board',
                    type: 'dropdown',
                }],
                defaults: {
                    values: ['english', 'hindi']
                }
            }))
            mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.resolve(searchFilterPage['initialFilterCriteria']));
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchFilterPage['initialFilterCriteria'];
            });
            mockSearchFilterService.getFacetFormAPIConfig = jest.fn(() => Promise.resolve('string' as any));
            // act
            searchFilterPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.changeChannelIdToName).toHaveBeenCalled();
                expect(searchFilterPage.baseSearchFilter).toEqual({
                    values: ['english', 'hindi']
                });
                expect(searchFilterPage.filterFormTemplateConfig).toEqual([
                    {
                        facet: 'board',
                        type: 'dropdown',
                    }
                ]);
                done();
            }, 0);
        });
    });

    describe('resetFilter', () => {
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

        it('should delegate form reset to SbSearchFacetFilterComponent', () => {
            // arrange
            searchFilterPage.searchFilterComponent = undefined;
            // act
            searchFilterPage.resetFilter();
            // assert
        });
    });

    describe('when a selection is made', () => {
        it('should change isPageLoadedFirstTime to false if it is true', () => {
            // arrange
            const sampleFilterCriteria = FilterCriteriaData;
            searchFilterPage['initialFilterCriteria'] = sampleFilterCriteria;
            mockContentService.searchContent = jest.fn(() => of({ filterCriteria: sampleFilterCriteria }));
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            // act
            searchFilterPage.valueChanged({ board: 'sample_board_2', medium: ['sample_medium_2'] });
            //assert
            setTimeout(() => {
                expect(mockContentService.searchContent).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            });
        });
        it('should not do anything if the event return false', () => {
            //arrange
            const event = false;
            //act
            searchFilterPage.valueChanged(event);
            //assert
            expect(!event).toBe(true);
        });
        it('should call refresh form and selection might be of type string', (done) => {
            //arrange
            const event = {
                se_mediums: [{ name: 'na1' }],
                se_gradeLevels: 'se_gradeLevels'
            };
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchFilterPage['appliedFilterCriteria'];
            });
            const sampleFilterCriteria = FilterCriteriaData;
            searchFilterPage['initialFilterCriteria'] = sampleFilterCriteria;
            searchFilterPage['isPageLoadedFirstTime'] = false;
            mockContentService.searchContent = jest.fn(() => of({ filterCriteria: sampleFilterCriteria }));
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.resolve({
                filterCriteria: {
                    facetFilters: [
                        { name: 'board', values: [Array] },
                        { name: 'medium', values: [Array] }
                    ]
                }
            }));
            mockSearchFilterService.reformFilterValues = jest.fn(() => Promise.resolve([
                { name: 'board', values: [Array] },
                { name: 'medium', values: [Array] }
            ]))
            //act
            searchFilterPage.valueChanged(event);
            //assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.changeChannelIdToName).toHaveBeenCalled();
                expect(searchFilterPage['isPageLoadedFirstTime']).toBe(false);
                expect(mockContentService.searchContent).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call refresh form and selection might not be of type string', (done) => {
            //arrange
            const event = {
                name: 'se_mediums',
                values: 'se_gradeLevels'
            };
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchFilterPage['initialFilterCriteria'] = {
                    facetFilters: [
                        {
                            name: 'se_mediums', values: [
                                {
                                    name: 'english', count: 30408, apply: false, values: [{
                                        name: 'english'
                                    }]
                                },
                                {
                                    name: 'hindi', count: 2107, apply: false, values: [{
                                        name: 'hindi'
                                    }]
                                }
                            ]
                        },
                        {
                            name: 'se_gradeLevels', values: [
                                {
                                    name: 'class 10', count: 6446, apply: false, values: [{
                                        name: 'class 10'
                                    }]
                                },
                                {
                                    name: 'class 1', count: 23017, apply: false, values: [{
                                        name: 'class 1'
                                    }]
                                }
                            ]
                        }
                    ],
                    facets: ['se_mediums', 'se_gradeLevels']
                };
            });
            const sampleFilterCriteria = FilterCriteriaData;
            searchFilterPage['initialFilterCriteria'] = sampleFilterCriteria;
            searchFilterPage['isPageLoadedFirstTime'] = false;
            mockContentService.searchContent = jest.fn(() => of({ filterCriteria: sampleFilterCriteria }));
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.reject('error message'));
            mockSearchFilterService.reformFilterValues = jest.fn(() => Promise.resolve([
                { name: 'board', values: [Array] },
                { name: 'medium', values: [Array] }
            ]))
            //act
            searchFilterPage.valueChanged(event);
            //assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.changeChannelIdToName).toHaveBeenCalled();
                expect(searchFilterPage['isPageLoadedFirstTime']).toBe(false);
                expect(mockContentService.searchContent).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                done()
            }, 0);
        });
        it('should call refresh form and selection might not be of type string, if no facet filters', (done) => {
            //arrange
            const event = {
                name: 'se_mediums',
                values: 'se_gradeLevels'
            };
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return searchFilterPage['initialFilterCriteria'] = {
                    facetFilters: [
                        {
                            name: 'se_mediums', values: [
                                {
                                    name: 'english', count: 30408, apply: false, values: [{
                                        name: 'english'
                                    }]
                                },
                                {
                                    name: 'hindi', count: 2107, apply: false, values: [{
                                        name: 'hindi'
                                    }]
                                }
                            ]
                        },
                        {
                            name: 'se_gradeLevels', values: [
                                {
                                    name: 'class 10', count: 6446, apply: false, values: [{
                                        name: 'class 10'
                                    }]
                                },
                                {
                                    name: 'class 1', count: 23017, apply: false, values: [{
                                        name: 'class 1'
                                    }]
                                }
                            ]
                        }
                    ],
                    facets: ['se_mediums', 'se_gradeLevels']
                };
            });
            const sampleFilterCriteria = {};
            searchFilterPage['initialFilterCriteria'] = sampleFilterCriteria;
            searchFilterPage['isPageLoadedFirstTime'] = false;
            mockContentService.searchContent = jest.fn(() => of({ filterCriteria: sampleFilterCriteria }));
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.reject('error message'));
            mockSearchFilterService.reformFilterValues = jest.fn(() => Promise.resolve([
                { name: 'board', values: [Array] },
                { name: 'medium', values: [Array] }
            ]))
            //act
            searchFilterPage.valueChanged(event);
            //assert
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.changeChannelIdToName).toHaveBeenCalled();
                expect(searchFilterPage['isPageLoadedFirstTime']).toBe(false);
                expect(mockContentService.searchContent).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('when form is applied', () => {
        it('should dismiss current modal return selections', () => {
            // arrange
            mockModalController.dismiss = jest.fn(() => { }) as any;
            searchFilterPage['initialFilterCriteria'] = FilterCriteriaData;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            searchFilterPage.applyFilter();
            // assert
            setTimeout(() => {
                expect(mockModalController.dismiss).toHaveBeenCalledWith(expect.objectContaining({
                    appliedFilterCriteria: FilterCriteriaData
                }));
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                    InteractSubtype.APPLY_FILTER_CLICKED,
                    Environment.HOME,
                    PageId.COURSE_SEARCH_FILTER,
                    undefined);
            }, 0);
        });
    });


    describe('when form is cancelled', () => {
        it('should dismiss current modal', () => {
            // arrange
            mockModalController.dismiss = jest.fn(() => { }) as any;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            searchFilterPage.cancel();
            // assert
            setTimeout(() => {
                return Promise.resolve(
                    expect(mockModalController.dismiss).toHaveBeenCalled()
                )
            });
        });
    });
});
