import { Component, Inject } from '@angular/core';
import { AppGlobalService } from '../../services/app-global-service.service';
import { PageId, Environment, InteractType, InteractSubtype, ImpressionType } from '../../services/telemetry-constants';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Router } from '@angular/router';
import {
  CourseService,
  Course,
  CorrelationData,
  TelemetryObject,
  GetUserEnrolledCoursesRequest,
  CachedItemRequestSourceFrom
} from '@project-sunbird/sunbird-sdk';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { AppHeaderService } from '../../services/app-header.service';
import { ContentUtil } from '../../util/content-util';
import { NavigationService } from '../../services/navigation-handler.service';

@Component({
  selector: 'app-curriculum-courses',
  templateUrl: './curriculum-courses.page.html',
  styleUrls: ['./curriculum-courses.page.scss'],
})
export class CurriculumCoursesPage {

  isLoading = true;
  subjectName: string;
  subjectIcon: string;
  courseList: [];
  theme: string;
  titleColor: string;
  enrolledCourses: Array<Course> = [];
  mergedCourseList: [];
  headerObservable: Subscription;
  backButtonFunc: Subscription;
  corRelationList: Array<CorrelationData>;
  appliedFilter;


  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private appHeaderService: AppHeaderService,
    private appGlobalService: AppGlobalService,
    private navService: NavigationService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform,
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.subjectName = extrasState.subjectName;
    this.subjectIcon = extrasState.subjectIcon;
    this.courseList = extrasState.courseList;
    this.theme = extrasState.theme;
    this.titleColor = extrasState.titleColor;
    this.corRelationList = extrasState.corRelationList;
    this.appliedFilter = extrasState.appliedFilter;
  }

  async ionViewWillEnter() {
    await this.appHeaderService.showHeaderWithBackButton();

    this.headerObservable = this.appHeaderService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COURSE_LIST, Environment.HOME, false);
      this.location.back();
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.COURSE_LIST,
      Environment.HOME
    );
    if (this.appGlobalService.isUserLoggedIn()) {
      await this.appGlobalService.getActiveProfileUid()
        .then(async (uid) => {
          try {
            this.enrolledCourses = await this.getEnrolledCourses(uid);
          } catch (error) {
            console.error('CurriculumCoursesPage', error);
          }
        });
    }

    this.mergeCourseList(this.enrolledCourses, this.courseList);
    this.isLoading = false;
  }

  ionViewWillLeave(): void {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }



  async openCourseDetails(course) {
    this.corRelationList = this.commonUtilService.deDupe(this.corRelationList, 'type');
    const telemetryObject: TelemetryObject = ContentUtil.getTelemetryObject(course);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.COURSE_LIST,
      telemetryObject,
      undefined,
      ContentUtil.generateRollUp(undefined, course.identifier),
      this.corRelationList);
    await this.navService.navigateToTrackableCollection(
      {
        content: course,
        corRelationList: this.corRelationList
      }
    );
  }

  async getEnrolledCourses(userId: string) {
    this.appliedFilter.subject = [this.subjectName];
    const enrolledCourseRequest: GetUserEnrolledCoursesRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      request: {
        userId,
        filters: this.appliedFilter
      }
    };
    return this.courseService.getUserEnrolledCourses(enrolledCourseRequest).toPromise();
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

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COURSE_LIST, Environment.HOME, true);
      this.location.back();
    }
  }
}
