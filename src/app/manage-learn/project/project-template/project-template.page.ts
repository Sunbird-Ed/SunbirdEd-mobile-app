import { ChangeDetectorRef, Component, OnDestroy, Inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, AlertController, Platform, ModalController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statusType, statuses } from '../../core/constants/statuses.constant';
import { UtilsService } from '../../../../app/manage-learn/core/services/utils.service';
import * as moment from 'moment';
import { menuConstants } from '../../core/constants/menuConstants';
import { PopoverComponent } from '../../shared/components/popover/popover.component';
import { Subscription } from 'rxjs';
import { DbService } from '../../core/services/db.service';
import { LoaderService, ToastService, NetworkService } from '../../core';
import { SyncService } from '../../core/services/sync.service';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { RouterLinks } from '../../../../app/app.constant';
import { CreateTaskFormComponent } from '../../shared';
import { SharingFeatureService } from '../../core/services/sharing-feature.service';
import { Location } from '@angular/common';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { CommonUtilService } from '../../../../services/common-util.service';
import { AppHeaderService } from '../../../../services/app-header.service';

@Component({
  selector: 'app-project-template',
  templateUrl: './project-template.page.html',
  styleUrls: ['./project-template.page.scss'],
})
export class ProjectTemplatePage {
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
  closeAlert;
  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private loader: LoaderService,
    private router: Router,
    private utils: UtilsService,
    private alert: AlertController,
    private share: SharingFeatureService,
    private syncServ: SyncService,
    private toast: ToastService,
    private translate: TranslateService,
    private modal: ModalController,
    private unnatiService: UnnatiDataService,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    private alertController: AlertController,
    private network: NetworkService,
    private location: Location,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private kendra: KendraApiService
  ) {
    params.params.subscribe((parameters) => {
      this.id = parameters.id;
    });
    params.queryParams.subscribe((parameters) => {
      this.isTargeted = parameters.isTargeted;
      this.programId = parameters.programId;
      this.solutionId = parameters.solutionId;
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

  ngOnInit() {}

  ionViewWillEnter() {
    let data;
    this.translate.get(['FRMELEMNTS_LBL_PROJECT_VIEW']).subscribe((text) => {
      data = text;
    });
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = data['FRMELEMNTS_LBL_PROJECT_VIEW'];
    this.headerService.updatePageConfig(this.headerConfig);
  }

  async getProjectApi() {
    let payload = await this.utils.getProfileInfo();

    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + this.id,
      payload: payload,
    };
    let resp = await this.kendra.post(config).toPromise();
    this.project = resp.result;
    this.categories = [];
    this.project.categories.forEach((category: any) => {
      category.label ? this.categories.push(category.label) : this.categories.push(category.name);
    });
    this.sortTasks();
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

  async closeTemplate() {
    this.closeAlert = await this.alertController.create({
      header: 'Close Page',
      message: `Are you sure you want to close this page?`,
      buttons: [
        {
          text: 'Go Back',
          role: 'ok',
          handler: (blah) => {
            this.closeAlert.dismiss();
          },
        },
        {
          text: 'Close Page',
          role: 'cancel',
          handler: (blah) => {
            this.router.navigate([`/${RouterLinks.HOME}`]);
          },
        },
      ],
      backdropDismiss: false,
    });
    await this.closeAlert.present();
  }

  async mapProjectToUser() {
    let payload = { programId: this.programId, solutionId: this.solutionId };
    const config = {
      url: urlConstants.API_URLS.IMPORT_LIBRARY_PROJECT + this.project._id + '?isATargetedSolution=false',
      payload: payload,
    };
    let resp;
    try {
      resp = await this.unnatiService.post(config).toPromise();
    } catch (error) {
      console.log(error);
    }

    if (resp && resp.result) {
      this.router
        .navigate([`/${RouterLinks.PROJECT}`], {
          queryParams: {
            selectedFilter: this.isTargeted ? 'assignedToMe' : 'discoveredByMe',
          },
        })
        .then(() => {
          this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
            queryParams: {
              projectId: resp.result._id,
              programId: this.programId,
              solutionId: this.solutionId,
            },
          });
        });
    }
  }

  openStartIMPPopup() {
    console.log('start popup');
  }
}
