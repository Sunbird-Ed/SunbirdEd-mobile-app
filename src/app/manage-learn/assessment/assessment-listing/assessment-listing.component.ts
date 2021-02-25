import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../core';

@Component({
  selector: 'app-assessment-listing',
  templateUrl: './assessment-listing.component.html',
  styleUrls: ['./assessment-listing.component.scss'],
})
export class AssessmentListingComponent implements OnInit {
  count: any;
  assessmentList: any[];
  constructor(public httpClient: HttpClient, public loader: LoaderService) {}

  ngOnInit() {
    this.assessmentList = [];
    this.getList();
  }

  getList() {
    this.loader.startLoader();
    this.httpClient.get('assets/dummy/assessment-list.json').subscribe(
      (success: any) => {
        this.loader.stopLoader();
        console.log(success);
        if (success && success.result && success.result.data) {
          this.count = success.result.count;

          this.assessmentList = [...this.assessmentList, ...success.result.data];
        }
      },
      (error) => {
        this.assessmentList = [];
        this.loader.stopLoader();
      }
    );
  }
}
