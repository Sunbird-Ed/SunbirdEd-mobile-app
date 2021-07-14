import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { AddEntityComponent } from '../add-entity/add-entity.component';
import { LinkLearningResourcesComponent } from '../link-learning-resources/link-learning-resources.component';
import { AddProgramsComponent } from '../add-programs/add-programs.component';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { DbService } from '../../core/services/db.service';
import { TranslateService } from '@ngx-translate/core';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService, NetworkService, ToastService } from '../../core';
import { RouterLinks } from '@app/app/app.constant';
import { SyncService } from '../../core/services/sync.service';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-project-operation',
  templateUrl: './project-operation.page.html',
  styleUrls: ['./project-operation.page.scss'],
})
export class ProjectOperationPage  {
  button = 'FRMELEMNTS_BTN_IMPORT_PROJECT';
  private _appHeaderSubscription?: Subscription;

  selectedProgram;
  selectedResources;
  showSkip: boolean;
  today: any = new Date();
  currentYear = new Date().getFullYear();
  endDateMin: any = this.currentYear - 2;
  showLearningResources = false;
  showRatings = true;
  projectId;
  selectedEntity;
  template;
  templateCopy;
  viewProjectAlert;
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: []
  };
  constructor(
    private routerparam: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private http: HttpClient,
    private utils: UtilsService,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private db: DbService,
    private translate: TranslateService,
    private alertController: AlertController,
    private unnatiDataService: UnnatiDataService,
    private loaderService: LoaderService,
    private syncServ: SyncService,
    private networkService: NetworkService,
    private toast: ToastService
  ) {
    this.routerparam.params.subscribe(data => {
      this.projectId = data.id;
    })
    this.routerparam.queryParams.subscribe((params) => {
      if (params && params.availableInLocal) {
        if (params.isEdit) {
          this.button = 'FRMELEMNTS_BTN_SAVE_EDITS';
          this.showSkip = false;
        } else if (params.isCreate) {
          this.button = 'FRMELEMNTS_LBL_VIEW_PROJECT';
          this.showSkip = true;
        }
        this.showLearningResources = true;
        this.showRatings = false;
        this.getProjectFromLocal(this.projectId);
      } else {
        this.showRatings = true;
      }
    });

  }

  ionViewWillEnter() {
    this.initApp();
    let data;
    this.translate.get(["FRMELEMNTS_LBL_PROJECT_VIEW"]).subscribe((text) => {
      data = text;
    });
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = data["FRMELEMNTS_LBL_PROJECT_VIEW"];
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  initApp() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      if (eventName.name === 'skip') {
        this.createProject();
      }
    });
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
  async confirmToClose() {
    let text;
    this.translate
      .get([
        'FRMELEMNTS_LBL_DISCARD_PROJECT',
        'FRMELEMNTS_MSG_DISCARD_PROJECT',
        'FRMELEMNTS_BTN_DISCARD',
        'FRMELEMNTS_BTN_CONTINUE',
      ])
      .subscribe((data) => {
        text = data;
      });
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: text['FRMELEMNTS_LBL_DISCARD_PROJECT'],
      message: text['FRMELEMNTS_MSG_DISCARD_PROJECT'],
      buttons: [
        {
          text: text['FRMELEMNTS_BTN_DISCARD'],
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.location.back();
          },
        },
        {
          text: text['FRMELEMNTS_BTN_CONTINUE'],
          handler: () => { },
        },
      ],
    });
    await alert.present();
  }

  getProjectFromLocal(projectId) {
    this.db.query({ _id: projectId }).then(success => {
      this.template = success.docs[0];
      this.templateCopy = JSON.parse(JSON.stringify(this.template));
      this.endDateMin = moment(this.template.startDate).format("YYYY-MM-DD");
      if (this.template.entityName) {
        this.selectedEntity = {
          name: this.template.entityName ? this.template.entityName : '',
          _id: this.template.entityId ? this.template.entityId : '',
        }
      }
      this.selectedResources = this.template.learningResources && this.template.learningResources.length ? this.template.learningResources : [];
      if (this.template.programName) {
        this.selectedProgram = {
          _id: this.template.programId ? this.template.programId : '',
          name: this.template.programName ? this.template.programName : '',
          isAPrivateProgram: this.template.isAPrivateProgram
        }
      }
    }, error => {
    })
  }

  async openSearchModel(type) {
    const modal = await this.modalController.create({
      component: AddProgramsComponent,
      componentProps: {
        type: type
      }
      // cssClass: 'my-custom-class'
    });
    modal.onDidDismiss().then(data => {
      if (type == 'entity') {
        this.selectedEntity = data.data ? data.data : '';
      } else {
        this.selectedProgram = data.data ? data.data : '';
      }
    })
    return await modal.present();
  }
  addEntity() {
    this.openAddEntityModal();
  }
  checkNetwork(type?, url?) {
    if (this.networkService.isNetworkAvailable) {
      switch (type) {
        case 'entity': {
          this.addEntity();
          break;
        }
        case 'programs': {
          this.openSearchModel(type);
          break;
        }
        case 'resources': {
          this.addLearningResources();
          break;
        }
      }
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
    }
  }
  addLearningResources() {
    this.openAddResourcesModal();
  }

  async openAddEntityModal() {
    let entityType;
    const modal = await this.modalController.create({
      component: AddEntityComponent,
      componentProps: {
        // entityType: entityType ? entityType : null
      },
      cssClass: 'my-custom-class'
    });
    modal.onDidDismiss().then(data => {
      this.selectedEntity = data.data ? data.data : '';
    })
    return await modal.present();
  }

  async openAddResourcesModal() {
    const modal = await this.modalController.create({
      component: LinkLearningResourcesComponent,
      componentProps: {
        selectedResources: cloneDeep(this.selectedResources),
      },
      // cssClass: 'my-custom-class'
    });
    modal.onDidDismiss().then(data => {
      this.selectedResources = data.data ? data.data : this.selectedResources;
    })
    return await modal.present();
  }
  remove(data, type) {
    if (type == 'entity') {
      this.selectedEntity = '';
      if (this.template) {
        this.template.entityName ? delete this.template.entityName : '';
        this.template.entityId ? delete this.template.entityId : '';
      }
    } else if (type == 'program') {
      this.selectedProgram = '';
      this.template.programId ? delete this.template.programId : '';
      this.template.programName ? delete this.template.programName : '';
    } else if (type == 'resources') {
      const index = this.selectedResources.indexOf(data, 0);
      if (index > -1) {
        this.selectedResources.splice(index, 1);
      }
    }
  }

  resetEndDate(event) {
    if (event.detail && event.detail.value && (event.detail.value != this.templateCopy.startDate)) {
      this.endDateMin = moment(event.detail.value).format("YYYY-MM-DD");
      this.template.endDate = this.template.endDate ? '' : '';
    }
  }
  isMandatoryFieldsFilled() {
    const isProgramPresent = (this.selectedProgram && this.selectedProgram.name) || (this.selectedProgram && this.selectedProgram._id);
    const isEntityAdded = (this.selectedEntity && this.selectedEntity._id)
    if (this.template.showProgramAndEntity && (!isEntityAdded || !isProgramPresent)) {
      return false
    }
    return true
  }

  update(newProject?) {
    if (!this.isMandatoryFieldsFilled()) {
      return
    }
    this.template.isDeleted = false;
    this.db.update(this.template).then(success => {
      newProject ? this.createProjectModal(this.template, 'FRMELEMNTS_MSG_PROJECT_CREATED_SUCCESS', 'FRMELEMNTS_LBL_VIEW_PROJECT', true) : this.createProjectModal(this.template, 'FRMELEMNTS_MSG_PROJECT_UPDATED_SUCCESS', 'FRMELEMNTS_LBL_VIEW_PROJECT');
    })
  }



  async createProjectModal(project, header, button, isNew?) {
    let texts;
    this.translate.get([header, button]).subscribe(data => {
      texts = data;
    })
    this.viewProjectAlert = await this.alertController.create({
      cssClass: 'dark-background',
      subHeader: texts[header],
      backdropDismiss: false,
      buttons: [
        {
          text: texts[button],
          cssClass: 'secondary',
          handler: (blah) => {
            this.showSkip ? this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
              queryParams: {
                projectId: project._id,
                programId: project.programId,
                solutionId: project.solutionId
              }, replaceUrl: true,
            }) : this.location.back();
          }
        }
      ]
    });
    await this.viewProjectAlert.present();
  }
  createProject() {
    if (this.selectedEntity) {
      this.template.entityId = this.selectedEntity._id;
      this.template.entityName = this.selectedEntity.name;
    }
    if (this.selectedProgram) {
      !this.selectedProgram.created ? this.template.programId = this.selectedProgram._id : delete this.template.programId
      this.template.programName = this.selectedProgram.name;
      this.template.isAPrivateProgram = this.selectedProgram.isAPrivateProgram ? true : false;
    }
    this.template.learningResources = this.selectedResources;
    if (this.button == 'FRMELEMNTS_LBL_VIEW_PROJECT') {
      this.newProjectCreate();
    } else {
      this.template.isEdit = true; 
      this.update();
    }
  }

  newProjectCreate() {
    this.template.isNew = true;
    this.template.downloaded = true;

    this.update(true);
  }
  ionViewWillLeave() {
    if(this.viewProjectAlert ){
     this.viewProjectAlert.dismiss();
    }
   }
}
