import { SbSharePopupComponent } from '@app/app/components/popups/sb-share-popup/sb-share-popup.component';


import { Component, OnInit, Inject, NgZone, OnDestroy } from '@angular/core';
import { AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService, LocalCourseService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TocCardType } from '@project-sunbird/common-consumption';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PopoverController, Events } from '@ionic/angular';
import { RouterLinks, PreferenceKey, EventTopics, MimeType, ShareItemType } from '@app/app/app.constant';
import { SharedPreferences, AuthService, Batch, TelemetryObject, ContentState, Content, Course,
   CourseService, GetContentStateRequest, ContentStateResponse } from 'sunbird-sdk';
import { EnrollCourse } from '@app/app/enrolled-course-details-page/course.interface';
import { DatePipe } from '@angular/common';
import { ContentActionsComponent } from './../../components/content-actions/content-actions.component';
import { PageId } from './../../../services/telemetry-constants';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.page.html',
  styleUrls: ['./chapter-details.page.scss', '../../enrolled-course-details-page/enrolled-course-details-page.scss'],
})
export class ChapterDetailsPage implements OnInit, OnDestroy {

  chapter: any;
  cardType: TocCardType = TocCardType.COURSE;
  isAlreadyEnrolled = false;
  batches = [];
  courseContentData: any;
  courseContent: any;
  courseCardData: any;
  batchExp = false;
  guestUser = true;
  isChapterCompleted = false;
  isChapterStarted = false;
  isBatchNotStarted = false;
  userId;
  telemetryObject: TelemetryObject;
  updatedCourseCardData: Course;
  contentStatusData: ContentStateResponse;
  batchDetails: Batch;
  childContents = [];
  viewedContents = [];
  chapterProgress = 0;
  courseStartDate;

  private extrasData: any;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private appGlobalService: AppGlobalService,
    private popoverCtrl: PopoverController,
    private localCourseService: LocalCourseService,
    private events: Events,
    private zone: NgZone,
    private datePipe: DatePipe
  ) {
    // if ((!this.router.getCurrentNavigation() || !this.router.getCurrentNavigation().extras) && this.appGlobalService.preSignInData) {
    //   this.extrasData = this.appGlobalService.preSignInData;
    //   console.log('after login', this.extrasData);
    // } else {
    this.extrasData = this.router.getCurrentNavigation().extras.state;
      // console.log('else', this.extrasData);
    // }
    this.appGlobalService.preSignInData = null;
    this.courseContentData = this.extrasData.courseContentData;
    this.courseContent = this.extrasData.courseContent;
    this.chapter = this.extrasData.chapterData;
    this.batches = this.extrasData.batches;
    this.isAlreadyEnrolled = this.extrasData.isAlreadyEnrolled;
    this.courseCardData = this.extrasData.courseCardData;
    this.batchExp = this.extrasData.batchExp;
    this.telemetryObject = this.extrasData.telemetryObject;
    this.isChapterCompleted = this.extrasData.isChapterCompleted;
    this.contentStatusData = this.extrasData.contentStatusData;
    console.log('extrasData', this.extrasData);
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
    this.subscribeUtilityEvents();
    await this.checkLoggedInOrGuestUser();
    this.childContents = [];
    this.getAllContents(this.chapter);
    console.log('this.childContents', this.childContents);
    this.getContentState(true);

    if (!this.guestUser) {
      this.updatedCourseCardData = await this.courseService.getEnrolledCourses({ userId: this.userId, returnFreshCourses: false })
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
            || (!this.courseCardData.batchId && element.courseId === this.courseContentData.identifier));
        })
        .catch(e => {
          console.log(e);
          return null;
        });
      if (this.updatedCourseCardData && !this.courseCardData.batch) {
        this.courseCardData.batch = this.updatedCourseCardData.batch;
        this.courseCardData.batchId = this.updatedCourseCardData.batchId;
      }
      console.log('this.updatedCourseCardData', this.updatedCourseCardData);
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe(EventTopics.ENROL_COURSE_SUCCESS);
    // this.events.unsubscribe('courseToc:content-clicked');
    // this.events.unsubscribe(EventTopics.UNENROL_COURSE_SUCCESS);
    // this.events.unsubscribe('header:setzIndexToNormal');
    // this.events.unsubscribe('header:decreasezIndex');
  }

  async checkLoggedInOrGuestUser() {
    const session = await this.authService.getSession().toPromise();
    this.guestUser = !session;
    if (session) {
      this.userId = session.userToken;
    }
  }

  async getContentState(returnRefresh: boolean) {
    const loader = await this.commonUtilService.getLoader();
    if (this.courseCardData.batchId) {
      await loader.present();
      const request: GetContentStateRequest = {
        userId: this.appGlobalService.getUserId(),
        courseIds: [this.courseContentData.identifier],
        returnRefreshedContentStates: returnRefresh,
        batchId: this.courseCardData.batchId
      };
      this.courseService.getContentState(request).toPromise()
      .then(async (res: ContentStateResponse) => {
        this.zone.run(() => {
          this.contentStatusData = res;
          console.log('this.contentStatusData', this.contentStatusData);
          this.checkChapterCompletion();
        });
        await loader.dismiss();
      }).catch(async (err) => {
        await loader.dismiss();
      });
    }
  }

  async getBatchDetails() {
    if (this.courseCardData.batchId) {
      this.courseService.getBatchDetails({ batchId: this.courseCardData.batchId }).toPromise()
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
        });
      }).catch((err) => {

      });
    }
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
      this.courseCardData.batchId = res.batchId;
      console.log('enrol succ event -->', this.courseCardData);
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
    if (this.childContents.length && !this.isBatchNotStarted) {
      const firstChild = this.loadFirstChildren(this.chapter);
      this.navigateToChildrenDetailsPage(firstChild, 1);
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_WILL_BE_AVAILABLE',
        this.datePipe.transform(this.courseStartDate, 'mediumDate')));
    }
  }

  continueLearning() {
    if (this.updatedCourseCardData.lastReadContentId) {
      const child = this.childContents.find((c) => c.identifier === this.updatedCourseCardData.lastReadContentId);
      if (child) {
        this.navigateToChildrenDetailsPage(child, 1);
      } else {
        this.startLearning();
      }
    }
  }

  async showOverflowMenu(event) {
    const actionPopover = await this.popoverCtrl.create({
      component: ContentActionsComponent,
      event,
      cssClass: 'leave-training-popup',
      showBackdrop: false,
      componentProps: {
        content: this.courseContentData,
        batchDetails: this.batchDetails,
        pageName: PageId.CHAPTER_DETAILS,
        chapter: this.chapter
      },
    });
    await actionPopover.present();
    const { data } = await actionPopover.onDidDismiss();
    if (data && data.download) {
      // this.showConfirmAlert();
    } else if (data.share) {
      this.share();
    }
  }

  async share() {
    // this.contentShareHandler.shareContent(this.content, this.corRelationList);
    const popover = await this.popoverCtrl.create({
      component: SbSharePopupComponent,
      componentProps: {
        content: this.courseContent,
        // corRelationList: this.corRelationList,
        pageId: PageId.COURSE_DETAIL,
        shareItemType: ShareItemType.ROOT_COLECTION
      },
      cssClass: 'sb-popover',
    });
    await popover.present();
  }

  openContentDetails(event) {
    if (Object.keys(event.event).length !== 0 ) {
      if (this.courseContentData.createdBy !== this.userId) {
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
              // objRollup: this.objRollup,
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
    const loader =  await this.commonUtilService.getLoader();
    if (this.guestUser) {
      this.promptToLogin(item);
    } else {
      await loader.present();
      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch: item,
        pageId: PageId.COURSE_BATCHES,
        courseId: undefined
      };

      this.localCourseService.enrollIntoBatch(enrollCourse).toPromise()
        .then(async (data: boolean) => {
            await loader.dismiss();
            this.courseCardData.batchId = item.id;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: item.id,
              courseId: item.courseId
            });
            this.isAlreadyEnrolled = true;
        }, async (error) => {
            await loader.dismiss();
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
    if (!this.batches.length) {
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
    const contentState: ContentState = {
      batchId: this.courseCardData.batchId ? this.courseCardData.batchId : '',
      courseId: this.courseContentData.identifier
    };
    this.router.navigate([RouterLinks.CONTENT_DETAILS], {
      state: {
        content,
        depth,
        contentState,
        isChildContent: true,
        // corRelation: this.corRelationList,
        corRelation: undefined,
        isCourse: true,
        course: this.updatedCourseCardData
      }
    });
  }

}
