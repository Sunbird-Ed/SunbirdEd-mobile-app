
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
  FrameworkCategoryCode,
  LocationSearchResult,
  SharedPreferences,
  LocationSearchCriteria
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Location as loc, PreferenceKey } from '@app/app/app.constant';

@Component({
  selector: 'app-sub-profile-edit',
  templateUrl: './sub-profile-edit.page.html',
  styleUrls: ['./sub-profile-edit.page.scss'],
})
export class SubProfileEditPage implements OnInit, OnDestroy {

  @ViewChild('boardSelect') boardSelect: IonSelect;
  @ViewChild('mediumSelect') mediumSelect: IonSelect;
  @ViewChild('gradeSelect') gradeSelect: IonSelect;
  @ViewChild('stateSelect') stateSelect: IonSelect;
  @ViewChild('districtSelect') districtSelect: IonSelect;

  private framework: Framework;
  private formControlSubscriptions: Subscription;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public boardList: { name: string, code: string }[] = [];
  public stateList: LocationSearchResult[] = [];
  public districtList: LocationSearchResult[] = [];

  disableSubmitButton = false;

  profile: Profile;
  subProfileEditForm: FormGroup;
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
  stateOptions = {
    header: this.commonUtilService.translateMessage('STATE').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };
  districtOptions = {
    header: this.commonUtilService.translateMessage('DISTRICT').toLocaleUpperCase(),
    cssClass: 'select-box',
    animated: false
  };

  isBoardAvailable = true;
  availableState: string;
  availableDistrict: string;
  appName = '';

  get syllabusControl(): FormControl {
    return this.subProfileEditForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.subProfileEditForm.get('boards') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.subProfileEditForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.subProfileEditForm.get('grades') as FormControl;
  }

  get stateControl(): FormControl {
    return this.subProfileEditForm.get('state') as FormControl;
  }

  get districtControl(): FormControl {
    return this.subProfileEditForm.get('district') as FormControl;
  }

  errorMessages = {
    userName: {
      show: false,
      message: this.commonUtilService.translateMessage('NAME_IS_REQUIRED')
    }
  };

  selectedText = {
    medium: '',
    grade: '',
    state: '',
    district: ''
  };

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
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

    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    });
  }

  ngOnInit() {
    this.formControlSubscriptions = combineLatest(
      this.onSyllabusChange(),
      this.onMediumChange(),
      this.onGradeChange(),
      this.onStateChange()
    ).subscribe();
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }

  ionViewWillEnter() {
    this.initializeLoader();
    this.checkLocationAvailability();
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
    this.subProfileEditForm = this.fb.group({
      userName: '',
      syllabus: [],
      boards: [],
      medium: [],
      grades: [],
      state: '',
      district: ''
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
        // this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
        // disabling auto fill
        this.syllabusControl.patchValue([]);
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
          // if (!this.mediumControl.value) {
          //   this.mediumControl.patchValue(this.profile.medium || []);
          // } else {
            this.mediumControl.patchValue([]);
          // }
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

        this.selectedText.medium = this.formatSelectBoxDisplayText(this.mediumControl, this.mediumList);

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
          // if (!this.gradeControl.value) {
          //   this.gradeControl.patchValue(this.profile.grade || []);
          // } else {
            this.gradeControl.patchValue([]);
          // }
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
          this.selectedText.grade = this.formatSelectBoxDisplayText(this.gradeControl, this.gradeList);
      })
    );
  }

  onSubmit() {
    const formVal = this.subProfileEditForm.value;
    if (!formVal.userName.trim().length) {
      this.errorMessages.userName.show = true;
      return;
    } else if (!formVal.boards || !formVal.boards.length) {
      this.boardSelect.open();
      return;
    } else if (!formVal.medium || !formVal.medium.length) {
      this.mediumSelect.open();
      return;
    } else if (!formVal.grades || !formVal.grades.length) {
      this.gradeSelect.open();
      return;
    } else if (!formVal.state || !formVal.state.length) {
      this.stateSelect.open();
      return;
    } else if (!formVal.district || !formVal.district.length) {
      this.districtSelect.open();
      return;
    }

    // TODO
    // this.submitForm(formVal);
  }

  onInputFields(event) {
    if (!event && !event.data && !event.data.trim().length) {
      this.errorMessages.userName.show = true;
    } else {
      this.errorMessages.userName.show = false;
    }
  }

  async submitForm(formVal) {

  }

  onCancel() {
    this.location.back();
  }

  async getLoggedInFrameworkCategory() {
    try {
      const activeChannelDetails: Channel = await this.frameworkService.getChannelDetails({ channelId: this.frameworkService.activeChannelId }).toPromise()
      const defaultFrameworkDetails: Framework = await this.frameworkService.getFrameworkDetails({
        frameworkId: activeChannelDetails.defaultFramework, requiredCategories: []
      }).toPromise();
      const activeChannelSuggestedFrameworkList: Framework[] = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList({
        language: '',
        requiredCategories: [],
        ignoreActiveChannel: true
      }).toPromise();
      this.frameworkId = activeChannelDetails.defaultFramework;
      this.categories = defaultFrameworkDetails.categories;
      const boardCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'board');
      const mediumCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'medium');

      if (boardCategory) {
        this.syllabusList = activeChannelSuggestedFrameworkList.map(f => ({ name: f.name, code: f.identifier }));
        this.isBoardAvailable = true;
        // this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
        // disabling auto fill
        this.syllabusControl.patchValue([]);
      } else {
        this.categories.unshift([]);
        this.isBoardAvailable = false;
        this.mediumList = mediumCategory.terms;
        // this.mediumControl.patchValue(this.profile.medium || []);
        // disabling auto fill
        this.mediumControl.patchValue([]);
      }
    } catch (err) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      }
      console.error('getFrameWorkCategoryOrder', err);
    }
  }

  formatSelectBoxDisplayText(selectedCategory: FormControl, categoryList: { name: string, code: string }[]) {
    let displayText = '';
    if (selectedCategory && selectedCategory.value && selectedCategory.value.length && categoryList.length) {
      selectedCategory.value.forEach((categoryCode: string) => {
        categoryList.forEach(categoryData => {
          if (categoryData.code === categoryCode) {
            displayText += (displayText.length) ? ', ' + categoryData.name : categoryData.name;
            return;
          }
        });
      });
    }
    return displayText;
  }

  async checkLocationAvailability() {
    if (this.profile) {
      if (this.profile.serverProfile && this.profile.serverProfile['userLocations'] && this.profile.serverProfile['userLocations'].length) {
        for (const ele of this.profile.serverProfile['userLocations']) {
          if (ele.type === 'district') {
            this.availableDistrict = ele.name;
          } else if (ele.type === 'state') {
            this.availableState = ele.name;
          }
        }
      }
    } else if (await this.commonUtilService.isDeviceLocationAvailable()) {
      const availableLocationData = JSON.parse(await this.sharedPreferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise());
      this.availableState = availableLocationData.state;
      this.availableDistrict = availableLocationData.district;
    } else if (await this.commonUtilService.isIpLocationAvailable()) {
      const availableLocationData = JSON.parse(await this.sharedPreferences.getString(PreferenceKey.IP_LOCATION).toPromise());
      this.availableState = availableLocationData.state;
      this.availableDistrict = availableLocationData.district;
    }
    this.getStateList();
  }

  async getStateList() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      from: CachedItemRequestSourceFrom.SERVER,
      filters: {
        type: loc.TYPE_STATE
      }
    };
    const stateList: LocationSearchResult[] = await this.profileService.searchLocation(req).toPromise();
    if (stateList && stateList.length) {
      this.stateList = stateList;
      if (this.availableState) {
        const state = this.stateList.find(s => s.name === this.availableState);
        if (state) {
          this.selectedText.state = state.name;
          this.stateControl.patchValue(state.id);
        }
      }
    } else {
      this.selectedText.state = '',
      this.selectedText.district = '',
      this.stateList = [];
      this.districtList = [];
      this.commonUtilService.showToast('NO_DATA_FOUND');
    }
    await loader.dismiss();
  }

  private onStateChange(): Observable<string[]> {
    let autoFillDistrict = true;
    return this.stateControl.valueChanges.pipe(
      tap(async (value) => {
        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        try {
          const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
              type: loc.TYPE_DISTRICT,
              parentId: value
            }
          };
          const districtList: LocationSearchResult[] = await this.profileService.searchLocation(req).toPromise();
          if (districtList && districtList.length) {
            this.districtList = districtList;
            if (this.availableDistrict && autoFillDistrict) {
              const district = this.districtList.find(d => d.name === this.availableDistrict);
              if (district) {
                this.districtControl.patchValue(district.id || '');
              } else {
                this.districtControl.patchValue('');
              }
            } else {
              this.districtControl.patchValue('');
            }
          } else {
            this.districtList = [];
            this.districtControl.patchValue('');
            this.commonUtilService.showToast('NO_DATA_FOUND');
          }
          autoFillDistrict = false;
          await loader.dismiss();
        } catch (e) {
          await loader.dismiss();
        }
      })
    );
  }

}
