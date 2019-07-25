import { Component, Inject, NgZone, ViewChild, OnInit } from '@angular/core';
import { AlertController, Events, NavController, NavParams, Platform, PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import {
  AppGlobalService,
  CommonUtilService,
  CourseUtilService,
  TelemetryGeneratorService,
  UtilityService,
  AppHeaderService
} from '@app/services';
import { DatePipe } from '@angular/common';
import {
  Batch,
  ChildContentRequest,
  Content,
  ContentDetailRequest,
  ContentEventType,
  ContentExportRequest,
  ContentExportResponse,
  ContentImport,
  ContentImportCompleted,
  ContentImportRequest,
  ContentImportResponse,
  ContentImportStatus,
  ContentService,
  ContentState,
  ContentStateResponse,
  ContentUpdate,
  CorrelationData,
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
  CorReleationDataType
} from '../../services/telemetry-constants';
import { ProfileConstants, ContentType, EventTopics, MimeType, PreferenceKey, ShareUrl, RouterLinks } from '../app.constant';
import { BatchConstants } from '../app.constant';
import { ContentShareHandlerService } from '../../services/content/content-share-handler.service';
import { SbGenericPopoverComponent } from '../components/popups/sb-generic-popover/sb-generic-popover.component';
import { ContentActionsComponent, ContentRatingAlertComponent } from '../components';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
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
  isContentPlayed: boolean;
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
  batchExp: Boolean = false;
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
  objVer;
  didViewLoad: boolean;
  backButtonFunc = undefined;
  shouldGenerateEndTelemetry = false;
  source = '';
  firstChild;
  /** Whole child content is stored and it is used to find first child */
  childContentsData;
  isBatchNotStarted = false;
  // @ViewChild(Navbar) navBar: any;
  private eventSubscription: Subscription;
  private corRelationList: Array<CorrelationData>;
  headerObservable: any;
  content: Content;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private alertCtrl: AlertController,
    private zone: NgZone,
    private events: Events,
    private popoverCtrl: PopoverController,
    private social: SocialSharing,
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
    private router: Router
  ) {

    this.appGlobalService.getUserId();
    this.checkLoggedInOrGuestUser();
    this.checkCurrentUserType();
    this.courseCardData = this.router.getCurrentNavigation().extras.state.content;
    this.identifier = this.courseCardData.contentId || this.courseCardData.identifier;
    this.corRelationList = this.router.getCurrentNavigation().extras.state.corRelation;
    this.source = this.router.getCurrentNavigation().extras.state.source;
  }

  /**
   * Angular life cycle hooks
   */
  ngOnInit() {
    this.subscribeUtilityEvents();
  }

  subscribeUtilityEvents() {
    this.utilityService.getBuildConfigValue('BASE_URL')
      .then(response => {
        this.baseUrl = response;
      })
      .catch((error) => {
      });

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, (res) => {
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

  /**
   * Function to rate content
   */
  async rateContent(event) {
    if (!this.guestUser) {
      if (this.course.isAvailableLocally) {
        const popUp = await this.popoverCtrl.create({
          component: ContentRatingAlertComponent,
          componentProps: {
            content: this.course,
            rating: this.userRating,
            comment: this.ratingComment,
            pageId: PageId.COURSE_DETAIL
          },
          cssClass: 'content-rating-alert'
        });
        await popUp.present();
        const response = await popUp.onDidDismiss();
        if (response.data && response.data.message === 'rating.success') {
          this.userRating = response.data.rating;
          this.ratingComment = response.data.comment;
        }



        const paramsMap = new Map();
        if (this.isContentPlayed || this.course.contentAccess.length) {
          const popover = await this.popoverCtrl.create({
            component: ContentRatingAlertComponent,
            componentProps: {
              content: this.content,
              pageId: PageId.CONTENT_DETAIL,
              rating: this.userRating,
              comment: this.ratingComment,
              // popupType: popupType,
            },
            cssClass: 'sb-popover info',
          });
          await popover.present();
          const response = await popover.onDidDismiss();
          if (response.data.data && response.data.data.message === 'rating.success') {
            this.userRating = response.data.data.rating;
            this.ratingComment = response.data.data.comment;
          }
        } else {
          paramsMap['IsPlayed'] = 'N';
          this.commonUtilService.showToast('TRY_BEFORE_RATING');
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.RATING_CLICKED,
          Environment.HOME,
          PageId.CONTENT_DETAIL,
          undefined,
          // paramsMap,
          undefined,
          // this.objRollup,
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
      componentProps: {
        overFlowMenuData,
        content: contentData,
        batchDetails: this.batchDetails,
        pageName: PageId.COURSE_DETAIL
      },
      // cssClass: 'content-action'
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data && data.data === 'unenroll') {
      this.handleUnenrollment(data.data);
    }
  }

  /*
   * check for user confirmation
   * if confirmed then unenrolls the user from the course
   */
  handleUnenrollment(unenroll): void {
    if (unenroll) {
      const loader = this.commonUtilService.getLoader();
      loader.present();
      const unenrolCourseRequest: UnenrollCourseRequest = {
        userId: this.appGlobalService.getUserId(),
        courseId: this.batchDetails.courseId,
        batchId: this.batchDetails.id
      };
      this.courseService.unenrollCourse(unenrolCourseRequest)
        .subscribe(() => {
          this.zone.run(() => {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_UNENROLLED'));
            this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            loader.dismiss();
          });
        }, (error) => {
          this.zone.run(() => {
            if (error && error.error === 'CONNECTION_ERROR') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else {
              this.events.publish(EventTopics.UNENROL_COURSE_SUCCESS, {});
            }
            loader.dismiss();
          });
        });
    }
  }

  /**
   * Set course details by passing course identifier
   * @param {string} identifier
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
        // this.navCtrl.pop();
        this.location.back();
      });
  }

  /**
   * Function to extract api response. Check content is locally available or not.
   * If locally available then make childContents api call else make import content api call
   * @param data
   */
  extractApiResponse(data: Content): void {
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

      if (this.course && this.course.isAvailableLocally) {
        this.headerService.showHeaderWithBackButton(['share', 'more']);
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
    } else {
      this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      this.location.back();

    }

    if (data.isAvailableLocally) {
      this.getBatchDetails();
    }
    this.course.isAvailableLocally = data.isAvailableLocally;

    if (this.courseCardData.batchId) {
      // if (this.course.isAvailableLocally === true) {
      // this.getBatchDetails();
    }

    if (Boolean(data.isAvailableLocally)) {
      this.setChildContents();
    } else {
      this.showLoading = true;
      this.headerService.hideHeader();
      this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.course, true);
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
            this.saveContentContext(this.appGlobalService.getUserId(),
              this.batchDetails.courseId, this.courseCardData.batchId, this.batchDetails.status);
            this.preferences.getString(PreferenceKey.COURSE_IDENTIFIER).toPromise()
              .then(async val => {
                if (val === this.batchDetails.identifier) {
                  this.batchExp = true;
                } else {
                  if (this.batchDetails.status === 2) {
                    this.batchExp = true;
                    const confirm = await this.popoverCtrl.create({
                      component: SbGenericPopoverComponent,
                      componentProps: {
                        sbPopoverHeading: this.commonUtilService.translateMessage('BATCH_EXPIRED'),
                        sbPopoverMainTitle: this.commonUtilService.translateMessage('BATCH_EXPIRED_DESCRIPTION'),
                        actionsButtons: [
                          {
                            btntext: this.commonUtilService.translateMessage('BATCH_EXPIRED_BUTTON'),
                            btnClass: 'popover-color'
                          }
                        ],
                        icon: null
                      },
                      cssClass: 'sb-popover info',
                    });
                    await confirm.present();
                    const response = await confirm.onDidDismiss();
                    if (response.data.leftBtnClicked == null) {
                      return;
                    }
                    if (response.data.leftBtnClicked) {
                      this.preferences.putString(PreferenceKey.COURSE_IDENTIFIER, this.batchDetails.identifier).toPromise().then();
                    }
                  } else if (this.batchDetails.status === 0) {
                    this.isBatchNotStarted = true;
                    this.courseStartDate = this.batchDetails.startDate;
                  } else {
                    this.batchExp = false;
                  }
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
      if (!_.isObject(this.course.contentTypesCount)) {
        this.course.contentTypesCount = JSON.parse(this.course.contentTypesCount);
      } else {
        this.course.contentTypesCount = this.course.contentTypesCount;
      }
    } else if (this.courseCardData.contentTypesCount && !_.isObject(this.courseCardData.contentTypesCount)) {
      this.course.contentTypesCount = JSON.parse(this.courseCardData.contentTypesCount);
    }
  }

  /**
   * Function to get import content api request params
   *
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  getImportContentRequestBody(identifiers, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    _.forEach(identifiers, (value) => {
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
   * @param {Array<string>} identifiers contains list of content identifier(s)
   * @param {boolean} isChild
   */
  importContent(identifiers, isChild: boolean, isDownloadAllClicked?) {
    this.showChildrenLoader = this.downloadIdentifiers.length === 0;
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: [],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };

    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (data && data[0].status === ContentImportStatus.NOT_FOUND) {
            this.showLoading = false;
            this.headerService.showHeaderWithBackButton(['share', 'more']);
          }
          if (data && data.length && this.isDownloadStarted) {
            _.forEach(data, (value) => {
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

  downloadAllContent() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!this.isBatchNotStarted) {
        this.isDownloadStarted = true;
        this.downloadProgress = 0;
        this.importContent(this.downloadIdentifiers, true, true);
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
          this.datePipe.transform(this.courseStartDate, 'mediumDate')));
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

  /**
   * Function to set child contents
   */
  setChildContents(): void {
    this.showChildrenLoader = true;
    const option: ChildContentRequest = {
      contentId: this.identifier,
      hierarchyInfo: null,
      level: !this.courseCardData.batchId ? 1 : 0,
    };
    this.contentService.getChildContents(option).toPromise()
      .then((data: Content) => {
        this.zone.run(() => {
          if (data && data.children) {
            this.enrolledCourseMimeType = data.mimeType;
            this.childrenData = data.children;
            this.startData = data.children;
            this.childContentsData = data;
            this.getContentState(!this.isNavigatingWithinCourse);
          }
          if (this.courseCardData.batchId) {
            this.downloadSize = 0;
            this.getContentsSize(this.childrenData);
          }
          this.showChildrenLoader = false;
        });
      }).catch(() => {
        this.zone.run(() => {
          this.showChildrenLoader = false;
        });
      });
  }

  /**
   * Redirect to child content details page
   * @param content
   * @param depth
   */
  navigateToChildrenDetailsPage(content: Content, depth): void {
    const contentState: ContentState = {
      batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
      courseId: this.identifier
    };
    this.zone.run(() => {
      if (content.contentType === ContentType.COURSE) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
          state: {
            content: content,
            depth: depth,
            contentState: contentState
          }
        });
      } else if (content.mimeType === MimeType.COLLECTION) {
        let isChildClickable = true;
        if (this.isAlreadyEnrolled && this.isBatchNotStarted) {
          isChildClickable = false;
        }
        this.router.navigate([RouterLinks.COLLECTION_DETAILS], {
          state: {
            content: content,
            depth: depth,
            contentState: contentState,
            fromCoursesPage: true,
            isAlreadyEnrolled: this.isAlreadyEnrolled,
            isChildClickable: isChildClickable
          }
        });
      } else {
        this.router.navigate([RouterLinks.CONTENT_DETAILS], {
          state: {
            content: content,
            depth: depth,
            contentState: contentState,
            isChildContent: true
          }
        });
      }
    });
  }

  cancelDownload() {
    this.telemetryGeneratorService.generateCancelDownloadTelemetry(this.course);
    this.contentService.cancelDownload(this.identifier).toPromise()
      .then(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.headerService.showHeaderWithBackButton(['share', 'more']);
          // this.navCtrl.pop();
          this.location.back();

        });
      }).catch(() => {
        this.zone.run(() => {
          this.showLoading = false;
          this.headerService.showHeaderWithBackButton(['share', 'more']);
          // this.navCtrl.pop();
          this.location.back();
        });
      });
  }

  getContentsSize(data) {
    _.forEach(data, (value) => {
      if (value.contentData.size) {
        this.downloadSize += Number(value.contentData.size);
      }
      this.getContentsSize(value.children);
      if (value.isAvailableLocally === false) {
        this.downloadIdentifiers.push(value.contentData.identifier);
      }
    });
  }

  /**
   * Function gets executed when user click on resume course button.
   * @param {string} identifier
   */
  resumeContent(identifier): void {
    const params: NavigationExtras = {
      state: {
        content: { identifier: identifier },
        depth: '1', // Needed to handle some UI elements.
        contentState: {
          batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
          courseId: this.identifier
        },
        isResumedCourse: true,
        isChildContent: true,
        resumedCourseCardData: this.courseCardData
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
  ionViewWillEnter(): void {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.downloadSize = 0;
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
    this.headerService.showHeaderWithBackButton(['share', 'more']);
    // If courseCardData does not have a batch id then it is not a enrolled course
    this.subscribeSdkEvent();
    this.populateCorRelationData(this.courseCardData.batchId);
    this.handleBackButton();
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
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
    console.log('Correlation list', this.corRelationList);
  }

  isCourseEnrolled(identifier: string) {
    // get all the enrolled courses
    const enrolledCourses = this.appGlobalService.getEnrolledCourseList();
    if (enrolledCourses && enrolledCourses.length > 0) {
      for (const course of enrolledCourses) {
        if (course.courseId === identifier) {
          if (this.courseCardData.batch && course.batchId === this.courseCardData.batchId) {
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
      this.course.progress = this.courseUtilService.getCourseProgress(this.courseCardData.leafNodesCount, this.courseCardData.progress);
      this.course.progress = parseInt(this.course.progress, 10);
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
                this.headerService.showHeaderWithBackButton(['share', 'more']);
              }
            }
          }

          // Get child content
          if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
            this.showLoading = false;
            this.headerService.showHeaderWithBackButton(['share', 'more']);
            const contentImportCompleted = event as ContentImportCompleted;
            if (this.queuedIdentifiers.length && this.isDownloadStarted) {
              if (_.includes(this.queuedIdentifiers, contentImportCompleted.payload.contentId)) {
                this.currentCount++;
              }

              if (this.queuedIdentifiers.length === this.currentCount) {
                this.isDownloadStarted = false;
                this.currentCount = 0;
                this.isDownloadCompleted = true;
                this.downloadIdentifiers.length = 0;
                this.queuedIdentifiers.length = 0;
              }
            } else {
              this.course.isAvailableLocally = true;
              this.setChildContents();
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
              this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.course, false);
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
      if (!this.guestUser) {
        await loader.present();
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then((data: Batch[]) => {
            this.zone.run(async () => {
              this.batches = data;
              if (this.batches.length) {
                _.forEach(this.batches, (batch, key) => {
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
                    upcommingBatches
                  }
                });
              } else {
                await loader.dismiss();
                this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
              }
            });
          })
          .catch((error: any) => {
          });
      } else {
        this.router.navigate([RouterLinks.COURSE_BATCHES]);
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
      for (let i = 0; i < data.children.length; i++) {
        return this.loadFirstChildren(data.children[i]);
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
    this.contentShareHandler.shareContent(this.course, this.corRelationList);
  }

  handleNavBackButton() {
    this.didViewLoad = false;
    this.generateEndEvent(this.objId, this.objType, this.objVer);
    if (this.shouldGenerateEndTelemetry) {
      this.generateQRSessionEndEvent(this.source, this.course.identifier);
    }
    this.location.back();
    this.backButtonFunc.unsubscribe();
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
      case 'share': this.share();
        break;
      case 'more': this.showOverflowMenu($event.event);
        break;
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COURSE_DETAIL, Environment.HOME,
        true, this.identifier, this.corRelationList);
        // this.handleNavBackButton();
        break;
    }
  }
}
