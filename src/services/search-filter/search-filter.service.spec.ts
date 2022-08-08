import { FormRequest } from '@project-sunbird/sunbird-sdk';
import { throwError } from 'rxjs';
import { OnboardingConfigurationService } from '..';
import { mockOnboardingConfigData } from '../../app/components/discover/discover.page.spec.data';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { SearchFilterService } from './search-filter.service';

describe('SearchFilterService', () => {
    let searchFilterService: SearchFilterService;
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initialOnboardingScreenName: '',
        getAppConfig: jest.fn(() => mockOnboardingConfigData)
    }

    beforeAll(() => {
        searchFilterService = new SearchFilterService(
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockOnboardingConfigurationService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(searchFilterService).toBeTruthy();
    });

    describe('fetchFacetFilterFormConfig', () => {
        it('Should get Form Fields by specifying the subtype', (done) => {
        //arrange
            const subType ="default";
            const formRequest: FormRequest = {action: "get",
            component: "app",
            subType: subType,
            type: "filterConfig"}; 
            mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
                code: 'name',
                default: 'default',
                templateOptions: {
                    hidden: false
                }
            }, {
                code: 'persona',
                templateOptions: {
                    dataSrc: {
                        marker: 'SUPPORTED_PERSONA_LIST',
                        params: {
                            useCase: 'sample-useCase'
                        }
                    },
                    options: {}
                },
                children: {
                    administrator: [
                        {
                            code: 'state',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'STATE_LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                }
                            },
                            validations: [
                                {
                                    type: 'required'
                                }
                            ]
                        }, {
                            code: 'subPersona',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'SUBPERSONA_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }, {
                            code: 'district',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }]
                }
            }]));
            //act
            searchFilterService.fetchFacetFilterFormConfig(subType).then(() => {
            //assert
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(formRequest, 'SAMPLE_CHANNEL_ID');
            done();
        });
    });

    it('Should get Form Fields without specifying the subtype', (done) => {
        //arrange
            const formRequest: FormRequest = {action: "get",
            component: "app",
            subType: 'default',
            type: "filterConfig"}; 
            mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
                code: 'name',
                default: 'default',
                templateOptions: {
                    hidden: false
                }
            }, {
                code: 'persona',
                templateOptions: {
                    dataSrc: {
                        marker: 'SUPPORTED_PERSONA_LIST',
                        params: {
                            useCase: 'sample-useCase'
                        }
                    },
                    options: {}
                },
                children: {
                    administrator: [
                        {
                            code: 'state',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'STATE_LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                }
                            },
                            validations: [
                                {
                                    type: 'required'
                                }
                            ]
                        }, {
                            code: 'subPersona',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'SUBPERSONA_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }, {
                            code: 'district',
                            type: 'select',
                            templateOptions: {
                                labelHtml: {
                                    contents: '<span>$0&nbsp;<span class=\'required-asterisk\'>*</span></span>',
                                    values: {
                                        $0: 'State'
                                    }
                                },
                                placeHolder: 'Select State',
                                multiple: false,
                                dataSrc: {
                                    marker: 'LOCATION_LIST',
                                    params: {
                                        useCase: 'SIGNEDIN_GUEST'
                                    }
                                },
                                options: { value: 'hm', label: 'HM' }
                            }
                        }]
                }
            }]));
            //act
            searchFilterService.fetchFacetFilterFormConfig().then(() => {
            //assert
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(formRequest, 'SAMPLE_CHANNEL_ID');
            done();
        });
    });

    it('Should get Form Fields and execute catch block', (done) => {
        //arrange
            const formRequest: FormRequest = {action: "get",
            component: "app",
            subType: 'default',
            type: "filterConfig"}; 
            mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.reject({
                error: 'Error message'                
            }));
            //act
            const data = searchFilterService.fetchFacetFilterFormConfig().catch(() => {
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(formRequest, 'SAMPLE_CHANNEL_ID');
                done();
            });
    }); 
}); 

    describe('getFacetFormAPIConfig', () => {
        it('Should get Facet Filter Form Config Value if it return true', (done) => {
            //arrange
            searchFilterService['facetFilterFormConfig'] = null;
            searchFilterService.fetchFacetFilterFormConfig = jest.fn();
            const subType = undefined;
            mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
            //act
            searchFilterService.getFacetFormAPIConfig().then(() => {
            //assert
            expect(searchFilterService.fetchFacetFilterFormConfig).toHaveBeenCalled();
            done();
        });
        });

        it('Should get Facet Filter Form Config Value if facet filter config is undefined', (done) => {
            //arrange
            searchFilterService['facetFilterFormConfig'] = undefined;
            searchFilterService.fetchFacetFilterFormConfig = jest.fn();
            const subType = undefined;
            //act
            searchFilterService.getFacetFormAPIConfig().then(() => {
            //assert
            expect(searchFilterService.fetchFacetFilterFormConfig).toHaveBeenCalled();
            done();
        });
        });

        it('Should get Facet Filter Form Config Value if it return false', (done) => {
            //arrange
            searchFilterService['facetFilterFormConfig'] = [
                {code: "se_mediums", type: "dropdown", name: "language codes", placeholder: "Select Medium", multiple: true, index: 1},
            {code: "se_gradeLevels", type: "dropdown", name: "language codes", placeholder: "Select Class", multiple: true, index: 2}
            ];
            searchFilterService.fetchFacetFilterFormConfig = jest.fn();
            mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
            const subType = undefined;
            //act
            searchFilterService.getFacetFormAPIConfig().then(() => {
            //assert
            expect(searchFilterService.fetchFacetFilterFormConfig).not.toHaveBeenCalled();
            done();
        });
        });
    }) 

describe('reformFilterValues', () => {
    it('Should get Facet Values if form API Facet is true', (done) => {
        //arrange
        const facetFilters = [
            {
                name: 'se_mediums',
                value: [
                    {name: "english", count: 499, apply: true},
                    {name: "hindi", count: 8, apply: false},
                    {name: "sanskrit", count: 6, apply: false}
                ]
            },
            {
                name: 'se_gradeLevels',
                values: [
                    {name: "class 1", apply: true},
                    {name: "lkg", apply: false},
                    {name: "ukg", apply: false},
                    {name: "class 4", apply: false},
                    {name: "class 5", apply: false},
                    {name: "class 6", apply: false}
                ]
            }
        ];
        searchFilterService['facetFilterFormConfig'] = [
            {code: "se_mediums", type: "dropdown", name: "language codes", placeholder: "Select Medium", multiple: true, index: 1,
            value: [
                {name: "english", count: 499, apply: true},
                {name: "hindi", count: 8, apply: false},
                {name: "sanskrit", count: 6, apply: false}
            ]},
        {code: "se_gradeLevels", type: "dropdown", name: "language codes", placeholder: "Select Class", multiple: true, index: 2,
        values: [
            {name: "class 1", apply: true},
            {name: "lkg", apply: false},
            {name: "ukg", apply: false},
            {name: "class 4", apply: false},
            {name: "class 5", apply: false},
            {name: "class 6", apply: false}
        ]}
        ];
        mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
        let formAPIFacets;
        searchFilterService.getFacetFormAPIConfig = jest.fn();
        //act
        searchFilterService.reformFilterValues(facetFilters, formAPIFacets).then(() => {
        //assert
        expect(searchFilterService.getFacetFormAPIConfig).not.toHaveBeenCalled();
        done();
        });
    });

    it('Should get Facet Values if form API Facet is false', (done) => {
        //arrange
        const facetFilters = [
            {
                name: 'se_mediums',
                value: [
                    {name: "english", count: 499, apply: true},
                    {name: "hindi", count: 8, apply: false},
                    {name: "sanskrit", count: 6, apply: false}
                ]
            },
            {
                name: 'se_gradeLevels',
                value: [
                    {name: "class 1", apply: true},
                    {name: "lkg", apply: false},
                    {name: "ukg", apply: false},
                    {name: "class 4", apply: false},
                    {name: "class 5", apply: false},
                    {name: "class 6", apply: false}
                ]
            }
        ];
        searchFilterService['facetFilterFormConfig'] = null;
        mockOnboardingConfigurationService.getAppConfig = jest.fn(() => mockOnboardingConfigData)
        let formAPIFacets;
        //act
        searchFilterService.reformFilterValues(facetFilters, formAPIFacets).then(() => {
        //assert
        expect(searchFilterService.getFacetFormAPIConfig).toHaveBeenCalled();
        done();
        });
    });
});
});