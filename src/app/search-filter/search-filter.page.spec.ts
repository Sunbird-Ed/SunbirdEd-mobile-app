import { SearchFilterPage } from './search-filter.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ContentService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { FilterFormConfigMapper } from '@app/app/search-filter/filter-form-config-mapper';
import { Location } from '@angular/common';
import {of} from 'rxjs';
import { FormAndFrameworkUtilService } from '../../services';
import { FilterCriteriaData } from './search-filter.page.spec.data';

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
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        changeChannelIdToName: jest.fn(()=>Promise.resolve(FilterCriteriaData)),
        changeChannelNameToId: jest.fn(()=>Promise.resolve(FilterCriteriaData))
    };

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
            new FilterFormConfigMapper(mockCommonUtilService),
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
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
            searchFilterPage['initialFilterCriteria'] = FilterCriteriaData;
            
            // act
            searchFilterPage.ngOnInit();
            
            // assert
            setTimeout(() => {
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
            }, 0);
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
            searchFilterPage['initialFilterCriteria'] = FilterCriteriaData;

            // act
            searchFilterPage.ngOnInit();
            searchFilterPage.applyFilter();
            // assert
            setTimeout(() => {
                expect(mockModalController.dismiss).toHaveBeenCalledWith(expect.objectContaining({
                    appliedFilterCriteria: FilterCriteriaData
                }));
            }, 0);
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
            const sampleFilterCriteria = FilterCriteriaData;
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
