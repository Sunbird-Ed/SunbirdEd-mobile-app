import { Component, NgZone, Inject } from '@angular/core';
import { NavController, NavParams, Events, PopoverController } from '@ionic/angular';
import {
  SharedPreferences,
  EnrollCourseRequest,
  AuthService,
  CourseService,
  TelemetryObject,
  InteractType,
  CourseBatchesRequest,
  CourseEnrollmentType,
  CourseBatchStatus
} from 'sunbird-sdk';
import { PreferenceKey, ProfileConstants, EventTopics, ContentType, MimeType, BatchConstants, RouterLinks } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractSubtype, Environment, PageId } from '@app/services/telemetry-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrollment-details-page',
  templateUrl: './enrollment-details-page.html',
  styleUrls: ['./enrollment-details-page.scss'],
})
export class EnrollmentDetailsPage {

  ongoingBatches: any;
  upcommingBatches: any;
  retiredBatched: any;
  userId: any;
  isGuestUser: boolean;
  layoutInProgress: string;
  sectionName: any;
  index: any;
  layoutName: any;
  pageName: any;
  env: any;
  courseId: any;

  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events,
    private zone: NgZone,
    private popOverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    this.ongoingBatches = this.navParams.get('ongoingBatches');
    this.upcommingBatches = this.navParams.get('upcommingBatches');
    this.retiredBatched = this.navParams.get('retiredBatched');
    this.courseId = this.navParams.get('courseId');
    this.getUserId();

  }

  close() {
    this.popOverCtrl.dismiss();
  }

  resumeCourse(content: any) {
    this.saveContentContext(content);
    if (content.lastReadContentId && content.status === 1) {
      this.events.publish('course:resume', { content });
    } else {
      this.router.navigate([`/${RouterLinks.ENROLLED_COURSE_DETAILS}`], { state: { content } });
    }
    this.close();
  }

  saveContentContext(content: any) {
    const contentContextMap = new Map();
    // store content context in the below map
    contentContextMap['userId'] = content.userId;
    contentContextMap['courseId'] = content.courseId;
    contentContextMap['batchId'] = content.batchId;
    if (content.batch) {
      contentContextMap['batchStatus'] = content.batch.status;
    }

    // store the contentContextMap in shared preference and access it from SDK
    this.preference.putString(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap));
  }

  enrollIntoBatch(content: any): void {
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: content.contentId ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS]
      },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.CONTENT_DETAIL, undefined,
      reqvalues);
    const enrollCourseRequest: EnrollCourseRequest = {
      userId: this.userId,
      courseId: content.courseId || this.courseId,
      batchId: content.id,
      batchStatus: content.status
    };
    const loader = this.commonUtilService.getLoader();
    loader.present();
    this.courseService.enrollCourse(enrollCourseRequest).toPromise()
      .then((data: any) => {
        this.zone.run(() => {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
          this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
            batchId: content.id,
            courseId: content.courseId
          });
          loader.dismiss();
          this.popOverCtrl.dismiss({ isEnrolled: true });
          this.navigateToDetailPage(content);
        });
      }, (error) => {
        loader.dismiss();
        this.zone.run(() => {
          if (error && error.code === 'NETWORK_ERROR') {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
          } else if (error && error.response
            && error.response.body && error.response.body.params && error.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
          }
        });
      });
  }

  /**
   * Get logged-user id. User id is needed to enroll user into batch.
   */
  getUserId(): void {
    this.authService.getSession().toPromise().then((session) => {
      if (session === undefined || session == null) {
        console.log('session expired');
        this.zone.run(() => { this.isGuestUser = true; });
      } else {
        this.zone.run(() => {
          this.isGuestUser = false;
          this.userId = session[ProfileConstants.USER_TOKEN];
        });
      }
    });
  }

  navigateToDetailPage(content: any, layoutName?: string): void {
    const identifier = content.contentId || content.identifier;
    let type;
    if (layoutName === this.layoutInProgress) {
      type = ContentType.COURSE;
    } else {
      type = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
    }
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, type, '');

    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      this.env,
      this.pageName ? this.pageName : this.layoutName,
      telemetryObject,
      values
    );

    if (content.contentType === ContentType.COURSE) {
      content.contentId = !content.contentId ? content.courseId : content.contentId;
      this.router.navigate([`/${RouterLinks.ENROLLED_COURSE_DETAILS}`], { state: { content } });
    } else if (content.mimeType === MimeType.COLLECTION) {
      // this.navCtrl.push(CollectionDetailsPage, {
      // this.navCtrl.push(CollectionDetailsEtbPage, {
      //   content: content
      // });
      this.router.navigate([`/${RouterLinks.COLLECTION_DETAILS}/${RouterLinks.ENROLLED_COURSE_DETAILS}`], { state: { content } });
    } else {
      this.router.navigate([`/${RouterLinks.CONTENT_DETAILS}`], { state: { content } });
    }
  }

}
