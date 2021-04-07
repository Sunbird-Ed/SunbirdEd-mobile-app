import { Component, OnInit, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHeaderService } from "@app/services";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService, ToastService } from "../../core";
import { DbService } from "../../core/services/db.service";
import { UtilsService } from "../../core/services/utils.service";
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
var environment = {
  db: {
    projects: "project.db",
    categories: "categories.db",
  },
  deepLinkAppsUrl: ''
};

@Component({
  selector: "app-learning-resources",
  templateUrl: "./learning-resources.page.html",
  styleUrls: ["./learning-resources.page.scss"],
})
export class LearningResourcesPage implements OnInit {
  projectId;
  taskId: any;
  list;
  private backButtonFunc: Subscription;
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [] as string[]
  };

  constructor(
    private routerparam: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private utils: UtilsService,
    private loader: LoaderService,
    private toast: ToastService,
    private db: DbService,
    private navigateService: NavigationService,
    private platform: Platform,
    private location: Location,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
    // private openResources: OpenResourcesService
  ) {
    let data;
    routerparam.params.subscribe((param) => {
      this.projectId = param.id;
      this.taskId = param.taskId;
      this.getProjectFromLocal(this.projectId);
    });
  }

  ngOnInit() { }


  ionViewWillEnter() {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_LEARNING_RESOURCES"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showHeader = true;
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle =  data["FRMELEMNTS_LBL_LEARNING_RESOURCES"];
    this.headerService.updatePageConfig(this._headerConfig);
    this.handleBackButton();
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
  getProjectFromLocal(projectId) {
    // this.loader.startLoader();
    this.db.query({ _id: projectId }).then(
      (success) => {
        // this.loader.stopLoader();
        this.list = success.docs.length ? success.docs[0] : [];
        if (this.taskId) {
          this.list = this.list.tasks.filter((t) => t._id == this.taskId)[0];
        }
      },
      (error) => {
        // this.loader.stopLoader();
      }
    );
  }
  openBodh(id) {
    // let identifier = link.split("/").pop();
    const req: ContentDetailRequest = {
      contentId: id,
      attachFeedback: false,
      attachContentAccess: false,
      emitUpdateIfAny: false
    };

    this.contentService.getContentDetails(req).toPromise()
      .then(async (data: Content) => {
        this.navigateService.navigateToDetailPage(data, { content: data });
      });
  }
}
