import {Component, Inject, OnInit} from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {ContentFilterConfig, ProfileConstants, RouterLinks} from '../app.constant';
import { NavigationExtras, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService, ContentAggregatorHandler, PageId } from '@app/services';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, ContentAggregatorRequest, ContentSearchCriteria } from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption';
import { NavigationService } from '@app/services/navigation-handler.service';
import {Profile, ProfileService, SearchType} from 'sunbird-sdk';
import {ContentAggregation, DataSourceMap} from 'sunbird-sdk/content/handlers/content-aggregator';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  appLabel: string;
  headerObservable: Subscription;
  displaySections: any[] = [];
  courseCardType = CourseCardGridTypes;

  constructor(
    private appVersion: AppVersion,
    private headerService: AppHeaderService,
    private router: Router,
    private events: Events,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private commonUtilService: CommonUtilService
  ) {

  }

  ngOnInit() {
    this.appVersion.getAppName().then((appName: any) => {
      this.appLabel = appName;
    });
    this.fetchDisplayElements();
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }

  async fetchDisplayElements() {
    const request: ContentAggregatorRequest = {
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => contentSearchCriteria,
      from: CachedItemRequestSourceFrom.SERVER
    };

    this.displaySections = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.DISCOVER);
  }

  async openSearchPage() {
    // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
    //   InteractSubtype.SEARCH_BUTTON_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY);
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
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.NOTIFICATION_CLICKED,
    //   Environment.HOME,
    //   PageId.LIBRARY);
    this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  handlePillSelect(event) {
    console.log(event);
    if (!event || !event.data || !event.data.length) {
      return;
    }
    const params = {
      formField: event.data[0].value
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

  navigateToViewMoreContentsPage(section, pageName) {
    const params: NavigationExtras = {
      state: {
        requestParams: {
          request: section.searchRequest
        },
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        pageName
      }
    };
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

}
