import { Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { AggregatorPageType } from '../../services/content/content-aggregator-namespaces';
import { NavigationService } from '../../services/navigation-handler.service';
import { ProfileHandler } from '../../services/profile-handler';
import { ContentUtil } from '../../util/content-util';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { IonRefresher, Platform, PopoverController, ToastController } from '@ionic/angular';
import { Events } from '../../util/events';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption';
import forEach from 'lodash/forEach';
import { Subscription } from 'rxjs';
import {
  Content,
  ContentAggregatorRequest, ContentEventType, ContentImportRequest, ContentImportResponse, ContentImportStatus,
  ContentSearchCriteria, ContentService,
  CorrelationData, Course,
  CourseBatchesRequest,
  CourseBatchStatus,
  CourseEnrollmentType,
  CourseService, DownloadEventType, DownloadProgress, EventsBusEvent, EventsBusService,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkService, FrameworkUtilService, GetFrameworkCategoryTermsRequest, NetworkError, PageAssembleCriteria, PageName,
  Profile, ProfileService, SharedPreferences,
  SortOrder, TelemetryObject
} from '@project-sunbird/sunbird-sdk';
import {
  BatchConstants, ContentCard,
  ContentFilterConfig, EventTopics,
  MimeType, PreferenceKey, ProfileConstants,
  ProgressPopupContext, RouterLinks, ViewMore
} from '../../app/app.constant';
import { AppGlobalService } from '../../services/app-global-service.service';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { CourseUtilService } from '../../services/course-util.service';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { QRResultCallback, SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import { CorReleationDataType, Environment, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { applyProfileFilter, updateFilterInSearchQuery } from '../../util/filter.util';
import { EnrollmentDetailsComponent } from '../components/enrollment-details/enrollment-details.component';
import { PageFilterCallback, PageFilterPage } from '../page-filter/page-filter.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit, OnDestroy {

  @ViewChild('courseRefresher', { static: false }) refresher: IonRefresher;

  /**
   * Contains enrolled course
   */
  enrolledCourses: Array<Course> = [];

  /**
   * Contains popular and latest courses ist
   */
  popularAndLatestCourses: Array<any>;

  /**
   * Contains user id
   */
  userId: string;

  /**
   * Flag to show/hide loader
   */
  showLoader = true;

  layoutInProgress = ContentCard.LAYOUT_INPROGRESS;
  layoutPopular = ContentCard.LAYOUT_POPULAR;

  /**
   * Flag to show latest and popular course loader
   */
  pageApiLoader = true;
  guestUser = false;
  showSignInCard = false;
  isOnBoardingCardCompleted = false;
  onBoardingProgress = 0;
  toast: any;
  selectedLanguage = 'en';
  appLabel: string;
  courseFilter: any;
  appliedFilter: any;
  filterIcon = './assets/imgs/ic_action_filter.png';
  profile: Profile;
  isVisible = false;
  inProgressSection = 'My Courses';

  /**
   * To queue downloaded identifier
   */
  queuedIdentifiers: Array<any> = [];
  downloadPercentage = 0;
  showOverlay = false;
  resumeContentData: any;
  tabBarElement: any;
  isFilterApplied = false;
  callback: QRResultCallback;
  pageFilterCallBack: PageFilterCallback;
  isUpgradePopoverShown = false;
  private eventSubscription: Subscription;
  headerObservable: any;
  private corRelationList: Array<CorrelationData>;
  isFilterOpen = false;
  private ssoSectionId?: string;

  courseCardType = CourseCardGridTypes;
  loader: any;
  dynamicCourses: any;
  searchGroupingContents: any;
  resetCourseFilter: boolean;
  filter: ContentSearchCriteria;
  isCourseListEmpty: boolean;
  userFrameworkDetails = {};
  frameworkCategories: any;

  constructor(
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private appVersion: AppVersion,
    private ngZone: NgZone,
    private qrScanner: SunbirdQRScanner,
    private popCtrl: PopoverController,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private courseUtilService: CourseUtilService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private network: Network,
    private router: Router,
    private toastController: ToastController,
    private headerService: AppHeaderService,
    private sbProgressLoader: SbProgressLoader,
    private navService: NavigationService,
    private contentAggregatorHandler: ContentAggregatorHandler,
    private profileHandler: ProfileHandler,
    private translate: TranslateService,
    public platform: Platform
  ) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
      .then(val => {
        if (val && val.length) {
          this.selectedLanguage = val;
        }
      });

    this.subscribeUtilityEvents();

    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
    this.generateNetworkType();
  }

  /**
   * Angular life cycle hooks
   */
  ngOnInit() {
    this.getCourseTabData();

    this.events.subscribe('event:update_course_data', async () => {
      await this.getAggregatorResult();
    });
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.events.unsubscribe('update_header');
    this.ngZone.run(() => {
      if (this.eventSubscription) {
        this.eventSubscription.unsubscribe();
      }
      this.isVisible = false;
      this.showOverlay = false;
      this.downloadPercentage = 0;
    });
    this.unsubscribeUtilityEvents();
  }

  unsubscribeUtilityEvents() {
    this.events.unsubscribe(AppGlobalService.PROFILE_OBJ_CHANGED);
    this.events.unsubscribe(EventTopics.COURSE_STATUS_UPDATED_SUCCESSFULLY);
    this.events.unsubscribe('force_optional_upgrade');
    this.events.unsubscribe('onboarding-card:completed');
    this.events.unsubscribe('onboarding-card:increaseProgress');
    this.events.unsubscribe('course:resume');
    this.events.unsubscribe(EventTopics.ENROL_COURSE_SUCCESS);
    this.events.unsubscribe('onAfterLanguageChange:update');
    this.events.unsubscribe(EventTopics.COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE);
    this.events.unsubscribe(EventTopics.TAB_CHANGE);
    this.events.unsubscribe(EventTopics.REFRESH_ENROLL_COURSE_LIST);
    this.events.unsubscribe(EventTopics.SIGN_IN_RELOAD);
  }

  async ionViewWillEnter() {
    this.refresher.disabled = false;
    this.isVisible = true;
    this.events.subscribe('update_header', async () => {
      await this.headerService.showHeaderWithHomeButton(['search', 'download']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async eventName => {
      await this.handleHeaderEvents(eventName);
    });
    await this.headerService.showHeaderWithHomeButton(['search', 'download']);
  }

  async ionViewDidEnter() {
    await this.sbProgressLoader.hide({ id: ProgressPopupContext.DEEPLINK });
    this.appGlobalService.generateConfigInteractEvent(PageId.COURSES, this.isOnBoardingCardCompleted);

    this.events.subscribe('event:showScanner', async (data) => {
      if (data.pageName === PageId.COURSES) {
        await this.qrScanner.startScanner(PageId.COURSES, false);
      }
    });
    await this.sbProgressLoader.hide({ id: 'login' });
  }

  ionViewWillLeave() {
    this.refresher.disabled = true;
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.events.unsubscribe('update_header');
    this.ngZone.run(() => {
      if (this.eventSubscription) {
        this.eventSubscription.unsubscribe();
      }
      this.isVisible = false;
      this.showOverlay = false;
      this.downloadPercentage = 0;
    });
  }

  generateNetworkType() {
    const values = new Map();
    values['network-type'] = this.network.type;
    this.telemetryGeneratorService.generateExtraInfoTelemetry(
      values,
      PageId.LIBRARY
    );
  }

  subscribeUtilityEvents() {
    // Event for optional and forceful upgrade
    this.events.subscribe('force_optional_upgrade', async (upgrade) => {
      if (upgrade && !this.isUpgradePopoverShown) {
        await this.appGlobalService.openPopover(upgrade);
        this.isUpgradePopoverShown = true;
      }
    });

    this.events.subscribe('onboarding-card:completed', (param) => {
      this.isOnBoardingCardCompleted = param.isOnBoardingCardCompleted;
    });

    this.events.subscribe(AppGlobalService.PROFILE_OBJ_CHANGED, () => {
      this.getCourseTabData();
    });

    this.events.subscribe(EventTopics.COURSE_STATUS_UPDATED_SUCCESSFULLY, async (data) => {
      if (data.update) {
        await this.getAggregatorResult();
      }
    });

    this.events.subscribe('onboarding-card:increaseProgress', (progress) => {
      this.onBoardingProgress = progress.cardProgress;
    });

    this.events.subscribe('course:resume', async (data) => {
      this.resumeContentData = data.content;
      await this.getContentDetails(data.content);
    });

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, (res) => {
      if (res && res.batchId) {
        this.getAggregatorResult();
      }
    });

    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res && res.selectedLanguage) {
        this.selectedLanguage = res.selectedLanguage;
        this.getAggregatorResult();
      }
    });

    this.events.subscribe(EventTopics.COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE, async () => {
      await this.ngZone.run(async () => {
        await this.getAggregatorResult();
      });
    });

    this.events.subscribe(EventTopics.TAB_CHANGE, (data: string) => {
      this.ngZone.run(async () => {
        if (data.trim().toUpperCase() === 'COURSES') {
          if (this.appliedFilter) {
            this.filterIcon = './assets/imgs/ic_action_filter.png';
            this.courseFilter = undefined;
            this.appliedFilter = undefined;
            this.isFilterApplied = false;
            this.filter = undefined;
            this.resetCourseFilter = true;
            await this.getAggregatorResult();
          }
        }
      });
    });
    this.events.subscribe(EventTopics.REFRESH_ENROLL_COURSE_LIST, async () => {
      await this.getAggregatorResult();
    });

    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async () => {
      this.showSignInCard = false;
    });
  }

  generateExtraInfoTelemetry(sectionsCount) {
    const values = new Map();
    values['pageSectionCount'] = sectionsCount;
    values['networkAvailable'] = this.commonUtilService.networkInfo.isNetworkAvailable ? 'Y' : 'N';
    this.telemetryGeneratorService.generateExtraInfoTelemetry(
      values,
      PageId.COURSES
    );
  }

  /**
   * To start / stop spinner
   */
  spinner(flag: boolean) {
    this.ngZone.run(() => {
      this.showLoader = flag;
    });
  }

  /**
   * Get user id.
   *
   * Used to get enrolled course(s) of logged-in user
   */
  getUserId() {
    return new Promise<void>((resolve, reject) => {
      this.guestUser = !this.appGlobalService.isUserLoggedIn();

      if (this.guestUser) {
        this.getCurrentUser();
        this.appGlobalService.setEnrolledCourseList([]);
        reject('session expired');
      } else {
        const sessionObj = this.appGlobalService.getSessionData();
        this.userId = sessionObj[ProfileConstants.USER_TOKEN];
        resolve();
      }
    });
  }

  getCourseTabData(refresher?) {
    setTimeout(() => {
      if (refresher) {
        refresher.target.complete();
        this.telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.COURSES, Environment.HOME);
      }
    }, 10);

    this.enrolledCourses = [];
    this.popularAndLatestCourses = [];

    this.getUserId()
      .then(async () => {
        await this.getAggregatorResult();
      })
      .catch(async () => {
        await this.getAggregatorResult();
      });
  }

  /**
   * It will fetch the guest user profile details
   */
  private getCurrentUser(): void {
    const profileType = this.appGlobalService.getGuestUserType();
    this.showSignInCard = this.commonUtilService.isAccessibleForNonStudentRole(profileType);
  }

  async search() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SEARCH_BUTTON_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    const primaryCategories = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_COURSE);
    await this.router.navigate([RouterLinks.SEARCH], {
      state: {
        primaryCategories,
        source: PageId.COURSES,
        enrolledCourses: this.enrolledCourses,
        guestUser: this.guestUser,
        userId: this.userId,
        searchWithBackButton: true
      }
    });
  }

  async showFilter() {
    if (this.isFilterOpen) {
      return;
    }
    this.isFilterOpen = true;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.FILTER_BUTTON_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    const that = this;

    this.pageFilterCallBack = {
      async applyFilter(filter, appliedFilter, isChecked) {
        await that.ngZone.run(async () => {
          const criteria: PageAssembleCriteria = {
            name: PageName.COURSE,
            source: 'app'
          };
          criteria.filters = filter;
          that.courseFilter = appliedFilter;
          that.appliedFilter = filter;
          let filterApplied = false;

          that.isFilterApplied = false;

          const values = new Map();
          values['filters'] = filter;
          that.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.APPLY_FILTER_CLICKED,
            Environment.HOME,
            PageId.COURSE_PAGE_FILTER,
            undefined,
            values
          );

          Object.keys(that.appliedFilter).forEach(key => {
            if (that.appliedFilter[key].length > 0) {
              filterApplied = true;
              that.isFilterApplied = true;
            }
          });

          if (filterApplied) {
            that.filterIcon = './assets/imgs/ic_action_filter_applied.png';
          } else {
            that.filterIcon = './assets/imgs/ic_action_filter.png';
          }
          if (isChecked) {
            that.filter = filter;
            await that.getAggregatorResult();
          }
        });
      }
    };

    const filterOptions = {
      callback: this.pageFilterCallBack,
      pageId: PageId.COURSES
    };
    if (this.courseFilter) {
      filterOptions['filter'] = this.courseFilter;
      await this.showFilterPage(filterOptions);
    } else {
      this.formAndFrameworkUtilService.getCourseFilterConfig().then(async (data) => {
        if (this.resetCourseFilter) {
          data = this.resetFilter(data);
          this.resetCourseFilter = false;
        }
        filterOptions['filter'] = data;
        await this.showFilterPage(filterOptions);
      }).catch(() => {
        this.isFilterOpen = false;
      });
    }
  }

  resetFilter(data) {
    for (let i = 0; data.length > i; i++) {
      data[i].selected = [];
    }
    return data;
  }

  private async presentToastForOffline(msg: string) {
    this.toast = await this.toastController.create({
      duration: 3000,
      message: this.commonUtilService.translateMessage(msg),
      buttons: [],
      position: 'top',
      cssClass: 'toastHeader'
    });
    await this.toast.present();
    this.toast.onDidDismiss().then(() => {
      this.toast = undefined;
    });
  }

  async showFilterPage(filterOptions) {
    const backupFilter = this.appliedFilter ? JSON.parse(JSON.stringify(this.appliedFilter)) : this.appliedFilter;
    const popup = await this.popCtrl.create({
      component: PageFilterPage,
      componentProps: {
        callback: filterOptions.callback,
        filter: filterOptions.filter,
        pageId: PageId.COURSES,
        reset: filterOptions.reset || false
      },
      cssClass: 'resource-filter'
    });
    await popup.present();
    const { data } = await popup.onDidDismiss();
    this.isFilterOpen = false;
    if (!data || !data.apply) {
      this.appliedFilter = backupFilter;
    }
  }

  checkEmptySearchResult(isAfterLanguageChange = false) {
    const flags = [];
    forEach(this.popularAndLatestCourses, (value, key) => {
      if (value.contents && value.contents.length) {
        flags[key] = true;
      }
    });

    if (flags.length && flags.includes(true)) {
    } else {
      if (!isAfterLanguageChange) {
        if (this.commonUtilService.currentTabName === 'courses') {
          this.commonUtilService.showToast('NO_CONTENTS_FOUND', this.isVisible);
        }
      }
    }
  }

  async showOfflineWarning() {
    await this.presentToastForOffline('NO_INTERNET_TITLE');
  }

  retryShowingPopularCourses(showRefresh = false) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable && showRefresh) {
      this.getCourseTabData();
    }
  }

  async getContentDetails(content) {
    const identifier = content.contentId || content.identifier;
    this.corRelationList = [
      {
        id: content.batchId ? content.batchId : '',
        type: CorReleationDataType.COURSE_BATCH
      }
    ];
    const request = {
      contentId: identifier,
      objectType: content.objectType,
      emitUpdateIfAny: false
    };
    try {
      let data: Content = await this.contentService.getContentDetails(request).toPromise()
        if (data && data.isAvailableLocally) {
          if (data.contentData.pkgVersion < content.content.pkgVersion) {
            this.contentDetailsImportCall(identifier);
          } else {
            this.showOverlay = false;
            await this.navigateToContentDetailsPage(content);
          }
        } else {
          this.contentDetailsImportCall(identifier);
        }
      }
      catch(err) {
        if (NetworkError.isInstance(err)) {
          this.commonUtilService.showToast('NO_INTERNET');
        } else {
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
      }
  }

  private contentDetailsImportCall(identifier) {
    this.subscribeSdkEvent();
    this.showOverlay = true;
    this.importContent([identifier], false);
  }

  async navigateToViewMoreContentsPage(showEnrolledCourses: boolean, sectionId?: string, searchQuery?: any, headerTitle?: string) {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      await this.presentToastForOffline('NO_INTERNET_TITLE'); return;
    }
    let params: NavigationExtras;
    let title;
    if (showEnrolledCourses) {
      title = this.commonUtilService.translateMessage('COURSES_IN_PROGRESS');
      params = {
        state: {
          headerTitle: 'COURSES_IN_PROGRESS',
          userId: this.userId,
          pageName: ViewMore.PAGE_COURSE_ENROLLED,
          sectionName: this.inProgressSection
        }
      };
    } else {
      searchQuery = updateFilterInSearchQuery(searchQuery, this.appliedFilter, this.isFilterApplied);

      if (this.ssoSectionId && sectionId === this.ssoSectionId) {
        searchQuery.request.filters['batches.createdFor'] = [this.frameworkService.activeChannelId];
      }

      title = headerTitle;
      params = {
        state: {
          headerTitle,
          pageName: ViewMore.PAGE_COURSE_POPULAR,
          requestParams: searchQuery,
          enrolledCourses: this.enrolledCourses,
          guestUser: this.guestUser,
          sectionName: headerTitle
        }

      };
    }
    const values = new Map();
    values['SectionName'] = title;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEWALL_CLICKED,
      Environment.HOME,
      PageId.COURSES, undefined,
      values);
    await this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);

  }

  private async navigateToContentDetailsPage(content) {
    const identifier = content.contentId || content.identifier;
    const extras: NavigationExtras = {
      state: {
        content: { identifier: content.lastReadContentId },
        depth: '1',
        contentState: {
          batchId: content.batchId ? content.batchId : '',
          courseId: identifier
        },
        isResumedCourse: true,
        isChildContent: true,
        resumedCourseCardData: content,
        isCourse: true,
        corRelation: this.corRelationList,
        course: content
      }
    };
    await this.router.navigate([RouterLinks.CONTENT_DETAILS], extras);
  }

  private importContent(identifiers, isChild) {
    const option: ContentImportRequest = {
      contentImportArray: this.courseUtilService.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.ngZone.run(() => {
          this.tabBarElement.style.display = 'none';
          if (data && data.length) {
            const importStatus = data[0];

            if (importStatus.status !== ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
              this.removeOverlayAndShowError();
            }
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.removeOverlayAndShowError();
        });
      });
  }

  /**
   * This method removes the loading/downloading overlay and displays the error message
   * and also shows the bottom navigation bar
   */
  private removeOverlayAndShowError(): any {
    this.commonUtilService.showToast('COURSE_NOT_AVAILABLE');
    this.tabBarElement.style.display = 'flex';
    this.showOverlay = false;
  }

  private subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe(async (event: EventsBusEvent) => {
      await this.ngZone.run(async () => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;
          this.downloadPercentage = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
        }

        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED && this.downloadPercentage === 100) {
          this.showOverlay = false;
          await this.navigateToContentDetailsPage(this.resumeContentData);
        }
      });
    }) as any;
  }

  cancelDownload() {
    this.ngZone.run(() => {
      this.contentService.cancelDownload(this.resumeContentData.contentId ||
        this.resumeContentData.identifier).toPromise()
        .then(() => {
          this.tabBarElement.style.display = 'flex';
          this.showOverlay = false;
        }).catch(() => {
          this.tabBarElement.style.display = 'flex';
          this.showOverlay = false;
        });
    });
  }

  async handleHeaderEvents($event) {
    switch ($event.name) {
      case 'search':
        await this.search();
        break;
      case 'filter':
        await this.showFilter();
        break;
      case 'download':
        await this.redirectToActivedownloads();
        break;
    }
  }

  private async redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    await this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  async openEnrolledCourseDetails(event) {
    const params = {
      env: 'home',
      sectionName: this.inProgressSection,
      pageName: 'course',
      course: event.data,
      guestUser: this.guestUser,
      layoutName: this.layoutInProgress,
      enrolledCourses: this.enrolledCourses
    };
    await this.checkRetiredOpenBatch(params.course, params);
  }

  async openCourseDetails(event, section, index) {
    const params = {
      env: 'home',
      index,
      sectionName: section.name,
      pageName: 'course',
      course: event.data,
      guestUser: this.guestUser,
      layoutName: this.layoutPopular,
      enrolledCourses: this.enrolledCourses,
      isFilterApplied: this.isFilterApplied
    };
    await this.checkRetiredOpenBatch(params.course, params);
  }

  async checkRetiredOpenBatch(content: any, courseDetails) {
    let anyRunningBatch = false;
    let retiredBatches: Array<any> = [];
    const enrolledCourses = courseDetails.enrolledCourses || [];
    if (courseDetails.layoutName !== ContentCard.LAYOUT_INPROGRESS) {
      retiredBatches = enrolledCourses.filter((element) => {
        if (element.contentId === content.identifier && element.batch.status === 1 && element.cProgress !== 100) {
          anyRunningBatch = true;
          content.batch = element.batch;
        }
        if (element.contentId === content.identifier && element.batch.status === 2 && element.cProgress !== 100) {
          return element;
        }
      });
    }
    if (anyRunningBatch || !retiredBatches.length) {
      // open the batch directly
      await this.navigateToDetailPage(content, courseDetails);
    } else if (retiredBatches.length) {
      await this.navigateToBatchListPopup(content, courseDetails, retiredBatches);
    }
  }

  async navigateToBatchListPopup(content: any, courseDetails: any, retiredBatched?: any) {
    const ongoingBatches = [];
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.IN_PROGRESS]
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!courseDetails.guestUser) {
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then(async (data: any) => {
            await this.ngZone.run(async () => {
              const batches = data;
              if (batches.length) {
                batches.forEach((batch, key) => {
                  if (batch.status === 1) {
                    ongoingBatches.push(batch);
                  }
                });
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                  'showing-enrolled-ongoing-batch-popup',
                  Environment.HOME,
                  PageId.CONTENT_DETAIL, undefined,
                  reqvalues);
                const popover = await this.popCtrl.create({
                  component: EnrollmentDetailsComponent,
                  componentProps: {
                    upcommingBatches: [],
                    ongoingBatches,
                    retiredBatched,
                    content
                  },
                  cssClass: 'enrollement-popover'
                });
                await popover.present();
              } else {
                await this.navigateToDetailPage(content, courseDetails);
              }
            });
          })
          .catch((error: any) => {
            console.log('error while fetching course batches ==>', error);
          });
      } else {
        await this.router.navigate([RouterLinks.COURSE_BATCHES]);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  /**
   * Navigate to the course/content details page
   */
  async navigateToDetailPage(content: any, courseDetails: any) {
    const identifier = content.contentId || content.identifier;
    let telemetryObject: TelemetryObject;
    if (courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS) {
      telemetryObject = new TelemetryObject(identifier, CsPrimaryCategory.COURSE, undefined);
    } else {
      telemetryObject = ContentUtil.getTelemetryObject(content);
    }

    const corRelationList: Array<CorrelationData> = [{
      id: courseDetails.sectionName,
      type: CorReleationDataType.SECTION
    }, {
      id: identifier || '',
      type: CorReleationDataType.ROOT_ID
    }];
    if (courseDetails.isFilterApplied) {
      corRelationList.push({
        id: 'filter',
        type: CorReleationDataType.DISCOVERY_TYPE
      });
    }
    const values = new Map();
    values['sectionName'] = courseDetails.sectionName;
    values['positionClicked'] = courseDetails.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      courseDetails.env,
      courseDetails.pageName ? courseDetails.pageName : courseDetails.layoutName,
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      this.commonUtilService.deDupe(corRelationList, 'type'));
    if (courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS || ContentUtil.isTrackable(content) === 1) {
      await this.navService.navigateToTrackableCollection({
        content,
        isCourse: true,
        corRelation: corRelationList
      });
    } else if (content.mimeType === MimeType.COLLECTION) {
      await this.navService.navigateToCollection({
        content,
        corRelation: corRelationList
      });
    } else {
      await this.navService.navigateToContent({
        content,
        isCourse: true,
        corRelation: corRelationList
      });
    }
  }

  async navigateToTextbookPage(items, subject) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      ContentUtil.getTelemetryObject(items));
    if (this.commonUtilService.networkInfo.isNetworkAvailable || items.isAvailableLocally) {

      await this.router.navigate([RouterLinks.TEXTBOOK_VIEW_MORE], {
        state: {
          contentList: items,
          subjectName: subject,
          categoryKeys: this.appGlobalService.getCachedFrameworkCategory().value,
        }
      });
    } else {
      await this.commonUtilService.presentToastForOffline('OFFLINE_WARNING_ETBUI');
    }
  }

  async getUserFrameworkDetails() {
    if (this.profile?.serverProfile?.framework){
      this.userFrameworkDetails = this.profile.serverProfile.framework;
    } else if(this.profile.categories) {
      let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
      await this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(this.profile.syllabus[0], rootOrgId).then((categories) => {
        if (categories) {
          this.frameworkCategories = categories.sort((a, b) => a.index - b.index);
          let frameworkValue =typeof this.profile.categories === 'string' ? JSON.parse(this.profile.categories) : this.profile.categories;
          categories.forEach((e) => {
              this.userFrameworkDetails[e.code] = Array.isArray(frameworkValue[e.identifier]) ? frameworkValue[e.identifier] : [frameworkValue[e.identifier]]
            })
        }
      });
    }
  }

  async getAggregatorResult(resetFilter?: boolean) {
    this.spinner(true);
    this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    await this.getUserFrameworkDetails();
    const request = {
      userPreferences: this.userFrameworkDetails,
      applyFirstAvailableCombination: {},
      interceptSearchCriteria: (contentSearchCriteria) => {
        contentSearchCriteria = {...contentSearchCriteria, ...this.userFrameworkDetails};
        return contentSearchCriteria;
      }
      }
    try {
      let rootOrgId = this.profile.serverProfile ? this.profile.serverProfile['rootOrgId'] : undefined;
      this.dynamicCourses = await this.contentAggregatorHandler.newAggregate(request, AggregatorPageType.COURSE, rootOrgId, this.profile.syllabus[0]);
      if (this.dynamicCourses) {
        this.dynamicCourses = this.contentAggregatorHandler.populateIcons(this.dynamicCourses);
        this.isGroupedCoursesAvailable(this.dynamicCourses);
      }
      this.spinner(false);
    } catch (e) {
      this.spinner(false);
    }
  }

  concatFilter(filter, searchCriteria) {
    if (filter.gradeLevel) {
      filter.grade = filter.gradeLevel;
      delete filter.gradeLevel;
    }
    return { ...filter, ...searchCriteria };
  }

  async exploreOtherContents() {
    const syllabus: Array<string> = this.appGlobalService.getCurrentUser().syllabus;
    const frameworkId = (syllabus && syllabus.length > 0) ? syllabus[0] : undefined;
    const gradeLevelInfo = await this.getCategoryData(frameworkId, FrameworkCategoryCode.GRADE_LEVEL, this.profile.grade);
    const mediumInfo = await this.getCategoryData(frameworkId, FrameworkCategoryCode.MEDIUM, this.profile.medium);
    const subjectInfo = await this.getCategoryData(frameworkId, FrameworkCategoryCode.SUBJECT, this.profile.subject);
    const navigationExtras = {
      state: {
        categoryGradeLevels: gradeLevelInfo['categoryList'],
        primaryCategories: [CsPrimaryCategory.COURSE],
        selectedGrade:  gradeLevelInfo['selectedCategory'],
        selectedMedium: mediumInfo['selectedCategory'],
        subjects: [...subjectInfo['categoryList']]
      }
    };
    await this.router.navigate([RouterLinks.EXPLORE_BOOK], navigationExtras);

    const corRelationList: Array<CorrelationData> = [];
    corRelationList.push({ id: this.profile.board ? this.profile.board.join(',') : '', type: CorReleationDataType.BOARD });
    corRelationList.push({
      id: this.profile.grade && this.profile.grade.length ? this.profile.grade.join(',') : '',
      type: CorReleationDataType.CLASS });
    corRelationList.push({
      id: this.profile.medium && this.profile.medium.length ? this.profile.medium.join(',') : '',
      type: CorReleationDataType.MEDIUM });
  }

  async getCategoryData(frameworkId, categoryName, currentCategory): Promise<any> {
    const req: GetFrameworkCategoryTermsRequest = {
      currentCategoryCode: categoryName,
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
      frameworkId
    };
    const categoryMapList = await this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise();
    const selectedCategory = ((categoryMapList || [])
                            .filter((category) => (currentCategory || []).includes(category.code)) || [])
                            .map((category) => category.name);
    return {
      selectedCategory,
      categoryList: categoryMapList
    };
  }

  isGroupedCoursesAvailable(displayItems) {
    this.isCourseListEmpty = true;
    for (let index = 0; index < displayItems.length; index++) {
      if (displayItems[index] && displayItems[index].data && ((displayItems[index].data.length) ||
        (displayItems[index].data.sections && displayItems[index].data.sections.length && displayItems[index].data.sections[0].contents && displayItems[index].data.sections[0].contents.length)
      )) {
        this.isCourseListEmpty = false;
        break;
      }
    }
  }

}
