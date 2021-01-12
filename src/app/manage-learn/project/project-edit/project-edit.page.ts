import { Component, OnInit } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.page.html',
  styleUrls: ['./project-edit.page.scss'],
})
export class ProjectEditPage implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: []
  };
  project = {
    categories: [],
    createdAt: "2019-09-13T11:45:21.000Z",
    deleted: false,
    description: "Enabling student leadership and overall student development",
    isDeleted: false,
    isImportedFromLibrary: true,
    lastDownloadedAt: "2020-12-23T17:40:09.771Z",
    lastSync: "2020-12-05T18:15:10.363Z",
    learningResources: [],
    primaryAudience: [""],
    programExternalId: "IMP-#547-Sep-2019",
    programId: "5d7b7e68639f5817a1d73028",
    programName: "AP Imp Demo Program",
    rationale: "sample",
    solutionExternalId: "9edae470-d61a-11e9-9fbf-236864017e03",
    solutionId: "5d7b7f0f2550177ef7f08c73",
    status: "notStarted",
    syncedAt: "2020-02-27T10:07:29.000Z",
    taskSequence: [],
    tasks: [],
    title: "Talent Day",
    updatedAt: "2020-12-05T18:15:10.368Z",
    userId: "4267621e-903e-4934-8ed7-38121a4e3c99",
    _id: "5fc54221cce64916855f6b84",
    _rev: "1-3718fdc86e773e7d7c7c5be38b294214"
  };
  constructor(
    private router: Router,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_PROJECT_VIEW"]).subscribe((text) => {
      data = text;
    });
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = data["FRMELEMNTS_LBL_PROJECT_VIEW"];
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
  edit(type) {
    type == "metaData" ?
      this.router.navigate([`${RouterLinks.CREATE_PROJECT_PAGE}`], {
        queryParams: {
          projectId: this.project._id, type: type
        }
      }) :
      this.router.navigate([`${RouterLinks.PROJECT_OPERATION_PAGE}`, this.project._id], { queryParams: { availableInLocal: true, isEdit: true } });
  }
}
