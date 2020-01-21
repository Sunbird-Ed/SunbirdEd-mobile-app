import { Injectable, Inject, NgZone } from '@angular/core';
import {
  Batch, Course, CourseService, EnrollCourseRequest,
  InteractType, AuthService, SharedPreferences, OAuthSession, FetchEnrolledCourseRequest
} from 'sunbird-sdk';
import { Observable } from 'rxjs';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from './telemetry-constants';
import { Map } from '@app/app/telemetryutil';
import { CommonUtilService } from './common-util.service';
import { EnrollCourse } from './../app/enrolled-course-details-page/course.interface';
import { map, catchError} from 'rxjs/operators';
import { PreferenceKey, EventTopics } from '@app/app/app.constant';
import { Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Injectable()
export class LocalCourseService {
  private userId: string;

    constructor(
      @Inject('COURSE_SERVICE') private courseService: CourseService,
      @Inject('AUTH_SERVICE') private authService: AuthService,
      @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
      private appGlobalService: AppGlobalService,
      private telemetryGeneratorService: TelemetryGeneratorService,
      private commonUtilService: CommonUtilService,
      private events: Events,
      private zone: NgZone,
      private appVersion: AppVersion,
    ) {
    }

    enrollIntoBatch(enrollCourse: EnrollCourse): Observable<any> {
        const enrollCourseRequest: EnrollCourseRequest = this.prepareEnrollCourseRequest(
            enrollCourse.userId, enrollCourse.batch, enrollCourse.courseId);
        return this.courseService.enrollCourse(enrollCourseRequest).pipe(
            map((data: boolean) => {
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
            catchError(err => {
                const requestValue = this.prepareRequestValue(enrollCourseRequest)
                if (err && err.code === 'NETWORK_ERROR') {
                    requestValue.error = err.code;
                    this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
                } else if (err && err.response
                    && err.response.body && err.response.body.params && err.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
                        requestValue.error = err.response.body.params.err;
                        this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
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
      const isloogedInUser = await this.authService.getSession().toPromise();
      if (!this.appGlobalService.isSignInOnboardingCompleted && isloogedInUser) {
        this.appGlobalService.isJoinTraningOnboardingFlow = true;
        return;
      }
      const batchDetails = await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise();
      const courseDetail = await this.preferences.getString(PreferenceKey.COURSE_DATA_KEY).toPromise();
      if (batchDetails && courseDetail) {
        const session: OAuthSession = await this.authService.getSession().toPromise();
        let isGuestUser;
        if (!session) {
          isGuestUser = true;
        } else {
          isGuestUser = false;
          this.userId = session.userToken;
        }
        if (JSON.parse(courseDetail).createdBy !== this.userId && !isGuestUser) {
          this.enrollBatchAfterlogin(JSON.parse(batchDetails));
        } else {
          this.events.publish('return_course');
        }
        this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
      }
    }

    private async enrollBatchAfterlogin(batch: Batch) {
      const enrollCourseRequest = this.prepareEnrollCourseRequest(this.userId, batch);
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ENROLL_CLICKED,
        Environment.HOME,
        PageId.COURSE_BATCHES, undefined,
        this.prepareRequestValue(enrollCourseRequest));

      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch,
        pageId: PageId.COURSE_BATCHES
      };
      this.enrollIntoBatch(enrollCourse).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            await loader.dismiss();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: batch.id,
              courseId: batch.courseId
            });
            const appLabel = await this.appVersion.getAppName();
            this.events.publish('coach_mark_seen', { showWalkthroughBackDrop: false, appName: appLabel });
            this.getEnrolledCourses();
          });
        }, (error) => {
          this.zone.run(async () => {
            await loader.dismiss();
            if (error && error.code !== 'USER_ALREADY_ENROLLED_COURSE') {
              this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
                batchId: batch.id,
                courseId: batch.courseId
              });
            }
            if (error && error.code !== 'NETWORK_ERROR') {
            this.getEnrolledCourses();
            }
          });
        });
    }

    private async getEnrolledCourses(returnRefreshedCourses: boolean = false) {
        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        const option: FetchEnrolledCourseRequest = {
          userId: this.userId,
          returnFreshCourses: returnRefreshedCourses
        };
        this.courseService.getEnrolledCourses(option).toPromise()
          .then(async (enrolledCourses) => {
            await loader.dismiss();
            if (enrolledCourses) {
              this.zone.run(() => {
                enrolledCourses = enrolledCourses || [];
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
            await loader.dismiss();
          });
      }
}
