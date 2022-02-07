import { Injectable } from '@angular/core';
import { FormRequest } from 'sunbird-sdk';
import { FormAndFrameworkUtilService } from '@app/services';

@Injectable({
    providedIn: 'root'
})

export class SearchFilterService {
    private facetFilterFormConfig
    constructor(
        private formAndFrameworkUtilService: FormAndFrameworkUtilService
    ) {}

    async getFacetFormAPIConfig() {
        if (!this.facetFilterFormConfig) {
            await this.fetchFacetFilterFormConfig()
        }
        return this.facetFilterFormConfig;
    }

    async fetchFacetFilterFormConfig(subType?) {
        const formRequest: FormRequest = {
            type: 'filterConfig',
            subType: subType || 'default',
            action: 'get',
            component: 'app'
        };
        try{
            this.facetFilterFormConfig = await this.formAndFrameworkUtilService.getFormFields(formRequest);
        } catch {
            formRequest.subType = 'default';
            this.facetFilterFormConfig = await this.formAndFrameworkUtilService.getFormFields(formRequest);
        }
        return this.facetFilterFormConfig;
    }

    async reformFilterValues(facetFilters, formAPIFacets = this.facetFilterFormConfig) {
        if (!formAPIFacets) {
            await this.getFacetFormAPIConfig();
            formAPIFacets = this.facetFilterFormConfig
        }

        if (formAPIFacets && formAPIFacets.length) {
            facetFilters = facetFilters.map(facet => {
                for (let count = 0; count < formAPIFacets.length; count++) {
                    if (facet.name === formAPIFacets[count].code) {
                        facet = this.compareAndAssignValue(facet, formAPIFacets[count]);
                        break;
                    }
                }
                return facet;
            });
        }

        return facetFilters
    }

    private compareAndAssignValue(initialFacet, replaceableFacet) {
        if (replaceableFacet.values && replaceableFacet.values.length) {
            const initialFacetValues = JSON.parse(JSON.stringify(initialFacet.values));
            initialFacet.values = replaceableFacet.values;

            for (let count = 0; count < initialFacet.values.length; count++) {
                const facteVal = initialFacetValues.find(val => val.name === initialFacet.values[count].name);
                if(facteVal){
                    initialFacet.values[count].apply = facteVal.apply || false;
                }
            }
        }
        return initialFacet;
    }

}
