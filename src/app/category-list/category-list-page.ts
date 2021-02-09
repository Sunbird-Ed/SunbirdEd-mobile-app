import {Component, Inject} from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    CorReleationDataType,
    Environment,
    FormAndFrameworkUtilService,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import {Router} from '@angular/router';
import {ContentService, ContentsGroupedByPageSection, CourseService, FilterValue, FormService, ProfileService} from 'sunbird-sdk';
import {AggregatorConfigField, ContentAggregation} from 'sunbird-sdk/content/handlers/content-aggregator';
import {ContentData, ContentSearchCriteria, SearchType} from 'sunbird-sdk/content';
import {ContentUtil} from '@app/util/content-util';
import {RouterLinks} from '@app/app/app.constant';
import {NavigationService} from '@app/services/navigation-handler.service';
import {ScrollToService} from '@app/services/scroll-to.service';
import {FormConstants} from '@app/app/form.constants';
import {FilterFormConfigMapper} from '@app/app/search-filter/filter-form-config-mapper';
import {ModalController} from '@ionic/angular';
import {SearchFilterPage} from '@app/app/search-filter/search-filter.page';


@Component({
    selector: 'app-home-page',
    templateUrl: './category-list-page.html',
    styleUrls: ['./category-list-page.scss'],
})

export class CategoryListPage {

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
    mediumList = [];
    gradeList = [];
    mediumOptions = {
        title: this.commonUtilService.translateMessage('MEDIUM_OPTION_TEXT'),
        cssClass: 'select-box'
    };
    facetFilters: {
        [code: string]: FilterValue []
    } = {};
    supportedFacets?: string [];
    primaryFacetFilters: {
        code: string,
        translations: string
    } [];
    fromLibrary = false;
    private pageSearchCriteria: ContentSearchCriteria;


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
            this.pageSearchCriteria = JSON.parse(JSON.stringify(extrasState.formField.searchCriteria));
            this.primaryFacetFilters = extrasState.formField.primaryFacetFilters;
            this.fromLibrary = extrasState.fromLibrary;
            this.formField.facet = this.formField.facet.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        }
    }

    ionViewWillEnter() {
        this.appHeaderService.showHeaderWithBackButton();
        this.fetchAndSortData(this.pageSearchCriteria).then();
    }

    private async fetchAndSortData(searchCriteria) {
        if (!this.supportedFacets) {
            this.supportedFacets = (await this.formAndFrameworkUtilService
                .getFormFields(FormConstants.SEARCH_FILTER)).reduce((acc, filterConfig) => {
                acc.push(filterConfig.code);
                return acc;
            }, []);
        }
        const temp = ((await this.contentService.buildContentAggregator
        (this.formService, this.courseService, this.profileService)
            .aggregate({
                    interceptSearchCriteria: () => ({
                        ...searchCriteria,
                        facets: this.supportedFacets,
                        searchType: SearchType.SEARCH,
                        limit: 100
                    })
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
        this.facetFilters = (temp[0].meta.filterCriteria.facetFilters).reduce((acc, f) => {
            acc[f.name] = f.values;
            return acc;
        }, {});
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
        const corRelationList = [{id: sectionName || '', type: CorReleationDataType.SECTION}];
        const values = {};
        values['sectionName'] = sectionName;
        values['positionClicked'] = index;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            ContentUtil.getTelemetryObject(item),
            values,
            ContentUtil.generateRollUp(undefined, identifier),
            corRelationList);
        if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
            this.navService.navigateToDetailPage(item, {content: item, corRelation: corRelationList});
        } else {
            this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1').then();
        }
    }

    scrollToSection(id: string) {
        this.scrollService.scrollTo(id);
    }

    cancelEvent($event) {

    }

    async navigateToFilterFormPage() {
        const openFiltersPage = await this.modalController.create({
            component: SearchFilterPage,
            componentProps: {
                config: FilterFormConfigMapper.map(this.facetFilters)
            }
        });
        await openFiltersPage.present();
        openFiltersPage.onDidDismiss().then((result) => {
            if (result && result.data) {
                this.pageSearchCriteria = result.data;
                this.pageSearchCriteria.mode = 'hard';
                this.pageSearchCriteria.searchType = SearchType.FILTER;
                this.pageSearchCriteria.fields = [];
                this.fetchAndSortData(this.pageSearchCriteria).then();
            }
        });
    }
}
