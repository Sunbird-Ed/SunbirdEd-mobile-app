import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Events, Platform, PopoverController, AlertController } from '@ionic/angular';
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
  OAuthSession,
  EnrollCourseRequest
} from 'sunbird-sdk';
import { Subscription } from 'rxjs/Subscription';
import {
  Environment,
  ErrorType,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId,
  CorReleationDataType
} from '../../services/telemetry-constants';
import { ProfileConstants, ContentType, EventTopics, MimeType, PreferenceKey, ShareUrl, RouterLinks } from '../app.constant';
import { BatchConstants } from '../app.constant';
import { ContentShareHandlerService } from '../../services/content/content-share-handler.service';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { ContentActionsComponent, ContentRatingAlertComponent, ConfirmAlertComponent } from '../components';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SbPopoverComponent } from '../components/popups';
declare const cordova;

@Component({
  selector: 'app-enrolled-course-details-page',
  templateUrl: './enrolled-course-details-page.html',
  styleUrls: ['./enrolled-course-details-page.scss'],
})
export class EnrolledCourseDetailsPage implements OnInit {

  /**
   * Contains content details
   */
  course: any;

  /**
   * Contains children content data
   */
  childrenData: Array<any> = [];

  startData: any;
  shownGroup : null;

  /**
   * Show loader while importing content
   */
  showChildrenLoader: boolean;

  /**
   * Contains identifier(s) of locally not available content(s)
   */
  downloadIdentifiers = [];

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
  isDownloadCompleted = false;
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
  batchInfo;
  batchEndDate;
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
  private corRelationList: Array<CorrelationData>;
  headerObservable: any;
  content: Content;
  appName: any;
  updatedCourseCardData: Course;
  importProgressMessage: string;
  segmentType = 'info';
  isGuestUser = false;
  // isEnrolled = false;
  showDownload: boolean;
  lastReadContentName: string;
  enrollmentEndDate: string;
  loader: any;
  isQrCodeLinkToContent: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private loginHandlerService: LoginHandlerService,
    private alertCtrl: AlertController,
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
    private appVersion: AppVersion
  ) {

    this.userId = this.appGlobalService.getUserId();
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
    this.getUserId();

    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.courseCardData = extrasState.content;
      console.log('this.courseCardData', this.courseCardData);
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
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
    this.subscribeUtilityEvents();
    // const self = this;
    if (this.courseCardData.batchId) {
      this.segmentType = 'modules';
      // this.isEnrolled = true;
    } else {
      this.getAllBatches();
    }
  }

  subscribeUtilityEvents() {
    this.utilityService.getBuildConfigValue('BASE_URL')
      .then(response => {
        this.baseUrl = response;
      })
      .catch((error) => {
      });

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, (res) => {
      console.log('ENROL_COURSE_SUCCESS res', res);
      if (res && res.batchId) {
        this.batchId = res.batchId;
        if (this.identifier && res.courseId && this.identifier === res.courseId) {
          this.isAlreadyEnrolled = true;
        }
      }
    });

    this.events.subscribe(EventTopics.UNENROL_COURSE_SUCCESS, () => {
      // to show 'Enroll in Course' button courseCardData.batchId should be undefined/null
      this.updateEnrolledCourseList(this.courseCardData); // enrolled course list updated
      if (this.courseCardData) {
        delete this.courseCardData.batchId;
      }
      delete this.batchDetails;
      // delete this.batchDetails; // to show 'Enroll in Course' button courseCardData should be undefined/null
      this.isAlreadyEnrolled = false; // and isAlreadyEnrolled should be false
    });

    this.events.subscribe('courseToc:content-clicked', (data) => {
      console.log('courseToc:content-clicked');
      this.joinTraining();
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
            // this.removeUnenrolledCourse(unenrolledCourse);
          });
        }
      })
      .catch(() => {
        // this.removeUnenrolledCourse(unenrolledCourse);
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
        sbPopoverMainTitle : this.commonUtilService.translateMessage('YOU_MUST_JOIN_AN_ACTIVE_BATCH'),
        metaInfo: this.commonUtilService.translateMessage('REGISTER_TO_COMPLETE_ACCESS'),
        sbPopoverHeading : this.commonUtilService.translateMessage('JOIN_TRAINING')+'?',
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('ENROLL'),
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
    // if (this.isGuestUser) {
    //   await confirm.present();
    // } else {
    //   console.log('loggedin user');
    //   this.navigateToBatchListPage();
    // }
  }

  // handleEnrollCoursePopup(btnText: string) {
  //   console.log('handleEnrollCoursePopup', btnText);
  //   if (btnText === 'Login') {
  //     this.loginHandlerService.signIn();
  //   }
  // }

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
          undefined,
          undefined,
          undefined,
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
    const overFlowMenuData = {
      batchStatus: this.batchDetails ? this.batchDetails.status : 2,
      contentStatus: this.courseCardData.status,
      enrollmentType: this.batchDetails ? this.batchDetails.enrollmentType : '',
      courseProgress: this.course.progress
    };
    const contentData = this.course;
    contentData.batchId = this.courseCardData.batchId ? this.courseCardData.batchId : false;
    const popover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      event,
      cssClass: 'content-action',
      componentProps: {
        overFlowMenuData,
        content: contentData,
        batchDetails: this.batchDetails,
        pageName: PageId.COURSE_DETAIL
      },
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data && data.unenroll) {
      this.handleUnenrollment(data.unenroll);
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
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_UNENROLLED'));
            this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            await loader.dismiss();
          });
        }, (error) => {
          this.zone.run(async () => {
            if (error && error.error === 'CONNECTION_ERROR') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else {
              this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            }
            await loader.dismiss();
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
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    if (data.contentData) {
      this.course = data.contentData;
      this.content = data;
      this.objId = this.course.identifier;
      this.objType = this.course.contentType;
      this.objVer = this.course.pkgVersion;

      if (!this.didViewLoad) {
        this.generateImpressionEvent(this.course.identifier, this.course.contentType, this.course.pkgVersion);
        this.generateStartEvent(this.course.identifier, this.course.contentType, this.course.pkgVersion);
      }
      this.didViewLoad = true;
      if(this.course.lastReadContentId){
        this.getLastPlayedName(this.course.lastReadContentId);
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

      if (this.course.me_totalRatings) {
        const rating = this.course.me_totalRatings.split('.');
        if (rating && rating[0]) {
          this.course.me_totalRatings = rating[0];
        }
      }

      // User Rating
      const contentFeedback: any = data.contentFeedback ? data.contentFeedback : [];
      if (contentFeedback !== undefined && contentFeedback.length !== 0) {
        this.userRating = contentFeedback[0].rating;
        this.ratingComment = contentFeedback[0].comments;
      }
      this.getCourseProgress();
      await this.loader.dismiss();
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
            console.log('this.batchdetails', this.batchDetails);
            this.saveContentContext(this.appGlobalService.getUserId(),
              this.batchDetails.courseId, this.courseCardData.batchId, this.batchDetails.status);
            this.preferences.getString(PreferenceKey.COURSE_IDENTIFIER).toPromise()
              .then(async val => {
                if (val === this.batchDetails.identifier) {
                  this.batchExp = true;
                } else if (this.batchDetails.status === 2) {
                    this.batchExp = true;
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
        correlationData: this.corRelationList !== undefined ? this.corRelationList : []
      });
    });

    return requestParams;
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  importContent(identifiers, isChild: boolean, isDownloadAllClicked?) {
    this.showChildrenLoader = this.downloadIdentifiers.length === 0;
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
                identifiers.length
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


  async showDownloadConfirmationAlert(myEvent) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let contentTypeCount;
      if (this.downloadIdentifiers.length) {
        contentTypeCount = this.downloadIdentifiers.length;
      } else {
        contentTypeCount = '';
      }
      if(!this.isBatchNotStarted){
        this.isDownloadStarted = true;
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
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          'download-all-button-clicked',
          Environment.HOME,
          PageId.ENROLLED_COURSE_DETAIL,
          undefined,
          undefined,
          // todo
          // this.objRollup,
          //this.corRelationList
          );
        this.importContent(this.downloadIdentifiers, true, true);        
        this.events.publish('header:decreasezIndex');
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


  /**
   * Function to get status of child contents
   */
  async getStatusOfChildContent(childrenData) {
    const contentStatusData = this.contentStatusData;
    let lastReadContentId = this.courseCardData.lastReadContentId;
    const userId = this.appGlobalService.getUserId();
    const lastReadContentIdKey = 'lastReadContentId_' + userId + '_' + this.identifier + '_' + this.courseCardData.batchId;
    this.getLastPlayedName(lastReadContentId)
    await this.preferences.getString(lastReadContentIdKey).toPromise()
      .then(val => {
        this.courseCardData.lastReadContentId = val;
        lastReadContentId = val;
      });
    
    this.zone.run(() => {
      childrenData.forEach(childContent => {
        // Inside First level
        let contentLength = 0;
        childContent.children.every(eachContent => {
          // Inside resource level
          if (childContent.hasOwnProperty('status') && !childContent.status) {
            // checking for property status
            return false;
          } else {
            // checking for getContentState result length
            if (contentStatusData.contentList.length) {
              contentStatusData.contentList.every(contentData => {
                // checking for each content status
                if (eachContent.identifier === contentData.contentId) {
                  contentLength = contentLength + 1;
                  // checking for contentId from getContentState and lastReadContentId
                  if (contentData.contentId === lastReadContentId) {
                    childContent.lastRead = true;
                  }
                  if (contentData.status === 0 || contentData.status === 1) {
                    // manipulating the status
                    childContent.status = false;
                    return false;
                  } else {
                    // if content played completely
                    eachContent.status = true;
                    childContent.status = true;
                    return true;
                  }
                }
                return true;
              });
              return true;
            } else {
              childContent.status = false;
              return false;
            }
          }
        });

        if (childContent.children.length === contentLength) {
          return true;
        } else {
          childContent.status = false;
          return true;
        }
      });
    });
  }
  /** Extract only numbers from an array */
  getNumbersFromArray(str) {
    if (str) {
      return str.replace(/^\D+/g, '');
    }
  }
  getAllBatches() {
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: this.identifier,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS],
        enrollmentType: CourseEnrollmentType.OPEN
      },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
    .then((data: Batch[]) => {
      console.log('all batches', data);
      if (data.length > 1) {
        this.batchInfo = data.length;
      } else if (data.length === 1) {
        // unenrolled and only one batch available
        this.batchEndDate = data[0].endDate;
        this.enrollmentEndDate =  data[0].enrollmentEndDate ;
        // this.batchDetails = data[0];
      }
    })
    .catch((error: any) => {
      console.log('Error while fetching Batch Details', error);
    });
  }

  toggleGroup(group) {
    let isCollapsed = true;
    if (this.isGroupShown(group)) {
      isCollapsed = false;
      this.shownGroup = null;
    } else {
      isCollapsed = false;
      this.shownGroup = group;
    }
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
      }
      this.contentService.getContentDetails(option).toPromise()
        .then((data: Content) => {
          console.log('data is here', data);
          this. lastReadContentName = data.contentData.name;
        }).catch(() => {

        })
    }

  }

  /**
   * Function to set child contents
   */
  async setChildContents() {
    this.showChildrenLoader = true;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const option: ChildContentRequest = {
      contentId: this.identifier,
      hierarchyInfo: null,
      level: !this.courseCardData.batchId ? 1 : 0,
    };
    this.contentService.getChildContents(option).toPromise()
      .then((data: Content) => {
        this.zone.run(async () => {
          if (data && data.children) {
            this.enrolledCourseMimeType = data.mimeType;
            this.childrenData = data.children;
            this.toggleGroup(0);
            this.startData = data.children;
            this.childContentsData = data;
            this.getContentState(!this.isNavigatingWithinCourse);
          }
          if (this.courseCardData.batchId) {
            this.downloadSize = 0;
            this.getContentsSize(this.childrenData);
          }
          this.showChildrenLoader = false;
          await loader.dismiss();
        });
      }).catch(() => {
        this.zone.run(async () => {
          this.showChildrenLoader = false;
          await loader.dismiss();
        });
      });
  }

  /**
   * Redirect to child content details page
   */
  navigateToChildrenDetailsPage(content: Content, depth): void {
    let subtype = InteractSubtype.CONTENT_CLICKED;
    const contentState: ContentState = {
      batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
      courseId: this.identifier
    };
    this.zone.run(() => {
      if (content.contentType === ContentType.COURSE) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
          state: {
            content,
            depth,
            contentState,
            corRelation: this.corRelationList
          }
        });
      } else if (content.mimeType === MimeType.COLLECTION) {
        subtype = InteractSubtype.UNIT_CLICKED;
        let isChildClickable = true;
        if (this.isAlreadyEnrolled && this.isBatchNotStarted) {
          isChildClickable = false;
        }
        this.router.navigate([RouterLinks.COLLECTION_DETAILS], {
          state: {
            content,
            depth,
            contentState,
            fromCoursesPage: true,
            isAlreadyEnrolled: this.isAlreadyEnrolled,
            isChildClickable,
            corRelation: this.corRelationList
          }
        });
      } else {
        this.router.navigate([RouterLinks.CONTENT_DETAILS], {
          state: {
            content,
            depth,
            contentState,
            isChildContent: true,
            corRelation: this.corRelationList,
            isCourse: true
          }
        });
      }
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        subtype,
        Environment.HOME,
        PageId.COURSE_DETAIL,
        ContentUtil.getTelemetryObject(content),
        undefined,
        undefined,
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
    console.log('in getContentsSize', data);
    this.downloadIdentifiers = [];
    if (data) {
      data.forEach((value) => {
        if (value.contentData.size) {
          this.downloadSize += Number(value.contentData.size);
        }
        if (value.children) {
         this.getContentsSize(value.children);
        }
        if (value.isAvailableLocally === false) {
          this.downloadIdentifiers.push(value.contentData.identifier);
        }
      });
      console.log('this.downloadIdentifiers', this.downloadIdentifiers);
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
        isCourse: true
      }
    };
    this.router.navigate([RouterLinks.CONTENT_DETAILS], params);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.RESUME_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      undefined,
      undefined,
      undefined,
      this.corRelationList
    );
  }


  /**
   * Ionic life cycle hook
   */
  async ionViewWillEnter() {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.downloadSize = 0;
    this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
    if (!this.guestUser) {
      this.updatedCourseCardData = await this.courseService.getEnrolledCourses
      ({userId: this.userId, returnFreshCourses: false}).toPromise().then((data) => {
        if (data.length > 0) {
          const courseList: Array<Course> = [];
          for (const course of data) {
            courseList.push(course);
          }
          this.appGlobalService.setEnrolledCourseList(courseList);
        }
        return data.find((element) =>
        (this.courseCardData.batchId && element.batchId === this.courseCardData.batchId) ||
        (!this.courseCardData.batchId && element.courseId === this.identifier));
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
    // this.showResumeBtn = !!this.courseCardData.lastReadContentId;
    if (this.courseCardData.progress && this.courseCardData.progress > 0) {
      this.showResumeBtn = true;
    }
    this.setContentDetails(this.identifier);
    this.headerService.showHeaderWithBackButton();
    // If courseCardData does not have a batch id then it is not a enrolled course
    this.subscribeSdkEvent();
    this.populateCorRelationData(this.courseCardData.batchId);
    this.handleBackButton();
    if (this.courseCardData.batchId) {
      this.segmentType = 'modules';
      // this.isEnrolled = true;
    }
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.COURSE_DETAIL,
        Environment.HOME,
        false,
        this.identifier,
        this.corRelationList
      );
      this.didViewLoad = false;
      this.generateEndEvent(this.objId, this.objType, this.objVer);

      if (this.shouldGenerateEndTelemetry) {
        this.generateQRSessionEndEvent(this.source, this.course.identifier);
      }
      this.location.back();
    });
  }

  populateCorRelationData(batchId) {
    if (batchId && !this.corRelationList) {
      this.corRelationList = [];
      this.corRelationList.push({ id: batchId, type: CorReleationDataType.COURSE_BATCH });
    }
  }

  isCourseEnrolled(identifier: string) {
    // get all the enrolled courses
    const enrolledCourses = this.appGlobalService.getEnrolledCourseList();
    if (enrolledCourses && enrolledCourses.length > 0) {
      for (const course of enrolledCourses) {
        if (course.courseId === identifier) {
          if (this.courseCardData.batch && course.batchId === this.courseCardData.batch.identifier) {
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
    if (this.courseCardData.batchId) {
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
            console.log('download prog' , event);

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
            console.log('import complete' , event);

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
                this.isDownloadCompleted = true;
                this.downloadIdentifiers.length = 0;
                this.queuedIdentifiers.length = 0;
              }
            } else {
              this.course.isAvailableLocally = true;
              this.setContentDetails(this.identifier);
            }
          }

          if (event.type === ContentEventType.IMPORT_PROGRESS) {
            this.importProgressMessage = this.commonUtilService.translateMessage('EXTRACTING_CONTENT') + ' ' +
              Math.floor((event.payload.currentCount / event.payload.totalCount) * 100) +
              '% (' + event.payload.currentCount + ' / ' + event.payload.totalCount + ')';
              console.log('import prog' , event);
              
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
    // TODO: this.events.unsubscribe(EventTopics.UNENROL_COURSE_SUCCESS);
  }

  /**
   * checks whether batches are available or not and then Navigate user to batch list page
   */
  async navigateToBatchListPage() {
    const ongoingBatches = [];
    const upcommingBatches = [];
    const loader = await this.commonUtilService.getLoader();
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: this.identifier,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS],
        enrollmentType: CourseEnrollmentType.OPEN
      },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL, undefined,
      reqvalues);

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      await loader.present();
      this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
        .then((data: Batch[]) => {
          this.zone.run(async () => {
            this.batches = data;
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
                await loader.dismiss();
                this.router.navigate([RouterLinks.COURSE_BATCHES], {
                  state: {
                    ongoingBatches,
                    upcommingBatches,
                    course: this.course
                  }
                });
              }
            } else {
              await loader.dismiss();
              this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
            }
          });
        })
        .catch((error: any) => {
          console.log('Error while fetching Batch Details', error);
        });
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
      undefined,
      undefined,
      undefined,
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

  share() {
    this.contentShareHandler.shareContent(this.content, this.corRelationList);
  }

  handleNavBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.course.identifier);
    }
  }

  goBack() {
    if (this.isQrCodeLinkToContent === 0) {
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
        undefined,
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
      undefined,
      this.corRelationList);
  }

  generateStartEvent(objectId, objectType, objectVersion) {
    const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
    this.telemetryGeneratorService.generateStartTelemetry(PageId.COURSE_DETAIL,
      telemetryObject,
      undefined,
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
      undefined,
      this.corRelationList);
  }

  /**
   * Opens up popup for the credits.
   */
  viewCredits() {
    this.courseUtilService.showCredits(this.course, PageId.CONTENT_DETAIL, undefined, this.corRelationList);
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
            this.getStatusOfChildContent(this.childrenData);
          }
        }).catch((error: any) => {
        });
    } else {
      // to be handled when there won't be any batchId
    }
  }

  private removeUnenrolledCourse(unenrolledCourse) {
    const enrolledCourses = this.appGlobalService.getEnrolledCourseList();
    const found = enrolledCourses.find((ele) => {
      return ele.courseId === unenrolledCourse.courseId;
    });
    let indx = -1;
    if (found) {
      indx = enrolledCourses.indexOf(found);
    }
    if (indx !== -1) {
      enrolledCourses.splice(indx, 1);
    }
    this.appGlobalService.setEnrolledCourseList(enrolledCourses);
    this.events.publish(EventTopics.REFRESH_ENROLL_COURSE_LIST, {});
  }

  readLessorReadMore(param: string, objRollup, corRelationList) {
    const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      param,
      Environment.HOME,
      PageId.ENROLLED_COURSE_DETAIL,
      undefined,
      telemetryObject,
      objRollup,
      corRelationList
    );
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
          true, this.identifier, this.corRelationList);
        this.goBack();
        break;
    }
  }

  // CoursePage Revamp
  getUserId(): void {
    this.authService.getSession().subscribe((session: OAuthSession) => {
      if (!session) {
        this.zone.run(() => {
          this.isGuestUser = true;
        });
      } else {
        this.zone.run(() => {
          this.isGuestUser = false;
          this.userId = session.userToken;
          // this.getBatchesByCourseId();
        });
      }
    }, () => {
    });
  }

  async enrollIntoBatch(item: Batch) {
    if (this.isGuestUser) {
      // this.showSignInCard = true;
      this.preferences.putString('batch_detail', JSON.stringify(item)).toPromise();
      this.preferences.putString('course_data', JSON.stringify(this.course)).toPromise();
      this.promptToLogin();
    } else {
      const enrollCourseRequest: EnrollCourseRequest = {
        batchId: item.id,
        courseId: item.courseId,
        userId: this.userId,
        batchStatus: item.status
      };
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const reqvalues = new Map();
      reqvalues['enrollReq'] = enrollCourseRequest;
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ENROLL_CLICKED,
          Environment.HOME,
          PageId.COURSE_BATCHES, undefined,
          reqvalues);

      this.courseService.enrollCourse(enrollCourseRequest).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            // this.setContentDetails(this.identifier);
            this.updatedCourseCardData = await this.courseService.getEnrolledCourses({userId: this.userId, returnFreshCourses: true })
            .toPromise().then((cData) => {
              return cData.find((element) => element.courseId === this.identifier);
            });
            this.courseCardData.batchId = item.id;
            this.getBatchDetails();
            this.segmentType = 'modules';
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: item.id,
              courseId: item.courseId
            });
            await loader.dismiss();
          });
        }, (error) => {
          this.zone.run(async () => {
            await loader.dismiss();
            if (error && error.code === 'NETWORK_ERROR') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else if (error && error.response
              && error.response.body && error.response.body.params && error.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
            }
          });
        });
    }
  }

  async promptToLogin() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle : 'You must login to join an active batch and access training details',
        metaInfo: 'Trainings are only for registered users',
        sbPopoverHeading : 'Login',
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: 'Login',
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.loginHandlerService.signIn();
    }
  }

}
