import { PreferenceKey } from '@app/app/app.constant';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Observable } from 'rxjs';
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
import { ContentType, MimeType, ActionType, EventTopics, RouterLinks } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, InteractSubtype, Environment } from '../telemetry-constants';
import { UtilityService } from '..';
import { Location } from '@angular/common';


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
    private location: Location
  ) {
    this.getUserId();
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
  }

  handleNotification(data) {
    switch (data.actionData.actionType) {
      case ActionType.SURVEY:
        this.externalUrl = data.actionData.deepLink;
        break;
      case ActionType.UPDATE_APP:
        this.utillService.getBuildConfigValue('APPLICATION_ID')
        .then( value => {
            this.appId = value;
        });
        break;
      case ActionType.COURSE_UPDATE:
        this.identifier = data.actionData.identifier;
        break;
      case ActionType.CONTENT_UPDATE:
        this.identifier = data.actionData.identifier;
        break;
      case ActionType.BOOK_UPDATE:
        this.identifier = data.actionData.identifier;
        break;
      default:
        console.log('Default Called');
        break;
    }
  }

  onAction(type: string, action?: { identifier: string }): Observable<undefined> {
    const identifier: any = action !== undefined ? action.identifier : this.identifier;
    if (identifier) {
      switch (type) {
        case 'content': {
          // const loader = await this.commonUtilService.getLoader();
          // await loader.present();
          return this.contentService.getContentDetails({
            contentId: identifier || this.identifier
          }).catch(async () => {
            // await loader.dismiss();
            return Observable.of(undefined);
          }).do(async (content: Content) => {
            // await loader.dismiss();
            if (content.contentType === ContentType.COURSE.toLowerCase()) {
              this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content } });
            } else if (content.mimeType === MimeType.COLLECTION) {
              this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content } });
            } else {
              this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content } });
            }
          }).mapTo(undefined) as any;
        }
        case 'dial': {
          this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: identifier, source: PageId.HOME } });
          return Observable.of(undefined);
        }
        default: {
          return Observable.of(undefined);
        }
      }
    } else if (this.appId) {
        this.utillService.openPlayStore(this.appId);
    } else if (this.externalUrl) {
        open(this.externalUrl);
    } else {
      this.checkCourseRedirect();
    }
    return Observable.of(undefined);
  }

  checkCourseRedirect() {
    this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise()
      .then(resp => {
        if (resp) {
          // this.events.publish('return_course');
          this.authService.getSession().subscribe((session: OAuthSession) => {
            if (!session) {
                this.isGuestUser = true;
            } else {
                this.isGuestUser = false;
                this.userId = session.userToken;
            }
            this.enrollIntoBatch(JSON.parse(resp));
          }, () => {
          });
          this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
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
      const enrollCourseRequest: EnrollCourseRequest = {
        batchId: batch.id,
        courseId: batch.courseId,
        userId: this.userId,
        batchStatus: batch.status
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
            if (error && error.code === 'NETWORK_ERROR') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            } else if (error && error.response
              && error.response.body && error.response.body.params && error.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
              this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
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
}
