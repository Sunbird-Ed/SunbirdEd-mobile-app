import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    CorReleationDataType,
    Environment,
    SearchFilterService,
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

    private readonly searchCriteria: ContentSearchCriteria;
    private readonly filterCriteria: ContentSearchCriteria;

    private supportedUserTypesConfig: Array<any>;
    private supportedFacets?: string[];
    private subscriptions: Subscription[] = [];
    layoutConfiguration = {
        layout: 'v4'
    };
    // defaultImage = 'assets/imgs/book.svg';
    // defaultImage = "data:image/png;base64,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"
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
        await this.convertFileToBase64();
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

    private async fetchAndSortData(searchCriteria, isInitialCall: boolean, refreshPillFilter = true, onSelectedFilter?: any) {
        this.showSheenAnimation = true;
        this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        if (onSelectedFilter) {
            const selectedData = [];
            onSelectedFilter.forEach((selectedFilter) => {
                selectedData.push(selectedFilter.name);
            });
            if (this.formField.aggregate && this.formField.aggregate.groupSortBy && this.formField.aggregate.groupSortBy.length) {
                this.formField.aggregate.groupSortBy.forEach((data) => {
                    data.name.preference = selectedData;
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
            console.log('primaryFacetFiltersFormGroup ', this.primaryFacetFiltersFormGroup);
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

    navigateToViewMorePage(items, subject, totalCount) {
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
            this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: items,
                    subjectName: subject,
                    corRelation: corRelationList,
                    supportedFacets: this.supportedFacets,
                    totalCount
                }
            });
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI').then();
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
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI').then();
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
        });
    }

    async onPrimaryFacetFilterSelect(primaryFacetFilter: { code: string }, toApply: FilterValue[]) {
        const appliedFilterCriteria: ContentSearchCriteria = this.deduceFilterCriteria();
        const facetFilter = appliedFilterCriteria.facetFilters.find(f => f.name === primaryFacetFilter.code);
        const onSelectedFilter = [];
        if (facetFilter) {
            facetFilter.values.forEach(facetFilterValue => {
                if (toApply.find(apply => facetFilterValue.name === apply.name)) {
                    facetFilterValue.apply = true;
                } else {
                    facetFilterValue.apply = false;
                }
            });
            toApply.forEach((selectedValue) => {
                onSelectedFilter.push(selectedValue.name);
            });

            await this.applyFilter(appliedFilterCriteria, true, toApply);
        }
    }

    private async applyFilter(appliedFilterCriteria: ContentSearchCriteria, refreshPillFilter = true, onSelectedFilter?) {
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
        await this.fetchAndSortData(tempSearchCriteria, false, refreshPillFilter, onSelectedFilter);
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

    async convertFileToBase64() {
        let res = await fetch('assets/imgs/ic_launcher.png');
        // let url = res.url;
        // console.log(url);
        // // var lastIndex = res.url.lastIndexOf('/');
        // let path = url.substring(0, url.lastIndexOf('/') + 1);
        // console.log('fetch ', url.substring(0, url.lastIndexOf('/') + 1));

        // this.file.readAsDataURL(path, 'ic_launcher.png').then((res) => {
        //     console.log('res ', res);
        //     this.defaultImage = res;
        // }).catch(err => {
        //     console.log('error ', err);
        //     this.defaultImage = "";
        // });
        let blob = await res.blob();
        let reader  = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          console.log('result ', reader.result);
          this.defaultImage = reader.result.toString();
        };
        reader.onerror = () => {
            this.defaultImage = "";
        };
    }
}
