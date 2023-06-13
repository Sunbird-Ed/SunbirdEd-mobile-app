import { Location } from '@angular/common';
import { Component, Inject, Input, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BatchConstants, ContentCard, PreferenceKey, RouterLinks, ViewMore } from '../../app/app.constant';
import { AppGlobalService } from '../../services/app-global-service.service';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { CourseUtilService } from '../../services/course-util.service';
import { NavigationService } from '../../services/navigation-handler.service';
import {
  CorReleationDataType, Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { ContentUtil } from '../../util/content-util';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { Subscription } from 'rxjs';
import {
  Batch, Content,
  ContentEventType,
  ContentImportRequest,
  ContentImportResponse,
  ContentImportStatus,
  ContentSearchCriteria,
  ContentSearchResult,
  ContentService,
  CorrelationData, Course,
  CourseBatchesRequest, CourseBatchStatus, CourseEnrollmentType, CourseService,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  FetchEnrolledCourseRequest, LogLevel, SearchType,
  SharedPreferences,
  SortOrder
} from '@project-sunbird/sunbird-sdk';
import { EnrollmentDetailsComponent } from '../components/enrollment-details/enrollment-details.component';

@Component({
  selector: 'app-view-more-activity',
  templateUrl: './view-more-activity.component.html',
  styleUrls: ['./view-more-activity.component.scss'],
})
export class ViewMoreActivityComponent implements OnInit {
  searchQuery: any;
  title: any;
  searchList: any;
  showLoader: any;

  /**
   * Contains tab bar element ref
   */
  tabBarElement: any;

  /**
   * Flag to show / hide button
   */
  loadMoreBtn = true;

  /**
   * value for downloads only toggle button, may have true/false
   */
  downloadsOnlyToggle = false;
  offset = 0;
  searchLimit = 10;
  totalCount: number;
  isLoadMore = false;

  /**
   * Flag to switch between view-more-card in view
   */
  backButtonFunc: Subscription;
  headerTitle: string;
  pageType = 'library';
  source = '';
  queuedIdentifiers: Array<any> = [];
  downloadPercentage = 0;
  showOverlay = false;
  resumeContentData: any;
  uid: any;
  audience: any;
  defaultImg: string;
  private eventSubscription: Subscription;
  enrolledCourses: any;
  guestUser: any;
  userId: any;
  requestParams: any;

  @Input() course: any;

  /**
   * Contains layout name
   *
   * @example layoutName = In-progress / popular
   */
  @Input() layoutName: string;

  @Input() pageName: string;

  @Input() onProfile = false;

  @Input() index: number;

  @Input() sectionName: string;

  @Input() env: string;
  identifier: string;
  didViewLoad: boolean;
  objId;
  objType;
  objVer;
  loader: any;
  isLoading = false;
  defaultAppIcon: '';

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private events: Events,
    private ngZone: NgZone,
    private courseUtilService: CourseUtilService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public platform: Platform,
    private zone: NgZone,
    private appGlobalService: AppGlobalService,
    private popoverCtrl: PopoverController,
    private navService: NavigationService
  ) {
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        console.log('params from state : ', this.router.getCurrentNavigation().extras.state);
        this.uid = this.router.getCurrentNavigation().extras.state.uid;
        this.title = this.router.getCurrentNavigation().extras.state.headerTitle;
        this.userId = this.router.getCurrentNavigation().extras.state.userId;
        this.pageName = this.router.getCurrentNavigation().extras.state.pageName;
        this.guestUser = this.router.getCurrentNavigation().extras.state.guestUser;
        this.searchQuery = this.router.getCurrentNavigation().extras.state.requestParams;
        this.audience = this.router.getCurrentNavigation().extras.state.audience;
        this.enrolledCourses = this.router.getCurrentNavigation().extras.state.enrolledCourses;

        if (this.router.getCurrentNavigation().extras.state.sectionName) {
          this.sectionName = this.router.getCurrentNavigation().extras.state.sectionName;
        }

        if (this.headerTitle !== this.title) {
          this.offset = 0;
          this.loadMoreBtn = true;
          await this.mapper();
        }
      }
    });
    this.defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
    this.subscribeUtilityEvents();
  }

  /**
   * Angular life cycle hooks
   */
  ngOnInit() {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    if (this.tabBarElement) {
      this.tabBarElement.style.display = 'none';
    }
  }

  /**
   * Ionic default life cycle hook
   */
  async ionViewWillEnter(): Promise<void> {
    await this.zone.run(async () => {
      await this.headerService.showHeaderWithBackButton();
      if (this.tabBarElement) {
        this.tabBarElement.style.display = 'none';
      }
      this.handleBackButton();
    });
  }

  subscribeUtilityEvents() {
    this.events.subscribe('viewMore:Courseresume', (data) => {
      this.resumeContentData = data.content;
      this.getContentDetails(data.content);
    });
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  /**
   * Search content
   */
  async search() {
    this.isLoading = true;
    await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise().then(language => {
      const selectedLanguage = language
      const searchCriteria: ContentSearchCriteria = {
        searchType: SearchType.FILTER,
        languageCode: selectedLanguage
      };
      this.searchQuery.request['searchType'] = SearchType.FILTER;
      this.searchQuery.request['offset'] = this.offset;
      this.contentService.searchContent(searchCriteria, this.searchQuery).toPromise()
      .then((data: ContentSearchResult) => {
        this.ngZone.run(() => {
          if (data && data.contentDataList) {
            this.loadMoreBtn = data.contentDataList.length >= this.searchLimit;
            if (this.isLoadMore) {
              data.contentDataList.forEach((value) => {
                this.searchList.push(value);
              });
            } else {
              this.searchList = data.contentDataList;
            }
          } else {
            this.loadMoreBtn = false;
          }
          this.isLoading = false;
        });
        this.generateImpressionEvent();
        this.generateLogEvent(data);
      })
      .catch(() => {
        console.error('Error: while fetching view more content');
        this.isLoading = false;
      });
    }).catch();
  }

  /**
   * Load more result
   */
  async loadMore() {
    this.isLoadMore = true;
    this.offset = this.offset + this.searchLimit;
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_INTERNET_TITLE'));
    } else {
      await this.mapper();
    }
  }

  /**
   * Mapper to call api based on page.Layout name
   */
  async mapper() {
    const pageName = this.pageName;
    switch (pageName) {
      case ViewMore.PAGE_COURSE_ENROLLED:
        this.pageType = 'enrolledCourse';
        this.loadMoreBtn = false;
        this.getEnrolledCourse();
        break;

      case ViewMore.PAGE_COURSE_POPULAR:
        this.pageType = 'popularCourses';
        await this.search();
        break;

      case ViewMore.PAGE_TV_PROGRAMS:
        this.pageType = 'tvPrograms';
        await this.search();
        break;

      default:
        await this.search();
    }
    console.log('search List =>', this.searchList);
  }

  /**
   * Get enrolled courses
   */
  getEnrolledCourse() {
    this.isLoading = true;
    this.pageType = 'enrolledCourse';
    const option = {
      userId: this.userId,
      returnFreshCourses: true
    };
    this.courseService.getEnrolledCourses(option).toPromise()
      .then((data: Course[]) => {
        if (data) {
          this.searchList = data;
          this.loadMoreBtn = false;
          for (const course of data) {
            course.completionPercentage = course.completionPercentage || 0;
          }
        }
        this.isLoading = false;
      })
      .catch((error: any) => {
        console.error('error while loading enrolled courses', error);
        this.isLoading = false;
      });
  }

  getContentDetails(content) {
    const identifier = content.contentId || content.identifier;
    this.contentService.getContentDetails({ contentId: identifier, objectType: content.objectType }).toPromise()
      .then(async (data: Content) => {
        if (Boolean(data.isAvailableLocally)) {
          const contentDetailsParams: NavigationExtras = {
            state: {
              content: { identifier: content.lastReadContentId },
              depth: '1',
              contentState: {
                batchId: content.batchId ? content.batchId : '',
                courseId: identifier
              },
              isResumedCourse: true,
              isChildContent: true,
              resumedCourseCardData: this.resumeContentData
            }
          };
          await this.router.navigate([RouterLinks.COLLECTION_DETAILS], contentDetailsParams);
        } else {
          this.subscribeSdkEvent();
          this.showOverlay = true;
          this.importContent([identifier], false);
        }

      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  importContent(identifiers, isChild) {
    this.queuedIdentifiers.length = 0;
    const option: ContentImportRequest = {
      contentImportArray: this.courseUtilService.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.ngZone.run(() => {
          if (data && data.length) {
            data.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.queuedIdentifiers.push(value.identifier);
              }
            });
            if (this.queuedIdentifiers.length === 0) {
              this.showOverlay = false;
              this.downloadPercentage = 0;
              this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
            }
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.showOverlay = false;
          this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        });
      });
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe(async (event: EventsBusEvent) => {
      await this.ngZone.run(async () => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;
          this.downloadPercentage = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;
        }
        if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED && this.downloadPercentage === 100) {
          this.showOverlay = false;
          const contentDetailsParams: NavigationExtras = {
            state: {
              content: { identifier: this.resumeContentData.lastReadContentId },
              depth: '1',
              contentState: {
                batchId: this.resumeContentData.batchId ? this.resumeContentData.batchId : '',
                courseId: this.resumeContentData.contentId || this.resumeContentData.identifier
              },
              isResumedCourse: true,
              isChildContent: true,
              resumedCourseCardData: this.resumeContentData
            }
          };
          await this.router.navigate([RouterLinks.COLLECTION_DETAILS], contentDetailsParams);
        }
      });
    }) as any;
  }

  cancelDownload() {
    this.ngZone.run(() => {
      this.contentService.cancelDownload(this.resumeContentData.contentId || this.resumeContentData.identifier)
        .toPromise().then(() => {
          this.showOverlay = false;
        }).catch(() => {
          this.showOverlay = false;
        });
    });
  }

  showDisabled(resource) {
    return !resource.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable;
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave() {
    this.ngZone.run(() => {
      if (this.eventSubscription) {
        this.eventSubscription.unsubscribe();
      }
      if (this.tabBarElement) {
        this.tabBarElement.style.display = 'flex';
      }
      this.isLoadMore = false;
      this.showOverlay = false;
      this.backButtonFunc.unsubscribe();
    });
  }

  private generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.SEARCH, '',
      PageId.VIEW_MORE,
      Environment.HOME, '', '', '');
  }

  private generateLogEvent(searchResult) {
    if (searchResult != null) {
      const contentArray: Array<any> = searchResult.contentDataList;
      const params = new Array<any>();
      const paramsMap = new Map();
      paramsMap['SearchResults'] = contentArray.length;
      paramsMap['SearchCriteria'] = searchResult.request;
      params.push(paramsMap);
      this.telemetryGeneratorService.generateLogEvent(LogLevel.INFO,
        PageId.VIEW_MORE,
        Environment.HOME,
        ImpressionType.SEARCH, params);
    }
  }
  async navigateToDetailPage(content: any): Promise<boolean> {
    if (!content.isAvailableLocally && !this.commonUtilService.networkInfo.isNetworkAvailable) {
      return false;
    }

    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      this.env,
      PageId.VIEW_MORE,
      ContentUtil.getTelemetryObject(content),
      values);
    await this.navService.navigateToDetailPage(content, { content });
  }

  getContentImg(content) {
    const img = this.commonUtilService.getContentImg(content);
    return img;
  }

  async openCourseDetails(course, index) {
    this.index = index;
    const payload = {
      guestUser: this.guestUser,
      enrolledCourses: this.enrolledCourses
    };

    await this.checkRetiredOpenBatch(course, this.pageType, payload);
  }

  async checkRetiredOpenBatch(content: any, layoutName?: string, payload?: any) {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    let anyOpenBatch = false;
    const enrolledCourses = payload.enrolledCourses || [];
    let retiredBatches: Array<any> = [];
    if (layoutName !== ContentCard.LAYOUT_INPROGRESS) {
      retiredBatches = enrolledCourses.filter((element) => {
        if (element.contentId === content.identifier && element.batch.status === 1 && element.cProgress !== 100) {
          anyOpenBatch = true;
          content.batch = element.batch;
        }
        if (element.contentId === content.identifier && element.batch.status === 2 && element.cProgress !== 100) {
          return element;
        }
      });
    }
    if (anyOpenBatch || !retiredBatches.length) {
      // open the batch directly
      await this.navigateToDetailsPage(content, layoutName);
    } else if (retiredBatches.length) {
      await this.navigateToBatchListPopup(content, layoutName, retiredBatches, payload);
    }
    await this.loader.dismiss();
  }

  private async navigateToBatchListPopup(content: any, layoutName?: string, retiredBatches?: any, payload?: any) {
    const ongoingBatches = [];
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.IN_PROGRESS]
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!payload.guestUser) {
        this.loader = await this.commonUtilService.getLoader();
        await this.loader.present();
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then(async (res: Batch[]) => {
            await this.zone.run(async () => {
              const batches = res;
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
                await this.loader.dismiss();

                const popover = await this.popoverCtrl.create({
                  component: EnrollmentDetailsComponent,
                  componentProps: {
                    upcommingBatches: [],
                    ongoingBatches,
                    retiredBatches,
                    content
                  },
                  cssClass: 'enrollement-popover'
                });
                await popover.present();
                const { data } = await popover.onDidDismiss();
                if (data && data.isEnrolled) {
                  this.getEnrolledCourses();
                }

              } else {
                await this.loader.dismiss();
                await this.navigateToDetailsPage(content, layoutName);
                this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
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


  private async navigateToDetailsPage(content: any, layoutName) {
    const identifier = content.contentId || content.identifier;
    const corRelationList: Array<CorrelationData> = [{
      id: this.sectionName,
      type: CorReleationDataType.SECTION
    }, {
      id: identifier || '',
      type: CorReleationDataType.ROOT_ID
    }];

    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      this.env,
      PageId.VIEW_MORE,
      ContentUtil.getTelemetryObject(content),
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      this.commonUtilService.deDupe(corRelationList, 'type'));

    await this.zone.run(async () => {
      if (layoutName === 'enrolledCourse') {
        await this.navService.navigateToTrackableCollection({ content });
      } else {
        await this.navService.navigateToDetailPage(
          content,
          { content }
        );
      }
    });
  }

  getEnrolledCourses(returnRefreshedCourses: boolean = false): void {

    const option: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: returnRefreshedCourses
    };
    this.courseService.getEnrolledCourses(option).toPromise()
      .then((enrolledCourses) => {
        if (enrolledCourses) {
          this.zone.run(() => {
            this.enrolledCourses = enrolledCourses;
            if (this.enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of this.enrolledCourses) {
                course.completionPercentage = course.completionPercentage || 0;
                courseList.push(course);
              }

              this.appGlobalService.setEnrolledCourseList(courseList);
            }

            this.showLoader = false;
          });
        }
      }, (err) => {
        this.showLoader = false;
      });
  }

}
