import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AppGlobalService,
  AppHeaderService,
  CommonUtilService,
  ContentAggregatorHandler,
  Environment,
  FormAndFrameworkUtilService,
  ImpressionType,
  InteractSubtype,
  PageId,
  SunbirdQRScanner,
  TelemetryGeneratorService,
} from '@app/services';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption';
import { NavigationExtras, Router } from '@angular/router';
import { EventTopics, ProfileConstants, RouterLinks, ViewMore } from '../../app.constant';
import {
  FrameworkService,
  FrameworkDetailsRequest,
  FrameworkCategoryCodesGroup,
  Framework,
  Profile,
  ProfileService,
  ContentAggregatorRequest,
  ContentSearchCriteria,
  CachedItemRequestSourceFrom,
  SearchType,
  InteractType,
  FormService
} from '@project-sunbird/sunbird-sdk';
import { AggregatorPageType } from '@app/services/content/content-aggregator-namespaces';
import { NavigationService } from '@app/services/navigation-handler.service';
import { IonContent as ContentView } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription } from 'rxjs';
import { DbService, LocalStorageService } from '@app/app/manage-learn/core';
import { localStorageConstants } from '@app/app/manage-learn/core/constants/localStorageConstants';
import { UnnatiDataService } from '@app/app/manage-learn/core/services/unnati-data.service';
import { OnTabViewWillEnter } from '@app/app/tabs/on-tab-view-will-enter';
import { FieldConfig } from '@app/app/components/common-forms/field-config';
import { FormConstants } from '@app/app/form.constants';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit, OnDestroy, OnTabViewWillEnter {
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
  newThemeTimeout: any;

  displaySections: any[] = [];
  headerObservable: Subscription;
  @ViewChild('contentView', { static: false }) contentView: ContentView;

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FORM_SERVICE') private formService: FormService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private appGlobalService: AppGlobalService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private navService: NavigationService,
    private headerService: AppHeaderService,
    private events: Events,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private qrScanner: SunbirdQRScanner,
    private storage: LocalStorageService,
    private unnatiService: UnnatiDataService,
    private db: DbService
  ) {}

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
    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res && res.selectedLanguage) {
        this.fetchDisplayElements();
      }
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED,
      '',
      PageId.ADMIN_HOME,
      Environment.HOME
    );
  }

  tabViewWillEnter() {
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe((eventName) => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }

  getCreateProjectForm() {
    this.storage.getLocalStorage(localStorageConstants.PROJECT_META_FORM).then(
      (resp) => {},
      async (error) => {
        const createProjectMeta: FieldConfig<any>[] = await this.formAndFrameworkUtilService.getFormFields(
          FormConstants.PROJECT_CREATE_META
        );
        if (createProjectMeta.length) {
          this.storage.setLocalStorage(localStorageConstants.PROJECT_META_FORM, createProjectMeta);
        }
        this.getTaskForm();
      }
    );
  }

  getTaskForm() {
    this.storage.getLocalStorage(localStorageConstants.TASK_META_FORM).then(
      (resp) => {},
      async (error) => {
        const createTaskMeta: FieldConfig<any>[] = await this.formAndFrameworkUtilService.getFormFields(
          FormConstants.TASK_CREATE_META
        );
        if (createTaskMeta.length) {
          this.storage.setLocalStorage(localStorageConstants.TASK_META_FORM, createTaskMeta);
        }
      }
    );
  }

  async getUserProfileDetails() {
    this.profileService
      .getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .subscribe((profile: Profile) => {
        this.profile = profile;
        this.getFrameworkDetails();
        this.fetchDisplayElements();
        this.getCreateProjectForm();
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
          isCurrentUser: true,
        },
      };
      this.router.navigate([RouterLinks.GUEST_EDIT], navigationExtras);
    }
  }

  ionViewDidLeave() {
    if (this.newThemeTimeout && this.newThemeTimeout.clearTimeout) {
      this.newThemeTimeout.clearTimeout();
    }
  }

  getFrameworkDetails(): void {
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: this.profile && this.profile.syllabus && this.profile.syllabus[0] ? this.profile.syllabus[0] : '',
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
    };
    this.frameworkService
      .getFrameworkDetails(frameworkDetailsRequest)
      .toPromise()
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
    this.categories[index].terms.forEach((element) => {
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
      },
      from: CachedItemRequestSourceFrom.SERVER,
    };

    this.displaySections = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.ADMIN_HOME);
    this.displaySections = this.contentAggregatorHandler.populateIcons(this.displaySections);
  }

  onPillClick(event) {
    switch (event.data[0].value.code) {
      case 'program':
        this.router.navigate([RouterLinks.PROGRAM], {});
        this.generateTelemetry('PROGRAM_TILE_CLICKED');
        break;
      case 'project':
        this.router.navigate([RouterLinks.PROJECT], {});
        this.generateTelemetry('PROJECT_TILE_CLICKED');
        break;
      case 'observation':
        this.router.navigate([RouterLinks.OBSERVATION], {});
        this.generateTelemetry('OBSERVATION_TILE_CLICKED');
        break;
      case 'survey':
        this.router.navigate([RouterLinks.SURVEY], {});
        this.generateTelemetry('SURVEY_TILE_CLICKED');
        break;
      case 'report':
        this.router.navigate([RouterLinks.REPORTS], {});
        this.generateTelemetry('REPORTS_TILE_CLICKED');
        break;
      case 'course':
        this.router.navigate([`/${RouterLinks.TABS}/${RouterLinks.COURSES}`]);
        this.generateTelemetry('COURSE_TILE_CLICKED');

    }
  }

  generateTelemetry(interactiveSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype[interactiveSubtype],
      Environment.HOME,
      PageId.ADMIN_HOME
    );
  }

  navigateToViewMoreContentsPage(section) {
    const params: NavigationExtras = {
      state: {
        enrolledCourses: section.data.sections[0].contents,
        pageName: ViewMore.PAGE_COURSE_ENROLLED,
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        userId: this.appGlobalService.getUserId(),
      },
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
      default:
        console.warn('Use Proper Event name');
    }
  }

  redirectToActivedownloads() {
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  redirectToNotifications() {
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
      this.navService.navigateToDetailPage(item, { content: item }); 
    } else {
      this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
    }
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe('update_header');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe('onAfterLanguageChange:update');
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }
}
