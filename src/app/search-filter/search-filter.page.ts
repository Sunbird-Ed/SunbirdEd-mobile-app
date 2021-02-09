import {Component, Input, OnInit} from '@angular/core';
import {FieldConfig} from 'common-form-elements';
import {FieldConfigInputType, FieldConfigValidationType} from 'common-form-elements';
import {Router} from '@angular/router';
import {FilterValue} from 'sunbird-sdk';
import {RouterLinks} from '@app/app/app.constant';
import {Location} from '@angular/common';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-search-filter.page',
    templateUrl: './search-filter.page.html',
    styleUrls: ['./search-filter.page.scss'],
})
export class SearchFilterPage implements OnInit {
    @Input() config: FieldConfig<any>[] = [];
    selectedConfig: {};

    constructor(
        private router: Router,
        private location: Location,
        private modalController: ModalController
    ) {
        // const extrasState = this.router.getCurrentNavigation().extras.state;
        // if (extrasState) {
        //     this.config = extrasState.facetFilters;
        // }
    }

    ngOnInit() {
    }

    onFormValueChange(event) {
        this.selectedConfig = event;
        console.log('event', event);
    }

    applyFilter() {
        this.modalController.dismiss(this.selectedConfig);
        // const params = {
        //     selectedConfig: this.selectedConfig
        // };
        //
        // this.router.navigate([RouterLinks.CATEGORY_LIST], {
        //     state: {params}
        // });
    }

    cancel() {
        // this.location.back();
        this.modalController.dismiss();
    }
}
