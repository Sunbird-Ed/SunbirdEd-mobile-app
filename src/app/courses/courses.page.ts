import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events, ToastController, PopoverController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { QRResultCallback, SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import has from 'lodash/has';
import forEach from 'lodash/forEach';
import { ContentCard, EventTopics, PreferenceKey, ProfileConstants, ViewMore, RouterLinks, ContentType, ContentFilterConfig } from '../../app/app.constant';
import { PageFilterPage, PageFilterCallback } from '../page-filter/page-filter.page';
import { Network } from '@ionic-native/network/ngx';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CourseUtilService } from '../../services/course-util.service';
import { updateFilterInSearchQuery } from '../../util/filter.util';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import {
  Content, ContentEventType, ContentImportRequest, ContentImportResponse, ContentImportStatus, ContentService, Course,
  CourseService, DownloadEventType, DownloadProgress, EventsBusEvent, EventsBusService, FetchEnrolledCourseRequest,
  PageAssembleCriteria, PageAssembleService, PageName, ProfileType, SharedPreferences, NetworkError, CorrelationData
} from 'sunbird-sdk';
import { Environment, InteractSubtype, InteractType, PageId, CorReleationDataType } from '../../services/telemetry-constants';
import { Subscription } from 'rxjs';
import { AppHeaderService } from '../../services/app-header.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit {
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
  profile: any;
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
  private mode = 'soft';
  private eventSubscription: Subscription;
  headerObservable: any;
  private corRelationList: Array<CorrelationData>;
  isFilterOpen: boolean = false;

  constructor(
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('PAGE_ASSEMBLE_SERVICE') private pageService: PageAssembleService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
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
    private route: ActivatedRoute
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

    this.events.subscribe('event:update_course_data', () => {
        this.getEnrolledCourses();
    });
  }

  ionViewWillEnter() {
    this.isVisible = true;
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton(['search', 'filter', 'download']);
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton(['search', 'filter', 'download']);
  }

  ionViewDidEnter() {
    this.appGlobalService.generateConfigInteractEvent(PageId.COURSES, this.isOnBoardingCardCompleted);

    this.events.subscribe('event:showScanner', (data) => {
      if (data.pageName === PageId.COURSES) {
        this.qrScanner.startScanner(PageId.COURSES, false);
      }
    });
  }

  ionViewWillLeave() {
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

    this.events.subscribe(EventTopics.COURSE_STATUS_UPDATED_SUCCESSFULLY, (data) => {
      if (data.update) {
        this.getEnrolledCourses(false, true);
      }
    });

    this.events.subscribe('onboarding-card:increaseProgress', (progress) => {
      this.onBoardingProgress = progress.cardProgress;
    });

    this.events.subscribe('course:resume', (data) => {
      this.resumeContentData = data.content;
      this.getContentDetails(data.content);
    });

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, (res) => {
      if (res && res.batchId) {
        this.getEnrolledCourses(false, true);
      }
    });

    this.events.subscribe('onAfterLanguageChange:update', (res) => {
      if (res && res.selectedLanguage) {
        this.selectedLanguage = res.selectedLanguage;
        this.getPopularAndLatestCourses();
      }
    });

    this.events.subscribe(EventTopics.TAB_CHANGE, (data: string) => {
      this.ngZone.run(() => {
        if (data.trim().toUpperCase() === 'COURSES') {
          if (this.appliedFilter) {
            this.filterIcon = './assets/imgs/ic_action_filter.png';
            this.courseFilter = undefined;
            this.appliedFilter = undefined;
            this.isFilterApplied = false;
            this.getPopularAndLatestCourses();
          }
        }
      });
    });
    this.events.subscribe(EventTopics.REFRESH_ENROLL_COURSE_LIST, () => {
      this.getEnrolledCourses(false, true);
    });

    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async () => {
      this.showSignInCard = false;
    });
  }

  /**
   * To get enrolled course(s) of logged-in user.
   *
   * It internally calls course handler of genie sdk
   */
  getEnrolledCourses(refreshEnrolledCourses: boolean = true, returnRefreshedCourses: boolean = false): void {
    this.spinner(true);

    const option: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: returnRefreshedCourses
    };
    this.courseService.getEnrolledCourses(option).toPromise()
      .then((enrolledCourses) => {
        if (enrolledCourses) {
          this.ngZone.run(() => {
            this.enrolledCourses = enrolledCourses ? enrolledCourses : [];
            if (this.enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of this.enrolledCourses) {
                courseList.push(course);
              }

              this.appGlobalService.setEnrolledCourseList(courseList);
            }

            this.spinner(false);
          });
        }
      }, (err) => {
        this.spinner(false);
      });
  }

  /**
   * To get popular course.
   *
   * It internally calls course handler of genie sdk
   */
  getPopularAndLatestCourses(hardRefresh = false, pageAssembleCriteria?: PageAssembleCriteria): void {
    this.pageApiLoader = true;
    if (pageAssembleCriteria === undefined) {
      const criteria: PageAssembleCriteria = {
        name: PageName.COURSE,
        filters: {},
        source: 'app'
      };
      criteria.mode = 'soft';

      if (this.appliedFilter) {
        let filterApplied = false;
        Object.keys(this.appliedFilter).forEach(key => {
          if (this.appliedFilter[key].length > 0) {
            filterApplied = true;
          }
        });

        if (filterApplied && !hardRefresh) {
          criteria.mode = 'hard';
        }
        criteria.filters = this.appliedFilter;
      }
      pageAssembleCriteria = criteria;
    }

    this.mode = pageAssembleCriteria.mode;

    if (this.profile && !this.isFilterApplied) {

      if (this.profile.board && this.profile.board.length) {
        pageAssembleCriteria.filters.board = this.applyProfileFilter(this.profile.board, pageAssembleCriteria.filters.board, 'board');
      }

      if (this.profile.medium && this.profile.medium.length) {
        pageAssembleCriteria.filters.medium = this.applyProfileFilter(this.profile.medium, pageAssembleCriteria.filters.medium, 'medium');
      }

      if (this.profile.grade && this.profile.grade.length) {
        pageAssembleCriteria.filters.gradeLevel = this.applyProfileFilter(this.profile.grade,
          pageAssembleCriteria.filters.gradeLevel, 'gradeLevel');
      }

      if (this.profile.subject && this.profile.subject.length) {
        pageAssembleCriteria.filters.subject = this.applyProfileFilter(this.profile.subject,
          pageAssembleCriteria.filters.subject, 'subject');
      }
    }

    // pageAssembleCriteria.hardRefresh = hardRefresh;

    this.pageService.getPageAssemble(pageAssembleCriteria).toPromise()
      .then((res: any) => {
        this.ngZone.run(() => {
          const sections = res.sections;
          const newSections = [];
          sections.forEach(element => {
            element.display = JSON.parse(element.display);
            if (element.display.name) {
              if (has(element.display.name, this.selectedLanguage)) {
                const langs = [];
                forEach(element.display.name, (value, key) => {
                  langs[key] = value;
                });
                element.name = langs[this.selectedLanguage];
              }
            }
            newSections.push(element);
          });

          this.popularAndLatestCourses = newSections;
          this.pageApiLoader = !this.pageApiLoader;
          this.generateExtraInfoTelemetry(newSections.length);
          this.checkEmptySearchResult();
        });
      }).catch((error: string) => {
        this.ngZone.run(() => {
          this.pageApiLoader = false;
          if (error === 'CONNECTION_ERROR') {
            this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
          } else if (error === 'SERVER_ERROR' || error === 'SERVER_AUTH_ERROR') {
            this.commonUtilService.showToast('ERROR_FETCHING_DATA');
          }
        });
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

  applyProfileFilter(profileFilter: Array<any>, assembleFilter: Array<any>, categoryKey?: string) {
    if (categoryKey) {
      const nameArray = [];
      profileFilter.forEach(filterCode => {
        let nameForCode = this.appGlobalService.getNameForCodeInFramework(categoryKey, filterCode);

        if (!nameForCode) {
          nameForCode = filterCode;
        }

        nameArray.push(nameForCode);
      });

      profileFilter = nameArray;
    }

    if (!assembleFilter) {
      assembleFilter = [];
    }
    assembleFilter = assembleFilter.concat(profileFilter);

    const uniqueArray = [];

    for (let i = 0; i < assembleFilter.length; i++) {
      if (uniqueArray.indexOf(assembleFilter[i]) === -1 && assembleFilter[i].length > 0) {
        uniqueArray.push(assembleFilter[i]);
      }
    }

    assembleFilter = uniqueArray;

    if (assembleFilter.length === 0) {
      return undefined;
    }

    return assembleFilter;
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
    return new Promise((resolve, reject) => {
      this.guestUser = !this.appGlobalService.isUserLoggedIn();

      if (this.guestUser) {
        this.getCurrentUser();
        this.appGlobalService.setEnrolledCourseList([]);
        reject('session expired');
      } else {
        this.profile = this.appGlobalService.getCurrentUser();
        const sessionObj = this.appGlobalService.getSessionData();
        this.userId = sessionObj[ProfileConstants.USER_TOKEN];
        this.getEnrolledCourses(false, true);
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
      .then(() => {
        this.getPopularAndLatestCourses(true);
      })
      .catch(() => {
        this.getPopularAndLatestCourses(true);
      });
  }

  /**
   * It will fetch the guest user profile details
   */
  getCurrentUser(): void {
    const profileType = this.appGlobalService.getGuestUserType();
    if (profileType === ProfileType.TEACHER && this.appGlobalService.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER) {
      this.showSignInCard = true;
    } else {
      this.showSignInCard = false;
    }
  }

  scanQRCode() {
    this.qrScanner.startScanner(PageId.COURSES);
  }

  async search() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SEARCH_BUTTON_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    const contentType = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_COURSE);
    this.router.navigate([RouterLinks.SEARCH], {
      state: {
        contentType,
        source: PageId.COURSES,
        enrolledCourses: this.enrolledCourses,
        guestUser: this.guestUser,
        userId: this.userId
      }
    });
  }

  showFilter() {
    if(this.isFilterOpen){
      return;
    }
    this.isFilterOpen = true;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.FILTER_BUTTON_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    const that = this;

    this.pageFilterCallBack = {
      applyFilter(filter, appliedFilter, isChecked) {
        that.ngZone.run(() => {
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
            criteria.mode = 'hard';
            that.filterIcon = './assets/imgs/ic_action_filter_applied.png';
          } else {
            criteria.mode = 'soft';
            that.filterIcon = './assets/imgs/ic_action_filter.png';
          }
          if (isChecked) {
            that.getPopularAndLatestCourses(false, criteria);
          }
        });
      }
    };

    const filterOptions = {
      callback: this.pageFilterCallBack,
      pageId: PageId.COURSES
    };
    // Already apllied filter
    if (this.courseFilter) {
      filterOptions['filter'] = this.courseFilter;
      this.showFilterPage(filterOptions);
    } else {
      // TODO: Need to add loader
      this.formAndFrameworkUtilService.getCourseFilterConfig().then((data) => {
        filterOptions['filter'] = data;
        this.showFilterPage(filterOptions);
      }).catch(() => {
        this.isFilterOpen = false;
      });
    }
  }
  async presentToastForOffline(msg: string) {
    this.toast = await this.toastController.create({
      duration: 3000,
      message: this.commonUtilService.translateMessage(msg),
      showCloseButton: true,
      position: 'top',
      closeButtonText: '',
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
        pageId: PageId.COURSES
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

  showOfflineWarning() {
    this.presentToastForOffline('NO_INTERNET_TITLE');
  }

  retryShowingPopularCourses(showRefresh = false) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable && showRefresh) {
      this.getCourseTabData();
    }
  }

  getContentDetails(content) {
    const identifier = content.contentId || content.identifier;
    this.corRelationList = [
      {
        id: content.batchId ? content.batchId : '',
        type: CorReleationDataType.COURSE_BATCH
      }
    ];
    const request = {
      contentId: identifier,
      emitUpdateIfAny: false
    };
    this.contentService.getContentDetails(request).toPromise()
      .then((data: Content) => {
        if (data && data.isAvailableLocally) {
          if (data.contentData.pkgVersion < content.content.pkgVersion) {
            this.contentDetailsImportCall(identifier);
          } else {
            this.showOverlay = false;
            this.navigateToContentDetailsPage(content);
          }
        } else {
          this.contentDetailsImportCall(identifier);
        }
      })
      .catch((err) => {
        if (err instanceof NetworkError) {
          this.commonUtilService.showToast('NO_INTERNET');
        } else {
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
      });
  }

  contentDetailsImportCall(identifier) {
    this.subscribeSdkEvent();
    this.showOverlay = true;
    this.importContent([identifier], false);
  }

  navigateToViewMoreContentsPage(showEnrolledCourses: boolean, searchQuery?: any, headerTitle?: string) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {

    } else {
      this.presentToastForOffline('NO_INTERNET_TITLE'); return;
    }
    let params: NavigationExtras;
    let title;
    if (showEnrolledCourses) {
      title = this.commonUtilService.translateMessage('COURSES_IN_PROGRESS');
      params = {
        state: {
          headerTitle: 'COURSES_IN_PROGRESS',
          userId: this.userId,
          pageName: ViewMore.PAGE_COURSE_ENROLLED
        }
      };
    } else {
      searchQuery = updateFilterInSearchQuery(searchQuery, this.appliedFilter, this.profile,
        this.mode, this.isFilterApplied, this.appGlobalService);
      title = headerTitle;
      params = {
        state: {
          headerTitle,
          pageName: ViewMore.PAGE_COURSE_POPULAR,
          requestParams: searchQuery,
          enrolledCourses: this.enrolledCourses,
          guestUser: this.guestUser
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
    this.router.navigate([RouterLinks.VIEW_MORE_ACTIVITY], params);

  }

  navigateToContentDetailsPage(content) {
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
    this.router.navigate([RouterLinks.CONTENT_DETAILS], extras);
  }

  importContent(identifiers, isChild) {
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
  removeOverlayAndShowError(): any {
    this.commonUtilService.showToast('COURSE_NOT_AVAILABLE');
    this.tabBarElement.style.display = 'flex';
    this.showOverlay = false;
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe((event: EventsBusEvent) => {
      this.ngZone.run(() => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;
          this.downloadPercentage = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
        }

        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED && this.downloadPercentage === 100) {
          this.showOverlay = false;
          this.navigateToContentDetailsPage(this.resumeContentData);
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

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'search':
        this.search();
        break;
      case 'filter':
        this.showFilter();
        break;
      case 'download':
        this.redirectToActivedownloads();
        break;
    }
  }

  redirectToActivedownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.COURSES);
    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

}
