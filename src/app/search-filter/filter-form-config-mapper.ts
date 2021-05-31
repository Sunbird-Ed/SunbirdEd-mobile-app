import { Injectable } from '@angular/core';
import { CommonUtilService } from '@app/services/common-util.service';
import { FilterValue } from 'sunbird-sdk';
import { IFacetFilterFieldTemplateConfig } from 'common-form-elements';

interface FilterFormConfigWithDefaults {
    config: IFacetFilterFieldTemplateConfig[];
    defaults: { [key: string]: string[] | string | undefined };
}

@Injectable()
export class FilterFormConfigMapper {
    constructor(
        private commonUtilService: CommonUtilService,
    ) {
    }
    private static order = [
        'board',
        'medium',
        'gradeLevel',
        'subject',
        'channel',
        'mimeType',
        'primaryCategory',
        'audience'
    ];

    private static buildDefault(filterValues: FilterValue[], multiple: boolean): string[] | string | undefined {
        if (multiple) {
            return filterValues
                .filter(f => f.apply)
                .map(f => f.name);
        } else {
            const filterValue = filterValues.find(f => f.apply);
            return filterValue && filterValue.name;
        }
    }

    map(facetFilters: { [key: string]: FilterValue[] }): FilterFormConfigWithDefaults {
        const accumulator = (acc, key) => {
            const { config, defaults } = acc;
            switch (key) {
                case 'board': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], false);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('BOARD'),
                        placeholderText: 'Select Board',
                        multiple: false,
                    });
                    break;
                }
                case 'medium': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('MEDIUM'),
                        placeholderText: 'Select Medium',
                        multiple: true,
                    });
                    break;
                }
                case 'gradeLevel': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('CLASS'),
                        placeholderText: 'Select Class',
                        multiple: true,
                    });
                    break;
                }
                case 'subject': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('SUBJECT'),
                        placeholderText: 'Select Class',
                        multiple: true,
                    });
                    break;
                }
                case 'channel': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('PUBLISHER'),
                        placeholderText: 'Select Publisher',
                        multiple: true,
                    });
                    break;
                }
                case 'mimeType': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_MEDIA_TYPE'),
                        placeholderText: 'Select Media Type',
                        multiple: true,
                    });
                    break;
                }
                case 'primaryCategory': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('FRMELEMENTS_LBL_CONTENT_TYPE'),
                        placeholderText: 'Select Content Type',
                        multiple: true,
                    });
                    break;
                }
                case 'audience': {
                    defaults[key] = FilterFormConfigMapper.buildDefault(facetFilters[key], true);
                    config.push({
                        facet: key,
                        type: 'dropdown',
                        labelText: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_MEANT_FOR'),
                        placeholderText: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_MEANT_FOR'),
                        multiple: true,
                    });
                    break;
                }
            }
            return acc;
        };
        const { config, defaults } = Object.keys(facetFilters).reduce<FilterFormConfigWithDefaults>(accumulator, { config: [], defaults: {} });

        return {
            defaults,
            config: config.sort((a, b) => {
                if (
                    FilterFormConfigMapper.order.includes(a.facet) &&
                    FilterFormConfigMapper.order.includes(b.facet)
                ) {
                    return FilterFormConfigMapper.order.indexOf(a.facet) - FilterFormConfigMapper.order.indexOf(b.facet);
                }
                return 1;
            })
        };
    }
}