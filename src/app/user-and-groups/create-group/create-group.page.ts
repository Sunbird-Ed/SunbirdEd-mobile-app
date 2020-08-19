import { Component, Inject, OnInit, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  GroupDeprecated,
  GroupServiceDeprecated
} from 'sunbird-sdk';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {
  groupEditForm: FormGroup;
  group: GroupDeprecated;
  isEditGroup = false;
  categories: Array<any> = [];
  loader: any;
  isFormValid = true;
  navData: any;
  backButtonFunc: Subscription;

  private _classList = [];
  private _syllabusList: Array<any> = [];

  get syllabusList() {
    return this._syllabusList;
  }
  set syllabusList(v) {
    this._syllabusList = v;
    this.changeDetectionRef.detectChanges();
  }

  get classList() {
    return this._classList;
  }
  set classList(v) {
    this._classList = v;
    this.changeDetectionRef.detectChanges();
  }


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
    public commonUtilService: CommonUtilService,
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private zone: NgZone,
    private location: Location,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.navData = this.router.getCurrentNavigation().extras.state;
    this.group = (this.navData && this.navData.groupInfo) ? this.navData.groupInfo : {};
    this.groupEditForm = this.fb.group({
      name: [this.group.name || '', Validators.required],
      syllabus: [this.group.syllabus && this.group.syllabus[0] || []],
      class: [this.group.grade || []]
    });

    this.isEditGroup = Boolean(this.group.hasOwnProperty('gid'));
  }

  ionViewDidEnter() {
    const headerTitle = this.isEditGroup ? 'EDIT_GROUP' : 'CREATE_GROUP';
    this.headerService.showHeaderWithBackButton([], this.commonUtilService.translateMessage(headerTitle));
  }

  ionViewWillEnter() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
    });
  }

  ngOnInit() {
    this.loadTelemetry();
    this.getSyllabusDetails();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  loadTelemetry() {
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
            await loader.dismiss();
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
    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`]);
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
      this.router.navigate([`/${RouterLinks.USER_AND_GROUPS}/${RouterLinks.GROUP_MEMBERS}`], navigationExtras);
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('ENTER_GROUP_NAME'));
    }
  }

  /**
   * Internally calls Update group API if form is valid
   */
  async updateGroup() {
    if(!this.commonUtilService.networkInfo.isNetworkAvailable) {
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
          loader.dismiss();
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.EDIT_GROUP_SUCCESS,
            Environment.USER,
            PageId.CREATE_GROUP
          );
          // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 2));
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_UPDATE_SUCCESS'));
          //this.router.navigate(['../'], { relativeTo: this.route });
          this.location.back();
        }, async (error) => {
          loader.dismiss();
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
  async getClassList(frameworkId, isSyllabusChanged: boolean = true) {
    if (isSyllabusChanged) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
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
      .then(async (classes) => {
        if (isSyllabusChanged) {
          await this.loader.dismiss();
        }
    this.classList = classes;

        if (!isSyllabusChanged) {
          this.groupEditForm.patchValue({
            class: this.group.grade || []
          });
        }
      })
      .catch(async error => {
        if (isSyllabusChanged) {
          await this.loader.dismiss();
        }
        this.isFormValid = false;
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
        }
        console.error('Error : ' + error);
      });
  }
}
