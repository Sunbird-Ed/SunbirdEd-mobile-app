import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit {
  memberList: any;
  filteredMemberList: any;
  searchValue: string;
  constructor(
    private router: Router,
    private filterPipe: FilterPipe
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.memberList = extras.memberList;
    this.filteredMemberList = [...this.memberList];
  }

  ngOnInit() {
  }

  onSearch(searchText) {
    this.searchValue = searchText;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'title', searchText)];
  }

}
