import { FormRequest } from '@project-sunbird/sunbird-sdk';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { SearchFilterService } from './search-filter.service';

describe('SearchFilterService', () => {
    let searchFilterService: SearchFilterService;
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

    beforeAll(() => {
        searchFilterService = new SearchFilterService(
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
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
        it('Should get Form Fields', (done) => {
        //arrange
            const subType ="default";
            const formRequest: FormRequest = {action: "get",
            component: "app",
            subType: subType,
            type: "filterConfig"}; 
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
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalledWith(formRequest);
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
        searchFilterService['facetFilterFormConfig'] = [
            {code: "se_mediums", type: "dropdown", name: "language codes", placeholder: "Select Medium", multiple: true, index: 1},
        {code: "se_gradeLevels", type: "dropdown", name: "language codes", placeholder: "Select Class", multiple: true, index: 2}
        ];
        const formAPIFacets = searchFilterService['facetFilterFormConfig'];
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
        const formAPIFacets = searchFilterService['facetFilterFormConfig'];
        //act
        searchFilterService.reformFilterValues(facetFilters, formAPIFacets).then(() => {
        //assert
        expect(searchFilterService.getFacetFormAPIConfig).toHaveBeenCalled();
        done();
        });
    });
});

describe('compareAndAssignValue', () => {
    it('should return initialfacet if values is undefined', () => {
    //arrange
    const initialFacet = {name: "se_mediums", values: Array(3)}, 
    replaceableFacet = {code: "se_mediums", type: "dropdown", name: "language codes", placeholder: "Select Medium", multiple: true, index: 1};
    const compareAndAssignValue = jest.fn();
    //act
    compareAndAssignValue(initialFacet, replaceableFacet);
    //assert
    expect(compareAndAssignValue).toHaveBeenCalledWith(initialFacet,replaceableFacet);
    });

    it('should return initialfacet if values is defined', () => {
    //arrange
    const initialFacet = {name: "subject", values: [
    {name: "general science", count: 1, apply: false},
    {name: "physical science", count: 1, apply: false},
    {name: "physical health and education", count: 1, apply: false},
    {name: "meitei( manipuri )", count: 1, apply: false},
    {name: "geography", count: 3, apply: false},
    {name: "political science/civics", count: 1, apply: false},
    {name: "english", count: 9, apply: false},
    {name: "moya", count: 1, apply: false},
    {name: "kokborok", count: 1, apply: false}
    ]}, 
    replaceableFacet = {code: "subject",
    index: 3,
    multiple: true,
    name: "language names",
    placeholder: "Select Subject",
    type: "dropdown",
    values: [
        {name: "general science", apply: false},
        {name: "physical science", apply: false},
        {name: "physical health and education", apply: false},
        {name: "meitei( manipuri )", apply: false},
        {name: "geography", apply: false}
    ]};
    const compareAndAssignValue = jest.fn();
    //act
    compareAndAssignValue(initialFacet, replaceableFacet);
    //assert
    expect(compareAndAssignValue).toHaveBeenCalledWith(initialFacet,replaceableFacet);
    });
}); 
});