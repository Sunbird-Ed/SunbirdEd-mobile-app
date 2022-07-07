import {Component, EventEmitter, Inject, OnDestroy, OnInit, Output} from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {ContentFilterConfig, PreferenceKey, PrimaryCaregoryMapping, RouterLinks, ViewMore} from '../../app.constant';
import { NavigationExtras, Router } from '@angular/router';
import {
  AppGlobalService,
  AppHeaderService,
  CommonUtilService,
  ContentAggregatorHandler,
  CorReleationDataType,
  Environment, ImpressionType, InteractType, OnboardingConfigurationService, PageId, TelemetryGeneratorService
} from '@app/services';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import {
  CachedItemRequestSourceFrom,
  ContentAggregatorRequest,
  ContentSearchCriteria,
  CorrelationData,
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption';
import { NavigationService } from '@app/services/navigation-handler.service';
import { SbSubjectListPopupComponent } from '@app/app/components/popups/sb-subject-list-popup/sb-subject-list-popup.component';
import { OnTabViewWillEnter } from '@app/app/tabs/on-tab-view-will-enter';
import { ObjectUtil } from '@app/util/object.util';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverComponent implements OnInit, OnDestroy, OnTabViewWillEnter {

  @Output() hideRefresher = new EventEmitter();
  

  appLabel: string;
  displaySections?: any[];
  courseCardType = CourseCardGridTypes;
  userType: string;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appVersion: AppVersion,
    private headerService: AppHeaderService,
    private router: Router,
    private events: Events,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private platform: Platform,
    private onboardingConfigurationService: OnboardingConfigurationService
  ) { }

  ngOnInit() {
    this.appVersion.getAppName().then((appName: any) => {
      this.appLabel = appName;
    });
    this.fetchDisplayElements(this.platform.is('ios') ? true : false);
  }

  doRefresh(refresher) {
    this.hideRefresher.emit(true);
    this.fetchDisplayElements(refresher);
  }

  async fetchDisplayElements(refresher?) {
    const request: ContentAggregatorRequest = {
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => contentSearchCriteria,
      from: refresher ? CachedItemRequestSourceFrom.SERVER : CachedItemRequestSourceFrom.CACHE
    };

    let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.DISCOVER, this.onboardingConfigurationService.getAppConfig().overriddenDefaultChannelId);
    displayItems = this.mapContentFacteTheme(displayItems);
    this.displaySections = displayItems;
    this.hideRefresher.emit(false);
    if (refresher && refresher.target) {
      refresher.target.complete();
    }
    this.userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    this.generateImpressionTelemetry();
  }

  private generateImpressionTelemetry() {
    if (this.displaySections && this.displaySections.length) {
      const corRelationList: Array<CorrelationData> = this.displaySections.reduce((acc: Array<CorrelationData>, val) => {
        if (val.dataSrc && val.dataSrc.values) {
          const categories: string[] = val.dataSrc.values.map((category: any) =>
            ObjectUtil.isJSON(category.facet) ? JSON.parse(category.facet)['en'] : category.facet);
          let categoryType = CorReleationDataType.CATEGORY_LIST;
          switch (val.code) {
            case 'popular_categories':
              categoryType = CorReleationDataType.CATEGORY_LIST;
              break;
            case 'other_boards':
              categoryType = CorReleationDataType.OTHER_BOARDS;
              break;
            case 'browse_by_audience':
              categoryType = CorReleationDataType.AUDIENCE_LIST;
              break;
          }
          acc.push({
            type: categoryType,
            id: categories.join(',')
          });
        }
        return acc;
      }, []);
      corRelationList.push({
        type: CorReleationDataType.USERTYPE,
        id: this.userType
      });
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.PAGE_LOADED, PageId.HOME,
        PageId.SEARCH,
        Environment.SEARCH, undefined, undefined, undefined, undefined,
        corRelationList
      );
    }
  }

  async openSearchPage() {
    const primaryCategories = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_COURSE);
    this.router.navigate([RouterLinks.SEARCH], {
      state: {
        primaryCategories,
        source: PageId.COURSES
      }
    });
  }

  handlePillSelect(event, section) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    if(section.dataSrc && section.dataSrc.params && section.dataSrc.params.config){
      const filterConfig = section.dataSrc.params.config.find(((facet) => (facet.type === 'filter' && facet.code === section.code)));
      event.data[0].value['primaryFacetFilters'] = filterConfig ? filterConfig.values : undefined;

      if(!event.data[0].value['filterIdentifier']){
        const filterIdentifierList = section.dataSrc.params.config.find(((facet) => (facet.type === 'filterConfigIdentifier' && facet.code === section.code)));
        const filterVal = filterIdentifierList && filterIdentifierList.values && filterIdentifierList.values.find(v=>{
          if(v.code && event.data[0].name) {
            return v.code.toLowerCase().replace(/ /g, '') === event.data[0].name.toLowerCase().replace(/ /g, '')
          }
          return false;
        });
        event.data[0].value['filterIdentifier'] = filterVal ? filterVal.filterIdentifier : undefined;
      }
    }
    const params = {
      code: section.code,
      formField: event.data[0].value,
      fromLibrary: true,
      title: (section && section.landingDetails && section.landingDetails.title) || '',
      description: (section && section.landingDetails && section.landingDetails.description) || ''
    };
    let corRelationType: string = CorReleationDataType.CATEGORY;
    let interactType: string = InteractType.SELECT_CATEGORY;
    switch (section.code) {
      case 'popular_categories':
        corRelationType = CorReleationDataType.CATEGORY;
        interactType = InteractType.SELECT_CATEGORY;
        break;
      case 'other_boards':
        corRelationType = CorReleationDataType.BOARD;
        interactType = InteractType.SELECT_BOARD;
        break;
      case 'browse_by_audience':
        corRelationType = CorReleationDataType.AUDIENCE;
        interactType = InteractType.SELECT_AUDIENCE;
        break;
    }
    const correlationList: Array<CorrelationData> = [];
    correlationList.push({
      id: event.data[0].name || '',
      type: corRelationType
    });

    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType, '',
      Environment.SEARCH,
      PageId.SEARCH, undefined, undefined, undefined,
      correlationList
    );

    this.router.navigate([RouterLinks.CATEGORY_LIST], { state: params });
  }

  navigateToDetailPage(event) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;

    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(item, { content: item });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
    }
  }

  navigateToViewMoreContentsPage(section, pageName?) {
    const params: NavigationExtras = {
      state: {
        requestParams: {
          request: section.meta.searchCriteria
        },
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        pageName: ViewMore.PAGE_COURSE_POPULAR
      }
    };
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

  async onViewMorePillList(event, section) {
    if (!event || !event.data) {
      return;
    }
    const subjectListPopover = await this.popoverCtrl.create({
      component: SbSubjectListPopupComponent,
      componentProps: {
        subjectList: event.data,
        title: section && section.title
      },
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'subject-list-popup',
    });
    await subjectListPopover.present();
    const { data } = await subjectListPopover.onDidDismiss();
    this.handlePillSelect(data, section);
  }

  ionViewWillLeave() {
    this.clearAllSubscriptions();
  }

  ngOnDestroy() {
    this.clearAllSubscriptions();
  }

  clearAllSubscriptions() {
    // If any
  }

  private mapContentFacteTheme(displayItems) {
    if (displayItems && displayItems.length) {
      for (let count = 0; count < displayItems.length; count++) {
        if (!displayItems[count].data) {
          continue;
        }
        if (displayItems[count].dataSrc && (displayItems[count].dataSrc.type === 'SEARCH_CONTENTS_BY_POULAR_CATEGORY')) {
          displayItems[count] = this.mapPrimaryCategoryTheme(displayItems[count]);
        }
      }
    }
    return displayItems;
  }

  private mapPrimaryCategoryTheme(displayItems) {
    displayItems.data.forEach(item => {
      const primaryCaregoryMap = item.facet &&
        PrimaryCaregoryMapping[item.facet.toLowerCase()] ? PrimaryCaregoryMapping[item.facet.toLowerCase()] :
        PrimaryCaregoryMapping['default'];
      item.icon = item.icon ? item.icon : primaryCaregoryMap.icon;
    });
    return displayItems;
  }

  tabViewWillEnter() {
    this.fetchDisplayElements();
  }
}
