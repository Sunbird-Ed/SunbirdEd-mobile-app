import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import { CommonUtilService, PageId, Environment, AppHeaderService, ImpressionType, TelemetryGeneratorService } from '@app/services';
import { GroupService, GroupActivityDataAggregationRequest, GroupActivity } from '@project-sunbird/sunbird-sdk';
import { CsGroupActivityDataAggregation } from '@project-sunbird/client-services/services/group/activity';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit {

  headerObservable: any;
  unregisterBackButton: Subscription;
  searchMember = '';
  timeStamp = '';
  memberList: any;
  filteredMemberList: any;
  searchValue: string;
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
    this.memberList = extras.memberList;
    this.filteredMemberList = [...this.memberList];
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

  getActvityDetails() {
    const req: GroupActivityDataAggregationRequest = {
      groupId: this.groupId,
      activity: this.activity
    };
    this.groupService.activityService.getDataAggregation(req).toPromise()
    .then((res: CsGroupActivityDataAggregation) => {
      console.log('getDataAggregation', res);
    }).catch((err) => {
      console.log(' CsGroupActivityDataAggregation err', err );
    });
  }

  onSearch(searchText) {
    this.searchValue = searchText;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'title', searchText)];
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
