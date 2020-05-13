import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-curriculum-courses',
  templateUrl: './curriculum-courses.page.html',
  styleUrls: ['./curriculum-courses.page.scss'],
})
export class CurriculumCoursesPage implements OnInit {

  subjectName: string;
  courseList: [];

  constructor(
    private appHeaderService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.subjectName = extrasState.subjectName;
    this.courseList = extrasState.curriculumCourseList;
   }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  ngOnInit() {
  }

  getContentImg(content) {
    const img = this.commonUtilService.getContentImg(content);
    return img;
  }

  openCourseDetails(course) {

  }

}
