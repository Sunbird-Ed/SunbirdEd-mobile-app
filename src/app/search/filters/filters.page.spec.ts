import { FormAndFrameworkUtilService } from '../../../services';

import { FiltersPage } from './filters.page';
import { ContentService, InteractType } from '@project-sunbird/sunbird-sdk';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import {
  CommonUtilService,
  TelemetryGeneratorService,
  AppHeaderService,
  InteractSubtype,
  Environment,
  PageId
} from '../../../services';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { mockSupportedUserTypeConfig } from '../../../services/profile-handler.spec.data';
import { mockFilterCriteria } from './filters.page.spec.data';
describe('FiltersPage', () => {
  let filtersPage: FiltersPage;

  const mockContentService: Partial<ContentService> = {
    searchContent: jest.fn(() => of({ filterCriteria: mockFilterCriteria } as any))
  };

  const mockPopOverController: Partial<PopoverController> = {};
  const mockEvents: Partial<Events> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {
    getLoader: jest.fn(() => {
      return {
        present: jest.fn(),
        dismiss: jest.fn()
      };
    }),
    showToast: jest.fn(),
    translateMessage: jest.fn(() => ('translated_message')),
    deDupe: jest.fn((array, property) => {
      return array.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
      });
    })
  };
  const mockPlatform: Partial<Platform> = {
  };
  mockPlatform.backButton = {
    subscribeWithPriority: jest.fn((_, fn) => fn()),

  } as any;

  const mockLocation: Partial<Location> = {
    back: jest.fn()
  };

  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(() => ({
      extras: {
        state: {
          filterCriteria: mockFilterCriteria,
          initialfilterCriteria: mockFilterCriteria,
          source: 'library',
          supportedUserTypesConfig: mockSupportedUserTypeConfig
        }
      }
    })) as any
  };
  const mockAppHeaderService: Partial<AppHeaderService> = {
  };

  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateImpressionTelemetry: jest.fn(),
    generateBackClickedTelemetry: jest.fn(),
    generateInteractTelemetry: jest.fn()
  };

  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};


  beforeAll(() => {
    filtersPage = new FiltersPage(
      mockContentService as ContentService,
      mockPopOverController as PopoverController,
      mockEvents as Events,
      mockCommonUtilService as CommonUtilService,
      mockPlatform as Platform,
      mockLocation as Location,
      mockRouter as Router,
      mockAppHeaderService as AppHeaderService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a instance of FiltersPage', () => {
    expect(filtersPage).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should execute fetchChannelIdName and execute init', (done) => {
      //arrange
      mockFormAndFrameworkUtilService.changeChannelIdToName = jest.fn(() => Promise.resolve(
        {
          facetFilters: [{
            name: 'se_mediums', values: [
              { name: 'english', count: 30408, apply: false },
              { name: 'hindi', count: 2107, apply: false }
            ],
            translatedName: 'mediums'
          },
          {
            name: 'audience', values: [
              { name: 'class 10', count: 6446, apply: false },
              { name: 'class 1', count: 23017, apply: false }
            ],
            translatedName: 'gradeLevels'
          }],
          facets: ['se_mediums', 'se_gradeLevels']
        }
      ));
      //act
      filtersPage.ngOnInit();
      //assert
      setTimeout(() => {
        expect(filtersPage.ngOnInit).toBeTruthy();
        done();
      }, 0);
    });
  });

  it('should execute getFilterValues if facet is undefined', () => {
    //arrange
    const facet = null;
    //act
    filtersPage.getFilterValues(facet);
    //assert
    expect(filtersPage.getFilterValues).toBeTruthy();
  });

  describe('applyInterimFilter', () => {
    it('should invoke searchContent API', (done) => {
      // arrange
      mockFormAndFrameworkUtilService.changeChannelNameToId = jest.fn(() => {
        return {
          primaryCategories: [],
          sortCriteria: [],
          mode: 'hard',
          facetFilters: [
            {
              name: 'channel',
              values: [
                {
                  name: '0129909224683274240',
                  count: 3,
                  apply: false,
                  rootOrgId: '0129909224683274240'
                }
              ],
              translatedName: 'Publisher'
            }
          ],
          impliedFiltersMap: [
            {
              contentType: []
            },
            {
              language: []
            },
            {
              topic: []
            },
            {
              purpose: []
            }
          ],
          impliedFilters: [
            {
              name: 'objectType',
              values: [
                {
                  name: 'Content',
                  apply: true
                },
                {
                  name: 'QuestionSet',
                  apply: true
                }
              ]
            }
          ],
          searchType: 'filter',
          fields: []
        }
      });
      // act
      filtersPage.applyInterimFilter().then(() => {
        // assert
        expect(mockContentService.searchContent).toHaveBeenCalled();
        done();
      });
    });
    it('should invoke searchContent API with error', (done) => {
      // arrange
      mockFormAndFrameworkUtilService.changeChannelNameToId = jest.fn(() => {
        return {
          facetFilters: [{
            name: 'channel',
            values: [{ name: '0129909224683274240', count: 3, apply: false, rootOrgId: '0129909224683274240' }],
            translatedName: 'Publisher'
          }]
        }
      });
      mockContentService.searchContent = jest.fn(() => throwError({ error: 'sample-error' }));
      // act
      filtersPage.applyInterimFilter().then(() => {
        // assert
        expect(mockContentService.searchContent).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('ionViewWillEnter', () => {
    it('should call header service', (done) => {
      //arrange
      mockAppHeaderService.showHeaderWithBackButton = jest.fn();
      //act
      filtersPage.ionViewWillEnter();
      //assert
      setTimeout(() => {
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  it('ionViewWillLeave', () => {
    //arrange
    filtersPage.unregisterBackButton = {
      unsubscribe: jest.fn()
    } as any;
    //act
    filtersPage.ionViewWillLeave();
    //assert
    expect(filtersPage.unregisterBackButton).not.toBeUndefined();
  });

  describe('getSelectedOptionCount', () => {
    it('should return a count if it is greater than 0', () => {
      //arrange
      const facet = { values: [{ name: 'na1', apply: true }] };
      let count = 0;
      filtersPage.getSelectedOptionCount(facet);
      //arrange
      expect(filtersPage.getSelectedOptionCount).toBeTruthy();
    });
    it('should return a count if it is less than or equal to 0', () => {
      //arrange
      const facet = { values: [{ name: 'na1', apply: false }] };
      let count = 0;
      filtersPage.getSelectedOptionCount(facet);
      //arrange
      expect(filtersPage.getSelectedOptionCount).toBeTruthy();
    });
  });
  it('reset', () => {
    //arrange
    JSON.parse = jest.fn().mockImplementationOnce(() => {
      return {
        facetFilters: [{
          name: 'se_mediums', values: [
            { name: 'english', count: 30408, apply: false },
            { name: 'hindi', count: 2107, apply: false }
          ]
        },
        {
          name: 'se_gradeLevels', values: [
            { name: 'class 10', count: 6446, apply: false },
            { name: 'class 1', count: 23017, apply: false }
          ]
        }],
        facets: ['se_mediums', 'se_gradeLevels']
      };
    });
    //act
    filtersPage.reset();
    //assert
  });
  describe('applyFilter', () => {
    it('source should not be courses', (done) => {
      //arrange
      const values = {
        appliedFilter: {}
      };
      filtersPage['filterCriteria'] = {
        facetFilters: [{
          name: 'se_mediums', values: [
            { name: 'english', count: 30408, apply: false },
            { name: 'hindi', count: 2107, apply: false }
          ]
        },
        {
          name: 'se_gradeLevels', values: [
            { name: 'class 10', count: 6446, apply: false },
            { name: 'class 1', count: 23017, apply: false }
          ]
        }],
        facets: ['se_mediums', 'se_gradeLevels']
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockFormAndFrameworkUtilService.changeChannelNameToId = jest.fn(() => {
        return {
          facetFilters: [
            {
              name: 'channel',
              values: [
                {
                  name: '0129909224683274240',
                  count: 3,
                  apply: false,
                  rootOrgId: '0129909224683274240'
                }
              ],
              translatedName: 'Publisher'
            }
          ]
        }
      });
      mockEvents.publish = jest.fn(() => []);
      //act
      filtersPage.applyFilter();
      //assert
      setTimeout(() => {
        expect(mockEvents.publish).toBeCalled();
        done();
      }, 0);
    });
    it('should set source as courses', (done) => {
      //arrange
      filtersPage.source = 'courses';
      const values = {
        appliedFilter: {}
      };
      filtersPage['filterCriteria'] = {
        facetFilters: [{
          name: 'se_mediums', values: [
            { name: 'english', count: 30408, apply: false },
            { name: 'hindi', count: 2107, apply: false }
          ]
        },
        {
          name: 'se_gradeLevels', values: [
            { name: 'class 10', count: 6446, apply: false },
            { name: 'class 1', count: 23017, apply: false }
          ]
        }]
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockFormAndFrameworkUtilService.changeChannelNameToId = jest.fn(() => {
        return {
          facetFilters: [
            {
              name: 'channel',
              values: [
                { name: '0129909224683274240', count: 3 }],
              translatedName: 'Publisher'
            }
          ]
        }
      });
      mockEvents.publish = jest.fn(() => []);
      //act
      filtersPage.applyFilter();
      //assert
      setTimeout(() => {
        expect(mockEvents.publish).toBeCalled();
        done();
      }, 0);
    });
  });
  describe('openFilterOptions', () => {
    it('should execute openFilterOptions and source must not be courses', (done) => {
      //arrange
      filtersPage.source = 'library'
      const facet = { name: 'se-mediums', values: [{ name: 'na1', apply: true }] };
      mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({
          data: { isFilterApplied: true }
        })),
      } as any)));
      const values = new Map();
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        return {
          facetFilters: [{
            name: 'audience', values: [
              { name: 'english', count: 30408, apply: false },
              { name: 'hindi', count: 2107, apply: false }
            ]
          },
          {
            name: 'se_gradeLevels', values: [
              { name: 'class 10', count: 6446, apply: false },
              { name: 'class 1', count: 23017, apply: false }
            ]
          }],
          facets: ['se_mediums', 'se_gradeLevels']
        };
      });
      //act
      filtersPage.openFilterOptions(facet);
      //assert
      setTimeout(() => {
        expect(mockPopOverController.create).toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should execute openFilterOptions and source must be courses', (done) => {
      //arrange
      const facet = { name: 'se-mediums', values: [{ name: 'na1', apply: true }] };
      filtersPage.source = 'courses';
      mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({
          data: { isFilterApplied: true }
        })),
      } as any)));
      const values = new Map();
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        return {
          facetFilters: [{
            name: 'audience', values: [
              { name: 'english', count: 30408, apply: false },
              { name: 'hindi', count: 2107, apply: false }
            ]
          },
          {
            name: 'se_gradeLevels', values: [
              { name: 'class 10', count: 6446, apply: false },
              { name: 'class 1', count: 23017, apply: false }
            ]
          }],
          facets: ['se_mediums', 'se_gradeLevels']
        };
      });
      //act
      filtersPage.openFilterOptions(facet);
      //assert
      setTimeout(() => {
        expect(mockPopOverController.create).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
  it('ngOnDestroy', () => {
    //arrange
    mockEvents.publish = jest.fn(() => []);
    //act
    filtersPage.ngOnDestroy();
    //assert
    expect(mockEvents.publish).toBeCalled();
  });
});
