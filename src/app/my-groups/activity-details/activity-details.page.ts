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
  CachedItemRequestSourceFrom, GroupMemberRole
} from '@project-sunbird/sunbird-sdk';
import { CsGroupActivityDataAggregation } from '@project-sunbird/client-services/services/group/activity';
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
  groupId: string;
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
    this.groupId = extras.groupId;
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
      groupId: this.groupId,
      activity: {
        id: this.activity.id,
        type: this.activity.type
      }
    };

    try {
      this.isActivityLoading = true;
      const response: CsGroupActivityDataAggregation = await this.groupService.activityService.getDataAggregation(req).toPromise();
      console.log('getDataAggregation', response);
      if (response) {
        this.memberList = response.members;
        this.activityDetail = response.activity;

        if (this.memberList) {
          this.memberList.sort((a, b) => {
            if (b.userId === this.loggedinUser.userId) {
              return 1;
            } else if (a.userId === this.loggedinUser.userId) {
              return -1;
            }
            if (b.role === GroupMemberRole.ADMIN && a.role === GroupMemberRole.MEMBER) {
              return 1;
            } else if (b.role === GroupMemberRole.MEMBER && a.role === GroupMemberRole.ADMIN) {
              return -1;
            }
            return a.name.localeCompare(b.name);
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
    console.log('onMemberSearch', query);
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
