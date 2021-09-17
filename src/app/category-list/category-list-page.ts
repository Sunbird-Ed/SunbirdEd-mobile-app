import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    CorReleationDataType,
    Environment,
    FormAndFrameworkUtilService,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import { Router } from '@angular/router';
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
    CorrelationData,
    Profile
} from 'sunbird-sdk';
import { AggregatorConfigField, ContentAggregation } from 'sunbird-sdk/content/handlers/content-aggregator';
import { ContentUtil } from '@app/util/content-util';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { NavigationService } from '@app/services/navigation-handler.service';
import { ScrollToService } from '@app/services/scroll-to.service';
import { FormConstants } from '@app/app/form.constants';
import { ModalController } from '@ionic/angular';
import { SearchFilterPage } from '@app/app/search-filter/search-filter.page';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PillBorder, PillsColorTheme } from '@project-sunbird/common-consumption';
import { ObjectUtil } from '@app/util/object.util';


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
        showNavigationPill?: boolean;
        filterPillBy?: string;
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
    displayFacetFilters: {
        [code: string]: FilterValue[]
    } = {};
    initialFacetFilters?: {
        [code: string]: FilterValue[]
    };
    primaryFacetFilters: {
        code: string,
        translations: string,
        sort: boolean
    }[];
    fromLibrary = false;
    sectionCode = '';
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
    filterPillList = [];
    selectedFilterPill;
    selectedPillTheme: PillsColorTheme = {
        pillBgColor: getComputedStyle(document.querySelector('html')).getPropertyValue('--app-primary'),
        pillTextColor: getComputedStyle(document.querySelector('html')).getPropertyValue('--app-white')
    }

    private shouldGenerateImpressionTelemetry = true;
    private corRelationList = [];
    private pageId: string = PageId.CATEGORY_RESULTS;
    private fromPage: string = PageId.SEARCH;
    private env: string = Environment.SEARCH;
    private initialFilterCriteria: ContentSearchCriteria;
    private resentFilterCriteria: ContentSearchCriteria;
    private preFetchedFilterCriteria: ContentSearchCriteria;
    profile: Profile;
    private existingSearchFilters = {};

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
            this.sectionCode = extrasState.code;
            this.searchCriteria = JSON.parse(JSON.stringify(extrasState.formField.searchCriteria));
            if (this.formField && this.formField.facet && this.formField.facet.toLowerCase() === 'course') {
                if (!this.searchCriteria.impliedFiltersMap) {
                    this.searchCriteria.impliedFiltersMap = [];
                }
                this.searchCriteria.impliedFiltersMap = this.searchCriteria.impliedFiltersMap.concat([{
                    'batches.enrollmentType': 'open'
                }, {
                    'batches.status': 1
                }
                ]);
            }
            this.primaryFacetFilters = extrasState.formField.primaryFacetFilters;
            this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
            this.categoryDescription = extrasState.description || '';
            if (this.primaryFacetFilters) {
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
            this.existingSearchFilters = this.getExistingFilters(extrasState.formField);
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
        }, true);
    }

    async ionViewWillEnter() {
        this.appHeaderService.showHeaderWithBackButton();

        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({ id: this.formField.facet, type: CorReleationDataType.FORM_PAGE });
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.PAGE_LOADED,
            '',
            PageId.CATEGORY_RESULTS,
            Environment.HOME,
            undefined, undefined, undefined, undefined,
            corRelationList
        );
    }

    private async fetchAndSortData(searchCriteria, isInitialCall: boolean, refreshPillFilter = true) {
        this.showSheenAnimation = true;
        this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        const temp = ((await this.contentService.buildContentAggregator
            (this.formService, this.courseService, this.profileService)
            .aggregate({
                interceptSearchCriteria: () => (searchCriteria),
                userPreferences: {
                    board: this.profile.board,
                    medium: this.profile.medium,
                    gradeLevel: this.profile.grade,
                    subject: this.profile.subject,
                  }
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

        if(this.facetFilters){
            this.displayFacetFilters = JSON.parse(JSON.stringify(this.facetFilters));
        }
        if (isInitialCall) {
            this.initialFilterCriteria = JSON.parse(JSON.stringify(this.filterCriteria));
        }

        if (!this.initialFacetFilters) {
            this.initialFacetFilters = JSON.parse(JSON.stringify(this.facetFilters));
        }

        if (this.primaryFacetFiltersFormGroup) {
            this.primaryFacetFiltersFormGroup.patchValue(
                this.primaryFacetFilters.reduce((acc, p) => {
                    if (p.sort) {
                        this.displayFacetFilters[p.code].sort((a, b) => a.name > b.name && 1 || -1);
                    }
                    acc[p.code] = this.facetFilters[p.code]
                        .filter(v => v.apply)
                        .map(v => {
                            return this.displayFacetFilters[p.code].find(i => (i.name === v.name));
                        });
                    return acc;
                }, {}),
                { emitEvent: false }
            );
        }

        if (this.formField.filterPillBy) {
            if (refreshPillFilter) {
                this.filterPillList = [];
                setTimeout(() => {
                    this.filterPillList = (this.facetFilters[this.formField.filterPillBy] && JSON.parse(JSON.stringify(this.facetFilters[this.formField.filterPillBy]))) || [];
                    if (this.filterPillList.length) {
                        this.preFetchedFilterCriteria = JSON.parse(JSON.stringify(this.filterCriteria));
                        if (this.filterPillList.length === 1) {
                            this.selectedFilterPill = this.filterPillList[0];
                        } else {
                            this.pillFilterHandler(this.filterPillList[0]);
                        }
                    }
                }, 0);
            }
        }

        this.sectionGroup = (temp[0] as ContentAggregation<'CONTENTS'>).data;
        this.showSheenAnimation = false;
        this.generateImpressionTelemetry();
    }

    private generateImpressionTelemetry() {
        if (!this.shouldGenerateImpressionTelemetry) {
            return;
        }
        const facet = this.formField.facet;
        const selectedFacet = facet && ObjectUtil.isJSON(facet) ? JSON.parse(facet)['en'] : facet;
        switch (this.sectionCode) {
            case 'popular_categories':
                this.corRelationList.push({
                    type: CorReleationDataType.CATEGORY,
                    id: selectedFacet
                });
                this.pageId = PageId.CATEGORY_RESULTS;
                this.fromPage = PageId.SEARCH;
                this.env = Environment.SEARCH;
                break;
            case 'other_boards':
                this.corRelationList.push({
                    type: CorReleationDataType.BOARD,
                    id: selectedFacet
                });
                this.pageId = PageId.BOARD_RESULTS;
                this.fromPage = PageId.SEARCH;
                this.env = Environment.SEARCH;
                break;
            case 'browse_by_subject':
                this.corRelationList.push({
                    type: CorReleationDataType.SUBJECT,
                    id: selectedFacet
                });
                this.pageId = PageId.SUBJECT_RESULTS;
                this.fromPage = PageId.HOME;
                this.env = Environment.HOME;
                break;
            case 'browse_by_category':
                this.corRelationList.push({
                    type: CorReleationDataType.CATEGORY,
                    id: selectedFacet
                });
                this.pageId = PageId.CATEGORY_RESULTS;
                this.fromPage = PageId.HOME;
                this.env = Environment.HOME;
                break;
            case 'browse_by_audience':
                this.corRelationList.push({
                    type: CorReleationDataType.AUDIENCE,
                    id: selectedFacet
                });
                this.pageId = PageId.AUDIENCE_RESULTS;
                this.fromPage = PageId.SEARCH;
                this.env = Environment.SEARCH;
                break;
        }

        this.corRelationList.push({
            type: CorReleationDataType.FROM_PAGE,
            id: this.fromPage
        });
        let upDatedCorRelationList = [];
        if (this.sectionGroup && this.sectionGroup.sections && this.sectionGroup.sections.length) {
            const categoryResultCount = this.sectionGroup.sections.reduce((acc, curr) => {
                return acc + curr.count;
            }, 0);
            upDatedCorRelationList = this.corRelationList.concat([{
                type: CorReleationDataType.COUNT_CONTENT,
                id: categoryResultCount + ''
            }]);
        }
        this.shouldGenerateImpressionTelemetry = false;
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.PAGE_LOADED, '',
            this.pageId,
            this.env, undefined, undefined, undefined, undefined,
            upDatedCorRelationList
        );
    }

    navigateToViewMorePage(items, subject) {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(items));
        if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {
            const corRelationList = [
                { id: subject || '', type: CorReleationDataType.SECTION },
                { id: this.sectionCode || '', type: CorReleationDataType.ROOT_SECTION }
            ];
            this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: items,
                    subjectName: subject,
                    corRelation: corRelationList
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
        const corRelationList = [
            { id: sectionName || '', type: CorReleationDataType.SECTION },
            { id: this.sectionCode || '', type: CorReleationDataType.ROOT_SECTION }
        ];
        const values = {};
        values['sectionName'] = sectionName;
        values['positionClicked'] = index;
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SELECT_CONTENT,
            '',
            this.env,
            this.pageId,
            ContentUtil.getTelemetryObject(item),
            values,
            ContentUtil.generateRollUp(undefined, identifier),
            this.corRelationList);
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
        const isDataEmpty = (this.sectionGroup && this.sectionGroup.sections && this.sectionGroup.sections.length) ? false : true;
        const inputFilterCriteria: ContentSearchCriteria = this.deduceFilterCriteria(isDataEmpty);
        const openFiltersPage = await this.modalController.create({
            component: SearchFilterPage,
            componentProps: {
                initialFilterCriteria: inputFilterCriteria,
                defaultFilterCriteria: JSON.parse(JSON.stringify(this.initialFilterCriteria)),
                existingSearchFilters: this.existingSearchFilters
            }
        });
        await openFiltersPage.present();
        openFiltersPage.onDidDismiss().then(async (result) => {
            if (result && result.data) {
                this.resentFilterCriteria = result.data.appliedFilterCriteria;
                await this.applyFilter(result.data.appliedFilterCriteria);
            }
        });
    }

    async onPrimaryFacetFilterSelect(primaryFacetFilter: { code: string }, toApply: FilterValue[]) {
        const appliedFilterCriteria: ContentSearchCriteria = this.deduceFilterCriteria();
        const facetFilter = appliedFilterCriteria.facetFilters.find(f => f.name === primaryFacetFilter.code);

        if (facetFilter) {
            facetFilter.values.forEach(facetFilterValue => {
                if (toApply.find(apply => facetFilterValue.name === apply.name)) {
                    facetFilterValue.apply = true;
                } else {
                    facetFilterValue.apply = false;
                }
            });

            await this.applyFilter(appliedFilterCriteria);
        }
    }

    private async applyFilter(appliedFilterCriteria: ContentSearchCriteria, refreshPillFilter = true) {
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
        await this.fetchAndSortData(tempSearchCriteria, false, refreshPillFilter);
    }

    async pillFilterHandler(pill){
        if(!pill){
            return;
        }
        const appliedFilterCriteria: ContentSearchCriteria = this.deduceFilterCriteria();
        const facetFilter = appliedFilterCriteria.facetFilters.find(f => f.name === this.formField.filterPillBy);
        if (facetFilter) {
            pill.apply = true;
            facetFilter.values = [pill];
            this.selectedFilterPill = pill
        }
        await this.applyFilter(appliedFilterCriteria, false);
    }

    deduceFilterCriteria(isDataEmpty?) {
        let filterCriteriaData: ContentSearchCriteria;
        if (isDataEmpty && this.resentFilterCriteria) {
            filterCriteriaData = JSON.parse(JSON.stringify(this.resentFilterCriteria));
        } else if (this.filterPillList.length && this.formField.filterPillBy && this.preFetchedFilterCriteria) {
            filterCriteriaData = JSON.parse(JSON.stringify(this.preFetchedFilterCriteria));
        } else {
            filterCriteriaData = JSON.parse(JSON.stringify(this.filterCriteria))
        }
        return filterCriteriaData;
    }

    getExistingFilters(formFields){
        const existingSearchFilters = {};
        if(formFields){
            if(formFields.filterPillBy){
                existingSearchFilters[formFields.filterPillBy] = true;
            }
            if(formFields.primaryFacetFilters){
                formFields.primaryFacetFilters.forEach(facets => {
                    existingSearchFilters[facets.code] = true;
                });
            }
        }
        return existingSearchFilters;
    }

    reloadDropdown(index, item){
        return item;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}
