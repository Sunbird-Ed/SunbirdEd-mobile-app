import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location, TitleCasePipe} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {ContentService, ContentSearchCriteria, ContentSearchResult, SearchType, ContentSearchFilter} from '@project-sunbird/sunbird-sdk';
import {FilterFormConfigMapper} from '../../app/search-filter/filter-form-config-mapper';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { Environment, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { CommonUtilService } from '../../services/common-util.service';
import { SearchFilterService } from '../../services/search-filter/search-filter.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import {FieldConfig, IFacetFilterFieldTemplateConfig, SbSearchFacetFilterComponent} from 'common-form-elements';

@Component({
    selector: 'app-search-filter.page',
    templateUrl: './search-filter.page.html',
    styleUrls: ['./search-filter.page.scss'],
    providers: [FilterFormConfigMapper, TitleCasePipe]
})
export class SearchFilterPage implements OnInit {
    @Input('initialFilterCriteria') initialFilterCriteria: ContentSearchCriteria;
    @ViewChild('sbSearchFilterComponent', { static: false }) searchFilterComponent?: SbSearchFacetFilterComponent;
    @Input('defaultFilterCriteria') readonly defaultFilterCriteria: ContentSearchCriteria;
    @Input('existingSearchFilters') existingSearchFilters: {[key:string]:boolean};
    @Input('formAPIFacets') formAPIFacets;

    public config: FieldConfig<any>[];

    public baseSearchFilter?: { [key: string]: string[] | string | undefined };
    public filterFormTemplateConfig?: IFacetFilterFieldTemplateConfig[];
    public searchResultFacets: ContentSearchFilter[];

    private appliedFilterCriteria: ContentSearchCriteria;
    private isPageLoadedFirstTime: boolean;

    constructor(
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private modalController: ModalController,
        private commonUtilService: CommonUtilService,
        private filterFormConfigMapper: FilterFormConfigMapper,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private searchFilterService: SearchFilterService,
        private telemetryGeneratorService: TelemetryGeneratorService
    ) {
    }

    async ngOnInit() {
        this.isPageLoadedFirstTime = true;
        await this.initilizeSearchFilter();
    }

    private async initilizeSearchFilter(){
        this.initialFilterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(this.initialFilterCriteria);
        this.appliedFilterCriteria = JSON.parse(JSON.stringify(this.initialFilterCriteria));
        if (!this.filterFormTemplateConfig) {
            const {config, defaults} = await this.buildConfig(this.appliedFilterCriteria);
            this.filterFormTemplateConfig = config;
            this.baseSearchFilter = defaults;
        }
        this.searchResultFacets = this.appliedFilterCriteria.facetFilters || [];
    }

    resetFilter() {
        if (this.searchFilterComponent) {
            this.searchFilterComponent.resetFilter(true);
        }
    }

    async applyFilter() {
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.APPLY_FILTER_CLICKED,
            Environment.HOME,
            PageId.COURSE_SEARCH_FILTER,
            undefined);
        await this.modalController.dismiss({
            appliedFilterCriteria: this.formAndFrameworkUtilService.changeChannelNameToId(this.appliedFilterCriteria)
        });
    }

    cancel() {
        this.router.navigate([], { relativeTo: this.activatedRoute }).then(() => {
            this.modalController.dismiss();
        }).catch(e => console.error(e));
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
            if (selection) {
                facetFilter.values.forEach(f => {
                    //single select type == string || multiple select type == Array
                    if(typeof selection === 'string'){
                        f.apply = (f.name === selection)
                    } else {
                        f.apply = !!(selection.indexOf(f.name) !== -1);
                    }
                });
            }
        });

        this.formAndFrameworkUtilService.changeChannelNameToId(searchCriteria);

        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const contentSearchResult: ContentSearchResult = await this.contentService.searchContent(searchCriteria).toPromise();
            if(contentSearchResult && contentSearchResult.filterCriteria && contentSearchResult.filterCriteria.facetFilters){
                contentSearchResult.filterCriteria.facetFilters =
                await this.searchFilterService.reformFilterValues(contentSearchResult.filterCriteria.facetFilters);
            }
            this.appliedFilterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(contentSearchResult.filterCriteria);
            this.searchResultFacets = this.appliedFilterCriteria.facetFilters || [];
        } catch (e) {
            console.error(e);
        } finally {
            await loader.dismiss();
        }
    }

    private async buildConfig(filterCriteria: ContentSearchCriteria) {
        return await this.filterFormConfigMapper.map(
            filterCriteria.facetFilters.reduce((acc, f) => {
                acc[f.name] = f.values;
                return acc;
            }, {}),
            (this.existingSearchFilters || {})
        );
    }

    async valueChanged(event) {
        if (!event) {
            return;
        }
        if (this.isPageLoadedFirstTime) {
            this.isPageLoadedFirstTime = false;
            return;
        }

        await this.refreshForm(event);
    }
}
