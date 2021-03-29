import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    CorReleationDataType,
    Environment,
    FormAndFrameworkUtilService, ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import {Router} from '@angular/router';
import {
    ContentService,
    ContentsGroupedByPageSection,
    CourseService,
    FilterValue,
    FormService,
    ProfileService,
    ContentData,
    ContentSearchCriteria,
    SearchType,
    CorrelationData
} from 'sunbird-sdk';
import {AggregatorConfigField, ContentAggregation} from 'sunbird-sdk/content/handlers/content-aggregator';
import {ContentUtil} from '@app/util/content-util';
import {RouterLinks} from '@app/app/app.constant';
import {NavigationService} from '@app/services/navigation-handler.service';
import {ScrollToService} from '@app/services/scroll-to.service';
import {FormConstants} from '@app/app/form.constants';
import {ModalController} from '@ionic/angular';
import {SearchFilterPage} from '@app/app/search-filter/search-filter.page';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import { PillBorder } from '@project-sunbird/common-consumption-v8';


@Component({
    selector: 'app-category-list-page',
    templateUrl: './category-list-page.html',
    styleUrls: ['./category-list-page.scss'],
})
export class CategoryListPage implements OnInit, OnDestroy {

    sectionGroup?: ContentsGroupedByPageSection;
    formField: {
        facet: string;
        searchCriteria: ContentSearchCriteria;
        aggregate: {
            sortBy?: {
                [field in keyof ContentData]: 'asc' | 'desc';
            }[];
            groupBy?: keyof ContentData;
        };
    };
    public imageSrcMap = new Map();
    defaultImg: string;
    showSheenAnimation = true;
    primaryFacetFiltersTemplateOptions = {
        cssClass: 'select-box'
    };
    facetFilters: {
        [code: string]: FilterValue[]
    } = {};
    initialFacetFilters?: {
        [code: string]: FilterValue[]
    };
    primaryFacetFilters: {
        code: string,
        translations: string
    }[];
    fromLibrary = false;
    primaryFacetFiltersFormGroup: FormGroup;

    private readonly searchCriteria: ContentSearchCriteria;
    private readonly filterCriteria: ContentSearchCriteria;

    private supportedUserTypesConfig: Array<any>;
    private supportedFacets?: string[];
    private subscriptions: Subscription[] = [];
    layoutConfiguration = {
        layout: 'v3'
    };
    appName = '';
    categoryDescription = '';
    PillBorder = PillBorder;

    constructor(
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        public commonUtilService: CommonUtilService,
        private router: Router,
        private appHeaderService: AppHeaderService,
        private navService: NavigationService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private scrollService: ScrollToService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private modalController: ModalController
    ) {
        const extrasState = this.router.getCurrentNavigation().extras.state;
        if (extrasState) {
            this.formField = extrasState.formField;
            this.searchCriteria = JSON.parse(JSON.stringify(extrasState.formField.searchCriteria));
            this.primaryFacetFilters = extrasState.formField.primaryFacetFilters;
            this.fromLibrary = extrasState.fromLibrary;
            this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
            this.categoryDescription = extrasState.description || '';
            if (this.fromLibrary) {
                this.primaryFacetFiltersFormGroup = this.primaryFacetFilters.reduce<FormGroup>((acc, filter) => {
                    const facetFilterControl = new FormControl();
                    this.subscriptions.push(
                        facetFilterControl.valueChanges.subscribe((v) => {
                            this.onPrimaryFacetFilterSelect(filter, v);
                        })
                    );
                    acc.addControl(filter.code, facetFilterControl);
                    return acc;
                }, new FormGroup({}));
            }
        }
    }

    async ngOnInit() {
        this.appName = await this.commonUtilService.getAppName();
        if (!this.supportedFacets) {
            this.supportedFacets = (await this.formAndFrameworkUtilService
                .getFormFields(FormConstants.SEARCH_FILTER)).reduce((acc, filterConfig) => {
                    acc.push(filterConfig.code);
                    return acc;
                }, []);
        }

        await this.fetchAndSortData({
            ...this.searchCriteria,
            facets: this.supportedFacets,
            searchType: SearchType.SEARCH,
            limit: 100
        });
    }

    async ionViewWillEnter() {
        this.appHeaderService.showHeaderWithBackButton();

        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({id: this.formField.facet, type: CorReleationDataType.FORM_PAGE});
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.PAGE_LOADED,
            '',
            PageId.CATEGORY_RESULTS,
            Environment.HOME,
            undefined, undefined, undefined, undefined,
            corRelationList
        );
    }

    private async fetchAndSortData(searchCriteria) {
        this.showSheenAnimation = true;
        const temp = ((await this.contentService.buildContentAggregator
            (this.formService, this.courseService, this.profileService)
            .aggregate({
                interceptSearchCriteria: () => (searchCriteria)
            },
                [], null, [{
                    dataSrc: {
                        type: 'CONTENTS',
                        request: {
                            type: 'POST',
                            path: '/api/content/v1/search',
                            withBearerToken: true
                        },
                        mapping: [{
                            aggregate: this.formField.aggregate
                        }]
                    },
                    sections: [
                        {
                            index: 0,
                            title: this.formField.facet,
                            theme: {}
                        }
                    ],
                } as AggregatorConfigField<'CONTENTS'>]).toPromise()).result);
        (this as any)['filterCriteria'] = temp[0].meta.filterCriteria;
        this.facetFilters = (this.filterCriteria.facetFilters || []).reduce((acc, f) => {
            acc[f.name] = f.values;
            return acc;
        }, {});

        if (!this.initialFacetFilters) {
            this.initialFacetFilters = JSON.parse(JSON.stringify(this.facetFilters));
        }

        if (this.primaryFacetFiltersFormGroup) {
            this.primaryFacetFiltersFormGroup.patchValue(
                this.primaryFacetFilters.reduce((acc, p) => {
                    acc[p.code] = this.facetFilters[p.code]
                        .filter(v => v.apply)
                        .map(v => {
                            return this.initialFacetFilters[p.code].find(i => (i.name === v.name));
                        });
                    return acc;
                }, {}),
                { emitEvent: false }
            );
        }

        this.sectionGroup = (temp[0] as ContentAggregation<'CONTENTS'>).data;
        this.showSheenAnimation = false;
    }

    navigateToTextbookPage(items, subject) {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(items));
        if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {
            this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: items,
                    subjectName: subject
                }
            });
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1').then();
        }
    }

    navigateToDetailPage(event, sectionName) {
        event.data = event.data.content ? event.data.content : event.data;
        const item = event.data;
        const index = event.index;
        const identifier = item.contentId || item.identifier;
        const corRelationList = [{ id: sectionName || '', type: CorReleationDataType.SECTION }];
        const values = {};
        values['sectionName'] = sectionName;
        values['positionClicked'] = index;
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SELECT_CONTENT,
            '',
            Environment.HOME,
            PageId.CATEGORY_RESULTS,
            ContentUtil.getTelemetryObject(item),
            values,
            ContentUtil.generateRollUp(undefined, identifier),
            corRelationList);
        if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
            this.navService.navigateToDetailPage(item, { content: item, corRelation: corRelationList });
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1').then();
        }
    }

    scrollToSection(id: string) {
        this.scrollService.scrollTo(id, {
            block: 'center',
            behavior: 'smooth'
        });
    }

    async navigateToFilterFormPage() {
        const openFiltersPage = await this.modalController.create({
            component: SearchFilterPage,
            componentProps: {
                initialFilterCriteria: this.filterCriteria,
            }
        });
        await openFiltersPage.present();
        openFiltersPage.onDidDismiss().then(async (result) => {
            if (result && result.data) {
                await this.applyFilter(result.data.appliedFilterCriteria);
            }
        });
    }

    async onPrimaryFacetFilterSelect(primaryFacetFilter: { code: string }, toApply: FilterValue[]) {
        const appliedFilterCriteria: ContentSearchCriteria = JSON.parse(JSON.stringify(this.filterCriteria));
        const facetFilter = appliedFilterCriteria.facetFilters.find(f => f.name === primaryFacetFilter.code);

        if (facetFilter) {
            facetFilter.values.forEach(facetFilterValue => {
                if (toApply.find(apply => facetFilterValue.name === apply.name)){
                    facetFilterValue.apply = true;
                } else {
                    facetFilterValue.apply = false;
                }
            });

            await this.applyFilter(appliedFilterCriteria);
        }
    }

    private async applyFilter(appliedFilterCriteria: ContentSearchCriteria) {
        const tempSearchCriteria: ContentSearchCriteria = {
            ...appliedFilterCriteria,
            mode: 'hard',
            facets: this.supportedFacets,
            searchType: SearchType.FILTER
        };
        tempSearchCriteria.facetFilters.forEach(facet => {
            if (facet.values && facet.values.length > 0) {
                if (facet.name === 'audience' && this.supportedUserTypesConfig) {
                    facet.values = ContentUtil.getAudienceFilter(facet, this.supportedUserTypesConfig);
                }
            }
        });
        await this.fetchAndSortData(tempSearchCriteria);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}
