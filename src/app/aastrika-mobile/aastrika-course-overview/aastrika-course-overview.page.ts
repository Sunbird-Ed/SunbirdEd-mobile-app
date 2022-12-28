import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aastrika-course-overview',
  templateUrl: './aastrika-course-overview.page.html',
  styleUrls: ['./aastrika-course-overview.page.scss'],
})
export class AastrikaCourseOverviewPage implements OnInit {
  course: any;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    // const course = this.navParams.get('courseDetails');
    this.course = this.router.getCurrentNavigation()
  }

}
