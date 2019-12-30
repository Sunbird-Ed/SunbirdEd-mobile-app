import { BatchConstants, ContentCard, ContentType, MimeType, PreferenceKey, RouterLinks } from '../../../app.constant';
import { Component, Inject, Input, OnInit, NgZone } from '@angular/core';
import { Events, NavController, PopoverController } from '@ionic/angular';
import { CourseUtilService } from '../../../../services/course-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import {
  SharedPreferences, TelemetryObject,
  CourseService, CourseBatchesRequest, CourseEnrollmentType, CourseBatchStatus, GetContentStateRequest, CorrelationData
} from 'sunbird-sdk';
import { InteractSubtype, InteractType, Environment, PageId, CorReleationDataType } from '../../../../services/telemetry-constants';
import { CommonUtilService } from '../../../../services/common-util.service';
import { Router } from '@angular/router';
import { EnrollmentDetailsComponent } from '../../enrollment-details/enrollment-details.component';
import { ContentUtil } from '@app/util/content-util';

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

  @Input() isFilterApplied = false;

  /**
   * Contains default image path.
   *
   * It gets used when perticular course does not have a course/content icon
   */
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');

  layoutInProgress = ContentCard.LAYOUT_INPROGRESS;
  layoutPopular = ContentCard.LAYOUT_POPULAR;
  layoutSavedContent = ContentCard.LAYOUT_SAVED_CONTENT;
  batchExp = false;
  batches: any;
  loader: any;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    public navCtrl: NavController,
    private courseUtilService: CourseUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private popoverCtrl: PopoverController,
    public commonUtilService: CommonUtilService,
    private router: Router,
    private zone: NgZone) { }

  async  checkRetiredOpenBatch(content: any, layoutName?: string) {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();
    let anyRunningBatch = false;
    let retiredBatches: Array<any> = [];
    this.enrolledCourses = this.enrolledCourses || [];
    if (layoutName !== ContentCard.LAYOUT_INPROGRESS) {
      retiredBatches = this.enrolledCourses.filter((element) => {
        if (element.contentId === content.identifier && element.batch.status === 1 && element.cProgress !== 100) {
          anyRunningBatch = true;
          content.batch = element.batch;
        }
        if (element.contentId === content.identifier && element.batch.status === 2 && element.cProgress !== 100) {
          return element;
        }
      });
    }
    if (anyRunningBatch || !retiredBatches.length) {
      // open the batch directly
      this.navigateToDetailPage(content, layoutName);
    } else if (retiredBatches.length) {
      this.navigateToBatchListPopup(content, layoutName, retiredBatches);
    }
  }

  async navigateToBatchListPopup(content: any, layoutName?: string, retiredBatched?: any) {
    const ongoingBatches = [];
    const upcommingBatches = [];
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

    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (!this.guestUser) {
        this.courseService.getCourseBatches(courseBatchesRequest).toPromise()
          .then((data: any) => {
            this.zone.run(async () => {
              this.batches = data;
              if (this.batches.length) {
                this.batches.forEach((batch, key) => {
                    if (batch.status === 1) {
                      ongoingBatches.push(batch);
                    } else {
                      upcommingBatches.push(batch);
                    }
                });
                this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                  'showing-enrolled-ongoing-batch-popup',
                  Environment.HOME,
                  PageId.CONTENT_DETAIL, undefined,
                  reqvalues);
                await this.loader.dismiss();
                const popover = await this.popoverCtrl.create({
                  component: EnrollmentDetailsComponent,
                  componentProps: {
                    upcommingBatches,
                    ongoingBatches,
                    retiredBatched,
                    courseId: content.identifier
                  },
                  cssClass: 'enrollement-popover'
                });
                await popover.present();
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
        this.router.navigate([RouterLinks.COURSE_BATCHES]);
      }
    } else {
      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
  }

  /**
   * Navigate to the course/content details page
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

    const corRelationList: Array<CorrelationData> = [{
      id: this.sectionName,
      type: CorReleationDataType.SECTION
    }, {
      id: identifier,
      type: CorReleationDataType.ROOT_ID
    }];
    if (this.isFilterApplied) {
     corRelationList.push({
       id: 'filter',
       type: CorReleationDataType.DISCOVERY_TYPE
     });
   }
    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      this.env,
      this.pageName ? this.pageName : this.layoutName,
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      this.commonUtilService.deDupe(corRelationList, 'type'));
    if (this.loader) {
      await this.loader.dismiss();
    }
    if (layoutName === this.layoutInProgress || content.contentType === ContentType.COURSE) {
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
        state: {
          content,
          isCourse: true,
          corRelation: corRelationList
        }
      });
    } else if (content.mimeType === MimeType.COLLECTION) {
      this.router.navigate([RouterLinks.COLLECTION_DETAILS], {
        state: {
          content,
          corRelation: corRelationList
        }
      });
    } else {
      this.router.navigate([RouterLinks.CONTENT_DETAILS], {
        state: {
          content,
          isCourse: true,
          corRelation: corRelationList
        }
      });
    }
  }


  async resumeCourse(content: any) {
    const identifier = content.contentId || content.identifier;
    const telemetryObject: TelemetryObject = new TelemetryObject(identifier, ContentType.COURSE, content.pkgVersion);
    const values = new Map();
    values['sectionName'] = this.sectionName;
    values['positionClicked'] = this.index;

    const corRelationList: Array<CorrelationData> = [{
      id: this.sectionName,
      type: CorReleationDataType.SECTION
    }, {
      id: identifier,
      type: CorReleationDataType.ROOT_ID
    }];

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.RESUME_CLICKED,
      this.env,
      this.pageName ? this.pageName : this.layoutName,
      telemetryObject,
      values,
      ContentUtil.generateRollUp(undefined, identifier),
      this.commonUtilService.deDupe(corRelationList, 'type'));
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
            content
          });
        } else {
          this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
            state: {
              content,
              isCourse: true
            }
          });
        }
      });
  }

  ngOnInit() {
    if (this.layoutName === this.layoutInProgress) {
      this.course.cProgress = this.course.completionPercentage;
      this.batchExp = this.course.batch && this.course.batch.status === 2;
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

