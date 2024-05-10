import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { FormAndFrameworkUtilService } from '../../../services/formandframeworkutil.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  PageId
} from '../../../services/telemetry-constants';
import { CommonUtilService } from '../../../services/common-util.service';
import { ContentAggregatorHandler } from '../../../services/content/content-aggregator-handler.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { SunbirdQRScanner } from '../../../services/sunbirdqrscanner.service';
import { ButtonPosition, CourseCardGridTypes } from '@project-sunbird/common-consumption';
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
import { AggregatorPageType } from '../../../services/content/content-aggregator-namespaces';
import { NavigationService } from '../../../services/navigation-handler.service';
import { IonContent as ContentView } from '@ionic/angular';
import { Events } from '../../../util/events';
import { Subscription } from 'rxjs';
// TODO: Capacitor temp fix
import { DbService, LocalStorageService } from '../../../app/manage-learn/core';
import { localStorageConstants } from '../../../app/manage-learn/core/constants/localStorageConstants';
import { UnnatiDataService } from '../../../app/manage-learn/core/services/unnati-data.service';
import { OnTabViewWillEnter } from '../../../app/tabs/on-tab-view-will-enter';
import { FieldConfig } from '../../../app/components/common-forms/field-config';
import { FormConstants } from '../../../app/form.constants';

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
  ButtonPosition = ButtonPosition;
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
    // TODO: Capacitor temp fix - doesn't support cap app
    private storage: LocalStorageService,
    private unnatiService: UnnatiDataService,
    private db: DbService
  ) {}

  async ngOnInit() {
    await this.getUserProfileDetails();
    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, async () => {
      await this.getUserProfileDetails();
    });
    this.events.subscribe(EventTopics.TAB_CHANGE, async (data: string) => {
      if (data === '') {
        await this.qrScanner.startScanner(this.appGlobalService.getPageIdForTelemetry());
      }
    });
    this.events.subscribe('onAfterLanguageChange:update', async (res) => {
      if (res && res.selectedLanguage) {
        await this.fetchDisplayElements();
      }
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED,
      '',
      PageId.ADMIN_HOME,
      Environment.HOME
    );
  }

  async tabViewWillEnter() {
    await this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }

  async ionViewWillEnter() {
    this.events.subscribe('update_header', async () => {
      await this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async (eventName) => {
      await this.handleHeaderEvents(eventName);
      await this.headerService.showHeaderWithHomeButton(['download', 'notification']);
    });
    await this.headerService.showHeaderWithHomeButton(['download', 'notification']);
  }
  
  // TODO: Capacitor temp fix 
  getCreateProjectForm() {
    this.storage.getLocalStorage(localStorageConstants.PROJECT_META_FORM).then(
      (resp) => {},
      async (error) => {
        const createProjectMeta: FieldConfig<any>[] = await this.formAndFrameworkUtilService.getFormFields(
          FormConstants.PROJECT_CREATE_META
        );
        if (createProjectMeta.length) {
          await this.storage.setLocalStorage(localStorageConstants.PROJECT_META_FORM, createProjectMeta);
        }
        this.getTaskForm();
      }
    );
  }

  // TODO: Capacitor temp fix 
  getTaskForm() {
    this.storage.getLocalStorage(localStorageConstants.TASK_META_FORM).then(
      (resp) => {},
      async (error) => {
        const createTaskMeta: FieldConfig<any>[] = await this.formAndFrameworkUtilService.getFormFields(
          FormConstants.TASK_CREATE_META
        );
        if (createTaskMeta.length) {
          await this.storage.setLocalStorage(localStorageConstants.TASK_META_FORM, createTaskMeta);
        }
      }
    );
  }

  async getUserProfileDetails() {
    this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
    this.getFrameworkDetails();
    await this.fetchDisplayElements();
    this.getCreateProjectForm();
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    this.appLabel = await this.commonUtilService.getAppName();
  }

  async navigateToEditProfilePage() {
    if (!this.guestUser) {
      await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile,
          isCurrentUser: true,
        },
      };
      await this.router.navigate([RouterLinks.GUEST_EDIT], navigationExtras);
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
      }).catch(e => console.error(e));
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

  async onPillClick(event) {
    switch (event.data[0].value.code) {
      case 'program':
        await this.router.navigate([RouterLinks.PROGRAM], {});
        this.generateTelemetry('PROGRAM_TILE_CLICKED');
        break;
      case 'project':
        await this.router.navigate([RouterLinks.PROJECT], {});
        this.generateTelemetry('PROJECT_TILE_CLICKED');
        break;
      case 'observation':
        await this.router.navigate([RouterLinks.OBSERVATION], {});
        this.generateTelemetry('OBSERVATION_TILE_CLICKED');
        break;
      case 'survey':
        await this.router.navigate([RouterLinks.SURVEY], {});
        this.generateTelemetry('SURVEY_TILE_CLICKED');
        break;
      case 'report':
        await this.router.navigate([RouterLinks.REPORTS], {});
        this.generateTelemetry('REPORTS_TILE_CLICKED');
        break;
      case 'course':
        await this.router.navigate([`/${RouterLinks.TABS}/${RouterLinks.COURSES}`]);
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

  async navigateToViewMoreContentsPage(section) {
    const params: NavigationExtras = {
      state: {
        enrolledCourses: section.data.sections[0].contents,
        pageName: ViewMore.PAGE_COURSE_ENROLLED,
        headerTitle: this.commonUtilService.getTranslatedValue(section.title, ''),
        userId: this.appGlobalService.getUserId(),
      },
    };
    await this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);
  }

  async handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        await this.redirectToActivedownloads();
        break;
      case 'notification':
        await this.redirectToNotifications();
        break;
      default:
        console.warn('Use Proper Event name');
    }
  }

  async redirectToActivedownloads() {
    await this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  async redirectToNotifications() {
    await this.router.navigate([RouterLinks.NOTIFICATION]);
  }

  async navigateToDetailPage(event, sectionName) {
    event.data = event.data.content ? event.data.content : event.data;
    const item = event.data;
    const index = event.index;
    const values = {};
    values['sectionName'] = sectionName;
    values['positionClicked'] = index;
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      await this.navService.navigateToDetailPage(item, { content: item }); 
    } else {
      await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
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
