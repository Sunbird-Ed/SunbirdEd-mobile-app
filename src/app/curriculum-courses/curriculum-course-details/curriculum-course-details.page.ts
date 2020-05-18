import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import { ContentUtil } from '@app/util/content-util';
import { RouterLinks } from '@app/app/app.constant';

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
    // this.course.contentData.appIcon =
    //   this.commonUtilService.convertFileSrc(ContentUtil.getAppIcon(this.course.contentData.appIcon, this.course.basePath,
    //     this.commonUtilService.networkInfo.isNetworkAvailable));
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  openChapterDetails(event) {
    const chapterParams: NavigationExtras = {
      state: {
        courseName: this.course.name,
        chapterData: event.item,
      }
    };

    this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CHAPTER_DETAILS}`],
      chapterParams);
  }

}
