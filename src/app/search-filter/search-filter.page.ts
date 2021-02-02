import {Component, OnInit} from '@angular/core';
import {FieldConfig} from 'common-form-elements';
import {FieldConfigInputType, FieldConfigValidationType} from 'common-form-elements';
import {Router} from '@angular/router';
import {FilterValue} from 'sunbird-sdk';

@Component({
    selector: 'app-search-filter.page',
    templateUrl: './search-filter.page.html',
    styleUrls: ['./search-filter.page.scss'],
})
export class SearchFilterPage implements OnInit {

    private config: FieldConfig<any>[] = [
        {
            code: 'board',
            type: FieldConfigInputType.SELECT,
            fieldName: 'board',
            templateOptions: {
                label: 'board',
                placeHolder: 'Select Board',
                multiple: false,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'karnataka',
                        value: 'ka'
                    }
                ]
            },
            validations: [
                {
                    type: FieldConfigValidationType.REQUIRED
                }
            ]
        },
        {
            code: 'medium',
            type: FieldConfigInputType.SELECT,
            fieldName: 'medium',
            templateOptions: {
                label: 'medium',
                placeHolder: 'Select Medium',
                multiple: true,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'karnataka',
                        value: 'ka'
                    }
                ]
            }
        },
        {
            code: 'gradeLevel',
            type: FieldConfigInputType.SELECT,
            fieldName: 'gradeLevel',
            templateOptions: {
                label: 'class',
                placeHolder: 'Select Class',
                multiple: true,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'karnataka',
                        value: 'ka'
                    }
                ]
            }
        },
        {
            code: 'subject',
            type: FieldConfigInputType.SELECT,
            fieldName: 'subject',
            templateOptions: {
                label: 'subject',
                placeHolder: 'Select Subject',
                multiple: true,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'karnataka',
                        value: 'ka'
                    }
                ]
            }
        },
        {
            code: 'publisher',
            type: FieldConfigInputType.SELECT,
            fieldName: 'publisher',
            templateOptions: {
                label: 'publisher',
                placeHolder: 'Select publisher',
                multiple: true,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'karnataka',
                        value: 'ka'
                    }
                ]
            }
        },
        {
            code: 'mediaType',
            type: FieldConfigInputType.SELECT,
            fieldName: 'mediaType',
            templateOptions: {
                label: 'Media Type',
                multiple: true,
                hidden: false,
                disabled: false,
                options: []
            }
        },
        {
            code: 'rating',
            type: FieldConfigInputType.SELECT,
            fieldName: 'rating',
            templateOptions: {
                label: 'Rating',
                multiple: false,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: '1',
                        value: 1
                    },
                    {
                        label: '2',
                        value: 2
                    },
                    {
                        label: '3',
                        value: 3
                    },
                    {
                        label: '4',
                        value: 4
                    },
                    {
                        label: '5',
                        value: 5
                    }
                ]

            }
        },
        {
            code: 'certificates',
            type: FieldConfigInputType.SELECT,
            fieldName: 'certificates',
            templateOptions: {
                label: 'certificates',
                multiple: false,
                hidden: false,
                disabled: false,
                options: [
                    {
                        label: 'Available',
                        value: 'available'
                    },
                    {
                        label: 'Not Available',
                        value: 'not_available'
                    }
                ]

            }
        },
        {
            code: 'primaryCategory',
            type: FieldConfigInputType.SELECT,
            fieldName: 'primaryCategory',
            templateOptions: {
                label: 'Content Type',
                multiple: false,
                hidden: false,
                disabled: false,
                options: []

            }
        },
    ];

    facetFilters: {
        [code: string]: FilterValue []
    } = {};

    constructor(
        private router: Router,
    ) {
        const extrasState = this.router.getCurrentNavigation().extras.state;
        if (extrasState) {
            this.config = extrasState.facetFilters;
        }
    }

    ngOnInit() {
    }

}
