import { Component, Inject, NgZone, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Events, Platform, PopoverController } from '@ionic/angular';
import isObject from 'lodash/isObject';
import forEach from 'lodash/forEach';
import { FileSizePipe } from '@app/pipes/file-size/file-size';

import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { CourseUtilService } from '@app/services/course-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { UtilityService } from '@app/services/utility-service';
import { AppHeaderService } from '@app/services/app-header.service';
import { DatePipe } from '@angular/common';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
  Batch,
  ChildContentRequest,
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentImport,
  ContentImportCompleted,
  ContentImportRequest,
  ContentImportResponse,
  ContentImportStatus,
  ContentService,
  ContentState,
  ContentStateResponse,
  ContentUpdate,
  CorrelationData, Course,
  CourseBatchesRequest,
  CourseBatchStatus,
  CourseEnrollmentType,
  CourseService,
  DownloadEventType,
  DownloadProgress,
  EventsBusEvent,
  EventsBusService,
  FetchEnrolledCourseRequest,
  GetContentStateRequest, NetworkError,
  ProfileService,
  ProfileType,
  ServerProfileDetailsRequest,
  SharedPreferences,
  TelemetryErrorCode,
  TelemetryObject,
  UnenrollCourseRequest,
  AuthService,
  Rollup
} from 'sunbird-sdk';
import { Subscription } from 'rxjs';
import {
  Environment,
  ErrorType,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
  CorReleationDataType,
  ID
} from '../../services/telemetry-constants';
import { ProfileConstants, ContentType, EventTopics, MimeType, PreferenceKey, ShareUrl, RouterLinks, ShareItemType } from '../app.constant';
import { BatchConstants } from '../app.constant';
import { ContentShareHandlerService } from '../../services/content/content-share-handler.service';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { ContentActionsComponent, ContentRatingAlertComponent, ConfirmAlertComponent } from '../components';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { SbPopoverComponent } from '../components/popups';
import { TranslateService } from '@ngx-translate/core';
import { ContentInfo } from '@app/services/content/content-info';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import * as dayjs from 'dayjs';
import { LocalCourseService } from '@app/services';
import { EnrollCourse } from './course.interface';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
declare const cordova;

@Component({
  selector: 'app-enrolled-course-details-page',
  templateUrl: './enrolled-course-details-page.html',
  styleUrls: ['./enrolled-course-details-page.scss'],
})
export class EnrolledCourseDetailsPage implements OnInit, OnDestroy {

  /**
   * Contains content details
   */
  course: any;

  /**
   * Contains children content data
   */
  childrenData: Array<any> = [];

  startData: any;
  shownGroup: null;

  /**
   * Show loader while importing content
   */
  showChildrenLoader: boolean;

  /**
   * Contains identifier(s) of locally not available content(s)
   */
  downloadIdentifiers = new Set();

  /**
   * Contains total size of locally not available content(s)
   */
  downloadSize = 0;

  /**
   * this hold the mime type of a collection
   */
  enrolledCourseMimeType: string;
  /**
   * Flag to show / hide resume button
   */
  showResumeBtn: boolean;

  /**
   * Contains card data of previous state
   */
  courseCardData: any;

  /**
   * To get course structure keyspkgVersion
   */
  objectKeys = Object.keys;

  /**
   * To hold identifier
   */
  identifier: string;
  /**
   * Contains child content import / download progress
   */
  downloadProgress = 0;

  /**
   * To check batches available or not
   */
  public batches: Array<any>;

  isNavigatingWithinCourse = false;

  contentStatusData: ContentStateResponse;

  /**
   * To hold start date of a course
   */
  courseStartDate;
  isContentPlayed;
  showLoading = false;
  showDownloadProgress: boolean;
  totalDownload: number;
  currentCount = 0;
  isDownloadComplete = false;
  queuedIdentifiers: Array<string> = [];
  faultyIdentifiers: Array<any> = [];
  isDownloadStarted = false;
  batchDetails: Batch;
  batchExp = false;
  userId = '';
  userRating = 0;
  ratingComment = '';
  batchId = '';
  baseUrl = '';
  guestUser = false;
  isAlreadyEnrolled = false;
  profileType = '';
  objId;
  objType;
  batchCount: number;
  batchEndDate: string;
  objVer;
  didViewLoad: boolean;
  backButtonFunc = undefined;
  shouldGenerateEndTelemetry = false;
  source = '';
  firstChild;
  /** Whole child content is stored and it is used to find first child */
  childContentsData;
  isBatchNotStarted = false;
  private eventSubscription: Subscription;
  corRelationList: Array<CorrelationData>;
  headerObservable: any;
  content: Content;
  appName: any;
  updatedCourseCardData: Course;
  importProgressMessage: string;
  segmentType = 'info';
  // isEnrolled = false;
  showDownload: boolean;
  lastReadContentName: string;
  lastReadContentType: string;
  enrollmentEndDate: string;
  loader?: HTMLIonLoadingElement;
  isQrCodeLinkToContent: any;
  leaveTrainigPopover: any;
  showOfflineSection = false;
  courseBatchesRequest: CourseBatchesRequest;
  showUnenrollButton = false;
  licenseDetails;

  @ViewChild('stickyPillsRef') stickyPillsRef: ElementRef;
  public objRollup: Rollup;
  pageName = '';
  contentId: string;
  isChild = false;
  public telemetryObject: TelemetryObject;
  showCredits = false;
  contentDeleteObservable: any;
  public showUnenroll: boolean;
  public todayDate: any;
  public rollUpMap: { [key: string]: Rollup } = {};
  public lastReadContentId;
  public courseCompletionData = {};
  isCertifiedCourse: boolean;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private loginHandlerService: LoginHandlerService,
    private zone: NgZone,
    private events: Events,
    private fileSizePipe: FileSizePipe,
    private popoverCtrl: PopoverController,
    private courseUtilService: CourseUtilService,
    private platform: Platform,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private datePipe: DatePipe,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private contentShareHandler: ContentShareHandlerService,
    private location: Location,
    private router: Router,
    private contentDeleteHandler: ContentDeleteHandler,
    private localCourseService: LocalCourseService
  ) {

    this.objRollup = new Rollup();
    this.userId = this.appGlobalService.getUserId();
    // console.log('this.userId', this.userId);
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
    // this.getUserId();

    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.courseCardData = extrasState.content;
      // console.log('this.courseCardData', this.courseCardData);
      this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
      this.corRelationList = extrasState.corRelation;
      this.source = extrasState.source;
      this.isQrCodeLinkToContent = extrasState.isQrCodeLinkToContent;
    }
  }

  /**
   * Angular life cycle hooks
   */
  ngOnInit() {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
    this.subscribeUtilityEvents();
    if (this.courseCardData.batchId) {
      this.segmentType = 'modules';
    }
  }

  showDeletePopup() {
    this.contentDeleteObservable = this.contentDeleteHandler.contentDeleteCompleted$.subscribe(() => {
      this.location.back();
    });
    const contentInfo: ContentInfo = {
      telemetryObject: this.telemetryObject,
      rollUp: this.objRollup,
      correlationList: this.corRelationList,
      hierachyInfo: undefined
    };
    this.contentDeleteHandler.showContentDeletePopup(this.content, this.isChild, contentInfo, PageId.COURSE_DETAIL);
  }


  subscribeUtilityEvents() {
    this.utilityService.getBuildConfigValue('BASE_URL')
      .then(response => {
        this.baseUrl = response;
      })
      .catch((error) => {
      });

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, async (res) => {
      // console.log('ENROL_COURSE_SUCCESS enrolpage', res);
      this.updatedCourseCardData = await this.courseService
      .getEnrolledCourses({userId: this.appGlobalService.getUserId(), returnFreshCourses: true })
        .toPromise()
        .then((cData) => {
          return cData.find((element) => element.courseId === this.identifier);
        });
      this.courseCardData.batchId = res.batchId;
      this.getBatchDetails();
      this.segmentType = 'modules';
      this.getCourseProgress();
      if (res && res.batchId) {
        this.batchId = res.batchId;
        if (this.identifier && res.courseId && this.identifier === res.courseId) {
          this.isAlreadyEnrolled = true;
          this.zone.run(() => {
            this.getContentsSize(this.childrenData);
            if (this.loader) {
              this.loader.dismiss();
              this.loader = undefined;
            }
          });
        }
      }
    });


    this.events.subscribe(EventTopics.UNENROL_COURSE_SUCCESS, () => {
      // to show 'Enroll in Course' button courseCardData.batchId should be undefined/null
      this.getAllBatches();
      this.updateEnrolledCourseList(this.courseCardData); // enrolled course list updated
      if (this.courseCardData) {
        delete this.courseCardData.batchId;
      }
      delete this.batchDetails;
      // delete this.batchDetails; // to show 'Enroll in Course' button courseCardData should be undefined/null
      this.isAlreadyEnrolled = false; // and isAlreadyEnrolled should be false
      this.isBatchNotStarted = false; // this is needed to change behaviour onclick of individual content
    });

    this.events.subscribe('courseToc:content-clicked', (data) => {
      console.log('courseToc:content-clicked', data);
      if (this.course.createdBy !== this.userId) {
        if (!data.isEnrolled && !data.isBatchNotStarted) {
          this.joinTraining();
        } else if (data.isEnrolled && data.isBatchNotStarted) {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
            this.datePipe.transform(this.courseStartDate, 'mediumDate')));
        }
      }
    });

    this.events.subscribe('header:setzIndexToNormal', () => {
      this.stickyPillsRef.nativeElement.classList.remove('z-index-0');
    });

    this.events.subscribe('header:decreasezIndex', () => {
      this.stickyPillsRef.nativeElement.classList.add('z-index-0');
    });

  }

  updateEnrolledCourseList(unenrolledCourse) {
    const fetchEnrolledCourseRequest: FetchEnrolledCourseRequest = {
      userId: this.appGlobalService.getUserId(),
    };
    this.courseService.getEnrolledCourses(fetchEnrolledCourseRequest).toPromise()
      .then((enrolledCourses: any) => {
        if (enrolledCourses) {
          this.zone.run(() => {
            // this.enrolledCourses = enrolledCourses.result.courses ? enrolledCourses.result.courses : [];
            // maintain the list of courses that are enrolled, and store them in appglobal
            if (enrolledCourses.length > 0) {
              const courseList: Array<any> = [];
              for (const course of enrolledCourses) {
                courseList.push(course);
              }
              this.appGlobalService.setEnrolledCourseList(courseList);
            }
          });
        }
      })
      .catch(() => {
      });
  }

  /**
   * Get the session to know if the user is logged-in or guest
   *
   */
  checkLoggedInOrGuestUser() {
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
  }

  checkCurrentUserType() {
    if (this.guestUser) {
      this.appGlobalService.getGuestUserInfo()
        .then((userType) => {
          this.profileType = userType;
        })
        .catch((error) => {
          this.profileType = '';
        });
    }
  }

  async joinTraining() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_JOIN_AN_ACTIVE_BATCH'),
        metaInfo: this.commonUtilService.translateMessage('REGISTER_TO_COMPLETE_ACCESS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('JOIN_TRAINING') + '?',
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('JOIN_TRAINING'),
            btnClass: 'popover-color'
          },
        ],
        // handler : this.handleEnrollCoursePopup.bind(this)
      },
      cssClass: 'sb-popover info',
    });
    confirm.present();
    confirm.onDidDismiss().then(({ data }) => {
      if (data && data.canDelete) {
        this.navigateToBatchListPage();
      }
    });
  }

  /**
   * Function to rate content
   */
  async rateContent(event) {
    if (!this.guestUser) {
      if (this.course.isAvailableLocally) {
        const popUp = await this.popoverCtrl.create({
          component: ContentRatingAlertComponent,
          event,
          componentProps: {
            content: this.course,
            rating: this.userRating,
            comment: this.ratingComment,
            pageId: PageId.COURSE_DETAIL
          },
          cssClass: 'sb-popover info',
        });
        await popUp.present();
        const { data } = await popUp.onDidDismiss();
        if (data && data.message === 'rating.success') {
          this.userRating = data.rating;
          this.ratingComment = data.comment;
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.RATING_CLICKED,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          this.telemetryObject,
          undefined,
          this.objRollup,
          this.corRelationList);
      } else {
        this.commonUtilService.showToast('TRY_BEFORE_RATING');
      }
    } else {
      if (this.profileType === ProfileType.TEACHER) {
        this.commonUtilService.showToast('SIGNIN_TO_USE_FEATURE');
      }
    }
  }

  async showOverflowMenu(event) {
    this.leaveTrainigPopover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      event,
      cssClass: 'leave-training-popup',
      showBackdrop: false,
      componentProps: {
        // overFlowMenuData,
        content: this.course,
        batchDetails: this.batchDetails,
        pageName: PageId.COURSE_DETAIL
      },
    });
    await this.leaveTrainigPopover.present();
    const { data } = await this.leaveTrainigPopover.onDidDismiss();
    if (data && data.unenroll) {
      this.showConfirmAlert();
    }
  }

  async showConfirmAlert() {
    const confirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('LEAVE_TRAINING_HEADING'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('UNENROLL_CONFIRMATION_MESSAGE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
          },
          {
            btntext: this.commonUtilService.translateMessage('CONFIRM'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    let unenroll = false;
    if (data && data.isLeftButtonClicked === false) {
      unenroll = true;
      this.handleUnenrollment(unenroll);
    }
  }

  /*
   * check for user confirmation
   * if confirmed then unenrolls the user from the course
   */
  async handleUnenrollment(unenroll) {
    if (unenroll) {
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const unenrolCourseRequest: UnenrollCourseRequest = {
        userId: this.appGlobalService.getUserId(),
        courseId: this.batchDetails.courseId,
        batchId: this.batchDetails.id
      };
      this.courseService.unenrollCourse(unenrolCourseRequest)
        .subscribe(() => {
          this.zone.run(async () => {
            await loader.dismiss();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_UNENROLLED'));
            this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.UNENROL_SUCCESS,
              Environment.HOME,
              PageId.COURSE_DETAIL,
              this.telemetryObject,
              undefined,
              this.objRollup,
              this.corRelationList);
          });
        }, (error) => {
          this.zone.run(async () => {
            await loader.dismiss();
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.UNENROL_FAILURE,
              Environment.HOME,
              PageId.COURSE_DETAIL,
              this.telemetryObject,
              undefined,
              this.objRollup,
              this.corRelationList);
            if (error && error.error === 'CONNECTION_ERROR') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else {
              this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            }
          });
        });
    }
  }

  /**
   * Set course details by passing course identifier
   */
  setContentDetails(identifier): void {
    const option: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: true,
      emitUpdateIfAny: true,
      attachContentAccess: true
    };
    this.contentService.getContentDetails(option).toPromise()
      .then((data: Content) => {
        this.zone.run(() => {
          this.extractApiResponse(data);
        });
      })
      .catch((error: any) => {
        if (error instanceof NetworkError) {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else {
          this.commonUtilService.showToast('ERROR_FETCHING_DATA');
        }
        this.location.back();
      });
  }

  /**
   * Function to extract api response. Check content is locally available or not.
   * If locally available then make childContents api call else make import content api call
   */
  async extractApiResponse(data: Content) {
    // const loader = await this.commonUtilService.getLoader();
    if (data.contentData) {
      // await loader.present();
      this.course = data.contentData;
      this.licenseDetails = data.contentData.licenseDetails || this.licenseDetails;
      this.content = data;
      this.objId = this.course.identifier;
      this.objType = this.course.contentType;
      this.objVer = this.course.pkgVersion;
      this.showLoading = false;

      this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
      if (!this.didViewLoad) {
        this.generateImpressionEvent(this.course.identifier, this.course.contentType, this.course.pkgVersion);
        this.generateStartEvent(this.course.identifier, this.course.contentType, this.course.pkgVersion);
      }
      this.didViewLoad = true;
      if (this.courseCardData.lastReadContentId) {
        this.getLastPlayedName(this.courseCardData.lastReadContentId);
      }

      if (this.course && this.course.isAvailableLocally) {
        this.headerService.showHeaderWithBackButton();
      }

      if (this.course.status !== 'Live') {
        this.commonUtilService.showToast('COURSE_NOT_AVAILABLE');
        this.location.back();
      }

      if (this.course.gradeLevel && this.course.gradeLevel.length) {
        this.course.gradeLevel = this.course.gradeLevel.join(', ');
      }

      if (this.course.attributions && this.course.attributions.length) {
        this.course.attributions = this.course.attributions.join(', ');
      }

      // User Rating
      const contentFeedback: any = data.contentFeedback ? data.contentFeedback : [];
      if (contentFeedback !== undefined && contentFeedback.length !== 0) {
        this.userRating = contentFeedback[0].rating;
        this.ratingComment = contentFeedback[0].comments;
      }
      this.getCourseProgress();
      // await loader.dismiss();
    } else {
      this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      this.location.back();
    }

    if (data.isAvailableLocally) {
      this.getBatchDetails();
    }
    this.course.isAvailableLocally = data.isAvailableLocally;


    if (Boolean(data.isAvailableLocally)) {
      this.setChildContents();
    } else {
      this.showLoading = true;
      this.headerService.hideHeader();
      this.telemetryGeneratorService.generateSpineLoadingTelemetry(data, true);
      this.importContent([this.identifier], false);
    }

    this.setCourseStructure();
  }

  /**
   * Get batch details
   */
  async getBatchDetails() {
    this.courseService.getBatchDetails({ batchId: this.courseCardData.batchId }).toPromise()
      .then((data: Batch) => {
        this.zone.run(() => {
          if (data) {
            this.batchDetails = data;
            // console.log('this.batchDetails', this.batchDetails);
            this.handleUnenrollButton();
            this.isCertifiedCourse = data.cert_templates ? true : false;
            this.saveContentContext(this.appGlobalService.getUserId(),
              this.batchDetails.courseId, this.courseCardData.batchId, this.batchDetails.status);
            this.preferences.getString(PreferenceKey.COURSE_IDENTIFIER).toPromise()
              .then(async val => {
                if (val && val === this.batchDetails.identifier) {
                  this.batchExp = true;
                } else if (this.batchDetails.status === 2) {
                  this.batchExp = true;
                } else if (this.batchDetails.status === 0) {
                  this.isBatchNotStarted = true;
                  this.courseStartDate = this.batchDetails.startDate;
                }
              })
              .catch((error) => {
              });

            this.getBatchCreatorName();
          }
        });
      })
      .catch((error: any) => {
        if (this.courseCardData.batch) {
          this.saveContentContext(this.appGlobalService.getUserId(),
            this.courseCardData.courseId, this.courseCardData.batchId, this.courseCardData.batch.status);
        }
      });
  }
  /** url opens in browser */
  openBrowser(url) {
    this.commonUtilService.openUrlInBrowser(url);
  }

  saveContentContext(userId, courseId, batchId, batchStatus) {
    const contentContextMap = new Map();
    // store content context in the below map
    contentContextMap['userId'] = userId;
    contentContextMap['courseId'] = courseId;
    contentContextMap['batchId'] = batchId;
    if (batchStatus) {
      contentContextMap['batchStatus'] = batchStatus;
    }

    // store the contentContextMap in shared preference and access it from SDK
    this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap)).toPromise().then();
  }

  getBatchCreatorName() {
    const req: ServerProfileDetailsRequest = {
      userId: this.batchDetails.createdBy,
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    };
    this.profileService.getServerProfilesDetails(req).toPromise()
      .then((data) => {
        if (data) {
          this.batchDetails.creatorFirstName = data.firstName ? data.firstName : '';
          this.batchDetails.creatorLastName = data.lastName ? data.lastName : '';
        }
      }).catch(() => {
      });
  }

  /**
   * Set course structure
   */
  setCourseStructure(): void {
    if (this.course.contentTypesCount) {
      if (!isObject(this.course.contentTypesCount)) {
        this.course.contentTypesCount = JSON.parse(this.course.contentTypesCount);
      } else {
        this.course.contentTypesCount = this.course.contentTypesCount;
      }
    } else if (this.courseCardData.contentTypesCount && !isObject(this.courseCardData.contentTypesCount)) {
      this.course.contentTypesCount = JSON.parse(this.courseCardData.contentTypesCount);
    }
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  getImportContentRequestBody(identifiers, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: cordova.file.externalDataDirectory,
        contentId: value,
        correlationData: this.corRelationList !== undefined ? this.corRelationList : [],
        rollUp: this.rollUpMap[value]
      });
    });

    return requestParams;
  }

  refreshHeader() {
    this.events.publish('header:setzIndexToNormal');
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  importContent(identifiers, isChild: boolean, isDownloadAllClicked?) {
    this.showChildrenLoader = this.downloadIdentifiers.size === 0;
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (data && data[0].status === ContentImportStatus.NOT_FOUND) {
            this.showLoading = false;
            this.headerService.showHeaderWithBackButton();
          }
          if (data && data.length && this.isDownloadStarted) {
            data.forEach((value) => {
              if (value.status === ContentImportStatus.ENQUEUED_FOR_DOWNLOAD) {
                this.queuedIdentifiers.push(value.identifier);
              } else if (value.status === ContentImportStatus.NOT_FOUND) {
                this.faultyIdentifiers.push(value.identifier);
              }
            });

            if (isDownloadAllClicked) {
              this.telemetryGeneratorService.generateDownloadAllClickTelemetry(
                PageId.COURSE_DETAIL,
                this.course,
                this.queuedIdentifiers,
                identifiers.length,
                this.objRollup,
                this.corRelationList
              );
            }

            if (this.queuedIdentifiers.length === 0) {
              this.restoreDownloadState();
            }
            if (this.faultyIdentifiers.length > 0) {
              const stackTrace: any = {};
              stackTrace.parentIdentifier = this.course.identifier;
              stackTrace.faultyIdentifiers = this.faultyIdentifiers;
              this.telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
                TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                ErrorType.SYSTEM,
                PageId.COURSE_DETAIL,
                JSON.stringify(stackTrace),
              );
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
          }
        });
      })
      .catch((error) => {
        this.zone.run(() => {
          if (this.isDownloadStarted) {
            this.restoreDownloadState();
          } else {
            this.showChildrenLoader = false;
          }
          if (error && error.error === 'NETWORK_ERROR') {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
        });
      });
  }

  restoreDownloadState() {
    this.isDownloadStarted = false;
  }
  /** old download all content */
  // downloadAllContent1() {
  //   if (this.commonUtilService.networkInfo.isNetworkAvailable) {
  //     if (!this.isBatchNotStarted) {
  //       this.isDownloadStarted = true;
  //       this.downloadProgress = 0;
  //       this.importContent(this.downloadIdentifiers, true, true);
  //     } else {
  //       this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
  //         this.datePipe.transform(this.courseStartDate, 'mediumDate')));
  //     }

  //   } else {
  //     this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
  //   }
  // }


  async showDownloadConfirmationAlert() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let contentTypeCount;
      if (this.downloadIdentifiers.size) {
        contentTypeCount = this.downloadIdentifiers.size;
      } else {
        contentTypeCount = '';
      }
      if (!this.isBatchNotStarted) {
        this.downloadProgress = 0;
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
          this.datePipe.transform(this.courseStartDate, 'mediumDate')));
      }

      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('DOWNLOAD'),
          sbPopoverMainTitle: this.course.name,
          isNotShowCloseIcon: true,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('DOWNLOAD'),
              btnClass: 'popover-color'
            },
          ],
          icon: null,
          metaInfo: this.commonUtilService.translateMessage('ITEMS', contentTypeCount)
            + ' (' + this.fileSizePipe.transform(this.downloadSize, 2) + ')',
        },
        cssClass: 'sb-popover info',
      });
      await popover.present();
      const response = await popover.onDidDismiss();
      if (response && response.data) {
        this.isDownloadStarted = true;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          'download-all-button-clicked',
          Environment.HOME,
          PageId.COURSE_DETAIL,
          undefined,
          undefined,
          // todo
          // this.objRollup,
          // this.corRelationList
        );
        this.events.publish('header:decreasezIndex');
        this.importContent(this.downloadIdentifiers, true, true);
        this.showDownload = true;
      } else {
        // Cancel Clicked Telemetry
        // todo
        // this.generateCancelDownloadTelemetry(this.contentDetail);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  private async getLastReadContentId() {
    this.lastReadContentId = this.courseCardData.lastReadContentId;
    const userId = this.appGlobalService.getUserId();
    const lastReadContentIdKey = 'lastReadContentId_' + userId + '_' + this.identifier + '_' + this.courseCardData.batchId;
    const chacedLastReadContentId = await this.preferences.getString(lastReadContentIdKey).toPromise();
    if (chacedLastReadContentId) {
      this.lastReadContentId = chacedLastReadContentId;
      this.courseCardData.lastReadContentId = chacedLastReadContentId;
    }
    return this.lastReadContentId;
  }

  private getLeafNodes(contents: Content[]) {
    return contents.reduce((acc, content) => {
      if (content.children) {
        acc = acc.concat(this.getLeafNodes(content.children));
      } else {
        acc.push(content);
      }
      return acc;
    }, []);
  }

  /**
   * Function to get status of child contents
   */

  private getStatusOfCourseCompletion(childrenData: Content[]) {
    const contentStatusData = this.contentStatusData;
    this.getLastPlayedName(this.lastReadContentId);

    this.zone.run(() => {
      childrenData.forEach((childContent) => {
        if (childContent.children && childContent.children.length) {
          this.courseCompletionData[childContent.identifier] =
            this.getLeafNodes(childContent.children).every((eachContent) => {
              if (contentStatusData.contentList.length) {
                const statusData = contentStatusData.contentList.find(c => c.contentId === eachContent.identifier);
                if (statusData) {
                  if (this.lastReadContentId === statusData.contentId) {
                    childContent['lastRead'] = true;
                  }
                  return !(statusData.status === 0 || statusData.status === 1);
                }
                return false;
              }
              return false;
            });
        }
      });
      console.log('courseCompletionData ', this.courseCompletionData);
    });
  }

  async getAllBatches() {
    const loader = await this.commonUtilService.getLoader();
    this.courseBatchesRequest = {
      filters: {
        courseId: this.identifier,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS],
        enrollmentType: CourseEnrollmentType.OPEN
      },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    await loader.present();
    this.courseService.getCourseBatches(this.courseBatchesRequest).toPromise()
      .then(async (data: Batch[]) => {
        await loader.dismiss();
        this.handleUnenrollButton();
        this.showOfflineSection = false;
        this.batches = data || [];
        // console.log('this.batches', this.batches);
        if ( data && data.length > 1) {
          this.batchCount = data.length;
        } else if (data && data.length === 1) {
          this.batchEndDate = data[0].endDate;
          this.enrollmentEndDate =  data[0].enrollmentEndDate ;
        }
      })
      .catch(async (error: any) => {
        await loader.dismiss();
        if (error instanceof NetworkError) {
          this.showOfflineSection = true;
        } else {
          this.showOfflineSection = false;
        }
        console.log('Error while fetching all Batches', error);
      });
  }

  toggleGroup(group, content) {
    let isCollapsed = true;
    if (this.isGroupShown(group)) {
      isCollapsed = false;
      this.shownGroup = null;
    } else {
      isCollapsed = false;
      this.shownGroup = group;
    }
    const values = new Map();
    values['isCollapsed'] = isCollapsed;
    const telemetryObject = new TelemetryObject(content.identifier, ContentType.COURSE_UNIT, content.pkgVersion);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UNIT_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      telemetryObject,
      values,
      undefined,
      this.corRelationList
    );
  }
  // to check whether the card is toggled or not
  isGroupShown(group) {
    return this.shownGroup === group;
  }

  getLastPlayedName(id) {
    if (this.showResumeBtn) {
      const option = {
        contentId: id,
        hierarchyInfo: null,
        level: !this.courseCardData.batchId ? 1 : 0,
      };
      this.contentService.getContentDetails(option).toPromise()
        .then((data: Content) => {
          this.lastReadContentName = data.contentData.name;
          this.lastReadContentType = data.contentData.contentType;
        }).catch(() => {

        });
    } else if (this.childContentsData) {
      const firstChild = this.loadFirstChildren(this.childContentsData);
      this.lastReadContentName = firstChild.contentData.name;
    }

  }

  /**
   * Function to set child contents
   */
  async setChildContents() {
    this.showChildrenLoader = true;
    const option: ChildContentRequest = {
      contentId: this.identifier,
      hierarchyInfo: null
    };
    this.contentService.getChildContents(option).toPromise()
      .then((data: Content) => {
        // console.log('getChildContents', data);
        // this.contentService.nextContent(data.hierarchyInfo, this.courseCardData.lastReadContentId).subscribe((content) => {
        //   console.log('next content', content);
        // });
        this.zone.run(async () => {
          // await loader.dismiss();
          if (data && data.children) {
            setTimeout(() => {
              if (this.stickyPillsRef) {
                this.stickyPillsRef.nativeElement.classList.add('sticky');
              }
            }, 1000);

            this.enrolledCourseMimeType = data.mimeType;
            this.childrenData = data.children;
            this.toggleGroup(0, this.childrenData[0]);
            this.startData = data.children;
            this.childContentsData = data;
            // this.getContentState(!this.isNavigatingWithinCourse);
            this.getContentState(true);
          }
          if (this.courseCardData.batchId) {
            this.downloadSize = 0;
            this.getContentsSize(this.childrenData);
          }
          this.showChildrenLoader = false;
        });
      }).catch(() => {
        this.zone.run(async () => {
          this.showChildrenLoader = false;
        });
      });
  }

  /**
   * Redirect to child content details page
   */
  navigateToChildrenDetailsPage(content: Content, depth): void {
    const subtype = InteractSubtype.CONTENT_CLICKED;
    const contentState: ContentState = {
      batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
      courseId: this.identifier
    };
    this.zone.run(() => {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content,
          depth,
          contentState,
          isChildContent: true,
          corRelation: this.corRelationList,
          isCourse: true,
          course: this.updatedCourseCardData
        }
      });
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        subtype,
        Environment.HOME,
        PageId.COURSE_DETAIL,
        ContentUtil.getTelemetryObject(content),
        undefined,
        ContentUtil.generateRollUp(content.hierarchyInfo, undefined),
        this.corRelationList);
    });
  }

  cancelDownload() {
    const showHeader = () => {
      this.zone.run(() => {
        this.showLoading = false;
        this.headerService.showHeaderWithBackButton();
        this.location.back();
      });
    };

    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.course);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        showHeader();
      }).catch(() => {
        showHeader();
      });
  }

  getContentsSize(data?) {
    // this.downloadIdentifiers = [];
    if (data) {
      data.forEach((value) => {
        if (value.contentData.size) {
          this.downloadSize += Number(value.contentData.size);
        }
        if (value.children) {
          this.getContentsSize(value.children);
        }
        if (value.isAvailableLocally === false) {
          this.downloadIdentifiers.add(value.contentData.identifier);
          this.rollUpMap[value.contentData.identifier] = ContentUtil.generateRollUp(value.hierarchyInfo, undefined);
        }
      });
    }
  }

  /**
   * Function gets executed when user click on resume course button.
   */
  resumeContent(identifier): void {
    const params: NavigationExtras = {
      state: {
        content: { identifier },
        depth: '1', // Needed to handle some UI elements.
        contentState: {
          batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
          courseId: this.identifier
        },
        isResumedCourse: true,
        isChildContent: true,
        resumedCourseCardData: this.courseCardData,
        corRelation: this.corRelationList,
        isCourse: true,
        course: this.updatedCourseCardData
      }
    };
    this.router.navigate([RouterLinks.CONTENT_DETAILS], params);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.RESUME_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );
  }

  /**
   * Ionic life cycle hook
   */
  async ionViewWillEnter() {
    this.todayDate =  dayjs().format('YYYY-MM-DD');
    console.log('coursecarddata' + this.courseCardData);
    this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
    this.downloadSize = 0;
    this.objRollup = ContentUtil.generateRollUp(this.courseCardData.hierarchyInfo, this.identifier);
    this.headerService.showHeaderWithBackButton();

    if (!this.guestUser) {
      this.updatedCourseCardData = await this.courseService.getEnrolledCourses({userId: this.userId, returnFreshCourses: false})
        .toPromise()
        .then((data) => {
          if (data.length > 0) {
            const courseList: Array<Course> = [];
            for (const course of data) {
              courseList.push(course);
            }
            this.appGlobalService.setEnrolledCourseList(courseList);
          }
          return data.find((element) =>
            (this.courseCardData.batchId && element.batchId === this.courseCardData.batchId)
            || (!this.courseCardData.batchId && element.courseId === this.identifier));
        });
      if (this.updatedCourseCardData && !this.courseCardData.batch) {
        this.courseCardData.batch = this.updatedCourseCardData.batch;
        this.courseCardData.batchId = this.updatedCourseCardData.batchId;
      }
    }

    // check if the course is already enrolled
    this.isCourseEnrolled(this.identifier);
    if (this.batchId) {
      this.courseCardData.batchId = this.batchId;
    }

    if (this.courseCardData.progress && this.courseCardData.progress > 0) {
      this.showResumeBtn = true;
    }

    // TODO: Need to check
    if (!this.isAlreadyEnrolled) {
      this.getAllBatches();
    } else {
      this.segmentType = 'modules';
    }

    // if (this.courseCardData.batchId) {
    //   this.segmentType = 'modules';
    // }
    this.downloadIdentifiers = new Set();
    this.setContentDetails(this.identifier);
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    // this.showResumeBtn = !!this.courseCardData.lastReadContentId;

    // If courseCardData does not have a batch id then it is not a enrolled course
    this.subscribeSdkEvent();
    this.populateCorRelationData(this.courseCardData.batchId);
    this.handleBackButton();
    this.getLastReadContentId();
  }

  showLicensce() {
    this.showCredits = !this.showCredits;

    if (this.showCredits) {
      this.licenseSectionClicked('expanded');
    } else {
      this.licenseSectionClicked('collapsed');
    }
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.COURSE_DETAIL,
        Environment.HOME,
        false,
        this.identifier,
        this.corRelationList,
        this.objRollup,
        this.telemetryObject
      );
      this.didViewLoad = false;
      this.generateEndEvent(this.objId, this.objType, this.objVer);

      if (this.shouldGenerateEndTelemetry) {
        this.generateQRSessionEndEvent(this.source, this.course.identifier);
      }
      this.goBack();
    });
  }

  populateCorRelationData(batchId) {
    if (!this.corRelationList) {
      this.corRelationList = [];
    }
    this.corRelationList.push({ id: batchId ? batchId : '', type: CorReleationDataType.COURSE_BATCH });
    this.corRelationList.push({ id: this.identifier, type: CorReleationDataType.ROOT_ID });
    this.corRelationList = this.commonUtilService.deDupe(this.corRelationList, 'type');
  }

  isCourseEnrolled(identifier: string) {
    // get all the enrolled courses
    const enrolledCourses = this.appGlobalService.getEnrolledCourseList();
    if (enrolledCourses && enrolledCourses.length > 0) {
      for (const course of enrolledCourses) {
        if (course.courseId === identifier) {
          if (!this.guestUser && this.courseCardData.batch && course.batchId
            === this.courseCardData.batch.identifier) {
            this.isAlreadyEnrolled = true;
            this.courseCardData = course;
          } else if (!this.courseCardData.batch) {
            this.courseCardData = course;
          }
        }
      }
    }
  }

  getCourseProgress() {
    if (this.courseCardData.batchId && this.updatedCourseCardData) {
      // console.log('getCourseProgress', this.updatedCourseCardData);
      this.course.progress = this.updatedCourseCardData.completionPercentage;
    }
  }

  /**
   * Subscribe Sunbird-SDK event to get content download progress
   */
  subscribeSdkEvent() {
    this.eventSubscription = this.eventsBusService.events()
      .subscribe((event: EventsBusEvent) => {
        this.zone.run(() => {
          // Show download percentage
          if (event.type === DownloadEventType.PROGRESS) {

            const downloadEvent = event as DownloadProgress;
            if (downloadEvent.payload.identifier === this.identifier) {
              this.downloadProgress = downloadEvent.payload.progress === -1 ? 0 : downloadEvent.payload.progress;

              if (this.downloadProgress === 100) {
                this.getBatchDetails();
                this.showLoading = false;
                this.headerService.showHeaderWithBackButton();
              }
            }
          }

          // Get child content
          if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
            this.showLoading = false;
            this.headerService.showHeaderWithBackButton();
            const contentImportCompleted = event as ContentImportCompleted;
            if (this.queuedIdentifiers.length && this.isDownloadStarted) {
              if (this.queuedIdentifiers.includes(contentImportCompleted.payload.contentId)) {
                this.currentCount++;
              }

              if (this.queuedIdentifiers.length === this.currentCount) {
                this.isDownloadStarted = false;
                this.currentCount = 0;
                this.showDownload = false;
                this.downloadIdentifiers = new Set();
                this.queuedIdentifiers.length = 0;
              }
            } else {
              this.course.isAvailableLocally = true;
              this.setContentDetails(this.identifier);
            }
          }

          if (event.payload && event.type === ContentEventType.SERVER_CONTENT_DATA) {
            this.licenseDetails = event.payload.licenseDetails;
            if (event.payload.size) {
              this.content.contentData.size =  event.payload.size;
            }
          }

          if (event.type === ContentEventType.IMPORT_PROGRESS) {
            const totalCountMsg = Math.floor((event.payload.currentCount / event.payload.totalCount) * 100) +
              '% (' + event.payload.currentCount + ' / ' + event.payload.totalCount + ')';
            this.importProgressMessage = this.commonUtilService.translateMessage('EXTRACTING_CONTENT', totalCountMsg);

            if (event.payload.currentCount === event.payload.totalCount) {
              let timer = 30;
              const interval = setInterval(() => {
                this.importProgressMessage = `Getting things ready in ${timer--}  seconds`;
                if (timer === 0) {
                  this.importProgressMessage = 'Getting things ready';
                  clearInterval(interval);
                }
              }, 1000);
            }
          }

          // For content update available
          const hierarchyInfo = this.courseCardData.hierarchyInfo ? this.courseCardData.hierarchyInfo : null;
          const contentUpdateEvent = event as ContentUpdate;
          if (contentUpdateEvent.payload && contentUpdateEvent.payload.contentId === this.identifier &&
            contentUpdateEvent.type === ContentEventType.UPDATE
            && hierarchyInfo === null) {
            this.zone.run(() => {
              this.showLoading = true;
              this.headerService.hideHeader();
              this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.content, false);
              this.importContent([this.identifier], false);
            });
          }

        });
      }) as any;
  }

  /**
   * Ionic life cycle hook
   */
  ionViewWillLeave(): void {
    this.isNavigatingWithinCourse = true;
    this.events.publish('header:setzIndexToNormal');
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe(EventTopics.ENROL_COURSE_SUCCESS);
    this.events.unsubscribe('courseToc:content-clicked');
    this.events.unsubscribe(EventTopics.UNENROL_COURSE_SUCCESS);
    this.events.unsubscribe('header:setzIndexToNormal');
    this.events.unsubscribe('header:decreasezIndex');
  }

  /**
   * checks whether batches are available or not and then Navigate user to batch list page
   */
  async navigateToBatchListPage() {
    const ongoingBatches = [];
    const upcommingBatches = [];
    const loader = await this.commonUtilService.getLoader();
    const reqvalues = new Map();
    reqvalues['enrollReq'] = this.courseBatchesRequest;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL, this.telemetryObject,
      reqvalues,
      this.objRollup);

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (this.batches.length) {
        if (this.batches.length === 1) {
          this.enrollIntoBatch(this.batches[0]);
        } else {
          forEach(this.batches, (batch, key) => {
            if (batch.status === 1) {
              ongoingBatches.push(batch);
            } else {
              upcommingBatches.push(batch);
            }
          });
          this.router.navigate([RouterLinks.COURSE_BATCHES], {
            state: {
              ongoingBatches,
              upcommingBatches,
              course: this.course,
              objRollup: this.objRollup,
              telemetryObject: this.telemetryObject,
              corRelationList: this.corRelationList
            }
          });
        }
      } else {
        this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
        await loader.dismiss();

      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  /**
   * Loads first children with in the start data
   */
  loadFirstChildren(data) {
    if (data && (data.children === undefined)) {
      return data;
    } else {
      for (const child of data.children) {
        return this.loadFirstChildren(child);
      }
    }
  }

  /**
   * Get executed when user click on start button
   */
  startContent() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.START_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );
    if (this.startData && this.startData.length && !this.isBatchNotStarted) {
      this.firstChild = this.loadFirstChildren(this.childContentsData);
      this.navigateToChildrenDetailsPage(this.firstChild, 1);
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
        this.datePipe.transform(this.courseStartDate, 'mediumDate')));
    }
  }

  async share() {
    // this.contentShareHandler.shareContent(this.content, this.corRelationList);
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.content,
        corRelationList: this.corRelationList,
        pageId: PageId.COURSE_DETAIL,
        shareItemType: ShareItemType.ROOT_COLECTION
      },
      cssClass: 'sb-popover',
    });
    popover.present();
  }

  handleNavBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.course.identifier);
    }
  }

  goBack() {
    this.events.publish('event:update_course_data');
    if (this.isQrCodeLinkToContent) {
      window.history.go(-2);
    } else {
      this.location.back();
    }
  }

  generateQRSessionEndEvent(pageId: string, qrData: string) {
    if (pageId !== undefined) {
      const telemetryObject = new TelemetryObject(qrData, 'qr', undefined);
      this.telemetryGeneratorService.generateEndTelemetry(
        'qr',
        Mode.PLAY,
        pageId,
        Environment.HOME,
        telemetryObject,
        this.objRollup,
        this.corRelationList);
    }
  }

  generateImpressionEvent(objectId, objectType, objectVersion) {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.DETAIL,
      '', PageId.COURSE_DETAIL,
      Environment.HOME,
      objectId,
      objectType,
      objectVersion,
      this.objRollup,
      this.corRelationList);
  }

  generateStartEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateStartTelemetry(PageId.COURSE_DETAIL,
      telemetryObject,
      this.objRollup,
      this.corRelationList
    );
  }

  generateEndEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateEndTelemetry(objectType,
      Mode.PLAY,
      PageId.COURSE_DETAIL,
      Environment.HOME,
      telemetryObject,
      this.objRollup,
      this.corRelationList);
  }

  /**
   * Opens up popup for the credits.
   */
  viewCredits() {
    this.courseUtilService.showCredits(this.course, PageId.COURSE_DETAIL, undefined, this.corRelationList);
  }
  licenseSectionClicked(params) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(
      params === 'expanded' ? InteractType.LICENSE_CARD_EXPANDED : InteractType.LICENSE_CARD_COLLAPSED,
      '',
      undefined,
      PageId.COURSE_DETAIL,
      telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList,
      ID.LICENSE_CARD_CLICKED
    );
  }

  getContentState(returnRefresh: boolean) {
    if (this.courseCardData.batchId) {
      const request: GetContentStateRequest = {
        userId: this.appGlobalService.getUserId(),
        courseIds: [this.identifier],
        returnRefreshedContentStates: returnRefresh,
        batchId: this.courseCardData.batchId
      };
      this.courseService.getContentState(request).toPromise()
        .then((success: ContentStateResponse) => {
          this.contentStatusData = success;

          if (this.contentStatusData && this.contentStatusData.contentList) {
            let progress = 0;
            this.contentStatusData.contentList.forEach((contentState: ContentState) => {
              if (contentState.status === 2) {
                progress = progress + 1;
              }
            });

            this.courseCardData.progress = progress;
            this.getCourseProgress();

            if (this.courseCardData.progress && this.courseCardData.progress > 0) {
              this.showResumeBtn = true;
            }
          }

          if (this.childrenData) {
            this.getStatusOfCourseCompletion(this.childrenData);
          }
        }).catch((error: any) => {
        });
    } else {
      // to be handled when there won't be any batchId
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'share':
        this.share();
        break;
      case 'more':
        this.showOverflowMenu($event.event);
        break;
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COURSE_DETAIL, Environment.HOME,
          true, this.identifier, this.corRelationList, this.objRollup, this.telemetryObject);
        this.handleNavBackButton();
        this.goBack();
        break;
    }
  }

  async enrollIntoBatch(item: Batch) {
    if (this.guestUser) {
      this.promptToLogin(item);
    } else {
      const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, item);
      this.loader = await this.commonUtilService.getLoader();
      if (this.loader) {
        this.loader.present();
      }
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ENROLL_CLICKED,
        Environment.HOME,
        PageId.COURSE_BATCHES, undefined,
        this.localCourseService.prepareRequestValue(enrollCourseRequest));

      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch: item,
        pageId: PageId.COURSE_BATCHES,
        courseId: undefined,
        telemetryObject: this.telemetryObject,
        objRollup: this.objRollup,
        corRelationList: this.corRelationList
      };

      this.localCourseService.enrollIntoBatch(enrollCourse).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            this.courseCardData.batchId = item.id;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: item.id,
              courseId: item.courseId
            });
            this.isAlreadyEnrolled = true;
          });
        }, (error) => {
          this.zone.run(async () => {
           if (this.loader) {
             this.loader.dismiss();
             this.loader = undefined;
           }
          });
        });
    }
  }

  async promptToLogin(batchdetail) {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
      '', PageId.SIGNIN_POPUP,
      Environment.HOME,
      this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version,
      this.objRollup,
      this.corRelationList);
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL'),
        metaInfo: this.commonUtilService.translateMessage('TRAININGS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify(batchdetail)).toPromise();
      this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, JSON.stringify(this.course)).toPromise();
      this.preferences.putString(PreferenceKey.CDATA_KEY, JSON.stringify(this.corRelationList)).toPromise();
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.LOGIN_CLICKED,
        Environment.HOME,
        PageId.SIGNIN_POPUP,
        this.telemetryObject,
        undefined,
        this.objRollup,
        this.corRelationList
      );
      this.appGlobalService.resetSavedQuizContent();
      this.loginHandlerService.signIn();
    }
  }

  onSegmentChange(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      event.detail.value === 'modules' ? InteractSubtype.TRAINING_MODULE_CLICKED : InteractSubtype.TRAINING_INFO_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );
  }

  // check wheather to show Unenroll button in overflow menu or not
  handleUnenrollButton() {
    console.log('INside the show unenroll ');
    const batchDetails = this.batchDetails ? this.batchDetails.status : 2;
    const enrollmentType = this.batchDetails ? this.batchDetails.enrollmentType : '';
    console.log('INside the show unenroll ',  batchDetails, enrollmentType);
    console.log('final condition --- ', (batchDetails !== 2 &&
      (this.courseCardData.status === 0 || this.courseCardData.status === 1 || this.course.progress < 100) &&
      enrollmentType !== 'invite-only'));

    if (this.updatedCourseCardData) {
      this.showUnenrollButton = (batchDetails !== 2 &&
        (this.updatedCourseCardData.status === 0 || this.updatedCourseCardData.status === 1 || this.course.progress < 100) &&
        enrollmentType !== 'invite-only');
    } else {
      this.showUnenrollButton = (
        (batchDetails !== 2 &&
          (this.courseCardData.status === 0 || this.courseCardData.status === 1 || this.course.progress < 100) &&
          enrollmentType !== 'invite-only')
      );
    }
  }

  mergeProperties(mergeProp) {
    return ContentUtil.mergeProperties(this.course, mergeProp);
  }


}
