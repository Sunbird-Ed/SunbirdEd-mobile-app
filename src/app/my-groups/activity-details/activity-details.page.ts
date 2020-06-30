import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit {

  timeStamp = '';
  memberList: any;

  constructor(
    private router: Router,
    private commonUtilService: CommonUtilService,
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.memberList = extras.memberList;
    console.log('memberList', this.memberList);
  }

  ngOnInit() {
  }

  onSearch(text) {
    console.log('onsearch', text);
  }

}
