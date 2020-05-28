import { Component, OnInit, Inject } from '@angular/core';
import { AppHeaderService, CommonUtilService, AppGlobalService } from '@app/services';
import { Router } from '@angular/router';
import { RouterLinks, ProfileConstants } from '../app.constant';
import { TranslateService } from '@ngx-translate/core';
import { FetchEnrolledCourseRequest, CourseService, Course } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-curriculum-courses',
  templateUrl: './curriculum-courses.page.html',
  styleUrls: ['./curriculum-courses.page.scss'],
})
export class CurriculumCoursesPage implements OnInit {

  isLoading = false;
  subjectName: string;
  subjectIcon: string;
  courseList: [];
  theme: string;
  titleColor: string;
  enrolledCourses: Array<Course> = [];
  mergedCourseList: [];

  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private appHeaderService: AppHeaderService,
    private appGlobalService: AppGlobalService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.subjectName = extrasState.subjectName;
    this.subjectIcon = extrasState.subjectIcon;
    this.courseList = extrasState.courseList;
    this.theme = extrasState.theme;
    this.titleColor = extrasState.titleColor;
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  async ngOnInit() {
    this.isLoading = true;
    if (this.appGlobalService.isUserLoggedIn()) {
      // TODO: get the current userId
      const sessionObj = this.appGlobalService.getSessionData();
      const userId = sessionObj[ProfileConstants.USER_TOKEN];
      await this.getEnrolledCourses(userId);
    }

    this.mergeCourseList(this.enrolledCourses, this.courseList);
    this.isLoading = false;
  }

  openCourseDetails(course) {
    // this.checkRetiredOpenBatch(params.course, params);

    this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
      state: {
        content: course,
      }
    });
  }

  async getEnrolledCourses(userId: string) {
    const enrolledCourseRequest: FetchEnrolledCourseRequest = {
      userId,
      returnFreshCourses: true
    };
    this.courseService.getEnrolledCourses(enrolledCourseRequest).toPromise()
      .then((enrolledCourses) => {
        this.enrolledCourses = enrolledCourses ? enrolledCourses : [];
      }, (err) => {
      });
  }

  private mergeCourseList(enrolledCourses, courseList) {
    this.mergedCourseList = courseList.map((course) => {
      const enrolledCourse = enrolledCourses.find(c => c.identifier === course.identifier);
      if (enrolledCourse) {
        return {
          ...enrolledCourse,
          cardImg: this.commonUtilService.getContentImg(enrolledCourse),
          completionPercentage: enrolledCourse.completionPercentage || 0,
          isEnrolledCourse: true
        };
      } else {
        return {
          ...course,
          appIcon: this.commonUtilService.getContentImg(course),
          isEnrolledCourse: false
        };
      }
    });
  }

}
