import { Component, OnInit } from '@angular/core';
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
import { LoaderService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';

// var environment = {
//   db: {
//     projects: "project.db",
//     categories: "categories.db",
//   },
//   deepLinkAppsUrl: ''
// };
@Component({
  selector: 'app-project-operation',
  templateUrl: './project-operation.page.html',
  styleUrls: ['./project-operation.page.scss'],
})
export class ProjectOperationPage implements OnInit {
  button = 'FRMELEMNTS_BTN_IMPORT_PROJECT';
  private _appHeaderSubscription?: Subscription;

  selectedProgram;
  selectedResources;
  today: any = new Date();
  currentYear = new Date().getFullYear();
  endDateMin: any = this.currentYear - 2;
  showLearningResources = false;
  showRatings = true;
  projectId;
  selectedEntity;
  template;
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
    private loaderService: LoaderService
  ) {
    this.routerparam.params.subscribe(data => {
      this.projectId = data.id;
    })
    this.routerparam.queryParams.subscribe((params) => {
      if (params && params.availableInLocal) {
        if (params.isEdit) {
          this.button = 'FRMELEMNTS_BTN_SAVE_EDITS';
        } else if (params.isCreate) {
          this.button = 'FRMELEMNTS_BTN_CREATE_PROJECT';
        }
        this.showLearningResources = true;
        this.showRatings = false;
        this.getProjectFromLocal(this.projectId);
      } else {
        this.showRatings = true;
        // this.networkService.isNetworkAvailable ? this.getTemplate(this.projectId) : this.toast.showMessage('MESSAGEs.OFFLINE', 'danger');
      }
    });

  }

  ngOnInit() { }
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
      // this.loader.stopLoader();
    })
  }

  async openSearchModel(type, url?) {
    const modal = await this.modalController.create({
      component: AddProgramsComponent,
      componentProps: {
        url: url,
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
    // if (this.profileData && this.profileData.state && this.profileData.state._id) {
    // this.networkService.isNetworkAvailable ? this.openAddEntityModal() : this.showPopupForNoNet('LABELS.UNABLE_TO_ADD_ENTITY', 'MESSAGES.YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'LABELS.CANCEL', 'LABELS.TRYAGAIN');
    // } else {
    //   this.toast.showMessage('MESSAGES.DISABLED_ADD_ENTITY', 'danger');
    // }
    this.openAddEntityModal();
  }
  addLearningResources() {
    this.openAddResourcesModal();
    // this.networkService.isNetworkAvailable ? this.openAddResourcesModal(urlConstants.API_URLS.LEARNING_RESOURCES_LIST) : this.showPopupForNoNet('LABELS.UNABLE_TO_SHOW_LIBRARY', 'MESSAGES.YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'LABELS.CANCEL', 'LABELS.TRYAGAIN');
  }

  async openAddEntityModal() {
    let entityType;
    // if (this.template.entityType && this.template.entityType.length) {
    //   entityType = this.template.entityType;
    // }
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
        selectedResources: this.selectedResources
      }
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
      if (this.template.isAPrivateProgram) {
        this.selectedProgram = '';
        this.template.programId ? delete this.template.programId : '';
        this.template.programName ? delete this.template.programName : '';
      }
    } else if (type == 'resources') {
      const index = this.selectedResources.indexOf(data, 0);
      if (index > -1) {
        this.selectedResources.splice(index, 1);
      }
    }
  }

  resetEndDate(event) {
    if (event.detail && event.detail.value) {
      this.endDateMin = moment(event.detail.value).format("YYYY-MM-DD");
      this.template.endDate = this.template.endDate ? '' : '';
    }
  }
  isMandatoryFieldsFilled() {
    const isProgramPresent = (this.selectedProgram && this.selectedProgram.name) || (this.selectedProgram && this.selectedProgram._id);
    const isEntityAdded = (this.selectedEntity && this.selectedEntity._id)
    if (this.template.showProgramAndEntity && (!isEntityAdded || !isProgramPresent)) {
      // this.toast.showMessage('MESSAGES.REQUIRED_FIELDS', 'danger');
      return false
    }
    return true
  }

  update(data) {
    if (!this.isMandatoryFieldsFilled()) {
      return
    }
    data.isEdit = true;
    data.isDeleted = false;
    this.db.update(data).then(success => {
      this.createProjectModal(data, 'FRMELEMNTS_MSG_PROJECT_UPDATED_SUCCESS', 'FRMELEMNTS_LBL_VIEW_PROJECT');
    }).catch(error => {
    })
  }



  async createProjectModal(project, header, button) {
    let texts;
    this.translate.get([header, button]).subscribe(data => {
      texts = data;
    })
    this.viewProjectAlert = await this.alertController.create({
      cssClass: 'my-custom-class',
      subHeader: texts[header],
      backdropDismiss: false,
      buttons: [
        {
          text: texts[button],
          cssClass: 'secondary',
          handler: (blah) => {
            this.location.back();
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
    this.button == 'FRMELEMNTS_BTN_CREATE_PROJECT' ? this.newProjectCreate() : this.update(this.template);
  }

  newProjectCreate() {
    this.loaderService.startLoader();
    let id = this.template._id;;
    this.template.isDeleted = false;
    delete this.template._id;
    const config = {
      url: urlConstants.API_URLS.CREATE_PROJECT,
      payload: this.template
    }
    this.unnatiDataService.post(config).subscribe(data => {
      this.loaderService.stopLoader();
      this.db.delete(id, this.template._rev).then(res => {
        this.template._id = data.result.projectId;
        this.template.programId = data.result.programId;
        delete this.template._rev;
        this.db
          .create(this.template)
          .then((success) => {
            this.createProjectModal(this.template, 'FRMELEMNTS_MSG_PROJECT_CREATED_SUCCESS', 'FRMELEMNTS_LBL_VIEW_PROJECT');
          })
          .catch((error) => {
          });
      }).catch((error) => {
      });
    }, error => {
      this.loaderService.stopLoader();
    })
  }
}

