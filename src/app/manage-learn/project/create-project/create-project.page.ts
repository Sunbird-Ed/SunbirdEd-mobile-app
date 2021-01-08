import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
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
  project = {
    categories: [],
    createdAt: "2019-09-13T11:45:21.000Z",
    deleted: false,
    description: "Enabling student leadership and overall student development",
    isDeleted: false,
    isImportedFromLibrary: true,
    lastDownloadedAt: "2020-12-23T17:40:09.771Z",
    lastSync: "2020-12-05T18:15:10.363Z",
    learningResources: [],
    primaryAudience: [""],
    programExternalId: "IMP-#547-Sep-2019",
    programId: "5d7b7e68639f5817a1d73028",
    programName: "AP Imp Demo Program",
    rationale: "sample",
    solutionExternalId: "9edae470-d61a-11e9-9fbf-236864017e03",
    solutionId: "5d7b7f0f2550177ef7f08c73",
    status: "notStarted",
    syncedAt: "2020-02-27T10:07:29.000Z",
    taskSequence: [],
    tasks: [],
    title: "Talent Day",
    updatedAt: "2020-12-05T18:15:10.368Z",
    userId: "4267621e-903e-4934-8ed7-38121a4e3c99",
    _id: "5fc54221cce64916855f6b84",
    _rev: "1-3718fdc86e773e7d7c7c5be38b294214"
  };
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
  ) { }

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
    // this.db.query({ _id: this.parameters.projectId }).then(success => {
    //   this.project = success.docs.length ? success.docs[0] : {};
    //   console.log(this.categories, "this.project.categories", this.project.categories);
    //   if (this.project.categories.length) {
    //     this.project.categories.forEach(element => {
    //       element.isChecked = true;
    //     });
    //     this.selectedCategories = this.project.categories;

    //   }
    //   console.log(this.selectedCategories, " this.selectedCategories", this.project.categories);
    // }, error => {
    // })
  }
  getForm() {
    this.projectFormData = [
      { field: "title", label: "Title", value: "", visible: true, editable: true, input: "text", validation: { required: true }, max: 50, hint: "Name your project" },
      { field: "description", label: "Description", value: "", visible: true, editable: true, input: "textarea", validation: { required: true }, max: 120, hint: "What is the Objective of your Project" },
      {
        field: "categories", label: "Categories", value: "", visible: true, editable: true, input: "select",
        options: [{ _id: "5fc714ef94fda51a7fe90825", label: "Teachers", value: "teachers" },
        { _id: "5fc714ef94fda51a7fe90826", label: "Students", value: "students" },
        { _id: "5fc714ef94fda51a7fe90827", label: "Infrastructure", value: "infrastructure" },
        { _id: "5fc714ef94fda51a7fe90828", label: "Community", value: "community" },
        { _id: "5fc714ef94fda51a7fe90829", label: "Education Leader", value: "educationLeader" },
        { _id: "5fc714ef94fda51a7fe9082a", label: "School Process", value: "schoolProcess" },
        { _id: "", label: "Others", value: "others" }], validation: { required: false }, hint: "What does your project aim to improve?"
      }]
    let taskForm = {
      field: "name", label: "Name", value: "", visible: true, editable: true, input: "text", validation: { required: true }
    }
    this.projectFormData.push(taskForm);
    console.log(this.projectFormData, "this.projectFormData");
    this.prepareForm();
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
    console.log(categories,"categories 12");
    const modal = await this.modal.create({
      component: CategorySelectComponent,
      cssClass: 'transparentModal',
      componentProps: {
        'categories': JSON.parse(JSON.stringify(categories)),
        'selectedCategories': this.selectedCategories ? JSON.parse(JSON.stringify(this.selectedCategories)) :'',
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
