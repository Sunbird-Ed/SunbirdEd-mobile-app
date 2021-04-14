import { Component, NgZone, OnInit } from '@angular/core';
import { ModalController, AlertController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { localStorageConstants } from '../../core/constants/localStorageConstants';
import { RouterLinks } from '@app/app/app.constant';
import { CreateTaskComponent } from '../../shared/components/create-task/create-task.component';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.page.html',
  styleUrls: ['./create-project.page.scss'],
})
export class CreateProjectPage implements OnInit {
  selectedCategories;
  showCategories;
  projectForm: FormGroup;
  projectFormData;
  showTask: boolean = false;
  tasks = [];
  projectId;
  createProjectAlert;
  hasAcceptedTAndC;
  project;
  parameters;
  button = 'FRMELEMENTS_BTN_CREATE_PROJECT';

  ranges = [
    '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
    '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
    '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
  ];

  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
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
    private db: DbService,
    private toast: ToastService,
    private utilsService: UtilsService,
    private ngZone: NgZone,
    private popoverCtrl: PopoverController
  ) {
    route.queryParams.subscribe((parameters) => {
      this.hasAcceptedTAndC = parameters.hasAcceptedTAndC;  
      if (parameters.projectId) {
        this.parameters = parameters;
        this.showTask = false;
        this.button = 'FRMELEMNTS_BTN_SAVE_EDITS';
        this.getProjectFromLocal();
      } else {
        this.showTask = true;
      }
    });
  }

  onKeyPress(event, content) {
    let emojiRegex: any = /(?:0\u20E3|1\u20E3|2\u20E3|3\u20E3|4\u20E3|5\u20E3|6\u20E3|7\u20E3|8\u20E3|9\u20E3|#\u20E3|\*\u20E3|\uD83C(?:\uDDE6\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF2|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFD|\uDDFF)|\uDDE7\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFC|\uDDFE|\uDDFF)|\uDDE8\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDE9\uD83C(?:\uDDEA|\uDDEC|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDFF)|\uDDEA\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDED|\uDDF7|\uDDF8|\uDDF9|\uDDFA)|\uDDEB\uD83C(?:\uDDEE|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDF7)|\uDDEC\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF1|\uDDF2|\uDDF3|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFE)|\uDDED\uD83C(?:\uDDF0|\uDDF2|\uDDF3|\uDDF7|\uDDF9|\uDDFA)|\uDDEE\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9)|\uDDEF\uD83C(?:\uDDEA|\uDDF2|\uDDF4|\uDDF5)|\uDDF0\uD83C(?:\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDF2|\uDDF3|\uDDF5|\uDDF7|\uDDFC|\uDDFE|\uDDFF)|\uDDF1\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDEE|\uDDF0|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFE)|\uDDF2\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDF3\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFF)|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C(?:\uDDE6|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF7|\uDDF8|\uDDF9|\uDDFC|\uDDFE)|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C(?:\uDDEA|\uDDF4|\uDDF8|\uDDFA|\uDDFC)|\uDDF8\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDE9|\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFD|\uDDFE|\uDDFF)|\uDDF9\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF9|\uDDFB|\uDDFC|\uDDFF)|\uDDFA\uD83C(?:\uDDE6|\uDDEC|\uDDF2|\uDDF8|\uDDFE|\uDDFF)|\uDDFB\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDEE|\uDDF3|\uDDFA)|\uDDFC\uD83C(?:\uDDEB|\uDDF8)|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C(?:\uDDEA|\uDDF9)|\uDDFF\uD83C(?:\uDDE6|\uDDF2|\uDDFC)))|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]/g;
    if (event.detail) {
      let str = event.detail.data;
      // str = str.replace(new RegExp(this.ranges.join('|'), 'g'), '');
      // let lastText: any = str.length - 1;
      if (str.match(emojiRegex, '')) {
        str = str.slice(0, -1);
        this.projectForm.value[content.field] = this.projectForm.value[content.field].slice(0, -1);
        this.projectForm.value[content.field]
      } else {
      }
    }

  }
  ngOnInit() {
    this.getForm();
  }
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
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
    this.db.query({ _id: this.parameters.projectId }).then(
      (success) => {
        this.project = success.docs.length ? success.docs[0] : {};
        if (this.project.categories.length) {
          this.project.categories.forEach((element) => {
            element.isChecked = true;
          });
          this.selectedCategories = this.project.categories;
        }
      },
      (error) => { }
    );
  }

  getForm() {
    this.storage.getLocalStorage(localStorageConstants.PROJECT_META_FORM).then((projectData) => {
      this.projectFormData = projectData;
      this.storage.getLocalStorage(localStorageConstants.TASK_META_FORM).then((taskData) => {
        let taskForm = {
          taskData,
        };
        this.projectFormData.push(taskForm);
        this.prepareForm();
      });
    });
  }
  public prepareForm() {
    const controls = {};
    this.projectFormData.forEach((res) => {
      const validationsArray = [];
      if (!res.taskData) {
        if (res.field != 'categories') {
          if (res.validation) {
            if (res.validation.required) {
              (res.validation.name = 'required'), validationsArray.push(Validators.required);
            }
            controls[res.field] = new FormControl(this.project ? this.project[res.field] : '', validationsArray);
          }
        }
      } else {
        res.taskData.forEach((element) => {
          if (element.validation) {
            if (element.validation.required) {
              (element.validation.name = 'required'), validationsArray.push(Validators.required);
            }
            controls[element.field] = new FormControl('', validationsArray);
          }
        });
      }
    });
    this.projectForm = this.fb.group(controls);
  }
  async confirmToClose() {
    let text;
    this.translate
      .get([
        'FRMELEMNTS_LBL_DISCARD_PROJECT',
        'FRMELEMNTS_MSG_DISCARD_PROJECT',
        'YES',
        'NO',
      ])
      .subscribe((data) => {
        text = data;
      });
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: text['FRMELEMNTS_LBL_DISCARD_PROJECT'],
      message: text['FRMELEMNTS_MSG_DISCARD_PROJECT'],
      buttons: [
        {
          text: text['YES'],
          role: 'cancel',
          cssClass: 'text-transform-free',
          handler: (blah) => {
            this.location.back();
          },
        },
        {
          text: text['NO'],
          cssClass: 'text-transform-free',
          handler: () => { },
        },
      ],
    });
    await alert.present();
  }

  async confirmToDelete(data, type) {
    let text;
    this.translate
      .get(['FRMELEMNTS_MSG_DELETE_CONFIRM', 'CANCEL', 'FRMELEMNTS_BTN_DELETE'])
      .subscribe((data) => {
        text = data;
      });
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      // header: text['LABELS.DISCARD_PROJECT'],
      message: text['FRMELEMNTS_MSG_DELETE_CONFIRM'] + type + ' ?',
      buttons: [
        {
          text: text['CANCEL'],
          role: 'cancel',
          cssClass: 'text-transform-free',
          handler: (blah) => { },
        },
        {
          text: text['FRMELEMNTS_BTN_DELETE'],
          cssClass: 'text-transform-free',
          handler: () => {
            if (type == 'task') {
              this.removeTask(data);
            } else if (type == 'category') {
              this.removeCategory(data);
            }
          },
        },
      ],
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
    const modal = await this.modal.create({
      component: CategorySelectComponent,
      cssClass: 'transparentModal',
      componentProps: {
        categories: JSON.parse(JSON.stringify(categories)),
        selectedCategories: this.selectedCategories ? JSON.parse(JSON.stringify(this.selectedCategories)) : '',
      },
    });
    modal.onWillDismiss().then(({ data }) => {
      data ? this.selectCategories(data) : null;
    });
    return await modal.present();
  }
  next() {
    if (this.projectForm.value.description && this.projectForm.value.title && this.selectedCategories.length) {
      delete this.projectForm.value.name;
      this.selectedCategories.forEach((category) => {
        'isChecked' in category ? delete category.isChecked : '';
        if (category.label == 'Others') {
          category.label = category.value;
          category.value = '';
          delete category._id;
        } else {
          category.value = category._id ? category._id : category.value;
          delete category._id;
        }
      });
      this.projectForm.value.categories = this.selectedCategories;
      this.projectForm.value.hasAcceptedTAndC = this.hasAcceptedTAndC;
      this.parameters ? this.update(this.projectForm.value) :
        this.createProjectModal('FRMELEMNTS_LBL_PROJECT_CREATE', 'FRMELEMNTS_MSG_PROJECT_CREATED_SUCCESS', 'EDIT', 'FRMELEMNTS_LBL_CONTINUE');
    } else {
      this.translate.get(['FRMELEMNTS_MSG_REQUIRED_FIELDS']).subscribe((data) => {
        this.toast.showMessage(data['FRMELEMNTS_MSG_REQUIRED_FIELDS'], 'danger');
      });
    }
  }

  saveTask(taskData) {
    this.tasks.push(taskData);
    this.translate.get(['FRMELEMNTS_MSG_TASK_ADDED_SUCCESSFULLY']).subscribe((data) => {
      this.toast.showMessage(data['FRMELEMNTS_MSG_TASK_ADDED_SUCCESSFULLY'], 'success');
    });
  }
  private async openCreateTaskAction(componentProps) {
    const popover = await this.popoverCtrl.create({
      component: CreateTaskComponent,
      componentProps,
      cssClass: 'popover-alert input-focus'
    });
    await popover.present();
    popover.onWillDismiss().then(({ data }) => {
      if (data) {
        this.saveTask(data);
      }
    });
  }


  public saveData(data) {
    if (!this.projectId) {
      data.isNew = true;
      data.tasks = this.tasks ? this.tasks : [];
      data.isEdit = true;
      data.isDeleted = true;
      const modifiedData = this.utilsService.setStatusForProject(data);
      // this.db.createPouchDB();
      this.db
        .create(modifiedData)
        .then((success) => {
          this.projectId = success.id;
          this.ngZone.run(() =>
            this.router.navigate([`${RouterLinks.PROJECT_OPERATION_PAGE}`, this.projectId], {
              queryParams: { availableInLocal: true, isCreate: true }, replaceUrl: true,
            })
          );
        })
        .catch((error) => { });
    } else {
      this.button == 'FRMELEMNTS_BTN_SAVE_EDITS'
        ? this.router.navigate(['menu/project-operation', this.projectId], {
          queryParams: { createdType: 'bySelf' },
          replaceUrl: true,
        })
        : this.location.back();
    }
  }

  update(data) {
    this.project.title = data.title;
    this.project.description = data.description;
    this.project.categories = data.categories;
    this.project.isEdit = true;
    this.db
      .update(this.project)
      .then((success) => {
        this.location.back();
      })
      .catch((error) => { });
  }

  async createProjectModal(header, msg, button, button1) {
    let texts;
    this.translate.get([header, msg, button, button1]).subscribe(data => {
      texts = data;
    })
    this.createProjectAlert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: texts[header],
      message: texts[msg],
      backdropDismiss: false,
      buttons: [
        {
          text: texts[button],
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: texts[button1],
          cssClass: 'secondary',
          handler: () => {
            this.saveData(this.projectForm.value);
          }
        }
      ]
    });
    await this.createProjectAlert.present();
  }
}
