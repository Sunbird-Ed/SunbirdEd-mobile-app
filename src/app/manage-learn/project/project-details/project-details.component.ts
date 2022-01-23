import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { actions } from '../../core/constants/actions.constants';
import { DbService } from '../../core/services/db.service';
import { LoaderService, ToastService, NetworkService } from '../../core';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { SyncService } from '../../core/services/sync.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { SharingFeatureService } from '../../core/services/sharing-feature.service';
import { PopoverController, AlertController, Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  projectId;
  solutionId;
  programId
  templateId;
  projectType;
  _headerConfig;
  allStrings;
  projectDetails;
  categories = [];
  isNotSynced: boolean;
  cardMetaData;
  projectActions;
  segmentType = "details";
  networkFlag: boolean;
  private _networkSubscription: Subscription;
  shareTaskId

  constructor(
    public params: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private db: DbService,
    private network: NetworkService,
    private toast: ToastService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private loader: LoaderService,
    private syncServ: SyncService,
    private share: SharingFeatureService,
    private alert: AlertController,


  ) {
    params.queryParams.subscribe((parameters) => {
      this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
      this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
        this.networkFlag = available;
      })
      this.setHeaderConfig();
      this.projectId = parameters.projectId;
      this.solutionId = parameters.solutionId;
      this.programId = parameters.programId;
      this.projectType = parameters.type ? parameters.type : '';
      this.templateId = parameters.templateId;
      this.getProject()
    });
  }

  ngOnInit() {
    this.translate
      .get([
        "FRMELEMNTS_MSG_SOMETHING_WENT_WRONG",
        "FRMELEMNTS_MSG_NO_ENTITY_MAPPED",
        "FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS",
        "FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE",
        "YES",
        "NO"
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
  }

  setHeaderConfig() {
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this._headerConfig);
  }

  getProject() {
    if (this.projectId) {
      this.db.query({ _id: this.projectId }).then(
        (success) => {
          if (success.docs.length) {
            this.categories = [];
            this.projectDetails = success.docs.length ? success.docs[0] : {};
            this.setActionButtons();
            this.isNotSynced = this.projectDetails ? (this.projectDetails.isNew || this.projectDetails.isEdit) : false;
            this.projectDetails.categories.forEach((category: any) => {
              category.label ? this.categories.push(category.label) : this.categories.push(category.name);
            });
            console.log(this.projectDetails);
            this.setCardMetaData();
            this.getProjectTaskStatus();
          } else {
            this.getProjectsApi();
          }

        },
        (error) => {
          this.getProjectsApi();
        }
      );
    } else {
      this.getProjectsApi();
    }

  }

  setCardMetaData() {
    this.cardMetaData = {
      title: this.projectDetails.title,
      subTitle: this.projectDetails.programName || null
    }
  }

  segmentChanged(event) {
    this.segmentType = event.detail.value;
  }

  setActionButtons() {
    const defaultOptions = actions.PROJECT_ACTIONS;
    if (this.projectDetails.isNew || this.projectDetails.isEdit) {
      const indexOfSync = defaultOptions.length - 1;
      defaultOptions[indexOfSync] = actions.SYNC_ACTION;
    }
    if (this.projectDetails.downloaded) {
      defaultOptions[0] = actions.DOWNLOADED_ACTION
    }
    this.projectActions = defaultOptions;
  }

  onAction(event) {
    switch (event) {
      case 'download':
        debugger
        this.projectDetails.downloaded = true;
        this.updateLocalDb();
        this.setActionButtons();
        break;
      case 'downloaded':
        break;
      case 'sync':
        if (this.network.isNetworkAvailable) {
          this.projectDetails.isNew
            ? this.createNewProject()
            : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
        } else {
          this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        }
        break;
      case 'synced':
        break
      case 'synced':
        this.router.navigate([`/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_EDIT}`, this.projectDetails._id]);
        break;
      case 'share':
        this.network.isNetworkAvailable
          ? this.openSyncSharePopup('shareProject', this.projectDetails.title)
          : this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        break;
      case 'files':
        this.router.navigate([`${RouterLinks.ATTACHMENTS_LIST}`, this.projectDetails._id]);
        break
      case 'edit':
        this.router.navigate([`/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_EDIT}`, this.projectDetails._id]);
        break;
    }
  }

  createNewProject(isShare?) {
    this.loader.startLoader();
    const projectDetails = JSON.parse(JSON.stringify(this.projectDetails));
    this.syncServ
      .createNewProject(true, projectDetails)
      .then((success) => {
        const { _id, _rev } = this.projectDetails;
        this.projectDetails._id = success.result.projectId;
        this.projectDetails.programId = success.result.programId;
        this.projectDetails.lastDownloadedAt = success.result.lastDownloadedAt;
        this.projectId = this.projectDetails._id;
        this.projectDetails.isNew = false;
        delete this.projectDetails._rev;
        this.loader.stopLoader();
        this.db
          .create(this.projectDetails)
          .then((success) => {
            this.projectDetails._rev = success.rev;
            this.db
              .delete(_id, _rev)
              .then(res => {
                setTimeout(() => {
                  const queryParam = {
                    projectId: this.projectId,
                    taskId: this.shareTaskId
                  }
                  if (isShare) {
                    queryParam['share'] = true
                  }
                  this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], {
                    queryParams: queryParam
                  })
                }, 0)
                this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
                  queryParams: {
                    projectId: this.projectDetails._id,
                    programId: this.programId,
                    solutionId: this.solutionId,
                    // fromImportPage: this.importProjectClicked
                  }, replaceUrl: true
                });
              })
          })
      })
      .catch((error) => {
        this.toast.showMessage(this.allStrings["FRMELEMNTS_MSG_SOMETHING_WENT_WRONG"], "danger");
        this.loader.stopLoader();
      });
  }

  async openSyncSharePopup(type, name, taskId?) {
    let data;
    this.translate.get(["FRMELEMNTS_LBL_SHARE_MSG", "FRMELEMNTS_BTN_DNTSYNC", "FRMELEMNTS_BTN_SYNCANDSHARE"]).subscribe((text) => {
      data = text;
    });
    this.shareTaskId = taskId ? taskId : null;
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      message: data["FRMELEMNTS_LBL_SHARE_MSG"],
      buttons: [
        {
          text: data["FRMELEMNTS_BTN_DNTSYNC"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            this.toast.showMessage("FRMELEMNTS_MSG_FILE_NOT_SHARED", "danger");
          },
        },
        {
          text: data["FRMELEMNTS_BTN_SYNCANDSHARE"],
          handler: () => {
            if (this.projectDetails.isEdit || this.projectDetails.isNew) {
              this.projectDetails.isNew
                ? this.createNewProject(true)
                : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId, taskId: taskId, share: true, fileName: name } });
            } else {
              type == 'shareTask' ? this.getPdfUrl(name, taskId) : this.getPdfUrl(this.projectDetails.title);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getPdfUrl(fileName, taskId?) {
    let task_id = taskId ? taskId : '';
    const config = {
      url: urlConstants.API_URLS.GET_SHARABLE_PDF + this.projectDetails._id + '?tasks=' + task_id,
    };
    this.share.getFileUrl(config, fileName);
  }


  updateLocalDb() {
    this.db.update(this.projectDetails).then(success => {
      this.projectDetails._rev = success.rev;
    })
  }

  getProjectsApi() {

  }

  getProjectTaskStatus() {

  }

}
