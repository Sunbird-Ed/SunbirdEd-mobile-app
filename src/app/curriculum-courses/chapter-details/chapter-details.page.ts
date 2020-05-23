import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TocCardType } from '@project-sunbird/common-consumption';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.page.html',
  styleUrls: ['./chapter-details.page.scss'],
})
export class ChapterDetailsPage implements OnInit {

  courseName: string;
  chapter: any;
  cardType: TocCardType = TocCardType.COURSE;

  constructor(
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.courseName = extrasState.courseName;
    this.chapter = extrasState.chapterData;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  startLearning() {

  }

  async showOverflowMenu(event) {
  }

  onTocCardClick(event) {
    console.log('onTocCardClick', event);
  }

}
