import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { RouterLinks} from '../app.constant';
import { Router } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption-v8';
import { SearchEventsService } from './search-events-service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-discover',
  templateUrl: './discover-container.page.html',
  styleUrls: ['./discover-container.page.scss'],
  animations: [
    trigger('labelVisibility', [
      state(
        'show',
        style({
          maxHeight: '50vh',
          overflow: 'hidden'
        })
      ),
      state(
        'hide',
        style({
          maxHeight: '0',
          overflow: 'hidden'
        })
      ),
      transition('* => show', [animate('500ms ease-out')]),
      transition('show => hide', [animate('500ms ease-in')])
    ])
  ],
})
export class DiscoverContainerPage implements OnInit, OnDestroy {

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
    this.router.navigate([`${RouterLinks.TABS}/${RouterLinks.DISCOVER_CONTAINER}/${RouterLinks.DISCOVER_SEARCH}`], {state:{}});
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
    this.openSearchPage()
    this.headerService.showHeaderWithBackButton();
  }

  onSearchBlur() {
    this.searchLabelVisibility = 'show';
  }

  ngOnDestroy() {
    this.searchEventsService.clear();
  }

}
