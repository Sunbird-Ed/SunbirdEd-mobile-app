import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppGlobalService, AppHeaderService, CommonUtilService, ContentAggregatorHandler, Environment,
  FormAndFrameworkUtilService, InteractSubtype, PageId, SunbirdQRScanner, TelemetryGeneratorService } from '@app/services';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption-v8';
import { NavigationExtras, Router } from '@angular/router';
import { ContentFilterConfig, EventTopics, ProfileConstants, RouterLinks } from '../../app.constant';
import { FrameworkService, FrameworkDetailsRequest, FrameworkCategoryCodesGroup, Framework,
    Profile, ProfileService, ContentAggregatorRequest, ContentSearchCriteria,
    CachedItemRequestSourceFrom, SearchType, InteractType } from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { NavigationService } from '@app/services/navigation-handler.service';
import { Events, IonContent as ContentView  } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit, OnDestroy {

  aggregatorResponse = [];
  courseCardType = CourseCardGridTypes;
  selectedFilter: string;
  concatProfileFilter: Array<string> = [];
  categories: Array<any> = [];
  boards: string;
  medium: string;
  grade: string;
  profile: Profile;
  guestUser: boolean;
  appLabel: string;

  displaySections: any[] = [];
  headerObservable: Subscription;
  @ViewChild('contentView', { static: false }) contentView: ContentView;

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private appGlobalService: AppGlobalService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private headerService: AppHeaderService,
    private events: Events,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private qrScanner: SunbirdQRScanner
  ) {
  }

  ngOnInit() {
    this.getUserProfileDetails();
    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, () => {
      this.getUserProfileDetails();
    });
    this.events.subscribe(EventTopics.TAB_CHANGE, (data: string) => {
      if (data === '') {
        this.qrScanner.startScanner(this.appGlobalService.getPageIdForTelemetry());
      }
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

  async getUserProfileDetails() {
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .subscribe((profile: Profile) => {
        this.profile = profile;
        this.getFrameworkDetails();
        this.fetchDisplayElements();
      });
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    this.appLabel = await this.commonUtilService.getAppName();
  }


  navigateToEditProfilePage() {
    if (!this.guestUser) {
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile,
          isCurrentUser: true
        }
      };
      this.router.navigate([RouterLinks.GUEST_EDIT], navigationExtras);
    }
  }

  getFrameworkDetails(): void {
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: (this.profile && this.profile.syllabus && this.profile.syllabus[0]) ? this.profile.syllabus[0] : '',
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then(async (framework: Framework) => {
        this.categories = framework.categories;

        if (this.profile.board && this.profile.board.length) {
          this.boards = this.getFieldDisplayValues(this.profile.board, 0);
        }
        if (this.profile.medium && this.profile.medium.length) {
          this.medium = this.getFieldDisplayValues(this.profile.medium, 1);
        }
        if (this.profile.grade && this.profile.grade.length) {
          this.grade = this.getFieldDisplayValues(this.profile.grade, 2);
        }
      });
  }

  getFieldDisplayValues(field: Array<any>, index: number): string {
    const displayValues = [];
    this.categories[index].terms.forEach(element => {
      if (field.includes(element.code)) {
        displayValues.push(element.name);
      }
    });
    return this.commonUtilService.arrayToString(displayValues);
  }

  async fetchDisplayElements() {
    const request: ContentAggregatorRequest = {
      interceptSearchCriteria: (contentSearchCriteria: ContentSearchCriteria) => {
        contentSearchCriteria.board = this.profile.board;
        contentSearchCriteria.medium = this.profile.medium;
        contentSearchCriteria.grade = this.profile.grade;
        contentSearchCriteria.searchType = SearchType.SEARCH;
        contentSearchCriteria.mode = 'soft';
        return contentSearchCriteria;
      }, from: CachedItemRequestSourceFrom.SERVER
    };

    this.displaySections = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.ADMIN_HOME);
    this.displaySections = this.contentAggregatorHandler.populateIcons(this.displaySections);
  }

  onPillClick(event) {
    switch (event.data[0].value.code) {
      case 'program':
        this.router.navigate([RouterLinks.PROGRAM], {})
        break
      case 'project':
        this.router.navigate([RouterLinks.PROJECT], {})
        break
      case 'observation':
        this.router.navigate([RouterLinks.OBSERVATION], {})
        break
      case 'survey':
        this.router.navigate([RouterLinks.SURVEY], {})
        break
      case 'report':
        this.router.navigate([RouterLinks.REPORTS], {})
        break
      case 'course':
        this.router.navigate([RouterLinks.SEARCH], {
          state: {
            source: PageId.ADMIN_HOME,
            preAppliedFilter: event.data[0].value.search
          }
        });
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

  navigateToDetailPage(event, sectionName) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;
    const index = event.index;
    const identifier = item.contentId || item.identifier;
    const values = {};
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToDetailPage(item, { content: item }); // TODO
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI_1');
    }
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

}
