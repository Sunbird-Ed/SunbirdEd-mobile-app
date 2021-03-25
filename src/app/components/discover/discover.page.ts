import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {ContentFilterConfig, PrimaryCaregoryMapping, RouterLinks, ViewMore} from '../../app.constant';
import { NavigationExtras, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService, ContentAggregatorHandler, PageId } from '@app/services';
import { PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, ContentAggregatorRequest, ContentSearchCriteria } from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption-v8';
import { NavigationService } from '@app/services/navigation-handler.service';
import { SbSubjectListPopupComponent } from '@app/app/components/popups/sb-subject-list-popup/sb-subject-list-popup.component';
import {OnTabViewWillEnter} from '@app/app/tabs/on-tab-view-will-enter';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverComponent implements OnInit, OnDestroy, OnTabViewWillEnter {

  @Output() hideRefresher = new EventEmitter();
  

  appLabel: string;
  headerObservable: Subscription;
  displaySections?: any[];
  courseCardType = CourseCardGridTypes;

  constructor(
    private appVersion: AppVersion,
    private headerService: AppHeaderService,
    private router: Router,
    private events: Events,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
    this.appVersion.getAppName().then((appName: any) => {
      this.appLabel = appName;
    });
    this.fetchDisplayElements();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
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

    let displayItems = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.DISCOVER);
    displayItems = this.mapContentFacteTheme(displayItems);
    this.displaySections = displayItems;
    this.hideRefresher.emit(false);
    refresher ? refresher.target.complete() : null;
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

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        this.redirectToActivedownloads();
        break;
      case 'notification':
        this.redirectToNotifications();
        break;
      default: console.warn('Use Proper Event name');
    }
  }

  redirectToActivedownloads() {
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
    this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  handlePillSelect(event, section) {
    if (!event || !event.data || !event.data.length) {
      return;
    }
    const filterConfig = section.dataSrc.params.config.find(((facet) => facet.type === 'filter'));
    event.data[0].value['primaryFacetFilters'] = filterConfig ? filterConfig.values : undefined;
    const params = {
      formField: event.data[0].value,
      fromLibrary: true,
      description: (section && section.description) || ''
    };
    this.router.navigate([RouterLinks.CATEGORY_LIST], { state: params });
  }

  navigateToDetailPage(event) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;

    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(item, { content: item });
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
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
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.events.unsubscribe('update_header');
  }

  private mapContentFacteTheme(displayItems) {
    if (displayItems && displayItems.length) {
      for (let count = 0; count < displayItems.length; count++){
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
      const primaryCaregoryMap = item.facet && PrimaryCaregoryMapping[item.facet.toLowerCase()] ? PrimaryCaregoryMapping[item.facet.toLowerCase()] :
        PrimaryCaregoryMapping['default'];
      item.icon = item.icon ? item.icon : primaryCaregoryMap.icon;
    });
    return displayItems;
  }

  tabViewWillEnter() {
    this.fetchDisplayElements();
  }
}
