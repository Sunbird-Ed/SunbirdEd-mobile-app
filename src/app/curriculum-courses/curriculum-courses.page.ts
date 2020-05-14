import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-curriculum-courses',
  templateUrl: './curriculum-courses.page.html',
  styleUrls: ['./curriculum-courses.page.scss'],
})
export class CurriculumCoursesPage implements OnInit {

  subjectName: string;
  courseList: [];
  theme: string;

  constructor(
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.subjectName = extrasState.subjectName;
    this.courseList = extrasState.curriculumCourseList;
    this.theme = extrasState.theme;
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
    const curriculumCourseParams: NavigationExtras = {
      state: {
        textbookName: 'TextBook Name',
        curriculumCourse: course,
      }
    };

    this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CURRICULUM_COURSE_DETAILS}`],
      curriculumCourseParams);
  }

}
