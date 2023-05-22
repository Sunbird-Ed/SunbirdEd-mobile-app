import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { Environment, PageId } from '../../../services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, GroupActivityDataAggregationRequest, GroupService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { CsGroupActivityAggregationMetric, CsGroupActivityDataAggregation } from '@project-sunbird/client-services/services/group/activity';
import { Interval } from '../../../pipes/date-ago/date-ago.pipe';
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

    loggedinUser;
    group
    corRelationList
    month = Interval.MONTH

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

    async ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        await this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        await this.getActvityDetails()
    }

    getDashletData() {
        this.groupService.activityService.getDataForDashlets(this.hierarchyData.children, this.aggData).subscribe((data) => {
            data.rows.forEach(element => {
				let columnNames = data.columns.map(function(item) {
					return item['data'];
				});
				if(Object.keys(element).length !== columnNames.length && Object.keys(element).length < columnNames.length) {
					columnNames.forEach(key => {
						if(element[key] == undefined) {
							element[key] = 'NA';
						}
					});
				}
            });
            this.dashletData = data;
            this.getActivityAggLastUpdatedOn()
        })
    }

    async getActvityDetails() {
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
        if($event.name === 'back')
        {
        this.handleBackButton(true);
        }
    }

}
