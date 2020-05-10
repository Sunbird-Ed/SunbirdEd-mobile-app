import { tap } from 'rxjs/operators';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Component, Inject, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { IonSelect, Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  FrameworkService,
  FrameworkUtilService,
  GetSuggestedFrameworksRequest,
  GetFrameworkCategoryTermsRequest,
  Framework,
  FrameworkCategoryCodesGroup,
  Profile,
  ProfileService,
  CachedItemRequestSourceFrom,
  Channel,
  FrameworkCategoryCode
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-create-edit-classroom',
  templateUrl: './create-edit-classroom.page.html',
  styleUrls: ['./create-edit-classroom.page.scss'],
})
export class CreateEditClassroomPage implements OnInit, OnDestroy {

  @ViewChild('boardSelect') boardSelect: IonSelect;
  @ViewChild('mediumSelect') mediumSelect: IonSelect;
  @ViewChild('gradeSelect') gradeSelect: IonSelect;
  @ViewChild('subjectSelect') subjectSelect: IonSelect;

  private initialAutoFill = true;
  private framework: Framework;
  private formControlSubscriptions: Subscription;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];
  public boardList: { name: string, code: string }[] = [];

  disableSubmitButton = false;

  profile: Profile;
  profileEditForm: FormGroup;
  frameworkId: string;
  categories = [];
  btnColor = '#8FC4FF';
  showOnlyMandatoryFields = true;
  editData = true;
  loader: any;
  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };

  backButtonFunc: Subscription;
  hasFilledLocation = false;

  /* Custom styles for the select box popup */
  boardOptions = {
    header: this.commonUtilService.translateMessage('BOARD').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };
  mediumOptions = {
    header: this.commonUtilService.translateMessage('MEDIUM').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };
  classOptions = {
    header: this.commonUtilService.translateMessage('CLASS').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };
  subjectOptions = {
    header: this.commonUtilService.translateMessage('SUBJECT').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };

  isBoardAvailable = true;

  get syllabusControl(): FormControl {
    return this.profileEditForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.profileEditForm.get('boards') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.profileEditForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.profileEditForm.get('grades') as FormControl;
  }

  get subjectControl(): FormControl {
    return this.profileEditForm.get('subjects') as FormControl;
  }

  errorMessages = {
    className: {
      show: false,
      message: this.commonUtilService.translateMessage('CLASSROOM_NAME_IS_REQUIRED')
    }
  };

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private alertCtrl: AlertController,

  ) {
    this.appGlobalService.closeSigninOnboardingLoader();
    this.profile = this.appGlobalService.getCurrentUser();
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState && extrasState.showOnlyMandatoryFields) {
      this.hasFilledLocation = extrasState.hasFilledLocation;
      this.showOnlyMandatoryFields = extrasState.showOnlyMandatoryFields;
      if (extrasState.profile) {
        this.profile = extrasState.profile;
      }
    } else {
      this.showOnlyMandatoryFields = false;
    }
    this.initializeForm();
  }

  ngOnInit() {
    this.formControlSubscriptions = combineLatest(
      this.onSyllabusChange(),
      this.onMediumChange(),
      this.onGradeChange()
    ).subscribe();
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }

  ionViewWillEnter() {
    this.initializeLoader();
    if (this.appGlobalService.isUserLoggedIn()) {
      this.getLoggedInFrameworkCategory();
    } else {
      this.getSyllabusDetails();
    }
    this.disableSubmitButton = false;
    this.headerService.showHeaderWithBackButton();

    this.handleBackButtonEvents();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleBackButtonEvents() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(0, async () => {
      const activePortal = await this.alertCtrl.getTop();
      if (activePortal) {
        activePortal.dismiss();
      } else {
        this.location.back();
      }
    });
  }

  initializeForm() {
    if (this.profile.board && this.profile.board.length > 1) {
      this.profile.board.splice(1, this.profile.board.length);
    }
    this.profileEditForm = this.fb.group({
      classroomName: '',
      syllabus: [],
      boards: [],
      medium: [],
      grades: [],
      subjects: []
    });
  }

  async initializeLoader() {
    this.loader = await this.commonUtilService.getLoader();
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

          const boards = await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise()
          this.boardList = boards.map(t => ({ name: t.name, code: t.code }));

          const boardTerm = boards.find(b => b.name === (this.syllabusList.find((s) => s.code === value[0])!.name));

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
          if (!this.mediumControl.value && this.initialAutoFill) {
            if (this.profile.medium.length === 1) {
              this.mediumControl.patchValue(this.profile.medium);
            } else {
              this.initialAutoFill = false;
            }
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
          if (!this.gradeControl.value && this.initialAutoFill) {
            if (this.profile.grade.length === 1) {
              this.gradeControl.patchValue(this.profile.grade);
            } else {
              this.initialAutoFill = false;
            }
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
          if (!this.subjectControl.value && this.initialAutoFill) {
            if (this.profile.subject.length === 1) {
              this.subjectControl.patchValue(this.profile.subject);
            }
            this.initialAutoFill = false;
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

  onSubmit() {
    const formVal = this.profileEditForm.value;
    if (!formVal.classroomName.trim().length) {
      this.errorMessages.className.show = true;
      return;
    } else if (!formVal.boards.length && this.syllabusList.length) {
      this.boardSelect.open();
      return;
    } else if (!formVal.medium || !formVal.medium.length) {
      this.mediumSelect.open();
      return;
    } else if (!formVal.grades || !formVal.grades.length) {
      this.gradeSelect.open();
      return;
    } else if (!formVal.subjects || !formVal.subjects.length) {
      this.subjectSelect.open();
      return;
    }

    // TODO
    // this.submitForm(formVal);
  }

  onInputFields(inputType, event) {
    console.log(event.data);
    if (inputType === 'CLASSNAME') {
      if (!event && !event.data && !event.data.trim().length) {
        this.errorMessages.className.show = true;
      } else {
        this.errorMessages.className.show = false;
      }
    }
  }

  async submitForm(formVal) {

  }

  async getLoggedInFrameworkCategory() {
    try {
      const activeChannelDetails: Channel = await this.frameworkService.getChannelDetails({ channelId: this.frameworkService.activeChannelId }).toPromise()
      const defaultFrameworkDetails: Framework = await this.frameworkService.getFrameworkDetails({
        frameworkId: activeChannelDetails.defaultFramework, requiredCategories: []
      }).toPromise();
      const activeChannelSuggestedFrameworkList: Framework[] = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList({
        language: '',
        requiredCategories: []
      }).toPromise();
      this.frameworkId = activeChannelDetails.defaultFramework;
      this.categories = defaultFrameworkDetails.categories;
      const boardCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'board');
      const mediumCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'medium');

      if (boardCategory) {
        this.syllabusList = activeChannelSuggestedFrameworkList.map(f => ({ name: f.name, code: f.identifier }));
        this.isBoardAvailable = true;
        this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
      } else {
        this.categories.unshift([]);
        this.isBoardAvailable = false;
        this.mediumList = mediumCategory.terms;
        this.mediumControl.patchValue(this.profile.medium || []);
      }
    } catch (err) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      }
      console.error('getFrameWorkCategoryOrder', err);
    }
  }

}
