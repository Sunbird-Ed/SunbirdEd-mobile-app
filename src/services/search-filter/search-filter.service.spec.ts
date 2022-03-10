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
        expect(searchFilterService).toBeTruthy;

    });

    describe('getFacetFormAPIConfig', () => {
        //arrange
        it('Should get Facet Filter Form Config Value', (done) => {
            true;

        //act
        searchFilterService.getFacetFormAPIConfig();
        //assert
        expect(searchFilterService['facetFilterFormConfig']).toBeFalsy();
        });
        
    }) 


    describe('fetchFacetFilterFormConfig', () => {
        //arrange
        it('Should get Form Fields', (done) => {
            const formRequest: FormRequest = {
                type: 'filterConfig',
                subType: 'form request'|| 'default',
                action: 'get',
                component: 'app',
            };
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
        searchFilterService.fetchFacetFilterFormConfig('default');


        //assert
        setTimeout(() => {
            expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
            done();
        }); 
    });
}); 

describe('reformFilterValues', () => {
    it('Should get Facet Values if form API Facet is true', (done) => {
        //arrange
        const facetFilters = [
            {
                "name": "primaryCategory",
                "values": [
                    {
                        "name": "course assessment",
                        "count": 1,
                        "apply": false
                    },
                    {
                        "name": "explanation content",
                        "count": 7,
                        "apply": false
                    }
                ]
            },
            {
                "name": "subject",
                "values": [
                    {
                        "name": "general science",
                        "count": 2,
                        "apply": false
                    },
                    {
                        "name": "physical science",
                        "count": 2,
                        "apply": false
                    }
                ]
            }
        ];
        const formAPIFacets =[
            {
                "code": "primaryCategory",
                "type": "dropdown",
                "name": "Content Type",
                "placeholder": "Select Content Type",
                "multiple": true,
                "index": 0
            },
            {
                "code": "subject",
                "type": "dropdown",
                "name": "Subject",
                "placeholder": "Select Subject",
                "multiple": true,
                "index": 1
            }
        ];
        searchFilterService.getFacetFormAPIConfig = jest.fn();
        //act
        searchFilterService.reformFilterValues(facetFilters, formAPIFacets)
        //assert
        expect(formAPIFacets).toBeTruthy();
    });

    it('Should get Facet Values if form API Facet is false', (done) => {
        //arrange
        const facetFilters = [
            {
                name: 'primaryCategory',
                value: [
                    {
                        name: 'category1'
                    },
                    {
                        name: 'category2'
                    },
                    {
                        name: 'category3'
                    }
                ]
            },
            {
                name: 'medium',
                value: [
                    {
                        name: 'medium1'
                    },
                    {
                        name: 'medium2'
                    },
                    {
                        name: 'medium3'
                    }
                ]
            }
        ],
        formAPIFacets = false
        //act
        searchFilterService.reformFilterValues(facetFilters, formAPIFacets)
        //assert
        expect(formAPIFacets).toBeFalsy;
    });
});

describe('compareAndAssignValue', () => {
    //arrange
    const initialFacet = 'Author', replaceableFacet = 1;
    const compareAndAssignValue = jest.fn();
    //act
    //assert
    expect(compareAndAssignValue).toHaveBeenCalledWith(initialFacet,replaceableFacet);
}); 

});