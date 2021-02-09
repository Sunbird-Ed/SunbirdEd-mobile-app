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

    config: FieldConfig<any>[] = [];

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
