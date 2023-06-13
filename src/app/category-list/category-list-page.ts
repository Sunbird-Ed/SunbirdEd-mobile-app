import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { SearchFilterService } from '../../services/search-filter/search-filter.service';
import {
    CorReleationDataType,
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
} from '../../services/telemetry-constants';
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
} from '@project-sunbird/sunbird-sdk';
import { AggregatorConfigField, ContentAggregation } from '@project-sunbird/sunbird-sdk/content/handlers/content-aggregator';
import { ContentUtil } from '../../util/content-util';
import { ProfileConstants, RouterLinks } from '../../app/app.constant';
import { NavigationService } from '../../services/navigation-handler.service';
import { ScrollToService } from '../../services/scroll-to.service';
import { ModalController } from '@ionic/angular';
import { SearchFilterPage } from '../../app/search-filter/search-filter.page';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PillBorder, PillsColorTheme } from '@project-sunbird/common-consumption';
import { ObjectUtil } from '../../util/object.util';

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
            groupSortBy?: any
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
    filterFields: {[k: string]: any} = {};

    private readonly searchCriteria: ContentSearchCriteria;
    private readonly filterCriteria: ContentSearchCriteria;

    private supportedUserTypesConfig: Array<any>;
    private supportedFacets?: string[];
    private subscriptions: Subscription[] = [];
    layoutConfiguration = {
        layout: 'v4'
    };
    defaultImage = '';
    appName = '';
    categoryDescription = '';
    categoryTitle = '';
    PillBorder = PillBorder;
    filterPillList = [];
    selectedFilterPill;
    selectedPillTheme: PillsColorTheme = {
        pillBgColor: getComputedStyle(document.querySelector('html')).getPropertyValue('--app-primary'),
        pillTextColor: getComputedStyle(document.querySelector('html')).getPropertyValue('--app-white')
    }
    formAPIFacets;

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
    filterIdentifier: any;

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
        private searchFilterService: SearchFilterService,
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
            this.filterIdentifier = extrasState.formField.filterIdentifier;
            this.primaryFacetFilters = extrasState.formField.primaryFacetFilters;
            this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
            this.categoryDescription = extrasState.description || '';
            this.categoryTitle = extrasState.title || '';
            if (this.primaryFacetFilters) {
                this.primaryFacetFiltersFormGroup = this.primaryFacetFilters.reduce<FormGroup>((acc, filter) => {
                    const facetFilterControl = new FormControl();
                    this.subscriptions.push(
                        facetFilterControl.valueChanges.subscribe((v) => {
                            this.onPrimaryFacetFilterSelect(filter, v).then(() => {}).catch();
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
            this.formAPIFacets = await this.searchFilterService.fetchFacetFilterFormConfig(this.filterIdentifier);
            this.supportedFacets = this.formAPIFacets.reduce((acc, filterConfig) => {
                    acc.push(filterConfig.code);
                    return acc;
                }, []);
        }

        await this.fetchAndSortData({
            ...this.searchCriteria,
            facets: this.supportedFacets,
            searchType: SearchType.SEARCH,
        }, true);
        (await this.commonUtilService.convertFileToBase64('assets/imgs/ic_launcher.png')).subscribe((img) => {
            this.defaultImage = img;
        });
    }

    async ionViewWillEnter() {
        await this.appHeaderService.showHeaderWithBackButton();

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

    private async fetchAndSortData(searchCriteria, isInitialCall: boolean, refreshPillFilter = true, onSelectedFilter?: any, filterKey?) {
        this.showSheenAnimation = true;
        this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        if (onSelectedFilter) {
            const selectedData = [];
            onSelectedFilter.forEach((selectedFilter) => {
                selectedData.push(selectedFilter.name);
            });
            if (filterKey) {
                this.filterFields = this.filterFields ? this.filterFields : {};
                this.filterFields[filterKey] = selectedData;
            }
            if (this.formField.aggregate && this.formField.aggregate.groupSortBy && this.formField.aggregate.groupSortBy.length) {
                this.formField.aggregate.groupSortBy.forEach((data) => {
                    let applyFilters = [];
                    Object.keys(this.filterFields).forEach((e) => {
                        if (this.filterFields[e].length) {
                            applyFilters = applyFilters.concat(this.filterFields[e]);
                        }
                    });
                    if (data.name && data.name.preference && data.name.preference.length) {
                        data.name.preference.push(selectedData);
                    } else {
                        data.name.preference = selectedData;
                    }
                });
            }
        }

        if (this.profile.subject.length >= 1) {
            if (this.formField.aggregate && this.formField.aggregate.groupSortBy && this.formField.aggregate.groupSortBy.length) {
                this.formField.aggregate.groupSortBy.forEach((sortData) => {
                    if (sortData.name.preference) {
                        sortData.name.preference.push(this.profile.subject);
                    }
                });
            }
        }
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

        if(this.filterCriteria && this.filterCriteria.facetFilters){
            this.filterCriteria.facetFilters =
            await this.searchFilterService.reformFilterValues(this.filterCriteria.facetFilters, this.formAPIFacets);
        }

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
                            this.pillFilterHandler(this.filterPillList[0]).then(() => {}).catch();
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

    async navigateToViewMorePage(items, subject, totalCount) {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(items));
        if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {
            const corRelationList = [
                { id: subject || '', type: CorReleationDataType.SECTION },
                { id: this.sectionCode || '', type: CorReleationDataType.ROOT_SECTION },
                { id: this.formField || '', type: CorReleationDataType.CONTENT}
            ];
            await this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: items,
                    subjectName: subject,
                    corRelation: corRelationList,
                    supportedFacets: this.supportedFacets,
                    totalCount
                }
            });
        } else {
            await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
        }
    }

    async navigateToDetailPage(event, sectionName) {
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
            await this.navService.navigateToDetailPage(item, { content: item, corRelation: corRelationList });
        } else {
            await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI').then();
        }
    }

    scrollToSection(id: string) {
        this.scrollService.scrollTo(id, {
            block: 'center',
            behavior: 'smooth'
        });
    }

    async navigateToFilterFormPage() {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.FILTER_BUTTON_CLICKED,
            Environment.COURSE,
            PageId.COURSE_PAGE_FILTER
            );
        const isDataEmpty = (this.sectionGroup && this.sectionGroup.sections && this.sectionGroup.sections.length) ? false : true;
        const inputFilterCriteria: ContentSearchCriteria = this.deduceFilterCriteria(isDataEmpty);
        const openFiltersPage = await this.modalController.create({
            component: SearchFilterPage,
            componentProps: {
                initialFilterCriteria: inputFilterCriteria,
                defaultFilterCriteria: JSON.parse(JSON.stringify(this.initialFilterCriteria)),
                existingSearchFilters: this.existingSearchFilters,
                formAPIFacets: this.formAPIFacets
            }
        });
        await openFiltersPage.present();
        openFiltersPage.onDidDismiss().then(async (result) => {
            if (result && result.data) {
                this.resentFilterCriteria = result.data.appliedFilterCriteria;
                await this.applyFilter(result.data.appliedFilterCriteria);
            }
        }).catch(e => console.error(e));
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

            await this.applyFilter(appliedFilterCriteria, true, toApply, primaryFacetFilter.code);
        }
    }

    private async applyFilter(appliedFilterCriteria: ContentSearchCriteria, refreshPillFilter = true, onSelectedFilter?, filterKey?) {
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
        await this.fetchAndSortData(tempSearchCriteria, false, refreshPillFilter, onSelectedFilter, filterKey);
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
