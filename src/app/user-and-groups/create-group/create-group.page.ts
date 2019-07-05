import { Component, Inject, OnInit } from '@angular/core';
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
  TelemetryGeneratorService,
  AppHeaderService,
  CommonUtilService
} from '../../../services';
import {
  Framework,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  GetSuggestedFrameworksRequest,
  Group,
  GroupService
} from 'sunbird-sdk';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {
  groupEditForm: FormGroup;
  classList = [];
  group: Group;
  isEditGroup = false;
  syllabusList: Array<any> = [];
  categories: Array<any> = [];
  loader: any;
  isFormValid = true;

  /* Options for class ion-select box */
  classOptions = {
    header: this.commonUtilService.translateMessage('CLASS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  /* Options for syllabus ion-select box */
  syllabusOptions = {
    header: this.commonUtilService.translateMessage('SYLLABUS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    @Inject('GROUP_SERVICE') private groupService: GroupService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.group = this.router.getCurrentNavigation().extras.state.groupInfo || {};
    this.groupEditForm = this.fb.group({
      name: [this.group.name || '', Validators.required],
      syllabus: [this.group.syllabus && this.group.syllabus[0] || []],
      class: [this.group.grade || []]
    });

    this.isEditGroup = Boolean(this.group.hasOwnProperty('gid'));
    this.getSyllabusDetails();
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
  }

  ngOnInit() {
  }

  ionViewDidLoad() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.CREATE_GROUP_SYLLABUS_CLASS,
      Environment.USER, this.isEditGroup ? this.group.gid : '', this.isEditGroup ? ObjectType.GROUP : ''
    );

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      this.isEditGroup ? InteractSubtype.EDIT_GROUP_INITIATED : InteractSubtype.CREATE_GROUP_INITIATED,
      Environment.USER,
      PageId.CREATE_GROUP
    );
  }

  /**
 * get Syllabus Details and store locally
 */
  async getSyllabusDetails() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (result: Framework[]) => {
        if (result && result.length) {
          result.forEach(element => {
            // renaming the fields to text, value and checked
            const value = { 'name': element.name, 'code': element.identifier };
            this.syllabusList.push(value);
          });

          if (this.group && this.group.syllabus && this.group.syllabus[0] !== undefined) {
            this.getClassList(this.group.syllabus[0], false);
          } else {
            await loader.dismiss();
          }
        } else {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
        }
      });
  }

  /**Navigates to guest edit profile */
  goToGuestEdit() {
    this.router.navigate(['GuestEditProfilePage']);
  }

  /**
 * Navigates to UsersList page
 */
  navigateToUsersList() {
    if (!this.isFormValid) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      return;
    }

    const formValue = this.groupEditForm.value;
    if (formValue.name) {
      this.group.name = formValue.name;
      this.group.grade = (!formValue.class.length) ? [] : [formValue.class];
      this.group.syllabus = (!formValue.syllabus.length) ? [] : [formValue.syllabus];
      this.group.gradeValue = {};

      if (this.group.grade && this.group.grade.length) {
        this.group.grade.forEach(gradeCode => {
          for (let i = 0; i < this.classList.length; i++) {
            if (this.classList[i].code === gradeCode) {
              this.group.gradeValue[this.classList[i].code] = this.classList[i].name;
              break;
            }
          }
        });
      }

      const navigationExtras: NavigationExtras = { state: { group: this.group } }
      this.router.navigate(['GroupMembersPage'], navigationExtras);
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('ENTER_GROUP_NAME'));
    }
  }

  /**
   * Internally calls Update group API if form is valid
   */
  async updateGroup() {
    if (!this.isFormValid) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      return;
    }

    const formValue = this.groupEditForm.value;
    if (formValue.name) {
      const loader = await this.commonUtilService.getLoader();
      await loader.present();

      this.group.name = formValue.name;
      this.group.grade = (!formValue.class.length) ? [] : Array.isArray(formValue.class) ? formValue.class : [formValue.class];
      this.group.syllabus = (!formValue.syllabus.length) ? [] : [formValue.syllabus];
      this.group.gradeValue = {};

      if (this.group.grade && this.group.grade.length > 0) {
        this.group.grade.forEach(gradeCode => {
          for (let i = 0; i < this.classList.length; i++) {
            if (this.classList[i].code === gradeCode) {
              this.group.gradeValue[this.classList[i].code] = this.classList[i].name;
              break;
            }
          }
        });
      }

      this.groupService.updateGroup(this.group)
        .subscribe(async (val) => {
          await loader.dismiss();
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.EDIT_GROUP_SUCCESS,
            Environment.USER,
            PageId.CREATE_GROUP
          );
          // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));
          this.router.navigate(['../'], { relativeTo: this.route });
        }, async (error) => {
          await loader.dismiss();
          console.error('Error : ' + error);
        });
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('ENTER_GROUP_NAME'));
    }
  }

  /**
 *
 * @param frameworkId
 * @param isSyllabusChanged
 */
  getClassList(frameworkId, isSyllabusChanged: boolean = true) {
    if (isSyllabusChanged) {
      this.loader = this.commonUtilService.getLoader();
      this.loader.present();
    }

    frameworkId = frameworkId ? frameworkId : this.groupEditForm.value.syllabus;
    console.log('framework id', frameworkId);
    this.groupEditForm.patchValue({
      class: []
    });

    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: frameworkId,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then((framework: Framework) => {
        this.isFormValid = true;
        const request: GetFrameworkCategoryTermsRequest = {
          currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
          language: this.translate.currentLang,
          requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
          frameworkId: frameworkId
        };
        return this.frameworkUtilService.getFrameworkCategoryTerms(request).toPromise();
      })
      .then((classes) => {
        this.loader.dismiss();
        this.classList = classes;

        if (!isSyllabusChanged) {
          this.groupEditForm.patchValue({
            class: this.group.grade || []
          });
        }
      })
      .catch(error => {
        this.loader.dismiss();
        this.isFormValid = false;
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
        console.error('Error : ' + error);
      });
  }
}
