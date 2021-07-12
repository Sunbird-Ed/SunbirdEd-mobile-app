import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location, TitleCasePipe} from '@angular/common';
import {ModalController} from '@ionic/angular';
import {ContentService, ContentSearchCriteria, ContentSearchResult, SearchType, ContentSearchFilter} from 'sunbird-sdk';
import {FilterFormConfigMapper} from '@app/app/search-filter/filter-form-config-mapper';
import {CommonUtilService, FormAndFrameworkUtilService} from '@app/services';
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
    @Input('resetData') resetData: boolean;

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
        private formAndFrameworkUtilService: FormAndFrameworkUtilService
    ) {
    }

    ngOnInit() {
        this.isPageLoadedFirstTime = true;
        this.initilizeSearchFilter();
    }

    private async initilizeSearchFilter(){
        this.initialFilterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(this.initialFilterCriteria);
        this.appliedFilterCriteria = JSON.parse(JSON.stringify(this.initialFilterCriteria));
        if (!this.filterFormTemplateConfig) {
            const {config, defaults} = this.buildConfig(this.appliedFilterCriteria);
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

    applyFilter() {
        this.modalController.dismiss({
            appliedFilterCriteria: this.formAndFrameworkUtilService.changeChannelNameToId(this.appliedFilterCriteria)
        });
    }

    cancel() {
        this.router.navigate([], { relativeTo: this.activatedRoute }).then(() => {
            this.modalController.dismiss();
        });
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

            facetFilter.values.forEach(f => {
                f.apply = !(!selection || selection.indexOf(f.name) === -1);
            });

        });

        this.formAndFrameworkUtilService.changeChannelNameToId(searchCriteria);

        const loader = await this.commonUtilService.getLoader();
        await loader.present();

        try {
            const contentSearchResult: ContentSearchResult = await this.contentService.searchContent(searchCriteria).toPromise();
            this.appliedFilterCriteria = await this.formAndFrameworkUtilService.changeChannelIdToName(contentSearchResult.filterCriteria);
            this.searchResultFacets = this.appliedFilterCriteria.facetFilters || [];
        } catch (e) {
            // todo show error toast
            console.error(e);
        } finally {
            await loader.dismiss();
        }
    }

    private buildConfig(filterCriteria: ContentSearchCriteria) {
        return this.filterFormConfigMapper.map(
            filterCriteria.facetFilters.reduce((acc, f) => {
                acc[f.name] = f.values;
                return acc;
            }, {})
        );
    }

    valueChanged(event) {
        if (!event) {
            return;
        }
        if (this.isPageLoadedFirstTime) {
            this.isPageLoadedFirstTime = false;
            if (this.resetData) {
                setTimeout(() => {
                    this.resetFilter();
                }, 500);
                this.resetData = false;
            }
            return;
        }

        this.refreshForm(event);
    }
}
