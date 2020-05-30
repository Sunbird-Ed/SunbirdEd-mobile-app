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

  isLoading = true;
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
    if (this.appGlobalService.isUserLoggedIn()) {
      console.log('ngOnInit: true');
      // TODO: get the current userId
      const sessionObj = this.appGlobalService.getSessionData();
      const userId = sessionObj[ProfileConstants.USER_TOKEN];
      try {
        this.enrolledCourses = await this.getEnrolledCourses(userId);
      } catch (error) {
        console.error('CurriculumCoursesPage', error);
      }
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
    return this.courseService.getEnrolledCourses(enrolledCourseRequest).toPromise();
  }

  private mergeCourseList(enrolledCourses, courseList) {
    this.mergedCourseList = courseList.map((course) => {
      const enrolledCourse = enrolledCourses.find(c => c.courseId === course.identifier);
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
