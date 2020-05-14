import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-curriculum-course-details',
  templateUrl: './curriculum-course-details.page.html',
  styleUrls: ['./curriculum-course-details.page.scss'],
})
export class CurriculumCourseDetailsPage implements OnInit {

  textbookName: string;
  course: any;

  constructor(
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.textbookName = extrasState.textbookName;
    this.course = extrasState.curriculumCourse;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

}
