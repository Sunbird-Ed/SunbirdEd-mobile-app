import { Router } from '@angular/router';
import { Events } from '@app/util/events';
import { TranslateService } from '@ngx-translate/core';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import isEqual from 'lodash/isEqual';
import {
  Framework,
  FrameworkCategoryCodesGroup,
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
import { PreferenceKey, RegexPatterns } from '@app/app/app.constant';
import { Location } from '@angular/common';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ProfileHandler } from '@app/services/profile-handler';
import { LoginHandlerService } from '@app/services';

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
  btnColor = '#8FC4FF';
  private formControlSubscriptions: Subscription;
  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];
  public supportedProfileAttributes: { [key: string]: string } = {};
  public supportedUserTypes: Array<any> = [];

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
    private telemetryGeneratorService: TelemetryGeneratorService,
    private container: ContainerService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private profileHandler: ProfileHandler,
    private loginHandlerService: LoginHandlerService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.isNewUser = Boolean(this.router.getCurrentNavigation().extras.state.isNewUser);
      this.isCurrentUser = Boolean(this.router.getCurrentNavigation().extras.state.isCurrentUser);
    }

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

    this.previousProfileType = this.profile.profileType;
    this.profileForTelemetry = Object.assign({}, this.profile);

  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.CREATE_USER,
      Environment.USER, this.isNewUser ? '' : this.profile.uid, this.isNewUser ? '' : ObjectType.USER
    );

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      this.isNewUser ? InteractSubtype.CREATE_USER_INITIATED : InteractSubtype.EDIT_USER_INITIATED,
      Environment.USER,
      PageId.CREATE_USER
    );
    this.addAttributeSubscription(this.profile.profileType || undefined);
    this.supportedUserTypes = await this.profileHandler.getSupportedUserTypes();
  }

  private async addAttributeSubscription(userType: string) {
    this.supportedProfileAttributes = await this.profileHandler.getSupportedProfileAttributes(true, userType);
    const subscriptionArray: Array<any> = this.updateAttributeStreamsnSetValidators(this.supportedProfileAttributes);
    this.formControlSubscriptions = combineLatest(subscriptionArray).subscribe();
  }


  ionViewWillEnter() {
    const headerTitle = this.isNewUser ? this.commonUtilService.translateMessage('CREATE_USER') :
      this.commonUtilService.translateMessage('EDIT_PROFILE');
    this.headerService.showHeaderWithBackButton([], headerTitle);
    this.getSyllabusDetails();
  }

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }

  onProfileTypeChange() {
    if (this.formControlSubscriptions) {
      this.formControlSubscriptions.unsubscribe();
    }
    this.addAttributeSubscription(this.guestEditForm.value.profileType);
    this.guestEditForm.patchValue({
      syllabus: [],
      boards: [],
      grades: [],
      subjects: [],
      medium: []
    });
    this.btnColor = '#8FC4FF';
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
            .find(b => b.name === (this.syllabusList.find((s) => s.code === value[0]).name));

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
          console.error(e);
        } finally {
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
          console.error(e);
        } finally {
          this.loader.dismiss();
        }
      })
    );
  }

  private onGradeChange(): Observable<string[]> {
    return this.gradeControl.valueChanges.pipe(
      tap(async () => {
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
          console.error(e);
        } finally {
          this.loader.dismiss();
        }
      })
    );
  }

  /**
   * This method is added as we are not getting subject value in reset form method
   */
  onCategoryChanged(name, event) {
    if (event.detail.value && event.detail.value.length) {
      const oldAttribute: any = {};
      const newAttribute: any = {};
      oldAttribute[name] = this.profileForTelemetry[name] ? this.profileForTelemetry[name] : '';
      newAttribute[name] = event.detail.value ? event.detail.value : '';
      if (!isEqual(oldAttribute, newAttribute)) {
        this.appGlobalService.generateAttributeChangeTelemetry(oldAttribute, newAttribute, PageId.GUEST_PROFILE);
      }
      if (name === 'subject') {
        this.profileForTelemetry.subject = event.detail.value ? event.detail.value : '';
      }
    }
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

    if (!formVal.profileType) {
      this.commonUtilService.showToast('USER_TYPE_SELECT_WARNING');
      return false;
    } else if (!this.validateName()) {
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('FULL_NAME')), false, 'red-toast');
    } else if (formVal.boards && formVal.boards.length === 0) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('BOARD')), false, 'red-toast');
      return false;
    } else if (formVal.medium && formVal.medium.length === 0 && !!this.supportedProfileAttributes['medium']) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('MEDIUM')), false, 'red-toast');
      return false;
    } else if (formVal.grades && formVal.grades.length === 0 && !!this.supportedProfileAttributes['gradeLevel']) {
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
      .subscribe(() => {
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
      }, () => {
        this._dismissLoader(loader);
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
      });
  }

  publishProfileEvents(formVal) {
    // Publish event if the all the fields are submitted
    if (formVal.syllabus && formVal.syllabus.length
      && (formVal.boards && formVal.boards.length)
      && (formVal.grades && formVal.grades.length)
      && (formVal.medium && formVal.medium.length)
      && (formVal.subjects && formVal.subjects.length)) {
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
      } else if (formVal.profileType === ProfileType.ADMIN) {
        this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.ADMIN).toPromise().then();
        initTabs(this.container, GUEST_TEACHER_TABS);
        this.loginHandlerService.signIn();
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

    this.profileService.createProfile(req, req.source).subscribe(() => {
      this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_CREATED_SUCCESSFULLY'));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER, InteractSubtype.CREATE_USER_SUCCESS, Environment.USER, PageId.CREATE_USER);
      this.location.back();
    }, () => {
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

  private updateAttributeStreamsnSetValidators(attributes: { [key: string]: string }): Array<any> {
    const subscriptionArray = [];
    Object.keys(attributes).forEach((attribute) => {
      switch (attribute) {
        case 'board':
          subscriptionArray.push(this.onSyllabusChange());
          break;
        case 'medium':
          subscriptionArray.push(this.onMediumChange());
          break;
        case 'gradeLevel':
          subscriptionArray.push(this.onGradeChange());
          break;
      }
    });
    subscriptionArray.push(this.guestEditForm.valueChanges.pipe(
     delay(250),
      tap(() => {
       this.btnColor = this.guestEditForm.valid ? '#006DE5' : '#8FC4FF';
      })
    ));
    return subscriptionArray;
  }

}
