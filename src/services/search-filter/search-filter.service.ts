import { Injectable } from '@angular/core';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { FormConstants } from '../../app/form.constants';
import { OnboardingConfigurationService } from '../onboarding-configuration.service';

@Injectable({
    providedIn: 'root'
})

export class SearchFilterService {
    private facetFilterFormConfig
    constructor(
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private onboardingConfigurationService: OnboardingConfigurationService
    ) {}

    async getFacetFormAPIConfig() {
        if (!this.facetFilterFormConfig) {
            await this.fetchFacetFilterFormConfig()
        }
        return this.facetFilterFormConfig;
    }

    async fetchFacetFilterFormConfig(subType?) {
        FormConstants.FACET_FILTERS['subType'] = subType || 'default';
        const rootOrgId = this.onboardingConfigurationService.getAppConfig().overriddenDefaultChannelId
        try {
            this.facetFilterFormConfig = await this.formAndFrameworkUtilService
               .getFormFields({...FormConstants.FACET_FILTERS, subType: subType || 'default'}, rootOrgId);
        } catch {
            this.facetFilterFormConfig = await this.formAndFrameworkUtilService.getFormFields(FormConstants.FACET_FILTERS, rootOrgId);
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
