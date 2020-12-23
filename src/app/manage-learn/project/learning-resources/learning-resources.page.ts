import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHeaderService } from "@app/services";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService, ToastService } from "../../core";
import { DbService } from "../../core/services/db.service";
import { UtilsService } from "../../core/services/utils.service";

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

  ngOnInit() {}
  getProjectFromLocal(projectId) {
    this.loader.startLoader();
    this.db.createPouchDB(environment.db.projects);
    this.db.query({ _id: projectId }).then(
      (success) => {
        // this.db.getById(id).then(success => {
        this.loader.stopLoader();
        this.list = this.utils.getProjectData();
        if (this.taskId) {
          // to show  learnign resources of task
          this.list = this.list.tasks.filter((t) => t._id == this.taskId)[0];
        }
        console.log(this.list, "learningResources");
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }
  openBodh(link) {
    console.log(link, "link");
    // this.networkService.isNetworkAvailable
    //   ? this.openResources.openBodh(link)
    //   : this.toast.showMessage("MESSAGES.OFFLINE", "danger");
  }
}
