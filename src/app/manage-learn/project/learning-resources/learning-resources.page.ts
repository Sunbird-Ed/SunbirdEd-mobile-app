import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "@app/environments/environment";
import { AppHeaderService } from "@app/services";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { NetworkService } from "../../core/services/network.service";

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
    private networkService: NetworkService,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    // private loader: LoaderService,
    // private toast: ToastMessageService,
    // private db: DbService,
    // private openResources: OpenResourcesService
  ) {
    let data;
    this.translate.get(["LABELS_LEARNING_RESOURCES"]).subscribe((text) => {
      data = text;
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this._headerConfig.pageTitle = data["LABELS_LEARNING_RESOURCES"];
    this.headerService.updatePageConfig(this._headerConfig);

    routerparam.params.subscribe((param) => {
      this.projectId = param.id;
      this.taskId = param.taskId;
      console.log(this.projectId, " this.projectId");
      console.log(this.taskId, " this.taskId");
      this.getProjectFromLocal(this.projectId);
    });
  }

  ngOnInit() {}
  getProjectFromLocal(projectId) {
    // this.loader.startLoader();
    // this.db.createPouchDB(environment.db.projects);
    // this.db.query({ _id: projectId }).then(
    //   (success) => {
        // this.db.getById(id).then(success => {
        // this.loader.stopLoader();
        this.list = {"userId":"01c04166-a65e-4e92-a87b-a9e4194e771d","status":"inProgress","isDeleted":false,"categories":[{"value":"5fc48155b9335656a106c06a","label":"Infrastructure"}],"tasks":[{"_id":"99eeb137-8192-4055-a67c-a76d4abb6724","createdBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"assessment","solutionDetails":{"type":"assessment","subType":"institutional","_id":"5d282bbcc1e91c71b6c025e3","isReusable":true,"externalId":"Apple-Assessment-Framework-2018-001-TEMPLATE","name":"Apple Assessment Framework 2018-001"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH ASSESSMENT1","externalId":"REJNEESH-ASSESSMENT1","description":"Task-1 Description","updatedAt":"2020-11-30T16:39:11.575Z","createdAt":"2020-11-30T16:37:58.024Z","__v":0,"status":"completed","isImportedFromLibrary":true,"lastSync":"2020-11-30T16:39:11.575Z","submissionDetails":{"entityId":"5beaa888af0065f0e0a10515","programId":"5fc5202fbba21c7039176ad1","solutionId":"5fc65d3b4599086818390ce0","_id":"5fc65ea84599086818390ce2"}},{"_id":"88047312-ac12-4c7e-b004-03e671e324e7","createdBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"observation","solutionDetails":{"type":"observation","subType":"school","_id":"5f1c5be0499e7a357a6c27f6","isReusable":true,"externalId":"CRO-2019","name":"Classroom Observations Form"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH OBSERVATION1","externalId":"REJNEESH-OBSERVATION1","description":"Task-2 Description","updatedAt":"2020-11-30T16:39:11.575Z","createdAt":"2020-11-30T16:37:58.029Z","__v":0,"status":"completed","isImportedFromLibrary":true,"lastSync":"2020-11-30T16:39:11.575Z"},{"_id":"21945027-79a7-46f5-ac8f-b46448613fa0","createdBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"assessment","solutionDetails":{"type":"assessment","subType":"institutional","_id":"5b98fa069f664f7e1ae7498c","isReusable":false,"externalId":"EF-DCPCR-2018-001","name":"DCPCR Assessment Framework 2018"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH ASSESSMENT2","externalId":"REJNEESH-ASSESSMENT2","description":"Task-3 Description","updatedAt":"2020-11-30T16:39:11.575Z","createdAt":"2020-11-30T16:37:58.032Z","__v":0,"status":"notStarted","isImportedFromLibrary":true,"lastSync":"2020-11-30T16:39:11.575Z"},{"_id":"308937fd-1d16-4c4f-8ff2-81de85cd2fd5","createdBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","updatedBy":"01c04166-a65e-4e92-a87b-a9e4194e771d","isDeleted":false,"isDeleteable":false,"taskSequence":[],"children":[],"visibleIf":[],"hasSubTasks":false,"learningResources":[],"deleted":false,"type":"observation","solutionDetails":{"type":"observation","subType":"school","_id":"5d282bbcc1e91c71b6c025e6","isReusable":false,"externalId":"CRO-2019-TEMPLATE","name":"Classroom Observations Form"},"projectTemplateId":"5fc4f056ed1ae1783770692f","name":"REJNEESH OBSERVATION2","externalId":"REJNEESH-OBSERVATION2","description":"Task-2 Description","updatedAt":"2020-11-30T16:39:11.575Z","createdAt":"2020-11-30T16:37:58.036Z","__v":0,"status":"notStarted","isImportedFromLibrary":true,"lastSync":"2020-11-30T16:39:11.575Z"}],"learningResources":[{"name":"Copy Feature","link":"https://dev.bodh.shikshalokam.org/resources/play/content/do_113059727462957056137","app":"bodh","id":"do_113059727462957056137"}],"deleted":false,"title":"AMAN-TEST","description":"improving community library","updatedAt":"2020-12-01T15:23:21.504Z","createdAt":"2020-11-30T13:15:02.824Z","lastDownloadedAt":"2020-12-11T04:10:37.799Z","lastSync":"2020-12-01T15:23:21.502Z","entityId":"5beaa888af0065f0e0a10515","entityName":"Apple School","programId":"5fc5202fbba21c7039176ad1","programName":"Test program","rationale":"","primaryAudience":["teachers","head master"],"_id":"5fc5202fc41bcb045f23e3cb","_rev":"1-23b3dfe1690881e96354f3c67f1cdd6e"};
        if (this.taskId) {
          // to show  learnign resources of task
          this.list = this.list.tasks.filter((t) => t._id == this.taskId)[0];
        }
        console.log(this.list, "learningResources");
    //   },
    //   (error) => {
    //     this.loader.stopLoader();
    //   }
    // );
  }
  openBodh(link) {
    console.log(link, "link");
    // this.networkService.isNetworkAvailable
    //   ? this.openResources.openBodh(link)
    //   : this.toast.showMessage("MESSAGES.OFFLINE", "danger");
  }
}
