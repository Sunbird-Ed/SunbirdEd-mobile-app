import { share } from 'rxjs/operators';
import { SbSharePopupComponent } from '@app/app/components/popups/sb-share-popup/sb-share-popup.component';
import { Component, OnInit, Inject, NgZone, OnDestroy } from '@angular/core';
import {
  AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService, LocalCourseService,
  TelemetryGeneratorService
} from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import { TocCardType } from '@project-sunbird/common-consumption';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import {PopoverController, Events, Platform} from '@ionic/angular';
import { RouterLinks, PreferenceKey, EventTopics, MimeType, ShareItemType, BatchConstants } from '@app/app/app.constant';
import {
  SharedPreferences, AuthService, Batch, TelemetryObject, ContentState, Content, Course,
  CourseService, GetContentStateRequest, ContentStateResponse, CourseBatchStatus,
  CourseEnrollmentType, SortOrder, DownloadService, DownloadTracking, DownloadProgress,
  EventsBusEvent, DownloadEventType, EventsBusService, ContentImportRequest, ContentService,
  ContentImportResponse, ContentImportStatus, ContentEventType, ContentImportCompleted,
  ContentUpdate, ContentImport, Rollup, AuditState
} from 'sunbird-sdk';
import { EnrollCourse } from '@app/app/enrolled-course-details-page/course.interface';
import {DatePipe, Location} from '@angular/common';
import { ContentActionsComponent } from './../../components/content-actions/content-actions.component';
import { PageId, Environment, InteractType, InteractSubtype, ImpressionType, AuditType } from './../../../services/telemetry-constants';
import { Observable, Subscription } from 'rxjs';
import { ConfirmAlertComponent } from '@app/app/components';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { ContentUtil } from '@app/util/content-util';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ConsentPopoverActionsDelegate } from '@app/services/local-course.service';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.page.html',
  styleUrls: ['./chapter-details.page.scss', '../../enrolled-course-details-page/enrolled-course-details-page.scss'],
})
export class ChapterDetailsPage implements OnInit, OnDestroy, ConsentPopoverActionsDelegate {

  chapter: any;
  cardType: TocCardType = TocCardType.COURSE;
  isAlreadyEnrolled = false;
  batches = [];
  courseContentData: any;
  courseContent: any;
  batchExp = false;
  guestUser = true;
  isChapterCompleted = false;
  isChapterStarted = false;
  isBatchNotStarted = false;
  isFromDeeplink = false;
  userId;
  telemetryObject: TelemetryObject;
  updatedCourseCardData: Course;
  contentStatusData: ContentStateResponse;
  batchDetails: Batch;
  childContents = [];
  viewedContents = [];
  chapterProgress = 0;
  courseStartDate;
  // Contains identifier(s) of locally not available content(s)
  downloadIdentifiers = new Set();
  // Contains total size of locally not available content(s)
  downloadSize = 0;
  // Contains child content import / download progress
  downloadProgress = 0;
  public rollUpMap: { [key: string]: Rollup } = {};
  identifier: string;
  isDownloadStarted = false;
  showCollapsedPopup = true;
  showDownload: boolean;
  private eventSubscription: Subscription;
  queuedIdentifiers = [];
  faultyIdentifiers = [];
  currentCount = 0;
  subContentIds: Array<string> = [];

  trackDownloads$: Observable<DownloadTracking>;
  public todayDate: any;

  private extrasData: any;

  isNextContentFound = false;
  isFirstContent = false;
  nextContent: Content;
  headerObservable: Subscription;
  backButtonFunc: Subscription;
  public objRollup: Rollup;
  private corRelationList: any;
  loader?: HTMLIonLoadingElement;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private appGlobalService: AppGlobalService,
    private popoverCtrl: PopoverController,
    private localCourseService: LocalCourseService,
    private events: Events,
    private zone: NgZone,
    private datePipe: DatePipe,
    private fileSizePipe: FileSizePipe,
    private sbProgressLoader: SbProgressLoader,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform,
    private contentPlayerHandler: ContentPlayerHandler
    ) {
    // if ((!this.router.getCurrentNavigation() || !this.router.getCurrentNavigation().extras) && this.appGlobalService.preSignInData) {
    //   this.extrasData = this.appGlobalService.preSignInData;
    //   console.log('after login', this.extrasData);
    // } else {
    this.extrasData = this.router.getCurrentNavigation().extras.state;
    // console.log('else', this.extrasData);
    // }
    this.appGlobalService.preSignInData = null;
    this.courseContent = this.extrasData.courseContent;
    this.chapter = this.extrasData.chapterData;
    this.batches = this.extrasData.batches;
    this.isAlreadyEnrolled = this.extrasData.isAlreadyEnrolled;
    // this.courseCardData = this.extrasData.courseCardData;
    this.batchExp = this.extrasData.batchExp;
    this.isChapterCompleted = this.extrasData.isChapterCompleted;
    this.contentStatusData = this.extrasData.contentStatusData;
    this.isFromDeeplink = this.extrasData.isFromDeeplink;
    this.courseContentData = this.courseContent;
    this.identifier = this.chapter.identifier;
    this.telemetryObject = ContentUtil.getTelemetryObject(this.chapter);
  }

  ngOnInit() {
    this.subContentIds = [];
    this.getSubContentIds(this.chapter);
    if (this.chapter.hierarchyInfo) {
      this.objRollup = ContentUtil.generateRollUp(this.chapter.hierarchyInfo, this.identifier);
    }
    this.generateImpressionEvent(this.chapter.identifier, this.chapter.contentType, this.chapter.contentData.pkgVersion);
    this.trackDownloads$ = this.downloadService.trackDownloads(
      { groupBy: { fieldPath: 'rollUp.l1', value: this.courseContentData.identifier } }).pipe(share());
  }

  async ionViewWillEnter() {
    this.downloadIdentifiers = new Set();
    this.headerService.showHeaderWithBackButton();
    this.todayDate = window.dayjs().format('YYYY-MM-DD');
    this.subscribeUtilityEvents();
    this.subscribeSdkEvent();
    await this.checkLoggedInOrGuestUser();
    this.childContents = [];
    if (this.isFromDeeplink) {
      this.getAllBatches();
    }
    this.getAllContents(this.chapter);
    this.checkChapterCompletion();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(event => {
      this.handleHeaderEvents(event);
    });
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CHAPTER_DETAILS, Environment.HOME, false);
      this.appGlobalService.generateCourseUnitCompleteTelemetry = false;
      this.location.back();
    });
    this.getContentState(true);

    if (!this.guestUser) {
      this.updatedCourseCardData = await this.courseService.getEnrolledCourses({ userId: this.userId, returnFreshCourses: false })
        .toPromise()
        .then((data) => {
          if (data.length > 0) {
            console.log('getEnrolledCourses', data);
            const courseList: Array<Course> = [];
            for (const course of data) {
              courseList.push(course);
            }
            this.appGlobalService.setEnrolledCourseList(courseList);
          }
          return data.find((element) =>
            (this.courseContent.batchId && element.batchId === this.courseContent.batchId)
            || (!this.courseContent.batchId && element.courseId === this.courseContent.identifier));
        })
        .catch(e => {
          console.log(e);
          return null;
        });
      if (this.updatedCourseCardData && !this.courseContent.batch) {
        this.courseContent = this.updatedCourseCardData;
        this.isAlreadyEnrolled = true;
      }
      if (this.isFromDeeplink) {
        this.getContentState(true);
        this.getBatchDetails();
      }
      console.log('this.courseCardData', this.courseContent);
      this.getContentsSize(this.chapter.children);
    }
  }
  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CHAPTER_DETAILS, Environment.HOME, true);
      this.location.back();
      this.appGlobalService.generateCourseUnitCompleteTelemetry = false;
    }
  }

  ionViewWillLeave(): void {
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

  ionViewDidEnter(): void {
    this.sbProgressLoader.hide({id: 'login'});
    this.sbProgressLoader.hide({ id: this.courseContent.identifier });
  }

  ngOnDestroy() {
    this.events.unsubscribe(EventTopics.ENROL_COURSE_SUCCESS);
    // this.events.unsubscribe('courseToc:content-clicked');
    // this.events.unsubscribe(EventTopics.UNENROL_COURSE_SUCCESS);
    // this.events.unsubscribe('header:setzIndexToNormal');
    // this.events.unsubscribe('header:decreasezIndex');
  }

  async getAllBatches() {
    // const loader = await this.commonUtilService.getLoader();
    const courseBatchesRequest = {
      filters: {
        courseId: this.courseContentData.identifier,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS],
        enrollmentType: CourseEnrollmentType.OPEN
      },
      sort_by: { createdDate: SortOrder.DESC },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    // await loader.present();
    this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
      .then(async (data: Batch[]) => {
        // await loader.dismiss();
        this.batches = data || [];
      })
      .catch(async (error: any) => {
        console.log('Error while fetching all Batches', error);
      });
  }

  async checkLoggedInOrGuestUser() {
    const session = await this.authService.getSession().toPromise();
    this.guestUser = !session;
    if (session) {
      this.userId = session.userToken;
    }
  }

  async getContentState(returnRefresh: boolean) {
    // const loader = await this.commonUtilService.getLoader();
    if (this.courseContent.batchId) {
      // await loader.present();
      const request: GetContentStateRequest = {
        userId: this.appGlobalService.getUserId(),
        courseId: this.courseContentData.identifier,
        contentIds: this.courseContent && this.courseContent.contentData ?
            this.courseContent.contentData.leafNodes : this.courseContentData.contentData.leafNodes,
        returnRefreshedContentStates: returnRefresh,
        batchId: this.courseContent.batchId
      };
      this.courseService.getContentState(request).toPromise()
        .then(async (res: ContentStateResponse) => {
          this.zone.run(() => {
            this.contentStatusData = res;
            console.log('this.contentStatusData', this.contentStatusData);
            this.checkChapterCompletion();
          });
          // await loader.dismiss();
        }).catch(async (err) => {
          // await loader.dismiss();
        });
    }
  }

  async getBatchDetails() {
    if (this.courseContent && this.courseContent.batchId) {
      this.courseService.getBatchDetails({ batchId: this.courseContent.batchId }).toPromise()
        .then((data: Batch) => {
          this.zone.run(() => {
            if (!data) {
              return;
            }
            this.batchDetails = data;
            if (this.batchDetails.status === 2) {
              this.batchExp = true;
            } else if (this.batchDetails.status === 0) {
              this.isBatchNotStarted = true;
              this.courseStartDate = this.batchDetails.startDate;
            }
            this.saveContentContext(this.appGlobalService.getUserId(),
            this.batchDetails.courseId, this.courseContent.batchId, this.batchDetails.status);
          });
        }).catch((err) => {
          this.saveContentContext(this.appGlobalService.getUserId(),
            this.courseContent.courseId, this.courseContent.batchId, this.courseContent.batch.status);
        });
    }
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

  getAllContents(collection) {
    if (collection.children) {
      collection.children.forEach(element => {
        this.getAllContents(element);
      });
    } else {
      if (collection.mimeType !== MimeType.COLLECTION) {
        this.childContents.push(collection);
      }
    }
  }

  checkChapterCompletion() {
    if (this.contentStatusData && this.contentStatusData.contentList.length) {
      this.viewedContents = [];
      for (const content of this.childContents) {
        if (this.contentStatusData.contentList.find((c) => c.contentId === content.identifier && c.status === 2)) {
          this.viewedContents.push(content);
        }
      }
      if (this.viewedContents.length && this.viewedContents.length === this.childContents.length) {
        this.isChapterCompleted = true;
      } else if (this.viewedContents.length) {
        this.isChapterStarted = true;
      } else {
        this.isChapterStarted = false;
      }
      if (this.viewedContents.length) {
        this.chapterProgress = Math.round((this.viewedContents.length / this.childContents.length) * 100);
        console.log('chapterProgress', this.chapterProgress);
      }
      if  (!this.chapterProgress || this.chapterProgress !== 100) {
        this.appGlobalService.generateCourseUnitCompleteTelemetry = true;
      }
      if (this.appGlobalService.generateCourseUnitCompleteTelemetry && this.chapterProgress === 100) {
        this.appGlobalService.generateCourseUnitCompleteTelemetry = false;
        const cdata = [
          {
              type: 'CourseId',
              id: this.courseContentData.identifier || ''
          },
          {
              type: 'BatchId',
              id: this.courseContent.batchId || ''
          },
          {
              type: 'UserId',
              id: this.userId || ''
          },
          {
            type: 'UnitId',
            id: this.identifier || ''
        },
        ];
        this.telemetryGeneratorService.generateAuditTelemetry(
          Environment.COURSE,
          AuditState.AUDIT_UPDATED,
          ['progress'],
          AuditType.UNIT_PROGRESS,
          this.telemetryObject.id,
          this.telemetryObject.type,
          this.telemetryObject.version,
          cdata,
          this.telemetryObject.rollup
        );
      }
    }
  }

  async subscribeUtilityEvents() {

    const loader = await this.commonUtilService.getLoader();

    this.events.subscribe(EventTopics.ENROL_COURSE_SUCCESS, async (res) => {
      console.log('enrol succ event');
      this.isAlreadyEnrolled = true;
      this.updatedCourseCardData = await this.courseService
        .getEnrolledCourses({ userId: this.appGlobalService.getUserId(), returnFreshCourses: true })
        .toPromise()
        .then((cData) => {
          return cData.find((element) => element.courseId === this.courseContentData.identifier);
        });
      this.courseContent.batchId = res.batchId;
      console.log('enrol succ event -->', this.courseContent);
      await this.getBatchDetails();
      // this.getCourseProgress();
      this.getContentState(true);
      // if (res && res.batchId) {
      //   this.batchId = res.batchId;
      //   if (this.identifier && res.courseId && this.identifier === res.courseId) {
      //     this.isAlreadyEnrolled = true;
      //       this.getContentsSize(this.childrenData);
      //   }
      // }
    });

  }

  startLearning() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.START_CLICKED,
      Environment.HOME,
      PageId.CHAPTER_DETAILS,
      this.telemetryObject,
      undefined,
      this.objRollup,
      // this.corRelationList
    );
    if (this.childContents && this.childContents.length && !this.isBatchNotStarted) {
      const firstChild = this.loadFirstChildren(this.chapter);
      const telemetryDetails = {
        pageId: PageId.CHAPTER_DETAILS,
        corRelationList: this.corRelationList
      };
      this.contentPlayerHandler.playContent(firstChild, this.generateContentNavExtras(firstChild, 1), telemetryDetails, true);
    } else if (!this.childContents || !this.childContents.length) {
        this.commonUtilService.showToast('NO_CONTENT_AVAILABLE_IN_MODULE');
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
        this.datePipe.transform(this.courseStartDate, 'mediumDate')));
    }
  }

  continueLearning() {
    this.isNextContentFound = false;
    this.isFirstContent = false;
    this.nextContent = undefined;
    this.getNextContent(this.chapter, this.contentStatusData.contentList);

    if (this.nextContent) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.RESUME_CLICKED,
        Environment.HOME,
        PageId.CHAPTER_DETAILS,
        this.telemetryObject,
        undefined,
        this.objRollup,
        // this.corRelationList
      );

      const telemetryDetails = {
        pageId: PageId.CHAPTER_DETAILS,
        corRelationList: this.corRelationList
      };
      this.contentPlayerHandler.playContent(this.nextContent, this.generateContentNavExtras(this.nextContent, 1), telemetryDetails, true);
    } else {
      this.startLearning();
    }
  }

  async showOverflowMenu(event) {
    const actionPopover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      event,
      cssClass: 'cd-leave-training-popup',
      showBackdrop: false,
      componentProps: {
        content: this.courseContentData,
        batchDetails: this.batchDetails,
        pageName: PageId.CHAPTER_DETAILS,
        chapter: this.chapter,
        downloadIdentifiers: this.downloadIdentifiers
      },
    });
    await actionPopover.present();
    const { data } = await actionPopover.onDidDismiss();
    if (data && data.download) {
      this.showDownloadConfirmationAlert();
    } else if (data.share) {
      this.share();
    }
  }

  async share() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SHARE_CLICKED,
        Environment.HOME,
        PageId.CHAPTER_DETAILS
    );
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.courseContentData,
        moduleId: this.chapter.identifier,
        subContentIds: this.subContentIds,
        // corRelationList: this.corRelationList,
        objRollup: this.objRollup,
        pageId: PageId.CHAPTER_DETAILS,
        shareItemType: ShareItemType.ROOT_COLECTION
      },
      cssClass: 'sb-popover',
    });
    await popover.present();
  }

  openContentDetails(event) {
    if ((event.event && Object.keys(event.event).length !== 0) || event.isFromDeeplink) {
      if (this.courseContentData.contentData.createdBy !== this.userId) {
        if (!this.isAlreadyEnrolled) {
          if (!this.isBatchNotStarted) {
            this.joinTraining();
          }
        } else {
          if (this.isBatchNotStarted) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
              this.datePipe.transform(this.courseStartDate, 'mediumDate')));
          } else {
            this.navigateToChildrenDetailsPage(event.data, 1);
          }
        }
      }
    }
  }

  /**
   * checks whether batches are available or not and then Navigate user to batch list page
   */
  async navigateToBatchListPage() {
    const ongoingBatches = [];
    const upcommingBatches = [];
    const loader = await this.commonUtilService.getLoader();
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (this.batches.length) {
        if (this.batches.length === 1) {
          this.enrollIntoBatch(this.batches[0]);
        } else {
          this.batches.forEach(batch => {
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
              course: this.courseContentData,
              objRollup: this.objRollup,
              telemetryObject: this.telemetryObject,
              // corRelationList: this.corRelationList
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

  async enrollIntoBatch(item: Batch) {
    this.loader = await this.commonUtilService.getLoader();
    if (this.guestUser) {
      this.promptToLogin(item);
    } else {
      await this.loader.present();
      const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, item);
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ENROLL_CLICKED,
        Environment.HOME,
        PageId.CHAPTER_DETAILS, undefined,
        this.localCourseService.prepareRequestValue(enrollCourseRequest));
      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch: item,
        pageId: PageId.COURSE_BATCHES,
        courseId: this.courseContent.identifier,
        channel: this.courseContent.contentData.channel,
        userConsent: this.courseContent.contentData.userConsent
      };

      this.localCourseService.enrollIntoBatch(enrollCourse, this).toPromise()
        .then(async (data: boolean) => {
         // await this.loader.dismiss();
          this.courseContent.batchId = item.id;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
          this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
            batchId: item.id,
            courseId: item.courseId
          });
          this.isAlreadyEnrolled = true;
        }, async (error) => {
          await this.loader.dismiss();
        });
    }
  }

  async promptToLogin(batchdetail) {
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
      this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, JSON.stringify(this.courseContentData)).toPromise();
      // this.preferences.putString(PreferenceKey.CDATA_KEY, JSON.stringify(this.corRelationList)).toPromise();
      this.appGlobalService.resetSavedQuizContent();
      // this.loginHandlerService.signIn({skipRootNavigation: true, componentData: this.extrasData});
      this.loginHandlerService.signIn();
    }
  }

  /**
   * get first child of unit
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

  async joinTraining() {
    if (!this.batches || !this.batches.length) {
      this.commonUtilService.showToast('NO_BATCHES_AVAILABLE');
      return;
    } else if (
      this.batches.length === 1 &&
      this.batches[0].enrollmentEndDate &&
      (new Date() > new Date(this.batches[0].enrollmentEndDate))
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
    await confirm.present();
    confirm.onDidDismiss().then(({ data }) => {
      if (data && data.canDelete) {
        this.navigateToBatchListPage();
      }
    });
  }

  /**
   * Redirect to child content details page
   */
  navigateToChildrenDetailsPage(content: Content, depth): void {
    const values = {
      contentClicked: content.identifier
    };
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.CHAPTER_DETAILS, this.telemetryObject,
      values,
      this.objRollup,
      this.corRelationList
    );

    this.router.navigate([RouterLinks.CONTENT_DETAILS], this.generateContentNavExtras(content, depth));
  }

  private generateContentNavExtras(content: Content, depth) {
    const contentState: ContentState = {
      batchId: this.courseContent.batchId ? this.courseContent.batchId : '',
      courseId: this.courseContentData.identifier
    };

    const params: NavigationExtras = {
      state: {
        content,
        depth,
        contentState,
        isChildContent: true,
        corRelation: this.corRelationList,
        isCourse: true,
        course: this.updatedCourseCardData
      }
    }
    return params;
  }

  getContentsSize(data?) {
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

  async showDownloadConfirmationAlert() {
    console.log('this.downloadIdentifiers', this.downloadIdentifiers);
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
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.DOWNLOAD_CLICKED,
          Environment.HOME,
          PageId.CHAPTER_DETAILS
      );
      const popover = await this.popoverCtrl.create({
        component: ConfirmAlertComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('DOWNLOAD'),
          sbPopoverMainTitle: this.chapter.name,
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
        // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        //   'download-all-button-clicked',
        //   Environment.HOME,
        //   PageId.COURSE_DETAIL,
        //   undefined,
        //   undefined,
        //   // todo
        //   // this.objRollup,
        //   // this.corRelationList
        // );
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

  getImportContentRequestBody(identifiers, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: cordova.file.externalDataDirectory,
        contentId: value,
        // correlationData: this.corRelationList !== undefined ? this.corRelationList : [],
        correlationData: [],
        rollUp: this.rollUpMap[value]
      });
    });

    return requestParams;
  }

  importContent(identifiers, isChild: boolean, isDownloadAllClicked?) {
    const option: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };
    console.log('ContentImportRequest', option);
    this.contentService.importContent(option).toPromise()
      .then((data: ContentImportResponse[]) => {
        this.zone.run(() => {
          if (data && data[0].status === ContentImportStatus.NOT_FOUND) {
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

            // if (isDownloadAllClicked) {
            //   this.telemetryGeneratorService.generateDownloadAllClickTelemetry(
            //     PageId.COURSE_DETAIL,
            //     this.course,
            //     this.queuedIdentifiers,
            //     identifiers.length,
            //     this.objRollup,
            //     this.corRelationList
            //   );
            // }

            if (this.queuedIdentifiers.length === 0) {
              // this.restoreDownloadState();
            }
            if (this.faultyIdentifiers.length > 0) {
              const stackTrace: any = {};
              stackTrace.parentIdentifier = this.courseContentData.identifier;
              stackTrace.faultyIdentifiers = this.faultyIdentifiers;
              // this.telemetryGeneratorService.generateErrorTelemetry(Environment.HOME,
              //   TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
              //   ErrorType.SYSTEM,
              //   PageId.COURSE_DETAIL,
              //   JSON.stringify(stackTrace),
              // );
              this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
            }
          }
        });
      })
      .catch((error) => {
        this.zone.run(() => {
          if (this.isDownloadStarted) {
            // this.restoreDownloadState();
          } else {
          }
          if (error && error.error === 'NETWORK_ERROR') {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          } else {
            this.commonUtilService.showToast('UNABLE_TO_FETCH_CONTENT');
          }
        });
      });
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
                this.headerService.showHeaderWithBackButton();
              }
            }
          }

          // Get child content
          if (event.payload && event.type === ContentEventType.IMPORT_COMPLETED) {
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
              this.courseContentData.isAvailableLocally = true;
              // this.setContentDetails(this.identifier);
            }
          }

          if (event.payload && event.type === ContentEventType.SERVER_CONTENT_DATA) {
            // this.licenseDetails = event.payload.licenseDetails;
            if (event.payload.size) {
              this.courseContent.contentData.size = event.payload.size;
            }
          }

          if (event.type === ContentEventType.IMPORT_PROGRESS) {
            // const totalCountMsg = Math.floor((event.payload.currentCount / event.payload.totalCount) * 100) +
            //   '% (' + event.payload.currentCount + ' / ' + event.payload.totalCount + ')';
            // this.importProgressMessage = this.commonUtilService.translateMessage('EXTRACTING_CONTENT', totalCountMsg);

            // if (event.payload.currentCount === event.payload.totalCount) {
            //   let timer = 30;
            //   const interval = setInterval(() => {
            //     this.importProgressMessage = `Getting things ready in ${timer--}  seconds`;
            //     if (timer === 0) {
            //       this.importProgressMessage = 'Getting things ready';
            //       clearInterval(interval);
            //     }
            //   }, 1000);
            // }
          }

          // For content update available
          const hierarchyInfo = this.courseContent.hierarchyInfo ? this.courseContent.hierarchyInfo : null;
          const contentUpdateEvent = event as ContentUpdate;
          if (contentUpdateEvent.payload && contentUpdateEvent.payload.contentId === this.courseContentData.identifier &&
            contentUpdateEvent.type === ContentEventType.UPDATE
            && hierarchyInfo === null) {
            this.zone.run(() => {
              this.headerService.hideHeader();
              // this.telemetryGeneratorService.generateSpineLoadingTelemetry(this.content, false);
              // this.importContent([this.identifier], false);
            });
          }

        });
      }) as any;
  }

  private getSubContentIds(content) {
    if (content && content.children) {
      content.children.forEach((ele) => {
        this.getSubContentIds(ele);
      });
    } else {
      if (content.mimeType !== MimeType.COLLECTION) {
        this.subContentIds.push(content.identifier);
      }
    }
    return this.subContentIds;
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
  generateImpressionEvent(objectId, objectType, objectVersion) {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.DETAIL,
      '', PageId.CHAPTER_DETAILS,
      Environment.HOME,
      objectId,
      objectType,
      objectVersion,
      this.objRollup,
      // this.corRelationList
      );
  }

  onConsentPopoverShow() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = undefined;
    }
  }

   onConsentPopoverDismiss() {}
}
