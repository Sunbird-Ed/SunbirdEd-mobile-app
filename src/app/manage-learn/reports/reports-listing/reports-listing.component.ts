import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Router} from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-reports-listing',
  templateUrl: './reports-listing.component.html',
  styleUrls: ['./reports-listing.component.scss'],
})
export class ReportsListingComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };

  reportsArray = [
    {
      title: 'FRMELEMNTS_LBL_OBSERVATION_REPORTS',
      subTitle: 'FRMELEMNTS_LBL_OBSERVATION_REPORTS_DEC',
      link:`${RouterLinks.REPORTS}/${RouterLinks.OBSERVATION_SOLUTION_LISTING}`
      // link: RouterLinks.OBSERVATION,
    },
    {
      title: 'FRMELEMNTS_LBL_SURVEY_REPORTS',
      subTitle: 'FRMELEMNTS_LBL_SURVEY_REPORTS_DESC',
      link: RouterLinks.SURVEY,
    },
    {
      title: 'FRMELEMNTS_LBL_IMPROVEMENT_REPORTS',
      subTitle: 'FRMELEMNTS_LBL_IMPROVEMENT_REPORTS_DESC',
      link: RouterLinks.PROJECT_REPORT,
    },
  ];

  constructor(
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private router: Router
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  handleNavBackButton() {
    this.location.back();
  }
  onReportClick(item) {
    if (item.link != "survey") {
      this.router.navigate([item.link]);
      return;
    }

    const extras = {
      state: {
        data: {
          report: true,
        },
      },
    };
    this.router.navigate([item.link],extras);
 }
}
