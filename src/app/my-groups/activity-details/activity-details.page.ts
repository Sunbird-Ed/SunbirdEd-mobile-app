import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {
  CommonUtilService, PageId, Environment, AppHeaderService,
  ImpressionType, TelemetryGeneratorService
} from '@app/services';
import {
  GroupService, GroupActivityDataAggregationRequest,
  GroupActivity, GroupMember,
  CachedItemRequestSourceFrom, GroupMemberRole, Group
} from '@project-sunbird/sunbird-sdk';
import { CsGroupActivityDataAggregation, CsGroupActivityAggregationMetric } from '@project-sunbird/client-services/services/group/activity';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit {

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
  activity: GroupActivity;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private headerService: AppHeaderService,
    private router: Router,
    private filterPipe: FilterPipe,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform,
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.loggedinUser = extras.loggedinUser;
    this.group = extras.group;
    this.activity = extras.activity;
  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
      '',
      PageId.ACTIVITY_DETAIL,
      Environment.GROUP);
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    this.getActvityDetails();
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  private async getActvityDetails() {
    const req: GroupActivityDataAggregationRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      groupId: this.group.id,
      activity: {
        id: this.activity.id,
        type: this.activity.type
      },
      mergeGroup: this.group
    };

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

  calulateProgress(member) {
    let progress = 0;
    if (member.agg && member.agg.length) {
      const memberAgg = member.agg.find(a => a.metric === CsGroupActivityAggregationMetric.COMPLETED_COUNT);
      const activityAgg = this.activityDetail.agg.find(a => a.metric === CsGroupActivityAggregationMetric.LEAF_NODES_COUNT);
      if (activityAgg && activityAgg.value > 0) {
        progress = Math.floor((memberAgg.value / activityAgg.value) * 100);
      }
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
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.GROUP_DETAIL, Environment.GROUP, isNavBack);
    this.location.back();
  }

}
