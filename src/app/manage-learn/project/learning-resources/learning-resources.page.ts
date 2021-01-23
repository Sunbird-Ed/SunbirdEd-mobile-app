import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHeaderService } from "@app/services";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService, ToastService } from "../../core";
import { DbService } from "../../core/services/db.service";
import { UtilsService } from "../../core/services/utils.service";
import { ContentDetailRequest, ContentService, Content } from 'sunbird-sdk';
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
    private contentService: ContentService
    // private openResources: OpenResourcesService
  ) {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_LEARNING_RESOURCES"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data["FRMELEMNTS_LBL_LEARNING_RESOURCES"];
    this.headerService.updatePageConfig(this._headerConfig);

    routerparam.params.subscribe((param) => {
      this.projectId = param.id;
      this.taskId = param.taskId;
      this.getProjectFromLocal(this.projectId);
    });
  }

  ngOnInit() { }
  getProjectFromLocal(projectId) {
    this.loader.startLoader();
    this.db.createPouchDB(environment.db.projects);
    this.db.query({ _id: projectId }).then(
      (success) => {
        console.log(success, "success 67");
        // this.db.getById(projectId).then(success => {
        this.loader.stopLoader();
        this.list = success.docs[0];
        console.log(this.list, "this.list 70");
        if (this.taskId) {
          console.log(this.taskId, "this.taskId");
          // to show  learnign resources of task
          this.list = this.list.tasks.filter((t) => t._id == this.taskId)[0];
          console.log(this.list, "this.list");
        }
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }
  openBodh(link) {
    console.log(link, "link");
    let identifier = link.split("/").pop();
    console.log(identifier, "identifier");
    const req: ContentDetailRequest = {
      contentId: identifier,
      attachFeedback: false,
      attachContentAccess: false,
      emitUpdateIfAny: false
    };
    this.contentService.getContentDetails(req).toPromise()
      .then(async (data: Content) => {
        if (data) {
          console.log(data, "data 98");
          if (data.contentData.size) {
            console.log(data.contentData.size, "data.contentData.size");
          }
        } else {
        }

      })
      .catch(async (error: any) => {
        if (error.hasOwnProperty('CONNECTION_ERROR')) {
          console.log('CONNECTION_ERROR');
          // this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
        } else if (error.hasOwnProperty('SERVER_ERROR') || error.hasOwnProperty('SERVER_AUTH_ERROR')) {
          // this.commonUtilService.showToast('ERROR_FETCHING_DATA');
          console.log('ERROR_FETCHING_DATA');
        } else {
          console.log('ERROR_CONTENT_NOT_AVAILABLE');
          // this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
        }
        // this.location.back();
      });
  }
}
