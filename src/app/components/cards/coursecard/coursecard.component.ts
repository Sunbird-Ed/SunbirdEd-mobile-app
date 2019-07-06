import { AppVersion } from '@ionic-native/app-version/ngx';
import { BatchConstants, ContentCard, ContentType, MimeType, PreferenceKey } from '../../../app.constant';
import { Component, Inject, Input, OnInit, NgZone } from '@angular/core';
import { Events, NavController, PopoverController } from '@ionic/angular';
// import { EnrolledCourseDetailsPage } from '../../../pages/enrolled-course-details/enrolled-course-details';
// import { CollectionDetailsEtbPage } from '../../../pages/collection-details-etb/collection-details-etb';
// import { ContentDetailsPage } from '../../../pages/content-details/content-details';
// import { ContentCard, ContentType, MimeType, PreferenceKey } from '../../../app/app.constant';
import { CourseUtilService } from '../../../../services/course-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import {
  SharedPreferences, TelemetryObject,
  CourseService, CourseBatchesRequest, CourseEnrollmentType, CourseBatchStatus, GetContentStateRequest
} from 'sunbird-sdk';
import { InteractSubtype, InteractType, Environment, PageId } from '../../../../services/telemetry-constants';
import { CommonUtilService } from '../../../../services/common-util.service';
import { async } from 'q';
// import { EnrollmentDetailsPage } from '@app/pages/enrolled-course-details/enrollment-details/enrollment-details';
@Component({
  selector: 'app-coursecard',
  templateUrl: './coursecard.component.html',
  styleUrls: ['./coursecard.component.scss'],
})
export class CourseCardComponent implements OnInit {
   /**
    * Contains course details
    */
  @Input() course: any;

  /**
   * Contains layout name
   *
   * @example layoutName = Inprogress / popular
   */
  @Input() layoutName: string;

  @Input() pageName: string;

  @Input() onProfile = false;

  @Input() index: number;

  @Input() sectionName: string;

  @Input() env: string;

  /**
   * To show card as disbled or Greyed-out when device is offline
   */
  @Input() cardDisabled = false;

  @Input() guestUser: any;

  @Input() enrolledCourses: any;

  /**
   * Contains default image path.
   *
   * It gets used when perticular course does not have a course/content icon
   */
  defaultImg: string;

  layoutInProgress = ContentCard.LAYOUT_INPROGRESS;
  layoutPopular = ContentCard.LAYOUT_POPULAR;
  layoutSavedContent = ContentCard.LAYOUT_SAVED_CONTENT;
  batchExp = false;
  batches: any;
  loader: any;

  /**
   * Default method of class CourseCard
   *
   * @param navCtrl To navigate user from one page to another
   * @param courseUtilService
   * @param events
   * @param telemetryGeneratorService
   * @param preferences
   */
  constructor(
    public navCtrl: NavController,
    private courseUtilService: CourseUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private popoverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private zone: NgZone) {
    this.defaultImg = 'assets/imgs/ic_launcher.png';
  }

  async  checkRetiredOpenBatch(content: any, layoutName?: string) {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    let anyOpenBatch: Boolean = false;
    let retiredBatches: Array<any> = [];
    this.enrolledCourses = this.enrolledCourses || [];
    if (layoutName !== ContentCard.LAYOUT_INPROGRESS) {
      retiredBatches = this.enrolledCourses.filter((element) => {
        if (element.contentId === content.identifier && element.batch.status === 1 && element.cProgress !== 100) {
          anyOpenBatch = true;
          content.batch = element.batch;
        }
        if (element.contentId === content.identifier && element.batch.status === 2 && element.cProgress !== 100) {
          return element;
        }
      });
    }
    if (anyOpenBatch || !retiredBatches.length) {
      // open the batch directly
      this.navigateToDetailPage(content, layoutName);
    } else if (retiredBatches.length) {
      this.navigateToBatchListPopup(content, layoutName, retiredBatches);
    }
  }

  async navigateToBatchListPopup(content: any, layoutName?: string, retiredBatched?: any) {
    const courseBatchesRequest: CourseBatchesRequest = {
      filters: {
        courseId: layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
        enrollmentType: CourseEnrollmentType.OPEN,
        status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS]
      },
      fields: BatchConstants.REQUIRED_FIELDS
    };
    const reqvalues = new Map();
    reqvalues['enrollReq'] = courseBatchesRequest;
    // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
    //   InteractSubtype.ENROLL_CLICKED,
    //     Environment.HOME,
    //     PageId.CONTENT_DETAIL, undefined,
    //     reqvalues);

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!this.guestUser) {
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then((data: any) => {
            this.zone.run(async () => {
              this.batches = data;
              if (this.batches.length) {
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                  'showing-enrolled-ongoing-batch-popup',
                  Environment.HOME,
                  PageId.CONTENT_DETAIL, undefined,
                  reqvalues);
                await this.loader.dismiss();
                // const popover = this.popoverCtrl.create(EnrollmentDetailsPage,
                //   {
                //     upcommingBatches: this.batches,
                //     retiredBatched: retiredBatched,
                //     courseId: content.identifier
                //   },
                //   { cssClass: 'enrollement-popover' }
                // );
                // popover.present();
              } else {
                await this.loader.dismiss();
                this.navigateToDetailPage(content, layoutName);
              }
            });
          })
          .catch((error: any) => {
            console.log('error while fetching course batches ==>', error);
          });
      } else {
        // this.navCtrl.push(CourseBatchesPage);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  /**
   * Navigate to the course/content details page
   *
   * @param {string} layoutName
   * @param {object} content
   */
  async navigateToDetailPage(content: any, layoutName: string) {
    const identifier = content.contentId || content.identifier;
    let telemetryObject: TelemetryObject;
    if (layoutName === this.layoutInProgress) {
      telemetryObject = new TelemetryObject(identifier, ContentType.COURSE, undefined);
    } else {
      const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentType : ContentType.RESOURCE;
      telemetryObject = new TelemetryObject(identifier, objectType, undefined);
    }


    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      this.env,
      this.pageName ? this.pageName : this.layoutName,
      telemetryObject,
      values);
    if (this.loader) {
      await this.loader.dismiss();
    }
    if (layoutName === this.layoutInProgress || content.contentType === ContentType.COURSE) {
      // migration-TODO
      // this.navCtrl.push(EnrolledCourseDetailsPage, {
      //   content: content
      // });
    } else if (content.mimeType === MimeType.COLLECTION) {
      // migration-TODO
      // this.navCtrl.push(CollectionDetailsPage, {
      // this.navCtrl.push(CollectionDetailsEtbPage, {
      //   content: content
      // });
    } else {
      // migration-TODO
      // this.navCtrl.push(ContentDetailsPage, {
      //   content: content
      // });
    }
  }


  async resumeCourse(content: any) {
    const identifier = content.contentId || content.identifier;
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, ContentType.COURSE, content.pkgVersion);
    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.RESUME_CLICKED,
      this.env,
      this.pageName ? this.pageName : this.layoutName,
      telemetryObject,
      values);
    // Update enrolled courses playedOffline status.
    this.getContentState(content);
    this.saveContentContext(content);

    const userId = content.userId;
    const lastReadContentIdKey = 'lastReadContentId_' + userId + '_' + identifier + '_' + content.batchId;
    this.preferences.getString(lastReadContentIdKey).toPromise()
      .then(val => {
        content.lastReadContentId = val;

        if (content.lastReadContentId) {
          this.events.publish('course:resume', {
            content: content
          });
        } else {
          // this.navCtrl.push(EnrolledCourseDetailsPage, {
          //   content: content
          // });
        }
      });
  }

  ngOnInit() {
    if (this.layoutName === this.layoutInProgress) {
      this.course.cProgress = (this.courseUtilService.getCourseProgress(this.course.leafNodesCount, this.course.progress));
      this.course.cProgress = parseInt(this.course.cProgress, 10);
      if (this.course.batch && this.course.batch.status === 2) {
        this.batchExp = true;
      } else {
        this.batchExp = false;
      }
    }
  }

  getContentState(course: any) {
    const request: GetContentStateRequest = {
      userId: course['userId'],
      courseIds: [course['contentId']],
      returnRefreshedContentStates: true,
      batchId: course['batchId']
    };
    this.courseService.getContentState(request).subscribe();
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
    this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap)).toPromise().then();
  }

}
