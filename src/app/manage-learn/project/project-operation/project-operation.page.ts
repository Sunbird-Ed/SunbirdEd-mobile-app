import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AddEntityComponent } from '../add-entity/add-entity.component';
import { LinkLearningResourcesComponent } from '../link-learning-resources/link-learning-resources.component';
import { AddProgramsComponent } from '../add-programs/add-programs.component';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
@Component({
  selector: 'app-project-operation',
  templateUrl: './project-operation.page.html',
  styleUrls: ['./project-operation.page.scss'],
})
export class ProjectOperationPage implements OnInit {
  button = 'FRMELEMNTS_BTN_IMPORT_PROJECT';
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

  constructor(
    private routerparam: ActivatedRoute,
    private modalController: ModalController,
    private http: HttpClient,
    private utils: UtilsService
  ) {
    this.routerparam.queryParams.subscribe((params) => {
      console.log(params,"params")
      if (params && params.availableInLocal) {
        this.button = params.isEdit ? 'FRMELEMNTS_BTN_SAVE_EDITS' : 'FRMELEMNTS_BTN_CREATE_PROJECT'
        this.showLearningResources = true;
        this.showRatings = false;
        this.getProjectFromLocal();
      } else {
        this.showRatings = true;
        // this.networkService.isNetworkAvailable ? this.getTemplate(this.projectId) : this.toast.showMessage('MESSAGEs.OFFLINE', 'danger');
      }
    });
  }

  ngOnInit() {}
  getProjectFromLocal() {
    this.template = this.utils.getProjectData();
    console.log('im getProjectFromLocal',this.template);

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
      // componentProps: {
      //   url: url,
      //   selectedResources: this.selectedResources
      // }
      // cssClass: 'my-custom-class'
    });
    modal.onDidDismiss().then(data => {
      this.selectedResources = data.data ? data.data : [];
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
    if (event.detail && event.detail.value) {
      this.endDateMin = moment(event.detail.value).format("YYYY-MM-DD");
      this.template.endDate = this.template.endDate ? '' : '';
    }
  }
}

