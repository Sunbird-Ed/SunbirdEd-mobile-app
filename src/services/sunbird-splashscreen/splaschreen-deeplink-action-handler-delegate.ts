import { PreferenceKey, ContentFilterConfig } from '@app/app/app.constant';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Observable, of, from } from 'rxjs';
import {
  ContentService,
  Content,
  SharedPreferences,
  CourseService,
  Batch,
  EnrollCourseRequest,
  OAuthSession,
  AuthService,
  FetchEnrolledCourseRequest,
  Course
} from 'sunbird-sdk';

import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { ContentType, MimeType, EventTopics, RouterLinks, LaunchType } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, InteractSubtype, Environment, ID, CorReleationDataType } from '../telemetry-constants';
import { UtilityService } from '..';
import { Location } from '@angular/common';
import { LocalCourseService } from '../local-course.service';
import { EnrollCourse } from '@app/app/enrolled-course-details-page/course.interface';
import { tap, catchError, mapTo } from 'rxjs/operators';


@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  identifier: any;
  isGuestUser: any;
  userId: string;
  enrolledCourses: any;
  appLabel: any;
  externalUrl: any;
  appId: any;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalServices: AppGlobalService,
    private events: Events,
    private zone: NgZone,
    private router: Router,
    private appVersion: AppVersion,
    private utillService: UtilityService,
    private location: Location,
    private localCourseService: LocalCourseService
  ) {
    this.getUserId();
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
  }

  onAction(payload: any): Observable<undefined> {
    // return from(async () => {
      if (payload && payload.url) {
        const quizTypeRegex = new RegExp(/(?:\/resources\/play\/content\/(?<quizId>\w+))/);
        const dialTypeRegex = new RegExp(/(?:\/get\/dial\/(?<dialCode>\w+))/);
        const contentTypeRegex = new RegExp(/(?:\/play\/(?:content|collection)\/(?<contentId>\w+))/);
        const courseTypeRegex = new RegExp(/(?:\/(?:explore-course|learn)\/course\/(?<courseId>\w+))/);

        const urlRegex = new RegExp(quizTypeRegex.source + '|' + dialTypeRegex.source + '|' +
          contentTypeRegex.source + '|' + courseTypeRegex.source);
        const urlMatch = payload.url.match(urlRegex.source);

        if (urlMatch && urlMatch.groups) {
          if (urlMatch.groups.dialCode) {
            this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: urlMatch.groups.dialCode, source: PageId.HOME } });
          } else if (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId) {
            this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true);
          }
        }
        return of(undefined);
      }
    // });
  }

  async navigateContent(identifier, isFromLink = false) {
    this.appGlobalServices.resetSavedQuizContent();
    const content = await this.contentService.getContentDetails({
      contentId: identifier
    }).toPromise();

    if (isFromLink) {
      this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK);
    }
    if (content.contentType === ContentType.COURSE.toLowerCase()) {
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content } });
    } else if (content.mimeType === MimeType.COLLECTION) {
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content } });
    } else {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
        return;
      }
      if (content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
        this.quizContentNavigator(identifier, content, isFromLink);
      } else {
        await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content } });
      }
    }
  }

  async quizContentNavigator(identifier, content, isFromLink) {
    this.appGlobalServices.limitedShareQuizContent = identifier;
    if (isFromLink) {
      this.limitedSharingContentLinkClickedTelemery();
    }
    if (!this.appGlobalServices.isUserLoggedIn() && !this.appGlobalServices.isProfileSettingsCompleted) {
      return;
    }
    if (!this.appGlobalServices.isSignInOnboardingCompleted && this.appGlobalServices.isUserLoggedIn()) {
      return;
    }
    if (this.router.url && this.router.url.indexOf(RouterLinks.CONTENT_DETAILS) !== -1) {
      this.events.publish(EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, { content, autoPlayQuizContent: true });
      return;
    }
    await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content, autoPlayQuizContent: true } });
  }

  async checkCourseRedirect() {
    const isloogedInUser = await this.authService.getSession().toPromise();
    if (!this.appGlobalServices.isSignInOnboardingCompleted && isloogedInUser) {
      this.appGlobalServices.isJoinTraningOnboardingFlow = true;
      return;
    }
    this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise()
      .then(resp => {
        if (resp) {
          this.preferences.getString(PreferenceKey.COURSE_DATA_KEY).toPromise()
            .then(courseDetail => {
              if (courseDetail) {
                this.authService.getSession().subscribe((session: OAuthSession) => {
                  if (!session) {
                    this.isGuestUser = true;
                  } else {
                    this.isGuestUser = false;
                    this.userId = session.userToken;
                  }
                  if (JSON.parse(courseDetail).createdBy !== this.userId) {
                    this.enrollIntoBatch(JSON.parse(resp));
                  } else {
                    this.events.publish('return_course');
                  }
                }, () => {
                });
                this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
              }
            });
        }
      });
  }

  /**
   * Enroll logged-user into selected batch
   *
   * @param batch contains details of select batch
   */
  async enrollIntoBatch(batch: Batch) {
    if (!this.isGuestUser) {
      const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, batch);
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ENROLL_CLICKED,
        Environment.HOME,
        PageId.COURSE_BATCHES, undefined,
        this.localCourseService.prepareRequestValue(enrollCourseRequest));

      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch,
        pageId: PageId.COURSE_BATCHES
      };
      this.localCourseService.enrollIntoBatch(enrollCourse).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            await loader.dismiss();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: batch.id,
              courseId: batch.courseId
            });
            this.events.publish('coach_mark_seen', { showWalkthroughBackDrop: false, appName: this.appLabel });
            this.getEnrolledCourses();
          });
        }, (error) => {
          this.zone.run(async () => {
            await loader.dismiss();
            if (error && error.code !== 'NETWORK_ERROR') {
              this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
                batchId: batch.id,
                courseId: batch.courseId
              });
              this.getEnrolledCourses();
            }
          });
        });
    }
  }

  /**
   * Get logged-user id. User id is needed to enroll user into batch.
   */
  getUserId() {
    this.authService.getSession().subscribe((session: OAuthSession) => {
      if (!session) {
        this.zone.run(() => {
          this.isGuestUser = true;
        });
      } else {
        this.zone.run(() => {
          this.isGuestUser = false;
          this.userId = session.userToken;
        });
      }
    }, () => {
    });
  }

  async navigateToCoursePage() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.preferences.getString(PreferenceKey.COURSE_DATA_KEY).toPromise()
      .then(resp => {
        if (resp) {
          console.log('URL', this.router.url);
          if (this.router.url.indexOf(RouterLinks.COURSE_BATCHES) !== -1) {
            window.history.go(-2);
          }
          setTimeout(async () => {
            this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
              state: {
                content: JSON.parse(resp)
              }
            });
            await loader.dismiss();
            this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, '').toPromise();
          }, 2000);
        }
      });
  }

  /**
   * To get enrolled course(s) of logged-in user.
   *
   * It internally calls course handler of genie sdk
   */
  async getEnrolledCourses(refreshEnrolledCourses: boolean = true, returnRefreshedCourses: boolean = false) {
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
            this.enrolledCourses = enrolledCourses ? enrolledCourses : [];
            if (this.enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of this.enrolledCourses) {
                courseList.push(course);
              }
              this.appGlobalServices.setEnrolledCourseList(courseList);
              this.navigateToCoursePage();
            }
          });
        }
      }, async (err) => {
        await loader.dismiss();
      });
  }

  limitedSharingContentLinkClickedTelemery() {
    const corRelationList = [];
    corRelationList.push({ id: ID.QUIZ, type: CorReleationDataType.DEEPLINK });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.QUIZ_DEEPLINK,
      '',
      Environment.HOME,
      undefined,
      undefined,
      undefined,
      undefined,
      corRelationList,
      ID.DEEPLINK_CLICKED
    );
  }

}
