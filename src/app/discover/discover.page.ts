import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {ContentFilterConfig, RouterLinks} from '../app.constant';
import { NavigationExtras, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService, ContentAggregatorHandler, PageId } from '@app/services';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, ContentAggregatorRequest, ContentSearchCriteria } from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption-v8';
import { NavigationService } from '@app/services/navigation-handler.service';
import { SearchEventsService } from './search-events-service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  animations: [
    trigger('labelVisibility', [
      state(
        'show',
        style({
          height: 'auto'
        })
      ),
      state(
        'hide',
        style({
          opacity: '0'
        })
      ),
      transition('* => show', [animate('500ms ease-out')]),
      transition('show => hide', [animate('500ms ease-out')])
    ])
  ],
})
export class DiscoverPage implements OnInit, OnDestroy {

  appLabel: string;
  headerObservable: Subscription;
  displaySections: any[] = [];
  courseCardType = CourseCardGridTypes;
  searchKeywords = '';
  showFilterBtn = false;
  showCancelBtn = false;
  searchLabelVisibility: 'show' | 'hide' = 'show';

  constructor(
    private appVersion: AppVersion,
    private headerService: AppHeaderService,
    private router: Router,
    private events: Events,
    private searchEventsService: SearchEventsService
  ) {}

  ngOnInit() {
    this.appVersion.getAppName().then((appName: any) => {
      this.appLabel = appName;
    });
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

  async openSearchPage() {
    this.router.navigate(['tabs/discover/search-results'], {state:{}});
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

  searchInput() {
    if (this.searchKeywords && this.searchKeywords.trim().length > 3) {
      this.searchEventsService.setSearchInput(this.searchKeywords.trim());
    }
  }

  submitSearch() {
    if (this.searchKeywords && this.searchKeywords.trim().length > 3) {
      this.searchEventsService.setSearchSubmit(this.searchKeywords.trim());
    }
    this.showFilterBtn = !this.showFilterBtn;
  }

  cancelSearch() {
    this.searchEventsService.triggerSearchCancel();
    this.searchKeywords = '';
    this.showCancelBtn = false;
  }

  openFilters() {
    this.searchEventsService.triggerOpenFilter();
  }

  onSearchFocus() {
    this.searchLabelVisibility = 'hide';
  }

  onSearchBlur() {
    this.searchLabelVisibility = 'show';
  }

  ngOnDestroy() {
    this.searchEventsService.clear();
  }

}
