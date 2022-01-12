import { Component } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../../core';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.page.html',
  styleUrls: ['./project-edit.page.scss'],
})
export class ProjectEditPage {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: []
  };

  projectId;
  project;
  constructor(
    private router: Router,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private translate: TranslateService,
    private db: DbService,
    private params: ActivatedRoute
  ) {
    params.params.subscribe((parameters) => {
      this.projectId = parameters.id;
      this.getProject();
    });
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

  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        this.project = success.docs.length ? success.docs[0] : {}
      })
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
