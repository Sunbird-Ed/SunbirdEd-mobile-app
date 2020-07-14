import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {CommonUtilService, Environment, ImpressionType, PageId, TelemetryGeneratorService} from '@app/services';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit {

  searchMember = '';
  timeStamp = '';
  memberList: any;
  filteredMemberList: any;
  searchValue: string;
  constructor(
    private router: Router,
    private filterPipe: FilterPipe,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.memberList = extras.memberList;
    this.filteredMemberList = [...this.memberList];
  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
        '',
        PageId.ACTIVITY_DETAIL,
        Environment.GROUP);
  }

  onSearch(searchText) {
    this.searchValue = searchText;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'title', searchText)];
  }

}
