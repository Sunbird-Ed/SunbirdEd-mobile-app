import {
  Component, OnInit,
  Inject, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {
  CommonUtilService, PageId, Environment, AppHeaderService,
  ImpressionType, TelemetryGeneratorService,
  CollectionService, AppGlobalService
} from '@app/services';
import {
  GroupService, GroupActivityDataAggregationRequest,
  GroupActivity, GroupMember,
  CachedItemRequestSourceFrom, Content,
  Group, MimeType, CorrelationData
} from '@project-sunbird/sunbird-sdk';
import {
  CsGroupActivityDataAggregation,
  CsGroupActivityAggregationMetric
} from '@project-sunbird/client-services/services/group/activity';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ContentType, RouterLinks } from './../../app.constant';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit, OnDestroy {

  corRelationList: Array<CorrelationData>;
  isActivityLoading = false;
  loggedinUser: GroupMember;
  headerObservable: any;
  unregisterBackButton: Subscription;
  searchMember = '';
  memberList: any;
  activityDetail: any;
  filteredMemberList: any;
  memberSearchQuery: string;
  group: Group;
  activity: any;
  courseList = [];
  showCourseDropdownSection = false;
  selectedCourse;
  courseData: Content;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private headerService: AppHeaderService,
    private router: Router,
    private filterPipe: FilterPipe,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform,
    private collectionService: CollectionService,
    private appGlobalService: AppGlobalService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.loggedinUser = extras.loggedinUser;
    this.group = extras.group;
    this.activity = extras.activity;
    this.corRelationList = extras.corRelation;
  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '', PageId.ACTIVITY_DETAIL, Environment.GROUP,
      undefined, undefined, undefined, undefined, this.corRelationList);
  }

  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    this.courseList = [];
    try {
      this.courseData = await this.collectionService.fetchCollectionData(this.activity.identifier);
      this.getNestedCourses(this.courseData.children);
      if (this.courseList.length) {
        this.showCourseDropdownSection = true;
      }
    } catch (err) {
      console.log('fetchCollectionData err', err);
    }
    this.selectedCourse = this.courseList.find((s) => s.identifier === this.appGlobalService.selectedActivityCourseId) || '';
    this.getActvityDetails(this.appGlobalService.selectedActivityCourseId || this.activity.identifier);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.appGlobalService.selectedActivityCourseId = '';
  }

  private async getActvityDetails(id) {
    const req: GroupActivityDataAggregationRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      groupId: this.group.id,
      activity: {
        id,
        type: this.activity.type
      },
      mergeGroup: this.group
    };
    if (this.selectedCourse) {
      req.leafNodesCount = this.selectedCourse.contentData.leafNodes.length;
    } else {
      req.leafNodesCount = this.courseData.contentData.leafNodes.length;
    }
    try {
      this.isActivityLoading = true;
      const response: CsGroupActivityDataAggregation = await this.groupService.activityService.getDataAggregation(req).toPromise();
      if (response) {
        this.memberList = response.members;
        this.activityDetail = response.activity;
        const loggedInUserId = this.loggedinUser.userId;
        if (this.memberList) {
          this.memberList = this.memberList.sort((a, b) => {
            if (a.userId === loggedInUserId) {
              return -1;
            } else if (b.userId === loggedInUserId) {
              return 1;
            }
            const aCompletedCount = a.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.COMPLETED_COUNT);
            const bCompletedCount = b.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.COMPLETED_COUNT);
            if (!aCompletedCount && !bCompletedCount) {
              return 0;
            }
            if (!aCompletedCount && bCompletedCount) {
              return 1;
            } else if (aCompletedCount && !bCompletedCount) {
              return -1;
            }
            return bCompletedCount!.value - aCompletedCount!.value;
          });
        }
        this.filteredMemberList = new Array(...this.memberList);
        this.isActivityLoading = false;
      }
    } catch (e) {
      console.log(' CsGroupActivityDataAggregation err', e);
      this.isActivityLoading = false;
    }
  }

  onMemberSearch(query) {
    this.memberSearchQuery = query;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'name', query)];
  }

  getMemberName(member) {
    let memberName = member.name;
    if (this.loggedinUser.userId === member.userId) {
      memberName = this.commonUtilService.translateMessage('LOGGED_IN_MEMBER', { member_name: member.name });
    }
    return memberName;
  }

  getMemberProgress(member) {
    let progress = 0;
    if (member.agg) {
      const progressMetric = member.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.PROGRESS);
      progress = progressMetric ? progressMetric.value : 0;
    }
    return '' + progress;
  }

  getActivityAggLastUpdatedOn() {
    let lastUpdatedOn = 0;
    if (this.activityDetail && this.activityDetail.agg) {
      const activityAgg = this.activityDetail.agg.find(a => a.metric === CsGroupActivityAggregationMetric.ENROLMENT_COUNT);
      if (activityAgg && activityAgg.lastUpdatedOn) {
        lastUpdatedOn = typeof activityAgg.lastUpdatedOn === 'string' ? parseInt(activityAgg.lastUpdatedOn, 10) : activityAgg.lastUpdatedOn;
      }
    }
    return lastUpdatedOn;
  }

  private getNestedCourses(courseData) {
    courseData.forEach(c => {
      if ((c.mimeType === MimeType.COLLECTION) && (c.contentType.toLowerCase() === ContentType.COURSE.toLowerCase())) {
        this.courseList.push(c);
      }
      if (c.children && c.children.length) {
        this.getNestedCourses(c.children);
      }
    });
  }

  openActivityToc() {
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}/${RouterLinks.ACTIVITY_TOC}`],
      {
        state: {
          courseList: this.courseList,
          mainCourseName: this.activity.name
        }
      });
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_DETAIL,
      Environment.GROUP, isNavBack, undefined, this.corRelationList);
    this.location.back();
  }

}
