import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, PageId } from '@app/services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, GroupActivityDataAggregationRequest, GroupService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { CsGroupActivityAggregationMetric, CsGroupActivityDataAggregation } from '@project-sunbird/client-services/services/group/activity';

@Component({
    selector: 'activity-dashboard',
    templateUrl: './activity-dashboard.page.html',
    styleUrls: ['./activity-dashboard.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ActivityDashboardPage {

    // corRelationList: Array<CorrelationData>;
    unregisterBackButton: Subscription;
    headerObservable: any;
    backButtonFunc = undefined;
    hierarchyData: any;
    aggData: any;
    dashletData: any;
    activity: any;
    lastUpdatedOn: any;
    collectionName: string;
    memberList: any;
    activityDetail: any;
    filteredMemberList: any;

    loggedinUser;
    group
    corRelationList
    isTrackable
    isGroupCreatorOrAdmin

    constructor(
        @Inject('GROUP_SERVICE') public groupService: GroupService,
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
        public commonUtilService: CommonUtilService
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.hierarchyData = extras.hierarchyData;
            this.activity = extras.activity;
            this.loggedinUser = extras.loggedinUser;
            this.group = extras.group;
            this.corRelationList = extras.corRelation;
            this.collectionName = this.hierarchyData.name;
        }
    }

    ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        this.getActvityDetails()
    }

    getDashletData() {
        this.groupService.activityService.getDataForDashlets(this.hierarchyData.children, this.aggData).subscribe((data) => {
            console.log('getDataForDashlets data new', data);
            this.dashletData = data;
            this.getActivityAggLastUpdatedOn()
        })
    }

    async getActvityDetails() {
        console.log('in getActvityDetails');
        const req: GroupActivityDataAggregationRequest = {
          from: CachedItemRequestSourceFrom.SERVER,
          groupId: this.group.id,
          activity: {
            id: this.activity.identifier,
            type: this.activity.type
          },
          mergeGroup: this.group
        };
            req.leafNodesCount = this.hierarchyData.contentData.leafNodes.length;
        
        try {
          const response: CsGroupActivityDataAggregation = await this.groupService.activityService.getDataAggregation(req).toPromise();
          if (response) {
            this.memberList = response.members;
            this.activityDetail = response.activity;
            const loggedInUserId = this.loggedinUser;
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
            this.aggData =  {
                members: this.memberList,
                activity: this.activityDetail
            }
            this.getDashletData()
          }
        } catch (e) {
          console.log(' CsGroupActivityDataAggregation err', e);
        }
    }

    getActivityAggLastUpdatedOn() {
        this.lastUpdatedOn = 0;
        if (this.activityDetail && this.activityDetail.agg) {
          const activityAgg = this.activityDetail.agg.find(a => a.metric === CsGroupActivityAggregationMetric.ENROLMENT_COUNT);
          if (activityAgg && activityAgg.lastUpdatedOn) {
            this.lastUpdatedOn = typeof activityAgg.lastUpdatedOn === 'string' ? parseInt(activityAgg.lastUpdatedOn, 10) : activityAgg.lastUpdatedOn;
          }
        }
      }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_TOC,
            Environment.GROUP, isNavBack);
        this.location.back();
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

}
