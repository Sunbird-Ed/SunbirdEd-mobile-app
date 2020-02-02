import { Component, Inject, ViewChild, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PreferenceKey, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
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
  SharedPreferences,
  DeviceRegisterService,
  FrameworkCategoryCode
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
export class ProfileSettingsPage implements OnInit, OnDestroy {
  public pageId = 'ProfileSettingsPage';
  @ViewChild('boardSelect') boardSelect: any;
  @ViewChild('mediumSelect') mediumSelect: any;
  @ViewChild('gradeSelect') gradeSelect: any;

  private framework: Framework;
  private navParams: any;
  private activeSessionProfile?: Profile;
  private unregisterBackButton: Subscription;
  private headerObservable: any;
  private formControlSubscriptions: Subscription;

  loader: any;
  btnColor = '#8FC4FF';
  appName: string;

  public profileSettingsForm: FormGroup;
  public hideBackButton = true;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];

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

  get syllabusControl(): FormControl {
    return this.profileSettingsForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.profileSettingsForm.get('board') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.profileSettingsForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.profileSettingsForm.get('grade') as FormControl;
  }

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
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
    private splashScreenService: SplashScreenService,
    private activatedRoute: ActivatedRoute
  ) {
    this.profileSettingsForm = new FormGroup({
      syllabus: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      board: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      medium: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      grade: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' })
    });
  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.ONBOARDING_PROFILE_PREFERENCES,
      Environment.ONBOARDING
    );

    this.handleActiveScanner();

    this.appVersion.getAppName().then((appName) => {
      this.appName = (appName).toUpperCase();
    });

    this.activeSessionProfile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();

    this.handleBackButton();

    this.formControlSubscriptions = combineLatest(
      this.onSyllabusChange(),
      this.onMediumChange(),
      this.profileSettingsForm.valueChanges.pipe(
        delay(250),
        tap(() => {
          this.btnColor = this.profileSettingsForm.valid ? '#006DE5' : '#8FC4FF';
          this.updateStyle();
        })
      )
    ).subscribe();

    await this.fetchSyllabusList();
    this.getQueryParams();
  }

  getQueryParams() {
    const snapshot = this.activatedRoute.snapshot;
    if (snapshot.queryParams && snapshot.queryParams.reOnboard) {
      window.history.pushState({}, '', `/${RouterLinks.USER_TYPE_SELECTION}`);
      window.history.pushState({}, '', `/${RouterLinks.LANGUAGE_SETTING}`);
      this.events.publish('reOnboard');
    }
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }

  handleActiveScanner() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }

    if (this.navParams && this.navParams.stopScanner && this.navParams.stopScanner) {
      setTimeout(() => {
        this.scanner.stopScanner();
      }, 500);
    }
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
        element['shadowRoot'].querySelector('.select-text.select-placeholder').setAttribute('style', 'color: #979797 !important;padding-left: 10px;opacity: 1;');
        element['shadowRoot'].querySelector('.select-icon-inner').setAttribute('style', 'border-color: #979797 !important;animation: none;border: solid;border-width: 0 2px 2px 0;display: inline-block;padding: 4px;transform: rotate(45deg);opacity: 1;');
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

  async dismissPopup() {
    const activePortal = await this.alertCtrl.getTop();

    if (activePortal) {
      activePortal.dismiss();
    } else {
      this.location.back();
    }
  }

  cancelEvent() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CANCEL_CLICKED,
      Environment.ONBOARDING,
      PageId.ONBOARDING_PROFILE_PREFERENCES,
      undefined);
  }

  extractProfileForTelemetry(formVal): any {
    const profileReq: any = {};
    profileReq.board = formVal.syllabus;
    profileReq.medium = formVal.medium;
    profileReq.grade = formVal.grades;
    return profileReq;
  }

  handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.dismissPopup();
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING, true);
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

  onSubmitAttempt() {
    if (this.profileSettingsForm.valid) {
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForm.value), 'passed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      this.submitProfileSettingsForm();
      return;
    }

    for (const [control, selector] of [
      [this.syllabusControl, this.boardSelect],
      [this.mediumControl, this.mediumSelect],
      [this.gradeControl, this.gradeSelect]
    ]) {
      if (!control.value.length) {
        if (!this.profileSettingsForm.value.board.length) {
          this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForm.value), 'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
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
        } else if (!this.profileSettingsForm.value.medium.length) {
          this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForm.value), 'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
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
        } else if (!this.profileSettingsForm.value.grade.length) {
          this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForm.value), 'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
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
        }
        selector.open();
        return;
      }
    }
  }

  async fetchSyllabusList() {
    await this.commonUtilService.getLoader().then((loader) => {
      this.loader = loader;
      this.loader.present();
    });

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };

    await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (frameworks: Framework[]) => {
        if (!frameworks || !frameworks.length) {
          this.loader.dismiss();
          this.commonUtilService.showToast('NO_DATA_FOUND');
          return;
        }

        this.syllabusList = frameworks.map(r => ({ name: r.name, code: r.identifier }));

        this.loader.dismiss();
      });
  }

  private onSyllabusChange(): Observable<string[]> {
    return this.syllabusControl.valueChanges.pipe(
      tap(async (value) => {
        if (!Array.isArray(value)) {
          this.syllabusControl.patchValue([value]);
          return;
        }

        await this.commonUtilService.getLoader().then((loader) => {
          this.loader = loader;
          this.loader.present();
        });

        try {
          this.framework = await this.frameworkService.getFrameworkDetails({
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

          this.mediumControl.patchValue([]);
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          this.loader.dismiss();
        }
      })
    );
  }

  private onMediumChange(): Observable<string[]> {
    return this.mediumControl.valueChanges.pipe(
      tap(async () => {
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

          this.gradeControl.patchValue([]);
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          this.loader.dismiss();
        }
      })
    );
  }

  private async submitProfileSettingsForm() {
    await this.commonUtilService.getLoader().then((loader) => {
      this.loader = loader;
    });
    const updateProfileRequest: Profile = {
      ...this.activeSessionProfile,
      syllabus: this.syllabusControl.value,
      board: this.boardControl.value,
      medium: this.mediumControl.value,
      grade: this.gradeControl.value,
      profileType: (this.navParams && this.navParams.selectedUserType) || this.activeSessionProfile.profileType
    };

    this.profileService.updateProfile(updateProfileRequest).toPromise()
      .then(async (profile: Profile) => {
        if (updateProfileRequest.profileType === ProfileType.TEACHER) {
          initTabs(this.container, GUEST_TEACHER_TABS);
        } else if (updateProfileRequest.profileType === ProfileType.STUDENT) {
          initTabs(this.container, GUEST_STUDENT_TABS);
        }
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = profile;
        await this.commonUtilService.handleToTopicBasedNotification();
        setTimeout(async () => {
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
          if (await this.commonUtilService.isDeviceLocationAvailable()) {
            this.appGlobalService.setOnBoardingCompleted();
            this.router.navigate([`/${RouterLinks.TABS}`]);
          } else {
            const navigationExtras: NavigationExtras = {
              state: {
                isShowBackButton: true
              }
            };
            this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
          }
        }, 2000);
        this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = profile;

        this.telemetryGeneratorService.generateProfilePopulatedTelemetry(
          PageId.ONBOARDING_PROFILE_PREFERENCES, profile, 'manual', Environment.ONBOARDING
        );
        this.loader = await this.commonUtilService.getLoader(2000);
        await this.loader.present();
      })
      .catch(async () => {
        // todo
        await this.loader.dismiss();
        this.commonUtilService.showToast('PROFILE_UPDATE_FAILED');
      });
  }
}
