import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService, LocalStorageService } from '../../core';
import { localStorageConstants } from '../../core/constants/localStorageConstants';


@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.page.html',
  styleUrls: ['./create-project.page.scss'],
})
export class CreateProjectPage implements OnInit {
  selectedCategories;
  showCategories;
  enableInput: boolean = false;
  projectForm: FormGroup;
  projectFormData;
  showTask: boolean = false;
  tasks;
  projectId;
  project;
  parameters;

  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  constructor(
    private location: Location,
    private modal: ModalController,
    private alert: AlertController,
    private translate: TranslateService,
    private fb: FormBuilder,
    private headerService: AppHeaderService,
    private platform: Platform,
    private router: Router,
    private route: ActivatedRoute,
    private storage: LocalStorageService,
    private db: DbService
  ) {
    route.queryParams.subscribe(parameters => {
      if (parameters.projectId) {
        this.parameters = parameters;
        this.showTask = false;
        this.getProjectFromLocal();
      }
    })
  }


  ngOnInit() {
    this.getForm();
  }
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  getProjectFromLocal() {
    this.db.query({ _id: this.parameters.projectId }).then(success => {
      this.project = success.docs.length ? success.docs[0] : {};
      if (this.project.categories.length) {
        this.project.categories.forEach(element => {
          element.isChecked = true;
        });
        this.selectedCategories = this.project.categories;

      }
      console.log(this.selectedCategories, " this.selectedCategories", this.project.categories);
    }, error => {
    })
  }

  getForm() {
    this.storage.getLocalStorage(localStorageConstants.PROJECT_META_FORM).then(projectData => {
      this.projectFormData = projectData;
      this.storage.getLocalStorage(localStorageConstants.TASK_META_FORM).then(taskData => {
        let taskForm = {
          taskData
        }
        this.projectFormData.push(taskForm);
        console.log(this.projectFormData, "this.projectFormData");
        this.prepareForm();
      })
    })
  }
  public prepareForm() {
    const controls = {};
    this.projectFormData.forEach(res => {
      const validationsArray = [];
      if (!res.taskData) {
        if (res.field != 'categories') {
          if (res.validation) {
            if (res.validation.required) {
              res.validation.name = 'required',
                validationsArray.push(
                  Validators.required
                );
            }
            controls[res.field] = new FormControl(this.project ? this.project[res.field] : '', validationsArray);
          }
        }
      } else {
        res.taskData.forEach(element => {
          if (element.validation) {
            if (element.validation.required) {
              element.validation.name = 'required',
                validationsArray.push(
                  Validators.required
                );
            }
            controls[element.field] = new FormControl('', validationsArray);
          }
        });
      }
    });
    this.projectForm = this.fb.group(
      controls
    );
  }
  async confirmToClose() {
    let text;
    this.translate.get(['FRMELEMNTS_LBL_DISCARD_PROJECT', 'FRMELEMNTS_MSG_DISCARD_PROJECT', 'FRMELEMNTS_BTN_DISCARD', 'FRMELEMNTS_BTN_CONTINUE']).subscribe(data => {
      text = data;
    });
    const alert = await this.alert.create({
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
          }
        }, {
          text: text['FRMELEMNTS_BTN_CONTINUE'],
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmToDelete(data, type) {
    let text;
    this.translate.get(['FRMELEMNTS_MSG_DELETE_CONFIRM', 'FRMELEMNTS_BTN_CANCEL', 'FRMELEMNTS_BTN_DELETE']).subscribe(data => {
      text = data;
    });
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      // header: text['LABELS.DISCARD_PROJECT'],
      message: text['FRMELEMNTS_MSG_DELETE_CONFIRM'] + type,
      buttons: [
        {
          text: text['FRMELEMNTS_BTN_CANCEL'],
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: text['FRMELEMNTS_BTN_DELETE'],
          handler: () => {
            if (type == 'task') {
              this.removeTask(data);
            } else if (type == 'category') {
              this.removeCategory(data);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // event trigger from category list page
  selectCategories(data) {
    this.selectedCategories = data;
    this.showCategories = false;
  }
  removeCategory(category) {
    const index = this.selectedCategories.indexOf(category, 0);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    }
  }
  removeTask(task) {
    const index = this.tasks.indexOf(task, 0);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
  }

  async openCategoryModal(categories) {
    console.log(categories, "categories 12");
    const modal = await this.modal.create({
      component: CategorySelectComponent,
      cssClass: 'transparentModal',
      componentProps: {
        'categories': JSON.parse(JSON.stringify(categories)),
        'selectedCategories': this.selectedCategories ? JSON.parse(JSON.stringify(this.selectedCategories)) : '',
      },
    });
    modal.onWillDismiss().then(({ data }) => {
      console.log(data)
      data ? this.selectCategories(data) : null;

    })
    return await modal.present();
  }
  next() {

  }
}
