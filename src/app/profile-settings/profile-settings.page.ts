import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationExtras } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PreferenceKey, ProfileConstants } from '@app/app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
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
  ProfileType,
  SharedPreferences
} from 'sunbird-sdk';
import {
  AppGlobalService,
  TelemetryGeneratorService,
  CommonUtilService,
  SunbirdQRScanner,
  ContainerService,
  AppHeaderService
} from 'services';
import { Platform, Events, AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { SplashScreenService } from '@app/services/splash-screen.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {

  public pageId = 'ProfileSettingsPage';
  @ViewChild('boardSelect') boardSelect: any;
  @ViewChild('mediumSelect') mediumSelect: any;
  @ViewChild('gradeSelect') gradeSelect: any;

  counter = 0;
  userForm: FormGroup;
  classList = [];
  profile: Profile;

  syllabusList: Array<any> = [];
  BoardList: Array<any> = [];
  mediumList: Array<any> = [];
  gradeList: Array<any> = [];
  categories: Array<any> = [];
  loader: any;
  frameworks: Array<any> = [];
  frameworkId = '';
  btnColor = '#8FC4FF';
  isEditData = true;
  unregisterBackButton: Subscription;
  selectedLanguage = 'en';
  profileForTelemetry: any = {};
  hideBackButton = true;
  appName: string;
  headerObservable: any;

  boardOptions = {
    title: this.commonUtilService.translateMessage('BOARD_OPTION_TEXT'),
    cssClass: 'select-box'
  };
  mediumOptions = {
    title: this.commonUtilService.translateMessage('MEDIUM_OPTION_TEXT'),
    cssClass: 'select-box'
  };
  classOptions = {
    title: this.commonUtilService.translateMessage('GRADE_OPTION_TEXT'),
    cssClass: 'select-box'
  };
  private navParams: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private fb: FormBuilder,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private scanner: SunbirdQRScanner,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private container: ContainerService,
    private telemetryService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private router: Router,
    private appVersion: AppVersion,
    private alertCtrl: AlertController,
    private location: Location,
    private splashScreenService: SplashScreenService
  ) {
    this.getNavParams();
    this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
      .then(val => {
        if (val && val.length) {
          this.selectedLanguage = val;
        }
      });
    this.initUserForm();
    this.getGuestUser();
    this.handleBackButton();
  }

  getNavParams() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }
  }

  ngOnInit() {
    if (this.navParams && this.navParams.stopScanner && this.navParams.stopScanner) {
      setTimeout(() => {
        this.scanner.stopScanner();
      }, 500);
    }
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.ONBOARDING_PROFILE_PREFERENCES,
      Environment.ONBOARDING
    );
    this.appVersion.getAppName().then((appName) => {
      this.appName = (appName).toUpperCase();
    });
  }

  ionViewWillEnter() {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    if (this.navParams) {
      this.hideBackButton = Boolean(this.navParams.hideBackButton);
    }
    if (!this.hideBackButton) {
      this.headerService.showHeaderWithBackButton();
    } else {
      this.headerService.hideHeader();
    }
    if (this.navParams && this.navParams.isCreateNavigationStack) {
      /* migration TODO
      this.navCtrl.insertPages(0, [{page: 'LanguageSettingsPage'}, {page: 'UserTypeSelectionPage'}]);
      */
    }
    this.getSyllabusDetails();
  }

  ionViewDidEnter() {
    this.updateStyle();
    this.hideOnboardingSplashScreen();
  }

  async hideOnboardingSplashScreen() {
    if (this.navParams && this.navParams.forwardMigration) {
      this.splashScreenService.handleSunbirdSplashScreenActions();
    }
  }

  updateStyle() {
    const ionSelectElement = Array.from(document.querySelectorAll('ion-item ion-select'));
    if (ionSelectElement) {
      ionSelectElement.forEach((element) => {
        element['shadowRoot'].querySelector('.select-text').setAttribute('style', 'color:#006de5;padding-left: 10px;opacity: inherit');
      });
    }

    const defaultSelectElement = Array.from(document.querySelectorAll('.item-label-stacked ion-select'));
    if (defaultSelectElement) {
      defaultSelectElement.forEach((element) => {
        element['shadowRoot'].querySelector('.select-icon-inner')
          .setAttribute('style', 'border: solid blue;border-width: 0 2px 2px 0;display: inline-block;padding: 4px;transform: rotate(45deg);animation: upDownAnimate 5s linear infinite;animation-duration: 0.9s;');
      });
    }

    const disabledSelectElement = Array.from(document.querySelectorAll('.item-label-stacked.item-select-disabled ion-select'));
    if (disabledSelectElement) {
      disabledSelectElement.forEach((element) => {
        element['shadowRoot'].querySelector('.select-text.select-placeholder').setAttribute('style', 'color: #cccccc !important;padding-left: 10px;');
        element['shadowRoot'].querySelector('.select-icon-inner').setAttribute('style', 'border-color: #cccccc !important;animation: none;border: solid;border-width: 0 2px 2px 0;display: inline-block;padding: 4px;transform: rotate(45deg);');
      });
    }

    const hasValueSelectElement = Array.from(document.querySelectorAll('.item-label-stacked.item-has-value ion-select'));
    if (hasValueSelectElement) {
      hasValueSelectElement.forEach((element) => {
        element['shadowRoot'].querySelector('.select-text').setAttribute('style', 'font-weight: bold;color: #333333;padding-left: 10px;');
        element['shadowRoot'].querySelector('.select-icon-inner').setAttribute('style', 'border-color: #333333;animation: none;border: solid;border-width: 0 2px 2px 0;display: inline-block;padding: 4px;transform: rotate(45deg);');
      });
    }
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  /**
   * It will Dismiss active popup
   */
  async dismissPopup() {
    const activePortal = await this.alertCtrl.getTop();

    if (activePortal) {
      activePortal.dismiss();
    } else {
      this.location.back();
    }
    // Migration Todo
    /* else if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    } */

  }

  /**
   * Initializes guest user object
   */
  getGuestUser() {
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .toPromise()
      .then((response: any) => {
        this.profile = response;
        console.log('responseresponse', response);

        this.profileForTelemetry = Object.assign({}, this.profile);
        this.initUserForm();
      }).catch((error) => {
        this.profile = undefined;
        this.initUserForm();
      });
  }

  /**
   * Initializes form and assigns default values from the profile object
   */
  initUserForm() {
    this.userForm = this.fb.group({
      syllabus: [this.profile && this.profile.syllabus && this.profile.syllabus[0] || []],
      boards: [this.profile && this.profile.board || []],
      grades: [this.profile && this.profile.grade || []],
      medium: [this.profile && this.profile.medium || []]
    });
  }

  /**
   * It will fetch syllabus details
   */
  async getSyllabusDetails() {
    this.loader = await this.commonUtilService.getLoader();
    this.loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (result: Framework[]) => {
        console.log('getActiveChannelSuggestedFrameworkList', result);
        this.syllabusList = [];
        if (result && result !== undefined && result.length > 0) {
          result.forEach(element => {
            // renaming the fields to text, value and checked
            const value = { name: element.name, code: element.identifier };
            this.syllabusList.push(value);
          });
          await this.loader.dismiss();
          if (this.profile && this.profile.syllabus && this.profile.syllabus[0] !== undefined) {
            const frameworkDetailsRequest: FrameworkDetailsRequest = {
              frameworkId: this.profile.syllabus[0] ? this.profile.syllabus[0] : '',
              requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
              .then((framework: Framework) => {
                this.categories = framework.categories;
                this.resetForm(0, false);
              }).catch(async error => {
                console.error('Error', error);
                await this.loader.dismiss();
                this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
              });
          }
        } else {
          await this.loader.dismiss();
          this.commonUtilService.showToast('NO_DATA_FOUND');
        }
      });
  }

  /**
   * This will internally call framework API
   * @param {string} currentCategory - request Parameter passing to the framework API
   * @param {string} list - Local variable name to hold the list data
   */
  getCategoryData(req: GetFrameworkCategoryTermsRequest, list): void {
    if (this.frameworkId) {
      this.frameworkUtilService.getFrameworkCategoryTerms(req).toPromise()
        .then(async (result: CategoryTerm[]) => {
          if (this.loader !== undefined) {
            await this.loader.dismiss();
          }
          this[list] = result;
          if (list !== 'gradeList') {
            this[list] = orderBy(this[list], ['name'], ['asc']);
          }
          if (req.currentCategoryCode === 'board') {
            const boardName = this.syllabusList.find(framework => this.frameworkId === framework.code);
            if (boardName) {
              const boardCode = result.find(board => boardName.name === board.name);
              if (boardCode) {
                this.userForm.patchValue({
                  boards: [boardCode.code]
                });
                this.resetForm(1, false);
              } else {
                this.userForm.patchValue({
                  boards: [result[0].code]
                });
                this.resetForm(1, false);
              }
            }
          } else if (this.isEditData) {
            this.isEditData = false;
            this.userForm.patchValue({
              medium: this.profile.medium || []
            });
            this.userForm.patchValue({
              grades: this.profile.grade || []
            });
          }
          this.updateStyle();
        });
    }
  }

  /**
   * It will check previous value and make a API call
   * @param index
   * @param currentField
   * @param prevSelectedValue
   */
  async checkPrevValue(index, currentField, prevSelectedValue: any[]) {
    if (index === 1) {
      const loader = await this.commonUtilService.getLoader();
      this.frameworkId = prevSelectedValue ? (Array.isArray(prevSelectedValue[0]) ? prevSelectedValue[0][0] : prevSelectedValue[0]) : '';
      const frameworkDetailsRequest: FrameworkDetailsRequest = {
        frameworkId: this.frameworkId,
        requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
      };
      this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
        .then((framework: Framework) => {
          this.categories = framework.categories;
          console.log('this.categories', this.categories);
          const request: GetFrameworkCategoryTermsRequest = {
            currentCategoryCode: this.categories.length ? this.categories[0].code : '',
            language: this.translate.currentLang,
            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
            frameworkId: this.frameworkId
          };
          this.getCategoryData(request, currentField);
        }).catch(async () => {
          this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
          await loader.dismiss();
        });

    } else {
      const request: GetFrameworkCategoryTermsRequest = {
        currentCategoryCode: (this.categories.length > 1) ? this.categories[index - 1].code : '',
        prevCategoryCode: (this.categories.length > 2) ? this.categories[index - 2].code : '',
        selectedTermsCodes: prevSelectedValue,
        language: this.selectedLanguage,
        requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
        frameworkId: this.frameworkId
      };
      this.getCategoryData(request, currentField);
    }
  }

  /**
   * It will reset user form, based on given index
   * @param {number}  index
   * @param {boolean} showLoader Flag for showing loader or not
   */
  async resetForm(index, showLoader: boolean) {
    const oldAttribute: any = {};
    const newAttribute: any = {};
    switch (index) {
      case 0:
        this.userForm.patchValue({
          boards: [],
          grades: [],
          medium: []
        });
        if (showLoader) {
          this.loader = await this.commonUtilService.getLoader();
          this.loader.present();
        }
        oldAttribute.board = this.profileForTelemetry.board && this.profileForTelemetry.board.length ? this.profileForTelemetry.board : '';
        newAttribute.board = this.userForm.value.syllabus ? this.userForm.value.syllabus : '';
        if (!isEqual(oldAttribute, newAttribute)) {
          this.appGlobalService.generateAttributeChangeTelemetry(
            oldAttribute, newAttribute, PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING
          );
        }
        this.profileForTelemetry.board = this.userForm.value.syllabus;
        this.checkPrevValue(1, 'boardList', [this.userForm.value.syllabus]);
        // Migration Todo
        // document.querySelectorAll('[ion-button=alert-button]')[0].setAttribute('disabled', 'false');
        this.updateStyle();
        break;

      case 1:
        this.userForm.patchValue({
          grades: [],
          medium: []
        });

        this.checkPrevValue(2, 'mediumList', this.userForm.value.boards);
        this.updateStyle();
        break;

      case 2:
        this.userForm.patchValue({
          grades: [],
        });

        oldAttribute.medium = this.profileForTelemetry.medium ? this.profileForTelemetry.medium : '';
        newAttribute.medium = this.userForm.value.medium ? this.userForm.value.medium : '';
        if (!isEqual(oldAttribute, newAttribute)) {
          this.appGlobalService.generateAttributeChangeTelemetry(
            oldAttribute, newAttribute, PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING
          );
        }
        this.profileForTelemetry.medium = this.userForm.value.medium;
        this.checkPrevValue(3, 'gradeList', this.userForm.value.medium);
        this.updateStyle();
        break;
    }
  }

  enableSubmit() {
    if (this.userForm.value.grades.length) {
      this.btnColor = '#006DE5';
    } else {
      this.btnColor = '#8FC4FF';
    }
    const oldAttribute: any = {};
    const newAttribute: any = {};
    oldAttribute.class = this.profileForTelemetry.grade ? this.profileForTelemetry.grade : '';
    newAttribute.class = this.userForm.value.grades ? this.userForm.value.grades : '';
    if (!isEqual(oldAttribute, newAttribute)) {
      this.appGlobalService.generateAttributeChangeTelemetry(
        oldAttribute, newAttribute, PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING
      );
    }
    this.profileForTelemetry.grade = this.userForm.value.grades;
    setTimeout(() => {
      this.updateStyle();
    }, 10);
  }

  extractProfileForTelemetry(formVal): any {
    const profileReq: any = {};
    profileReq.board = formVal.syllabus;
    profileReq.medium = formVal.medium;
    profileReq.grade = formVal.grades;
    return profileReq;
  }

  async onSubmit() {
    const loader = await this.commonUtilService.getLoader();
    const formVal = this.userForm.value;
    if (formVal.boards.length === 0) {
      this.btnColor = '#8FC4FF';
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(formVal), 'failed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      // this.commonUtilService.showToast(this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService
      //   .translateMessage('BOARD')), false, 'redErrorToast');
      const values = new Map();
      values['board'] = 'na';
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        'submit-clicked',
        Environment.HOME,
        PageId.ONBOARDING_PROFILE_PREFERENCES,
        undefined,
        values
      );
      this.boardSelect.open();
      return false;
    } else if (formVal.medium.length === 0) {
      this.btnColor = '#8FC4FF';
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(formVal), 'failed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      // this.commonUtilService.showToast(this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService
      //   .translateMessage('MEDIUM')), false, 'redErrorToast');
      const values = new Map();
      values['medium'] = 'na';
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        'submit-clicked',
        Environment.HOME,
        PageId.ONBOARDING_PROFILE_PREFERENCES,
        undefined,
        values
      );
      this.mediumSelect.open();
      return false;
    } else if (formVal.grades.length === 0) {
      this.btnColor = '#8FC4FF';
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(formVal), 'failed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      // this.commonUtilService.showToast(this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService
      //   .translateMessage('CLASS')), false, 'redErrorToast');
      this.gradeSelect.open();
      const values = new Map();
      values['grades'] = 'na';
      this.telemetryService.generateInteractTelemetry(
        InteractType.TOUCH,
        'submit-clicked',
        Environment.HOME,
        PageId.ONBOARDING_PROFILE_PREFERENCES,
        undefined,
        values
      );
      return false;
    } else {
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(formVal), 'passed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      this.submitEditForm(formVal, loader);

    }
  }

  submitEditForm(formVal, loader): void {
    const req: Profile = {
      ...this.profile,
      board: formVal.boards,
      grade: formVal.grades,
      medium: formVal.medium
    };

    if (this.navParams && this.navParams.selectedUserType) {
      req.profileType = this.navParams.selectedUserType;
    } else {
      req.profileType = this.profile.profileType;
    }

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
    this.profileService.updateProfile(req).toPromise()
      .then((res: any) => {
        if (req.profileType === ProfileType.TEACHER) {
          initTabs(this.container, GUEST_TEACHER_TABS);
        } else if (req.profileType === ProfileType.STUDENT) {
          initTabs(this.container, GUEST_STUDENT_TABS);
        }
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = res;
        this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
        this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = res;
        this.appGlobalService.setOnBoardingCompleted();
        this.telemetryGeneratorService.generateProfilePopulatedTelemetry(
          PageId.ONBOARDING_PROFILE_PREFERENCES, req, 'manual', Environment.ONBOARDING
        );

        const navigationExtras: NavigationExtras = {
          state: {
            loginMode: 'guest'
          }
        };
        this.router.navigate(['/tabs'], navigationExtras);
      })
      .catch(async () => {
        await loader.dismiss();
        this.commonUtilService.showToast('PROFILE_UPDATE_FAILED');
      });
  }

  handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      // migration-TODO
      // const navObj = this.app.getActiveNavs()[0];

      // if (navObj.canGoBack()) {
      //   this.telemetryGeneratorService.generateBackClickedTelemetry(
      //     PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING, false);
      //   this.dismissPopup();
      // } else {
      //   this.commonUtilService.showExitPopUp(PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING, false);
      // }

      this.dismissPopup();
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING, true);
                   this.dismissPopup();
                   break;
    }
  }

  openQRScanner() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.QRCodeScanClicked,
      Environment.ONBOARDING,
      PageId.ONBOARDING_PROFILE_PREFERENCES,
    );
    this.scanner.startScanner(PageId.ONBOARDING_PROFILE_PREFERENCES, false);
  }
}

