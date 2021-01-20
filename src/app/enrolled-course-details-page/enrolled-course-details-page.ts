import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { DatePipe, Location } from '@angular/common';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
  AuditState, AuthService,
  Batch,
  ChildContentRequest, Consent, Content, ContentDetailRequest,
  ContentEventType, ContentImport, ContentImportCompleted,
  ContentImportRequest, ContentImportResponse, ContentImportStatus,
  ContentService, ContentState, ContentStateResponse, ContentUpdate,
  CorrelationData, Course, CourseBatchesRequest, CourseBatchStatus,
  CourseEnrollmentType, CourseService,
  DownloadEventType, DownloadProgress,
  DownloadService, DownloadTracking,
  EventsBusEvent, EventsBusService,
  FetchEnrolledCourseRequest,
  GetContentStateRequest,
  NetworkError,
  ProfileService,
  Rollup,
  ServerProfileDetailsRequest, SharedPreferences, SortOrder,
  TelemetryErrorCode, TelemetryObject,
  UnenrollCourseRequest, DiscussionService
} from 'sunbird-sdk';
import { Observable, Subscription } from 'rxjs';
import {
  AuditType,
  CorReleationDataType,
  Environment, ErrorType,
  ImpressionType, InteractSubtype, InteractType,
  Mode,
  PageId
} from '../../services/telemetry-constants';
import {
  BatchConstants, ContentCard, EventTopics, MimeType,
  PreferenceKey, ProfileConstants, RouterLinks, ShareItemType
} from '../app.constant';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { ConfirmAlertComponent, ContentActionsComponent, ContentRatingAlertComponent } from '../components';
import { NavigationExtras, Router } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { SbPopoverComponent } from '../components/popups';
import { ContentInfo } from '@app/services/content/content-info';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import { LocalCourseService } from '@app/services';
import { EnrollCourse } from './course.interface';
import { SbSharePopupComponent } from '../components/popups/sb-share-popup/sb-share-popup.component';
import { share } from 'rxjs/operators';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { ConsentStatus, UserConsent } from '@project-sunbird/client-services/models';
import { ConsentPopoverActionsDelegate } from '@app/services/local-course.service';
import { CategoryKeyTranslator } from '@app/pipes/category-key-translator/category-key-translator-pipe';
import { ConsentService } from '@app/services/consent-service';
import {
  ProfileNameConfirmationPopoverComponent
} from '../components/popups/sb-profile-name-confirmation-popup/sb-profile-name-confirmation-popup.component';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { EnrollmentDetailsComponent } from '../components/enrollment-details/enrollment-details.component';

declare const cordova;

@Component({
  selector: 'app-enrolled-course-details-page',
  templateUrl: './enrolled-course-details-page.html',
  styleUrls: ['./enrolled-course-details-page.scss'],
})
export class EnrolledCourseDetailsPage implements OnInit, OnDestroy, ConsentPopoverActionsDelegate {

  /**
   * Contains content details
   */
  course: any;

  /**
   * Contains children content data
   */
  courseHeirarchy: any;

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
  isGuestUser = false;
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
  isFromGroupFlow = false;
  /** Whole child content is stored and it is used to find first child */
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
  enrollmentEndDate: string;
  loader?: HTMLIonLoadingElement;
  isQrCodeLinkToContent: any;
  leaveTrainigPopover: any;
  showOfflineSection = false;
  courseBatchesRequest: CourseBatchesRequest;
  showUnenrollButton = false;
  licenseDetails;
  forumId?: string;

  @ViewChild('stickyPillsRef', { static: false }) stickyPillsRef: ElementRef;
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
  public courseCompletionData = {};
  isCertifiedCourse: boolean;
  showSheenAnimation = true;
  private isOnboardingSkipped: any;
  private isFromChannelDeeplink: any;
  trackDownloads$: Observable<DownloadTracking>;
  showCollapsedPopup = true;
  resumeCourseFlag = false;

  isNextContentFound = false;
  isFirstContent = false;
  nextContent: Content;
  certificateDescription = '';
  private csGroupAddableBloc: CsGroupAddableBloc;
  pageId = PageId.COURSE_DETAIL;
  showShareData = false;
  isDataShare = false;
  isShared: any;
  dataSharingStatus: any;
  lastUpdateOn: string;
  isConsentPopUp = false;
  skipCheckRetiredOpenBatch = false;
  forumIds;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('DISCUSSION_SERVICE') private discussionService: DiscussionService,
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
    private location: Location,
    private router: Router,
    private contentDeleteHandler: ContentDeleteHandler,
    private localCourseService: LocalCourseService,
    private sbProgressLoader: SbProgressLoader,
    private contentPlayerHandler: ContentPlayerHandler,
    private categoryKeyTranslator: CategoryKeyTranslator,
    private consentService: ConsentService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
  ) {
    this.objRollup = new Rollup();
    this.csGroupAddableBloc = CsGroupAddableBloc.instance;
    // this.getUserId();

    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.courseCardData = extrasState.content;
      this.isOnboardingSkipped = extrasState.isOnboardingSkipped;
      this.isFromChannelDeeplink = extrasState.isFromChannelDeeplink;
      this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
      this.corRelationList = extrasState.corRelation;
      this.source = extrasState.source;
      if (CsGroupAddableBloc.instance.initialised) {
        this.isFromGroupFlow = true;
      }
      this.isQrCodeLinkToContent = extrasState.isQrCodeLinkToContent;
      this.resumeCourseFlag = extrasState.resumeCourseFlag || false;
      this.skipCheckRetiredOpenBatch = extrasState.skipCheckRetiredOpenBatch;
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
    this.contentDeleteObservable = this.contentDeleteHandler.contentDeleteCompleted$.subscribe(async () => {
      if (await this.onboardingSkippedBackAction()) {
        return;
      }
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
      this.reloadPageAfterEnrollment(res);
    });

    this.events.subscribe(EventTopics.UNENROL_COURSE_SUCCESS, async () => {
      // to show 'Enroll in Course' button courseCardData.batchId should be undefined/null
      this.getAllBatches();
      await this.updateEnrolledCourseData(); // enrolled course list updated
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
      if (this.stickyPillsRef && this.stickyPillsRef.nativeElement) {
        this.stickyPillsRef.nativeElement.classList.remove('z-index-0');
      }
    });

    this.events.subscribe('header:decreasezIndex', () => {
      if (this.stickyPillsRef && this.stickyPillsRef.nativeElement) {
        this.stickyPillsRef.nativeElement.classList.add('z-index-0');
      }
    });

  }

  private async reloadPageAfterEnrollment(res) {
    await this.appGlobalService.getActiveProfileUid()
      .then((uid) => {
        this.userId = uid;
      });
    this.checkUserLoggedIn();
    await this.updateEnrolledCourseData();
    this.courseCardData.batchId = res.batchId;
    await this.getBatchDetails();
    this.segmentType = 'modules';

    this.getContentState(true);
    if (res && res.batchId) {
      this.batchId = res.batchId;
      if (this.identifier && res.courseId && this.identifier === res.courseId) {
        await this.isCourseEnrolled(this.identifier);
        this.zone.run(() => {
          this.getContentsSize(this.courseHeirarchy.children);
          if (this.loader) {
            this.loader.dismiss();
            this.loader = undefined;
          }
        });
      }
    }
  }

  private checkUserLoggedIn() {
    this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
  }

  async updateEnrolledCourseData() {
    const fetchEnrolledCourseRequest: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: true
    };
    console.log('updateEnrolledCourseData');
    this.updatedCourseCardData = await this.courseService.getEnrolledCourses(fetchEnrolledCourseRequest).toPromise()
      .then((enrolledCourses) => {

        this.appGlobalService.setEnrolledCourseList(enrolledCourses || []);

        return enrolledCourses.find((element) =>
          (this.courseCardData.batchId && element.batchId === this.courseCardData.batchId)
          || (!this.courseCardData.batchId && element.courseId === this.identifier));
      })
      .catch(e => {
        console.log(e);
        return undefined;
      });

    if (this.updatedCourseCardData && !this.courseCardData.batch) {
      this.courseCardData.batch = this.updatedCourseCardData.batch;
      this.courseCardData.batchId = this.updatedCourseCardData.batchId;
    }
  }

  subscribeTrackDownloads() {
    this.trackDownloads$ = this.downloadService.trackDownloads({ groupBy: { fieldPath: 'rollUp.l1', value: this.identifier } }).pipe(
      share());
  }

  checkCurrentUserType() {
    if (this.isGuestUser) {
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
    if (!this.batches.length) {
      this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
      return;
    } else if (
      this.batches.length === 1 &&
      this.batches[0].enrollmentEndDate &&
      ((new Date().setHours(0, 0, 0, 0)) > new Date(this.batches[0].enrollmentEndDate).setHours(0, 0, 0, 0))
    ) {
      this.commonUtilService.showToast(
        'ENROLLMENT_ENDED_ON',
        null,
        null,
        null,
        null,
        this.datePipe.transform(this.batches[0].enrollmentEndDate)
      );
      return;
    }

    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_YOU_MUST_JOIN_AN_ACTIVE_BATCH', this.course),
        metaInfo: this.commonUtilService.translateMessage('REGISTER_TO_COMPLETE_ACCESS'),
        sbPopoverHeading: this.categoryKeyTranslator.transform('FRMELEMNTS_LBL_JOIN_TRAINING', this.course) + '?',
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.categoryKeyTranslator.transform('FRMELEMNTS_LBL_JOIN_TRAINING', this.course),
            btnClass: 'popover-color'
          },
        ],
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
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
    if (!this.isGuestUser) {
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
      if (this.commonUtilService.isAccessibleForNonStudentRole(this.profileType)) {
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
        sbPopoverHeading: this.categoryKeyTranslator.transform('FRMELEMNTS_LBL_LEAVE_TRAINING_HEADING', this.course),
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
            this.commonUtilService.showToast(this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_COURSE_UNENROLLED', this.course));
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
              // this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('FRMELEMNTS_MSG_UNABLE_TO_ENROLL'));
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
          if (!data.isAvailableLocally) {
            this.extractApiResponse(data);
            this.getCourseHierarchy(option, data);
          } else {
            this.extractApiResponse(data);
            this.showSheenAnimation = false;
          }
        });
      })
      .catch((error: any) => {
        if (NetworkError.isInstance(error)) {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else {
          this.commonUtilService.showToast('ERROR_FETCHING_DATA');
        }
        this.isConsentPopUp = true;
        this.showSheenAnimation = false;
        this.location.back();
      });
  }

  async getCourseHierarchy(request: ContentDetailRequest, data: Content) {
    this.telemetryGeneratorService.generatefastLoadingTelemetry(
      InteractSubtype.FAST_LOADING_INITIATED,
      PageId.COURSE_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );
    this.contentService.getContentHeirarchy(request).toPromise()
      .then((content: Content) => {
        /* setting child content here */
        this.showSheenAnimation = false;
        this.courseHeirarchy = content;
        this.checkRetiredOpenBatch(this.courseHeirarchy);
        this.toggleGroup(0, content.children[0]);
        this.getContentState(true);
        this.telemetryGeneratorService.generatefastLoadingTelemetry(
          InteractSubtype.FAST_LOADING_FINISHED,
          PageId.COURSE_DETAIL,
          this.telemetryObject,
          undefined,
          this.objRollup,
          this.corRelationList
        );
      })
      .catch(error => {
        console.log('Error Fetching Childrens', error);
        this.extractApiResponse(data);
        this.showSheenAnimation = false;
      });
  }

  /**
   * Function to extract api response. Check content is locally available or not.
   * If locally available then make childContents api call else make import content api call
   */
  async extractApiResponse(data: Content) {
    if (data.contentData) {
      this.course = data.contentData;
      this.forumId = this.course.forumId || this.forumId;
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
        this.course.attributions = (this.course.attributions.sort()).join(', ');
      }

      // User Rating
      const contentFeedback: any = data.contentFeedback ? data.contentFeedback : [];
      if (contentFeedback !== undefined && contentFeedback.length !== 0) {
        this.userRating = contentFeedback[0].rating;
        this.ratingComment = contentFeedback[0].comments;
      }
      // this.getCourseProgress();
    } else {
      this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      this.location.back();
    }

    /* getting batch details for the course
       Check Point: should be called on the condition of already enrolled courses only */
    await this.getBatchDetails();
    this.course.isAvailableLocally = data.isAvailableLocally;


    if (Boolean(data.isAvailableLocally)) {
      await this.setChildContents();
    } else {
      this.showLoading = true;
      // this.headerService.hideHeader();
      this.telemetryGeneratorService.generateSpineLoadingTelemetry(data, true);
      this.importContent([this.identifier], false);
    }

    this.setCourseStructure();
  }

  /**
   * Get batch details
   */
  async getBatchDetails(batchId?) {
    if (!batchId && (!this.courseCardData || !this.courseCardData.batchId)) {
      return;
    }
    const currentBatchId = batchId || this.courseCardData.batchId;
    this.courseService.getBatchDetails({ batchId: currentBatchId }).toPromise()
      .then((data: Batch) => {
        this.zone.run(() => {
          if (!data) {
            return;
          }
          this.batchDetails = data;
          // console.log('this.batchDetails', this.batchDetails);
          this.handleUnenrollButton();
          if (data.cert_templates && Object.keys(data.cert_templates).length) {
            this.isCertifiedCourse = true;
            if (data.cert_templates[Object.keys(data.cert_templates)[0]].description) {
              this.certificateDescription = data.cert_templates[Object.keys(data.cert_templates)[0]].description;
            }
          } else {
            this.isCertifiedCourse = false;
          }
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
              } else if (this.batchDetails.status === 1) {
                this.batchExp = false;
              }
            })
            .catch((error) => {
            });

          this.getBatchCreatorName();
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
    contentContextMap['isCertified'] = this.isCertifiedCourse;
    // const leafNodeIds = this.getLeafNodeIdsWithoutDuplicates([this.courseHeirarchy]);
    const leafNodeIds = this.courseHeirarchy.contentData.leafNodes;
    contentContextMap['leafNodeIds'] = leafNodeIds;
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
      .then((serverProfile) => {
        if (serverProfile) {
          this.batchDetails.creatorDetails.firstName = serverProfile.firstName ? serverProfile.firstName : '';
          this.batchDetails.creatorDetails.lastName = serverProfile.lastName ? serverProfile.lastName : '';
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
          if (data && data.length && data[0].status === ContentImportStatus.NOT_FOUND) {
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
        this.showCollapsedPopup = false;
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

  private getLeafNodeIdsWithoutDuplicates(contents: Content[]): Set<string> {
    return contents.reduce((acc, content) => {
      if (content.children) {
        this.getLeafNodeIdsWithoutDuplicates(content.children).forEach((c) => acc.add(c));
      } else {
        if (!acc.has(content.identifier)) {
          if (content.mimeType !== MimeType.COLLECTION) {
            acc.add(content.identifier);
          }
        }
      }
      return acc;
    }, new Set<string>());
  }

  /**
   * Function to get status of child contents
   */
  private getStatusOfCourseCompletion(childrenData: Content[]) {
    const contentStatusData = this.contentStatusData;

    this.initNextContent();

    this.zone.run(() => {
      childrenData.forEach((childContent) => {
        if (childContent.children && childContent.children.length) {
          this.courseCompletionData[childContent.identifier] =
            this.getLeafNodes(childContent.children).every((eachContent) => {
              if (contentStatusData.contentList.length) {
                const statusData = contentStatusData.contentList.find(c => c.contentId === eachContent.identifier);
                if (statusData) {
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
    // const loader = await this.commonUtilService.getLoader();
    this.courseBatchesRequest = {
      filters: {
        courseId: this.identifier,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS],
        enrollmentType: CourseEnrollmentType.OPEN
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    // await loader.present();
    this.courseService.getCourseBatches(this.courseBatchesRequest).toPromise()
      .then(async (data: Batch[]) => {
        // await loader.dismiss();
        this.handleUnenrollButton();
        this.showOfflineSection = false;
        this.batches = data || [];
        // console.log('this.batches', this.batches);
        if (data && data.length > 1) {
          this.batchCount = data.length;
        } else if (data && data.length === 1) {
          this.batchEndDate = data[0].endDate;
          this.enrollmentEndDate = data[0].enrollmentEndDate;
          this.getBatchDetails(data[0].identifier);
        }
      })
      .catch(async (error: any) => {
        // await loader.dismiss();
        if (NetworkError.isInstance(error)) {
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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UNIT_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      ContentUtil.getTelemetryObject(content),
      values,
      undefined,
      this.corRelationList
    );
  }
  // to check whether the card is toggled or not
  isGroupShown(group) {
    return this.shownGroup === group;
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
        this.zone.run(async () => {
          if (data && data.children) {
            setTimeout(() => {
              if (this.stickyPillsRef && this.stickyPillsRef.nativeElement) {
                this.stickyPillsRef.nativeElement.classList.add('sticky');
              }
            }, 1000);
            this.courseHeirarchy = data;
            this.checkRetiredOpenBatch(this.courseHeirarchy);
            this.getContentState(true);
          }
          if (this.courseCardData.batchId) {
            this.downloadSize = 0;
            this.getContentsSize(this.courseHeirarchy.children);
          }
          this.showChildrenLoader = false;
        });
      }).catch(() => {
        this.zone.run(async () => {
          this.showChildrenLoader = false;
        });
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
        if (!value.isAvailableLocally && value.contentData.downloadUrl) {
          this.downloadIdentifiers.add(value.contentData.identifier);
          this.rollUpMap[value.contentData.identifier] = ContentUtil.generateRollUp(value.hierarchyInfo, undefined);
        }
      });
    }
  }

  async startLearning() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.START_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      this.telemetryObject,
      undefined,
      this.objRollup,
      this.corRelationList
    );

    const key = PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-' + this.userId;
    const doNotShow = await this.preferences.getBoolean(key).toPromise();
    const profile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();

    if (doNotShow || await this.tncUpdateHandlerService.isSSOUser(profile) || !this.isCertifiedCourse) {
      this.startContent();
    } else {
      this.showProfileNameConfirmationPopup();
    }
  }

  private async startContent() {
    if (this.courseHeirarchy && this.courseHeirarchy.children
      && this.courseHeirarchy.children.length && !this.isBatchNotStarted) {
      if (!this.nextContent) {
        this.initNextContent();
      }
      const telemetryDetails = {
        pageId: PageId.COURSE_DETAIL,
        corRelationList: this.corRelationList
      };
      const assessmentStatus = this.localCourseService.fetchAssessmentStatus(this.contentStatusData, this.nextContent);

      const skipPlay =  await this.commonUtilService.handleAssessmentStatus(assessmentStatus);
      if (skipPlay) {
        return;
      }
      this.contentPlayerHandler.playContent(this.nextContent, this.generateContentNavExtras(this.nextContent, 1), telemetryDetails, true);
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
        this.datePipe.transform(this.courseStartDate, 'mediumDate')));
    }
  }

  /**
   * Function gets executed when user click on resume course button.
   */
  async resumeContent(): Promise<void> {
    if (!this.nextContent) {
      this.initNextContent();
    }
    const telemetryDetails = {
      pageId: PageId.COURSE_DETAIL,
      corRelationList: this.corRelationList
    };

    const assessmentStatus = this.localCourseService.fetchAssessmentStatus(this.contentStatusData, this.nextContent);

    const skipPlay =  await this.commonUtilService.handleAssessmentStatus(assessmentStatus);
    if (skipPlay) {
      return;
    }
    
    this.contentPlayerHandler.playContent(this.nextContent, this.generateContentNavExtras(this.nextContent, 1), telemetryDetails, true);

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
   * Redirect to child content details page
   */
  private navigateToContentDetails(content: Content, depth): void {
    this.router.navigate([RouterLinks.CONTENT_DETAILS], this.generateContentNavExtras(content, depth));
  }

  private generateContentNavExtras(content: Content, depth) {
    const params: NavigationExtras = {
      state: {
        content,
        depth, // Needed to handle some UI elements.
        contentState: {
          batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
          courseId: this.identifier
        },
        // isResumedCourse: true,
        isChildContent: true,
        // resumedCourseCardData: this.courseCardData,
        corRelation: this.corRelationList,
        isCourse: true,
        course: this.updatedCourseCardData
      }
    };
    return params;
  }

  /**
   * Ionic life cycle hook
   */
  async ionViewWillEnter() {
    this.checkUserLoggedIn();
    await this.appGlobalService.getActiveProfileUid()
      .then((uid) => {
        this.userId = uid;
      });
    this.checkCurrentUserType();
    this.todayDate = window.dayjs().format('YYYY-MM-DD');
    this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
    this.downloadSize = 0;
    this.objRollup = ContentUtil.generateRollUp(this.courseCardData.hierarchyInfo, this.identifier);
    this.headerService.showHeaderWithBackButton();

    if (!this.isGuestUser) {
      await this.updateEnrolledCourseData();
    }

    // check if the course is already enrolled
    this.isCourseEnrolled(this.identifier);
    if (this.batchId) {
      this.courseCardData.batchId = this.batchId;
    }

    if (this.courseCardData.progress && this.courseCardData.progress > 0) {
      this.showResumeBtn = true;
    } else {
      this.showResumeBtn = false;
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

    // If courseCardData does not have a batch id then it is not a enrolled course
    this.subscribeSdkEvent();
    this.populateCorRelationData(this.courseCardData.batchId);
    this.handleBackButton();
    if (this.isAlreadyEnrolled) {
      await this.checkDataSharingStatus();
    }
    this.fetchForumIds();
  }

  ionViewDidEnter() {
    this.sbProgressLoader.hide({ id: 'login' });
    this.sbProgressLoader.hide({ id: this.identifier });
  }

  editDataSettings() {
    this.showShareData = !this.showShareData;
  }

  expandDataSettings() {
    this.showShareData = false;
    this.isDataShare = !this.isDataShare;
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, async () => {
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

      if (await this.onboardingSkippedBackAction()) {
        return;
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
          if (!this.isGuestUser && this.courseCardData.batch && course.batchId
            === this.courseCardData.batch.identifier) {
            this.isAlreadyEnrolled = true;
            this.subscribeTrackDownloads();
            this.courseCardData = course;
          } else if (!this.courseCardData.batch) {
            this.courseCardData = course;
          }
        }
      }
    }
  }

  isCourseModifiedAfterEnrolment() {
    return (this.courseCardData && this.courseCardData.enrolledDate
      && this.course && this.course.lastUpdatedOn
      && (new Date(this.courseCardData.enrolledDate).getTime() < new Date(this.course.lastUpdatedOn).getTime()));
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
            this.isDownloadComplete = true;
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
            // this.forumId = (event.payload.serverContentData && event.payload.serverContentData.forumId) || this.forumId;
            this.licenseDetails = event.payload.licenseDetails;
            if (event.payload.size) {
              this.content.contentData.size = event.payload.size;
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

    if (this.batches && this.batches.length && !this.localCourseService.isEnrollable(this.batches, this.course)) {
      return false;
    }

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

  async share() {
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
    await popover.present();
  }

  handleNavBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.course.identifier);
    }
  }

  goBack() {
    this.appGlobalService.generateCourseCompleteTelemetry = false;
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
    const telemetryObject = new TelemetryObject(objectId, objectType || CsPrimaryCategory.COURSE, objectVersion);
    this.telemetryGeneratorService.generateStartTelemetry(PageId.COURSE_DETAIL,
      telemetryObject,
      this.objRollup,
      this.corRelationList
    );
  }

  generateEndEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType || CsPrimaryCategory.COURSE, objectVersion);
    this.telemetryGeneratorService.generateEndTelemetry(objectType || CsPrimaryCategory.COURSE,
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

  getContentState(returnRefresh: boolean) {
    if (this.courseCardData.batchId) {
      const request: GetContentStateRequest = {
        userId: this.appGlobalService.getUserId(),
        courseId: this.identifier,
        contentIds: this.courseHeirarchy.contentData.leafNodes,
        returnRefreshedContentStates: returnRefresh,
        batchId: this.courseCardData.batchId,
        fields: ['progress', 'score']
      };
      this.courseService.getContentState(request).toPromise()
        .then((contentStateResponse: ContentStateResponse) => {
          this.contentStatusData = contentStateResponse;

          this.initNextContent();
          if (this.contentStatusData) { //  && this.contentStatusData.contentList
            this.getLocalCourseAndUnitProgress();
            let progress = 0;
            this.contentStatusData.contentList.forEach((contentState: ContentState) => {
              if (contentState.status === 2) {
                progress = progress + 1;
              }
            });

            this.courseCardData.progress = progress;
            // this.getCourseProgress();

            if (this.courseCardData.progress && this.courseCardData.progress > 0) {
              this.showResumeBtn = true;
            } else {
              this.showResumeBtn = false;
            }
          }

          if (this.courseHeirarchy && this.courseHeirarchy.children) {
            this.getStatusOfCourseCompletion(this.courseHeirarchy.children);
          }

          if (this.resumeCourseFlag) {
            this.resumeContent();
            this.resumeCourseFlag = false;
          }
        }).catch((error: any) => {
          console.error('getContentState', error);

          this.resumeCourseFlag = false;
        });
    } else {
      // to be handled when there won't be any batchId
    }
  }

  getLocalCourseAndUnitProgress() {
    const courseLevelViewedContents = [];
    let leafNodeIds;
    this.courseHeirarchy.children.forEach(collection => {
      // Reset progress before assigning the updated progress.
      collection.progressPercentage = 0;

      const leafNodeIds = Array.from(this.getLeafNodeIdsWithoutDuplicates([collection]));
      const unitLevelViewedContents = [];
      for (const contentId of leafNodeIds) {
        if (this.contentStatusData.contentList.find((c) => c.contentId === contentId && c.status === 2)) {
          if (unitLevelViewedContents.indexOf(contentId) === -1) {
            unitLevelViewedContents.push(contentId);
          }
          if (courseLevelViewedContents.indexOf(contentId) === -1) {
            courseLevelViewedContents.push(contentId);
          }
        }
      }
      if (unitLevelViewedContents.length) {
        collection.progressPercentage = Math.round((unitLevelViewedContents.length / leafNodeIds.length) * 100);
      }
    });

    if (courseLevelViewedContents.length) {
      if (this.courseHeirarchy.contentData.leafNodes) {
        leafNodeIds = this.courseHeirarchy.contentData.leafNodes;
      }
      this.course.progress = Math.round((courseLevelViewedContents.length / leafNodeIds.length) * 100);
    } else {
      this.course.progress = 0;
    }

    if (!this.course.progress || this.course.progress !== 100) {
      this.appGlobalService.generateCourseCompleteTelemetry = true;
    }

    if (this.appGlobalService.generateCourseCompleteTelemetry && this.course.progress === 100) {
      this.appGlobalService.generateCourseCompleteTelemetry = false;
      const cdata = [
        {
          type: 'CourseId',
          id: this.identifier
        },
        {
          type: 'BatchId',
          id: this.batchDetails.id || ''
        },
        {
          type: 'UserId',
          id: this.userId
        },
      ];
      this.telemetryGeneratorService.generateAuditTelemetry(
        Environment.COURSE,
        AuditState.AUDIT_UPDATED,
        ['progress'],
        AuditType.COURSE_PROGRESS,
        this.telemetryObject.id,
        this.telemetryObject.type,
        this.telemetryObject.version,
        cdata,
        this.telemetryObject.rollup
      );
    }
  }

  async handleHeaderEvents($event) {
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

        if (await this.onboardingSkippedBackAction()) {
          return;
        }
        this.goBack();
        break;
    }
  }

  async enrollIntoBatch(item: Batch) {
    if (this.isGuestUser) {
      this.promptToLogin(item);
    } else {
      const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, item);
      this.loader = await this.commonUtilService.getLoader();
      if (this.loader) {
        await this.loader.present();
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
        courseId: this.course.identifier,
        channel: this.course.channel,
        telemetryObject: this.telemetryObject,
        objRollup: this.objRollup,
        corRelationList: this.corRelationList,
        userConsent: this.course.userConsent
      };

      this.localCourseService.enrollIntoBatch(enrollCourse, this).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            this.courseCardData.batchId = item.id;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.commonUtilService.showToast(this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_COURSE_ENROLLED', this.course));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: item.id,
              courseId: item.courseId
            });
            this.isAlreadyEnrolled = true;
            this.subscribeTrackDownloads();
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
        sbPopoverMainTitle: this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL', this.course),
        metaInfo: this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_TRAININGS_ONLY_REGISTERED_USERS', this.course),
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
    const batchDetails = this.batchDetails ? this.batchDetails.status : 2;
    const enrollmentType = this.batchDetails ? this.batchDetails.enrollmentType : '';

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

  onboardingSkippedBackAction(): Promise<boolean> {
    return new Promise(async resolve => {
      try {
        const session = await this.authService.getSession().toPromise();
        if ((this.isOnboardingSkipped && session) || this.isFromChannelDeeplink) {
          resolve(true);
          const navigationExtras: NavigationExtras = { replaceUrl: true };
          this.router.navigate([`/${RouterLinks.TABS_COURSE}`], navigationExtras);
        } else if (this.isOnboardingSkipped && !session) {
          resolve(true);
          const navigationExtras: NavigationExtras = { queryParams: { reOnboard: true }, replaceUrl: true };
          this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
        }
        resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  onTocCardClick(event) {
    // if from group flow then should not go to next page.
    if (this.isFromGroupFlow) {
      return;
    }
    // if (this.csGroupAddableBloc.state) {
    //   return;
    // }
    if (this.isGuestUser) {
      this.navigateToBatchListPage();
      return false;
    }

    if (this.course.createdBy !== this.userId) {
      if (!this.isAlreadyEnrolled && !this.isBatchNotStarted) {
        this.joinTraining();
        return false;
      } else if (this.isAlreadyEnrolled && this.isBatchNotStarted) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
          this.datePipe.transform(this.courseStartDate, 'mediumDate')));
        return false;
      }
    }

    if (this.batches && this.batches.length && !this.localCourseService.isEnrollable(this.batches, this.course)) {
      return false;
    }

    if (event.item.mimeType === MimeType.COLLECTION) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.TRAINING_MODULE_CLICKED,
        Environment.HOME,
        PageId.COURSE_DETAIL,
        this.telemetryObject,
        undefined,
        this.objRollup,
        this.corRelationList);
      const chapterParams: NavigationExtras = {
        state: {
          chapterData: event.item,
          batches: this.batches,
          isAlreadyEnrolled: this.isAlreadyEnrolled,
          courseCardData: this.courseCardData,
          batchExp: this.batchExp,
          isChapterCompleted: this.courseCompletionData[event.item.identifier],
          contentStatusData: this.contentStatusData,
          courseContent: this.content,
          corRelation: this.corRelationList,
          courseHeirarchy: this.courseHeirarchy
        }
      };

      this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CHAPTER_DETAILS}`],
        chapterParams);
    } else {
      if (!this.batchId) {
        return false;
      }
      this.navigateToContentDetails(event.item, 1);
    }
  }

  private initNextContent() {
    this.isNextContentFound = false;
    this.isFirstContent = false;
    this.nextContent = undefined;
    this.getNextContent(this.courseHeirarchy, this.contentStatusData.contentList);
  }

  private getNextContent(courseHeirarchy, contentStateList: ContentState[]) {
    const result = contentStateList.find(({ contentId }) => contentId === courseHeirarchy.identifier);
    if (!this.isFirstContent && courseHeirarchy.mimeType !== MimeType.COLLECTION) {
      this.nextContent = courseHeirarchy;
      this.isFirstContent = true;
    }
    if ((result && (result.status === 0 || result.status === 1))
      || (!result && courseHeirarchy.mimeType !== MimeType.COLLECTION)) {
      this.nextContent = courseHeirarchy;
      this.isNextContentFound = true;
      this.isFirstContent = true;
    } else if (!this.isNextContentFound && courseHeirarchy && courseHeirarchy.children) {
      courseHeirarchy.children.forEach((ele) => {
        if (!this.isNextContentFound) {
          this.getNextContent(ele, contentStateList);
        }
      });
    }
    return this.nextContent;
  }

  async saveChanges() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    if (this.dataSharingStatus === ConsentStatus.ACTIVE) {
      const request: Consent = {
        status: ConsentStatus.REVOKED,
        userId: this.courseCardData.userId,
        consumerId: this.courseCardData.content ? this.courseCardData.content.channel : this.course.channel,
        objectId: this.courseCardData.courseId,
        objectType: 'Collection',
      };
      this.profileService.updateConsent(request).toPromise()
        .then(async (data) => {
          await loader.dismiss();
          this.commonUtilService.showToast('FRMELEMNTS_MSG_DATA_SETTINGS_SUBMITED_SUCCESSFULLY');
          this.showShareData = false;
          this.checkDataSharingStatus();
        })
        .catch(async (e) => {
          await loader.dismiss();
          if (e.code === 'NETWORK_ERROR') {
            this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
          }
        });
    } else if (this.dataSharingStatus === ConsentStatus.REVOKED) {
      await loader.dismiss();
      await this.consentService.showConsentPopup(this.courseCardData);
      this.showShareData = false;
      this.checkDataSharingStatus();
    }
  }

  async checkDataSharingStatus() {
    const request: Consent = {
      userId: this.courseCardData.userId,
      consumerId: this.courseCardData.content ? this.courseCardData.content.channel : this.course.channel,
      objectId: this.courseCardData.courseId
    };
    await this.profileService.getConsent(request).toPromise()
      .then((data) => {
        if (data) {
          this.dataSharingStatus = data.consents[0].status;
          this.lastUpdateOn = data.consents[0].lastUpdatedOn;
        }
      })
      .catch(async (e) => {
        if (this.isAlreadyEnrolled && e.response && e.response.body && e.response.body.params.err === 'USER_CONSENT_NOT_FOUND'
          && this.course.userConsent === UserConsent.YES) {
          if (!this.isConsentPopUp) {
            this.isConsentPopUp = true;
            await this.consentService.showConsentPopup(this.courseCardData);
            await this.checkDataSharingStatus();
          }
        } else if (e.code === 'NETWORK_ERROR') {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        }
      });
  }

  onConsentPopoverShow() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = undefined;
    }
  }

  onConsentPopoverDismiss() {
    this.checkDataSharingStatus();
  }

  openDiscussionForum(forumId: string) {
    if(this.commonUtilService.networkInfo.isNetworkAvailable){
      // this.courseService.displayDiscussionForum({
      //   forumId
      // }).subscribe();
      // this.router.navigate([`/${RouterLinks.DISCUSSION}`]);
      this.checkUserRegistration();
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
    
  }

  private async showProfileNameConfirmationPopup() {
    const popUp = await this.popoverCtrl.create({
      component: ProfileNameConfirmationPopoverComponent,
      componentProps: {
      },
      cssClass: 'sb-popover sb-profile-name-confirmation-popover',
    });
    await popUp.present();
    const { data } = await popUp.onDidDismiss();
    if (data !== undefined) {
      if (data.buttonClicked) {
        this.startContent();
      }
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CLOSE_CLICKED,
        PageId.PROFILE_NAME_CONFIRMATION_POPUP,
        Environment.HOME
      );
    }
  }

  private async checkRetiredOpenBatch(content: any, layoutName?: string) {
    if (!this.isAlreadyEnrolled || this.skipCheckRetiredOpenBatch) {
      return;
    }
    this.skipCheckRetiredOpenBatch = true;
    // this.showLoader = false;
    // this.loader = await this.commonUtilService.getLoader();
    // await this.loader.present();
    // this.loader.onDidDismiss(() => { this.loader = undefined; });
    let retiredBatches: Array<any> = [];
    let anyOpenBatch = false;
    // await this.getEnrolledCourses(false, true);
    const enrolledCourses = this.appGlobalService.getEnrolledCourseList() || [];
    try {
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
    } catch (err) {
      console.error('checkRetiredOpenBatch', err);
    }

    if (anyOpenBatch || !retiredBatches.length) {
      // open the batch directly
      // Do nothing.
      // await this.showContentDetails(content, true);
    } else if (retiredBatches.length) {
      await this.navigateToBatchListPopup(content, layoutName, retiredBatches);
    }
  }

  async navigateToBatchListPopup(content: any, layoutName?: string, retiredBatched?: any) {
    const ongoingBatches = [];
    const upcommingBatches = [];
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.IN_PROGRESS] // CourseBatchStatus.NOT_STARTED,
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!this.isGuestUser) {
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then((res: Batch[]) => {
            this.zone.run(async () => {
              this.batches = res;
              if (this.batches.length) {
                this.batches.forEach((batch, key) => {
                  if (batch.status === 1) {
                    ongoingBatches.push(batch);
                  } else {
                    upcommingBatches.push(batch);
                  }
                });
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                  'ongoing-batch-popup',
                  Environment.HOME,
                  PageId.COURSE_DETAIL, undefined,
                  reqvalues, undefined, this.corRelationList);
                const popover = await this.popoverCtrl.create({
                  component: EnrollmentDetailsComponent,
                  componentProps: {
                    upcommingBatches,
                    ongoingBatches,
                    retiredBatched,
                    content
                  },
                  cssClass: 'enrollement-popover'
                });
                // await this.loader.dismiss();
                await popover.present();
                const { data } = await popover.onDidDismiss();
                if (data && data.isEnrolled) {
                  // Reload the page
                  // this.getEnrolledCourses();
                  await this.reloadPageAfterEnrollment(data);
                  this.checkDataSharingStatus();
                }
                if (data && typeof data.isEnrolled === 'function') {
                  (data.isEnrolled as Function).call(this);
                }
              } else {
                // await this.loader.dismiss();
                // Do nothing.
                // this.showContentDetails(content, true);
              }
            });
          })
          .catch((error: any) => {
            console.log('error while fetching course batches ==>', error);
          });
      }
    } else {
      // if (this.loader) {
      //   this.loader.dismiss();
      // }
      // this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  async checkUserRegistration() {
    // this.showLoader = true;
    const data = {
      username: '',
      identifier: this.userId,
    };
    await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise().then((p) => {
      data.username = p.serverProfile['userName']
    });
    console.log('createUser req', data);
    this.discussionService.createUser(data).subscribe((response) => {
      console.log('discussionService.createUser', response)
      const userName = response.result.userName
      const result = [this.forumIds];
      console.log('hello', this.forumIds);
      // this.router.navigate(['/discussion-forum'], {
        this.router.navigate([`/${RouterLinks.DISCUSSION}`], {
        queryParams: {
          categories: JSON.stringify({ result }),
          userName: userName
        }
      });
    }, error => {
      console.log('err in discussionService.createUser', error)
      // this.showLoader = false;
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
    });
  }

  fetchForumIds() {
    const requestBody = this.prepareRequestBody();
    console.log('requestBody --', requestBody)
    if (requestBody.identifier.length) {
      this.discussionService.getForumIds(requestBody).subscribe(forumDetails => {
        console.log('forumDetails', forumDetails)
        if (forumDetails.result.length) {
          this.forumIds = forumDetails.result[0].cid;
        }
      }, error => {
        console.log('error', error);
      });
    }
  }

  private prepareRequestBody() {
    const request = {
      identifier: [],
      type: ''
    };
    const isCreator = this.courseCardData.createdBy === this.userId;
    console.log('isCreator', isCreator)
    // const isMentor = this.permissionService.checkRolesPermissions(['COURSE_MENTOR']);
    if (isCreator) {
      request.identifier = [this.identifier];
      request.type = 'course';
    } else if (this.isAlreadyEnrolled) {
      request.identifier = [this.courseCardData.batchId];
      request.type = 'batch';
    // } else if (isMentor) {
    //   // TODO: make getBatches() api call;
    //   request.identifier = [this.courseId];
    //   request.type = 'course';
    // } else {
    //   return;
    }
      return request;
    // }	  
  }
}
