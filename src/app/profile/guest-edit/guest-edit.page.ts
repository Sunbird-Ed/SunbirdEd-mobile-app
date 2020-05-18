import { Router } from '@angular/router';
import {
  AlertController,
  Events,
  Platform,
  PopoverController
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import isEqual from 'lodash/isEqual';
import {
  CategoryTerm,
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  GetSuggestedFrameworksRequest,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SharedPreferences,
  FrameworkCategoryCode,
  CachedItemRequestSourceFrom
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
} from '@app/services/telemetry-constants';
import { ContainerService, } from '@app/services/container.services';
import { AppHeaderService } from '@app/services/app-header.service';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { PreferenceKey, RouterLinks, RegexPatterns } from '@app/app/app.constant';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { Location } from '@angular/common';
import { Observable, merge, Subscription, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-guest-edit',
  templateUrl: './guest-edit.page.html',
  styleUrls: ['./guest-edit.page.scss'],
})
export class GuestEditPage implements OnInit, OnDestroy {

  private framework: Framework;

  ProfileType = ProfileType;
  guestEditForm: FormGroup;
  profile: any = {};
  categories: Array<any> = [];
  boardList: Array<any> = [];
  userName = '';
  frameworkId = '';
  loader: any;
  isNewUser = false;
  unregisterBackButton: any;
  isCurrentUser = true;

  isFormValid = true;

  previousProfileType;
  profileForTelemetry: any = {};

  private formControlSubscriptions: Subscription;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];

  syllabusOptions = {
    title: this.commonUtilService.translateMessage('BOARD').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  boardOptions = {
    title: this.commonUtilService.translateMessage('BOARD').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  mediumOptions = {
    title: this.commonUtilService.translateMessage('MEDIUM_OF_INSTRUCTION').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  classOptions = {
    title: this.commonUtilService.translateMessage('CLASS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  subjectsOptions = {
    title: this.commonUtilService.translateMessage('SUBJECTS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  get syllabusControl(): FormControl {
    return this.guestEditForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.guestEditForm.get('boards') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.guestEditForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.guestEditForm.get('grades') as FormControl;
  }

  get subjectControl(): FormControl {
    return this.guestEditForm.get('subjects') as FormControl;
  }

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public appGlobalService: AppGlobalService,
    public commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private events: Events,
    private platform: Platform,
    private alertCtrl: AlertController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private popoverCtrl: PopoverController,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.isNewUser = Boolean(this.router.getCurrentNavigation().extras.state.isNewUser);
      this.isCurrentUser = Boolean(this.router.getCurrentNavigation().extras.state.isCurrentUser);
    }

    if (this.isNewUser) {
      if (this.router.getCurrentNavigation().extras.state) {
        this.profile = this.router.getCurrentNavigation().extras.state.lastCreatedProfile || {};
      } else {
        this.profile = {};
      }

      this.guestEditForm = this.fb.group({
        name: [this.profile.handle || ''],
        profileType: [this.profile.profileType || ProfileType.STUDENT],
        syllabus: [],
        boards: [],
        medium: [],
        grades: [],
        subjects: []
      });

    } else {
      if (this.router.getCurrentNavigation().extras.state) {
        this.profile = this.router.getCurrentNavigation().extras.state.profile || {};
      } else {
        this.profile = {};
      }

      this.guestEditForm = this.fb.group({
        name: [this.profile.handle || ''],
        profileType: [this.profile.profileType || ProfileType.STUDENT],
        syllabus: [],
        boards: [],
        medium: [],
        grades: [],
        subjects: []
      });
    }

    this.previousProfileType = this.profile.profileType;
    this.profileForTelemetry = Object.assign({}, this.profile);

  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.CREATE_USER,
      Environment.USER, this.isNewUser ? '' : this.profile.uid, this.isNewUser ? '' : ObjectType.USER,
    );

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      this.isNewUser ? InteractSubtype.CREATE_USER_INITIATED : InteractSubtype.EDIT_USER_INITIATED,
      Environment.USER,
      PageId.CREATE_USER
    );

    // auto fill alert is called when it is new user , profile and profile.name is present
    if (this.isNewUser && this.profile && this.profile.handle) {
      this.showAutoFillAlert();
    }

    this.formControlSubscriptions = combineLatest(
      this.onSyllabusChange(),
      this.onMediumChange(),
      this.onGradeChange(),
    ).subscribe();
  }


  ionViewWillEnter() {
    const headerTitle = this.isNewUser ? this.commonUtilService.translateMessage('CREATE_USER') :
      this.commonUtilService.translateMessage('EDIT_PROFILE');
    this.headerService.showHeaderWithBackButton([], headerTitle);
    this.getSyllabusDetails();
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.dismissPopup();
    });
  }

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }

  // shows auto fill alert on load
  async showAutoFillAlert() {
    const confirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('ALERT'),
        sbPopoverMainTitle: this.commonUtilService.translateMessage('PREVIOUS_USER_SETTINGS'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'sb-btn sb-btn-sm sb-btn-outline-info'
          }, {
            btntext: this.commonUtilService.translateMessage('OKAY'),
            btnClass: 'popover-color'
          }
        ],
        icon: null
      },
      cssClass: 'sb-popover',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data.isLeftButtonClicked) {
      this.guestEditForm.patchValue({
        name: undefined,
        syllabus: [],
        boards: [],
        grades: [],
        subjects: [],
        medium: []
      });
      this.guestEditForm.controls['profileType'].setValue(this.ProfileType.STUDENT);
    }
  }

  onProfileTypeChange() {
    this.guestEditForm.patchValue({
      syllabus: [],
      boards: [],
      grades: [],
      subjects: [],
      medium: []
    });
  }

  async getSyllabusDetails() {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };

    this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (frameworks: Framework[]) => {
        if (!frameworks || !frameworks.length) {
          await this.loader.dismiss();
          this.commonUtilService.showToast('NO_DATA_FOUND');
          return;
        }
        this.syllabusList = frameworks.map(r => ({ name: r.name, code: r.identifier }));
        this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
        await this.loader.dismiss();
      });
  }

  private onSyllabusChange(): Observable<string[]> {
    return this.syllabusControl.valueChanges.pipe(
      tap(async (value) => {
        if (!Array.isArray(value)) {
          this.syllabusControl.patchValue([value]);
          return;
        }

        if (!value.length) {
          return;
        }

        await this.commonUtilService.getLoader().then((loader) => {
          this.loader = loader;
          this.loader.present();
        });

        try {
          this.framework = await this.frameworkService.getFrameworkDetails({
            from: CachedItemRequestSourceFrom.SERVER,
            frameworkId: value[0],
            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
          }).toPromise();

          const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.BOARD],
            currentCategoryCode: FrameworkCategoryCode.BOARD,
            language: this.translate.currentLang
          };

          const boardTerm = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
            .find(b => b.name === (this.syllabusList.find((s) => s.code === value[0])!.name));

          this.boardControl.patchValue([boardTerm.code]);

          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.MEDIUM],
            prevCategoryCode: FrameworkCategoryCode.BOARD,
            currentCategoryCode: FrameworkCategoryCode.MEDIUM,
            language: this.translate.currentLang,
            selectedTermsCodes: this.boardControl.value
          };

          this.mediumList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          if (!this.mediumControl.value) {
            this.mediumControl.patchValue(this.profile.medium || []);
          } else {
            this.mediumControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.mediumControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onMediumChange(): Observable<string[]> {
    return this.mediumControl.valueChanges.pipe(
      tap(async (value) => {
        if (!value.length) {
          return;
        }
        await this.commonUtilService.getLoader().then((loader) => {
          this.loader = loader;
          this.loader.present();
        });

        try {
          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.GRADE_LEVEL],
            prevCategoryCode: FrameworkCategoryCode.MEDIUM,
            currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
            language: this.translate.currentLang,
            selectedTermsCodes: this.mediumControl.value
          };

          this.gradeList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          if (!this.gradeControl.value) {
            this.gradeControl.patchValue(this.profile.grade || []);
          } else {
            this.gradeControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.gradeControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onGradeChange(): Observable<string[]> {
    return this.gradeControl.valueChanges.pipe(
      tap(async () => {
        // await this.commonUtilService.getLoader().then((loader) => {
        //   this.loader = loader;
        //   this.loader.present();
        // });
        try {
          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.SUBJECT],
            prevCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
            currentCategoryCode: FrameworkCategoryCode.SUBJECT,
            language: this.translate.currentLang,
            selectedTermsCodes: this.gradeControl.value
          };

          this.subjectList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          if (!this.subjectControl.value) {
            this.subjectControl.patchValue(this.profile.subject || []);
          } else {
            this.subjectControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.subjectControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

 
  /**
   * This method is added as we are not getting subject value in reset form method
   */
  onSubjectChanged(event) {
    const oldAttribute: any = {};
    const newAttribute: any = {};
    oldAttribute.subject = this.profileForTelemetry.subject ? this.profileForTelemetry.subject : '';
    newAttribute.subject = event ? event : '';
    if (!isEqual(oldAttribute, newAttribute)) {
      this.appGlobalService.generateAttributeChangeTelemetry(oldAttribute, newAttribute, PageId.GUEST_PROFILE);
    }
    this.profileForTelemetry.subject = event;
  }

  /**
   * Call on Submit the form
   */

  async onSubmit() {
    if (!this.isFormValid) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      return;
    }
    const loader = await this.commonUtilService.getLoader();
    const formVal = this.guestEditForm.value;

    if (formVal.userType === '') {
      this.commonUtilService.showToast('USER_TYPE_SELECT_WARNING');
      return false;
    } else if (!this.validateName()) {
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('FULL_NAME')), false, 'red-toast');
    } else if (formVal.boards.length === 0) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('BOARD')), false, 'red-toast');
      return false;
    } else if (formVal.medium.length === 0) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('MEDIUM')), false, 'red-toast');
      return false;
    } else if (formVal.grades.length === 0) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('CLASS')), false, 'red-toast');
      return false;
    } else {
      await loader.present();
      if (this.isNewUser) {
        this.submitNewUserForm(formVal, loader);
      } else {
        this.submitEditForm(formVal, loader);
      }
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'passed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
    }
  }


  /**
   *  It will validate the name field.
   */
  validateName() {
    const name = this.guestEditForm.getRawValue().name;
    if (name) {
      return Boolean(name.trim().length);
    } else {
      return false;
    }
  }

  extractProfileForTelemetry(formVal): any {
    const profileReq: any = {};
    profileReq.board = formVal.boards;
    profileReq.grade = formVal.grades;
    profileReq.subject = formVal.subjects;
    profileReq.medium = formVal.medium;
    profileReq.profileType = formVal.profileType;
    profileReq.syllabus = (!formVal.syllabus.length) ? [] : [formVal.syllabus];

    return profileReq;
  }

  /**
   * This will submit edit form.
   */
  submitEditForm(formVal, loader): void {
    const req = {} as Profile;
    req.board = formVal.boards;
    req.grade = formVal.grades;
    req.subject = formVal.subjects;
    req.medium = formVal.medium;
    req.uid = this.profile.uid;
    req.handle = (formVal.name.replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '')).trim();
    req.profileType = formVal.profileType;
    req.source = this.profile.source;
    req.createdAt = this.profile.createdAt;
    req.syllabus = (!formVal.syllabus.length) ? [] : [formVal.syllabus];

    if (formVal.grades && formVal.grades.length > 0) {
      formVal.grades.forEach(gradeCode => {
        for (let i = 0; i < this.gradeList.length; i++) {
          if (this.gradeList[i].code === gradeCode) {
            if (!req.gradeValue) {
              req.gradeValue = {};
            }
            req.gradeValue[this.gradeList[i].code] = this.gradeList[i].name;
            break;
          }
        }
      });
    }
    this.profileService.updateProfile(req)
      .subscribe((res: any) => {
        this._dismissLoader(loader);
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.EDIT_USER_SUCCESS,
          Environment.USER,
          PageId.EDIT_USER
        );
        if (this.isCurrentUser) {
          this.commonUtilService.handleToTopicBasedNotification();
          this.publishProfileEvents(formVal);
        } else {
          this.location.back();
        }
      }, (err: any) => {
        this._dismissLoader(loader);
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
      });
  }

  publishProfileEvents(formVal) {
    // Publish event if the all the fields are submitted
    if (formVal.syllabus.length && formVal.boards.length && formVal.grades.length && formVal.medium.length && formVal.subjects.length) {
      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
    } else {
      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: false });
    }
    this.events.publish('refresh:profile');
    this.events.publish('refresh:onboardingcard');

    if (this.previousProfileType && this.previousProfileType !== formVal.profileType) {
      if (formVal.profileType === ProfileType.STUDENT) {
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.STUDENT).toPromise().then();
        initTabs(this.container, GUEST_STUDENT_TABS);
      } else if (formVal.profileType === ProfileType.TEACHER) {
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise().then();
        initTabs(this.container, GUEST_TEACHER_TABS);
      } else {
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.OTHER).toPromise().then();
        initTabs(this.container, GUEST_TEACHER_TABS);
      }
    }
    this.location.back();
  }


  /**
   * It will submit new user form
   */
  submitNewUserForm(formVal, loader): void {
    const req = {} as Profile;
    req.board = formVal.boards;
    req.grade = formVal.grades;
    req.subject = formVal.subjects;
    req.medium = formVal.medium;
    req.handle = formVal.name.trim();
    req.profileType = formVal.profileType;
    req.source = ProfileSource.LOCAL;
    req.syllabus = (!formVal.syllabus.length) ? [] : [formVal.syllabus];

    if (formVal.grades && formVal.grades.length > 0) {
      formVal.grades.forEach(gradeCode => {
        for (let i = 0; i < this.gradeList.length; i++) {
          if (this.gradeList[i].code === gradeCode) {
            if (!req.gradeValue) {
              req.gradeValue = {};
            }
            req.gradeValue[this.gradeList[i].code] = this.gradeList[i].name;
            break;
          }
        }
      });
    }

    this.profileService.createProfile(req, req.source).subscribe((res: any) => {
      this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_CREATED_SUCCESSFULLY'));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER, InteractSubtype.CREATE_USER_SUCCESS, Environment.USER, PageId.CREATE_USER);
      this.location.back();
    }, (err: any) => {
      this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('FILL_THE_MANDATORY_FIELDS'));
    });
  }

  private async _dismissLoader(loader?) {
    if (loader) {
      await loader.dismiss();
    } else if (this.loader) {
      await this.loader.dismiss();
      this.loader = undefined;
    }
  }

  /**
   * It will Dismiss active popup
   */
  async dismissPopup() {
    const activePortal = await this.alertCtrl.getTop();
    if (activePortal) {
      await activePortal.dismiss();
    } else {
      this.location.back();
    }
  }

}
