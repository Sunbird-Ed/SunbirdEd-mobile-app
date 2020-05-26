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
  subjectIcon: string;
  courseList: [];
  theme: string;
  titleColor: string;

  constructor(
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.subjectName = extrasState.subjectName;
    this.subjectIcon = extrasState.subjectIcon;
    this.courseList = extrasState.curriculumCourseList;
    this.theme = extrasState.theme;
    this.titleColor = extrasState.titleColor;
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

  // openCourseDetails(course) {
  //   const curriculumCourseParams: NavigationExtras = {
  //     state: {
  //       curriculumCourse: course,
  //     }
  //   };

  //   this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CURRICULUM_COURSE_DETAILS}`],
  //     curriculumCourseParams);
  // }

  openCourseDetails(course) {
    // const contentIndex = this.getContentIndexOf(this.popularAndLatestCourses[index].contents, event.data);
    const params = {
      env: 'home',
      // index: contentIndex,
      // sectionName: event.data.name,
      // pageName: 'course',
      course,
      // guestUser: this.guestUser,
      // layoutName: this.layoutPopular,
      // enrolledCourses: this.enrolledCourses,
      // isFilterApplied: this.isFilterApplied
    };
    // this.checkRetiredOpenBatch(params.course, params);

    this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
      state: {
        content: course,
        isCourse: true,
        // corRelation: corRelationList
      }
    });
  }

}
