import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController} from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '../../core/constants/statuses.constant';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';
import { NetworkService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { RouterLinks } from '@app/app/app.constant';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { actions } from '../../core/constants/actions.constants';

@Component({
  selector: 'app-project-templateview',
  templateUrl: './project-templateview.page.html',
  styleUrls: ['./project-templateview.page.scss'],
})
export class ProjectTemplateviewPage {
  showDetails: boolean = true;
  statuses = statuses;
  project: any;
  projectId;
  projectType = '';
  categories = [];
  isTargeted;
  taskCount: number = 0;
  filters: any = {};
  schedules = this.utils.getSchedules();
  sortedTasks;
  programId;
  solutionId;
  private backButtonFunc: Subscription;

  isNotSynced: boolean;
  locationChangeTriggered: boolean = false;
  allStrings;
  viewOnlyMode: boolean = false;
  templateId;
  templateDetailsPayload;
  importProjectClicked: boolean = false;
  fromImportProject: boolean = false;
  shareTaskId;
  networkFlag: boolean;
  id;
  private _networkSubscription: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [],
  };
  projectProgress;
  actionItems=[];
  metaData:any;
  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private router: Router,
    private utils: UtilsService,
    private translate: TranslateService,
    private network: NetworkService,
    private zone: NgZone,
    private headerService: AppHeaderService,
    private kendra: KendraApiService
  ) {

    params.params.subscribe((parameters) => {
      this.id = parameters.id;
    });
    params.queryParams.subscribe((parameters) => {
      this.isTargeted = true;
      this.programId = '6182745790fe0d0007802755';
      this.solutionId = '6182745790fe0d0007802758';
    });
    this.translate
      .get([
        'FRMELEMNTS_MSG_SOMETHING_WENT_WRONG',
        'FRMELEMNTS_MSG_NO_ENTITY_MAPPED',
        'FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE',
        'YES',
        'NO',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS',
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
     this.getProjectApi();
   }

   ionViewWillEnter(){
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
   }
   async getProjectApi() {
    this.actionItems = await actions.PROJECTACTIONS;
    let payload = await this.utils.getProfileInfo();

    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + this.id,
      payload: payload,
    };
    let resp = await this.kendra.post(config).toPromise();
    this.project = resp.result;
    this.metaData = {
      title : this.project.title,
      subTitle:this.project.programName ? this.project.programName :''
    }
    this.categories = [];
    this.project.categories.forEach((category: any) => {
      category.label ? this.categories.push(category.label) : this.categories.push(category.name);
    });
    this.sortTasks();
    if(this.project.tasks &&this.project.tasks,length)
    this.projectProgress = this.utils.getCompletedTaskCount(this.project.tasks);
  }

  async sortTasks() {
    let projectData: any = await this.utils.getSortTasks(this.project);
    this.project = projectData.project;
    this.sortedTasks = projectData.sortedTasks;
    this.taskCount = projectData.taskCount;
  }

  toggle() {
    this.showDetails = !this.showDetails;
  }
  action(action){
    console.log(action,"action");
  }
}
