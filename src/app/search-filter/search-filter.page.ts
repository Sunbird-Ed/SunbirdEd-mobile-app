import {Component, Inject, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {FormGroup} from '@angular/forms';
import {ContentService, ContentSearchCriteria, ContentSearchResult, SearchType} from 'sunbird-sdk';
import {FilterFormConfigMapper} from '@app/app/search-filter/filter-form-config-mapper';
import {CommonUtilService} from '@app/services';
import {Subscription} from 'rxjs';
import {FieldConfig} from 'common-form-elements';

@Component({
    selector: 'app-search-filter.page',
    templateUrl: './search-filter.page.html',
    styleUrls: ['./search-filter.page.scss'],
})
export class SearchFilterPage implements OnInit {
    @Input('initialFilterCriteria') readonly initialFilterCriteria: ContentSearchCriteria;
    
    public config: FieldConfig<any>[];

    private formGroup: FormGroup;
    private formValueSubscription: Subscription;
    private appliedFilterCriteria: ContentSearchCriteria;

    private static buildConfig(filterCriteria: ContentSearchCriteria, defaults?: {[field: string]: any}) {
        return FilterFormConfigMapper.map(
            filterCriteria.facetFilters.reduce((acc, f) => {
                acc[f.name] = f.values;
                return acc;
            }, {}),
            defaults
        );
    }

    constructor(
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        private router: Router,
        private location: Location,
        private modalController: ModalController,
        private commonUtilService: CommonUtilService
    ) {
    }

    ngOnInit() {
        this.resetFilter();
    }

    onFormInitialize(formGroup: FormGroup) {
        this.formGroup = formGroup;

        if (this.formValueSubscription) {
            this.formValueSubscription.unsubscribe();
        }

        this.formValueSubscription = this.formGroup.valueChanges.subscribe((formValue) => {
            this.refreshForm(formValue);
        });
    }

    resetFilter() {
        this.appliedFilterCriteria = JSON.parse(JSON.stringify(this.initialFilterCriteria));
        this.config = SearchFilterPage.buildConfig(this.appliedFilterCriteria);
    }

    applyFilter() {
        this.modalController.dismiss({
            appliedFilterCriteria: this.appliedFilterCriteria
        });
    }

    cancel() {
        this.modalController.dismiss();
    }

    private async refreshForm(formValue) {
        const searchCriteria: ContentSearchCriteria = {
            ...JSON.parse(JSON.stringify(this.appliedFilterCriteria)),
            limit: 0,
            mode: 'hard',
            searchType: SearchType.FILTER,
            fields: [],
        };

        searchCriteria.facetFilters.forEach((facetFilter) => {
            const selection = formValue[facetFilter.name];

            const valueToApply = facetFilter.values.find((value) => {
                if (Array.isArray(selection)) {
                    return selection.includes(value.name);
                } else {
                    return selection === value.name;
                }
            });

            if (valueToApply) {
                valueToApply.apply = true;
            }
        });

        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const contentSearchResult: ContentSearchResult = await this.contentService.searchContent(searchCriteria).toPromise();
            this.appliedFilterCriteria = contentSearchResult.filterCriteria;
            this.config = SearchFilterPage.buildConfig(contentSearchResult.filterCriteria, this.formGroup.value);
        } catch (e) {
            // todo show error toast
            console.error(e);
        } finally {
            await loader.dismiss();
        }
    }
}
