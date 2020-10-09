import { Injectable, Inject, NgZone } from '@angular/core';
import {
  Batch, Course, CourseService, EnrollCourseRequest,
  InteractType, SharedPreferences,
  FetchEnrolledCourseRequest, TelemetryObject, HttpClientError,
  NetworkError, GetContentStateRequest, ContentStateResponse, ContentData, ProfileService
} from 'sunbird-sdk';
import { Observable } from 'rxjs';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from './telemetry-constants';
import { Map } from '@app/app/telemetryutil';
import { CommonUtilService } from './common-util.service';
import { EnrollCourse } from './../app/enrolled-course-details-page/course.interface';
import { map, catchError } from 'rxjs/operators';
import { PreferenceKey, EventTopics, RouterLinks } from '@app/app/app.constant';
import { Events, PopoverController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ContentUtil } from '@app/util/content-util';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { ConsentPiiPopupComponent } from '@app/app/components/popups/consent-pii-popup/consent-pii-popup.component';
import { UserConsent, Consent, ConsentStatus } from '@project-sunbird/client-services/models';
import { CategoryKeyTranslator } from '@app/pipes/category-key-translator/category-key-translator-pipe';

export interface ConsentPopoverActionsDelegate {
  onConsentPopoverShow(): void;
  onConsentPopoverDismiss(): void;
}


@Injectable()
export class LocalCourseService {
  private userId: string;

  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private zone: NgZone,
    private appVersion: AppVersion,
    private router: Router,
    private location: Location,
    private sbProgressLoader: SbProgressLoader,
    private datePipe: DatePipe,
    private categoryKeyTranslator: CategoryKeyTranslator,
    private popoverCtrl: PopoverController,
  ) {
  }

  enrollIntoBatch(enrollCourse: EnrollCourse, consentPopoverActionsDelegate?: ConsentPopoverActionsDelegate): Observable<any> {
    const enrollCourseRequest: EnrollCourseRequest = this.prepareEnrollCourseRequest(
      enrollCourse.userId, enrollCourse.batch, enrollCourse.courseId);
    return this.courseService.enrollCourse(enrollCourseRequest).pipe(
      map(async (data: boolean) => {
        if (data) {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.ENROLL_SUCCESS,
            Environment.HOME,
            enrollCourse.pageId, enrollCourse.telemetryObject,
            this.prepareRequestValue(enrollCourseRequest),
            enrollCourse.objRollup,
            enrollCourse.corRelationList
          );
          if (enrollCourse.userConsent === UserConsent.YES) {
          if (consentPopoverActionsDelegate) {
            consentPopoverActionsDelegate.onConsentPopoverShow();
          }
          await this.showConsentPopup(enrollCourse);

          if (consentPopoverActionsDelegate) {
            consentPopoverActionsDelegate.onConsentPopoverDismiss();
          }
          }
        } else {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.ENROLL_FAILED,
            Environment.HOME,
            enrollCourse.pageId, enrollCourse.telemetryObject,
            this.prepareRequestValue(enrollCourseRequest),
            enrollCourse.objRollup,
            enrollCourse.corRelationList
          );
        }
        return data;
      }),
      catchError(async (err) => {
        const requestValue = this.prepareRequestValue(enrollCourseRequest);
        if (NetworkError.isInstance(err)) {
          requestValue.error = err.code;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
        } else if (HttpClientError.isInstance(err)) {
          if (err.response.body && err.response.body.params && err.response.body.params.status === 'USER_ALREADY_ENROLLED_COURSE') {
            requestValue.error = err.response.body.params.status;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
            if (enrollCourse.userConsent === UserConsent.YES) {
              await this.checkedUserConsent(enrollCourse);
            }
          } else {
            this.commonUtilService.showToast('ERROR_WHILE_ENROLLING_COURSE');
          }
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.ENROLL_FAILED,
          Environment.HOME,
          enrollCourse.pageId, enrollCourse.telemetryObject,
          requestValue,
          enrollCourse.objRollup,
          enrollCourse.corRelationList
        );
        throw err;
      })
    );
  }

  prepareEnrollCourseRequest(userId: string, batch: Batch | any, courseId?: string): EnrollCourseRequest {
    const enrollCourseRequest: EnrollCourseRequest = {
      batchId: batch.id,
      courseId: batch.courseId || courseId,
      userId,
      batchStatus: batch.status
    };
    return enrollCourseRequest;
  }

  prepareRequestValue(enrollCourseRequest): Map {
    const reqvalues = new Map();
    reqvalues['enrollReq'] = enrollCourseRequest;
    return reqvalues;
  }

  // This method is called when the user login immediately after pressing JOIN TRAINING from app-components
  // And after filling signinOnboarding completely from externalId service.
  async checkCourseRedirect() {
    const isLoggedInUser = this.appGlobalService.isUserLoggedIn();
    if (!this.appGlobalService.isSignInOnboardingCompleted && isLoggedInUser) {
      this.appGlobalService.isJoinTraningOnboardingFlow = true;
      return;
    }

    const batchDetails = await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise();
    const courseDetail = await this.preferences.getString(PreferenceKey.COURSE_DATA_KEY).toPromise();
    if (batchDetails && courseDetail) {
      this.userId = await this.appGlobalService.getActiveProfileUid();

      if (JSON.parse(courseDetail).createdBy !== this.userId && isLoggedInUser) {
        this.enrollBatchAfterlogin(JSON.parse(batchDetails), JSON.parse(courseDetail));
      } else {
        this.events.publish('return_course');
      }
      this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
    }
  }

  private async enrollBatchAfterlogin(batch: Batch, course: any) {
    const enrollCourseRequest = this.prepareEnrollCourseRequest(this.userId, batch);
    const telemetryObject: TelemetryObject = ContentUtil.getTelemetryObject(course);
    const corRelationList = await this.preferences.getString(PreferenceKey.CDATA_KEY).toPromise();
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_BATCHES, telemetryObject,
      this.prepareRequestValue(enrollCourseRequest),
      ContentUtil.generateRollUp(undefined, telemetryObject.id),
      corRelationList ? JSON.parse(corRelationList) : []);

    const enrollCourse: EnrollCourse = {
      userId: this.userId,
      batch,
      pageId: PageId.COURSE_BATCHES,
      telemetryObject,
      objRollup: ContentUtil.generateRollUp(undefined, telemetryObject.id),
      corRelationList: corRelationList ? JSON.parse(corRelationList) : [],
      channel: course.channel,
      userConsent: course.userConsent
    };
    this.enrollIntoBatch(enrollCourse).toPromise()
      .then(() => {
        this.zone.run(async () => {
          this.commonUtilService.showToast(this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_COURSE_ENROLLED', course));
          this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
            batchId: batch.id,
            courseId: batch.courseId
          });
          const appLabel = await this.appVersion.getAppName();
          this.events.publish(EventTopics.COACH_MARK_SEEN, { showWalkthroughBackDrop: false, appName: appLabel });
          await this.preferences.putString(PreferenceKey.CDATA_KEY, '').toPromise();
          this.getEnrolledCourses();
          this.navigateTocourseDetails();
          await this.sbProgressLoader.hide({ id: 'login' });
        });
      }, (err) => {
        this.zone.run(async () => {
          await this.preferences.putString(PreferenceKey.CDATA_KEY, '').toPromise();
          if (NetworkError.isInstance(err)) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            this.getEnrolledCourses();
          } else if (HttpClientError.isInstance(err)) {
            if (err.response.body && err.response.body.params && err.response.body.params.status === 'USER_ALREADY_ENROLLED_COURSE') {
              this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
                batchId: batch.id,
                courseId: batch.courseId
              });
            } else {
              this.commonUtilService.showToast('ERROR_WHILE_ENROLLING_COURSE');
            }
          }
          this.navigateTocourseDetails();
          await this.sbProgressLoader.hide({ id: 'login' });
        });
      });
  }

  navigateTocourseDetails() {
    const routeUrl = this.router.url;
    if ((routeUrl.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) === -1) && (routeUrl.indexOf(RouterLinks.COURSE_BATCHES) !== -1)) {
      this.location.back();
    }
  }

  private async getEnrolledCourses(returnRefreshedCourses: boolean = false) {
    const option: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: returnRefreshedCourses
    };
    this.courseService.getEnrolledCourses(option).toPromise()
      .then(async (enrolledCourses) => {
        if (enrolledCourses) {
          this.zone.run(() => {
            if (enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of enrolledCourses) {
                courseList.push(course);
              }
              this.appGlobalService.setEnrolledCourseList(courseList);
              this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, '').toPromise();
            }
          });
        }
      }, async (err) => {
      });
  }

  async getCourseProgress(courseContext) {
    return new Promise(async (resolve, reject) => {
      const request: GetContentStateRequest = {
        userId: this.appGlobalService.getUserId(),
        courseId: courseContext.courseId,
        contentIds: courseContext.leafNodeIds,
        returnRefreshedContentStates: true,
        batchId: courseContext.batchId
      };
      let progress = 0;
      try {
        const contentStatusData: ContentStateResponse = await this.courseService.getContentState(request).toPromise();
        if (contentStatusData && contentStatusData.contentList) {
          const viewedContents = [];
          for (const contentId of courseContext.leafNodeIds) {
            if (contentStatusData.contentList.find((c) => c.contentId === contentId && c.status === 2)) {
              viewedContents.push(contentId);
            }
          }
          progress = Math.round((viewedContents.length / courseContext.leafNodeIds.length) * 100);
        }
        resolve(progress);
      } catch (err) {
        resolve(progress);
      }
    });
  }

  isEnrollable(batches, course) {
    let latestBatch = batches[0];
    batches.forEach((batch) => {
      if (batch.startDate &&
        (new Date(batch.startDate) > new Date(latestBatch.startDate))) {
        latestBatch = batch;
      }
    });
    // start date is not passed, then check show message
    // start date is passed, then check for enrollmentenddate
    // enrollmentenddate is passed then show message

    if (latestBatch.startDate && (new Date(latestBatch.startDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0))) {
      this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_BATCH_AVAILABILITY_DATE', course,
        this.datePipe.transform(latestBatch.startDate));
      return false;
    } else if (latestBatch.enrollmentEndDate &&
      (new Date(latestBatch.enrollmentEndDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
      this.commonUtilService.showToast(
        'ENROLLMENT_ENDED_ON',
        null,
        null,
        null,
        null,
        this.datePipe.transform(latestBatch.enrollmentEndDate)
      );
      return false;
    }
    return true;
  }

  async showConsentPopup(course) {
    await this.sbProgressLoader.hide({id: 'login'});
    const popover = await this.popoverCtrl.create({
      component: ConsentPiiPopupComponent,
      componentProps: {
      },
      cssClass: 'sb-popover',
      backdropDismiss: false
    });
    await popover.present();
    const dismissResponse = await popover.onDidDismiss();
    const request: Consent = {
      status: dismissResponse.data.data ? ConsentStatus.ACTIVE : ConsentStatus.REVOKED,
      userId: course.userId ? course.userId : dismissResponse.data.userId,
      consumerId: course.channel ? course.channel : course.content.channel,
      objectId: course.courseId,
      objectType: 'Collection'
    };
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    await this.profileService.updateConsent(request).toPromise()
      .then(async (data) => {
        this.commonUtilService.showToast('FRMELEMNTS_MSG_DATA_SETTINGS_SUBMITED_SUCCESSFULLY');
        await loader.dismiss();
      })
      .catch((e) => {
        loader.dismiss();
        if (e.code === 'NETWORK_ERROR') {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        }
      });
  }
  private async checkedUserConsent(course) {
    const request: Consent = {
      userId: this.userId,
      consumerId: course.channel,
      objectId: course.courseId ? course.courseId : course.batch.courseId
    };
    await this.profileService.getConsent(request).toPromise()
      .then((data) => {
      })
      .catch(async (e) => {
        if (e.response.body.params.err === 'USER_CONSENT_NOT_FOUND') {
          await this.showConsentPopup(course);
        } else if (e.code === 'NETWORK_ERROR') {
          this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        }
      });
  }
}
