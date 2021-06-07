import { FormAndFrameworkUtilService } from './../../services/formandframeworkutil.service';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
  CorReleationDataType,
  AuditType
} from '@app/services/telemetry-constants';
import {
  Framework,
  FrameworkCategoryCode,
  FrameworkCategoryCodesGroup,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  GetSuggestedFrameworksRequest,
  Profile,
  ProfileService,
  ProfileType,
  CorrelationData,
  AuditState} from 'sunbird-sdk';
import {
  AppGlobalService,
  AppHeaderService,
  CommonUtilService,
  ContainerService,
  SunbirdQRScanner,
  TelemetryGeneratorService
} from 'services';
import { AlertController, Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Location } from '@angular/common';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { CachedItemRequestSourceFrom } from '@project-sunbird/sunbird-sdk';
import { ProfileHandler } from '@app/services/profile-handler';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit, OnDestroy, AfterViewInit {
  public pageId = 'ProfileSettingsPage';
  @ViewChild('boardSelect', { static: false }) boardSelect: any;
  @ViewChild('mediumSelect', { static: false }) mediumSelect: any;
  @ViewChild('gradeSelect', { static: false }) gradeSelect: any;
  @ViewChild('animatedQRImage', { static: false }) animatedQRImageRef: ElementRef;

  private framework: Framework;
  private navParams: any;
  private activeSessionProfile?: Profile;
  private unregisterBackButton: Subscription;
  private headerObservable: any;
  private formControlSubscriptions: Subscription;
  loader: any;
  btnColor = '#8FC4FF';
  appName: string;
  showQRScanner = true;

  public profileSettingsForm: FormGroup;
  public hideBackButton = true;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];

  public supportedProfileAttributes: { [key: string]: string } = {};

  boardOptions = {
    title: this.commonUtilService.translateMessage('BOARD_OPTION_TEXT'),
    cssClass: 'ftue-changes'
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
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private scanner: SunbirdQRScanner,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private container: ContainerService,
    private headerService: AppHeaderService,
    private router: Router,
    private appVersion: AppVersion,
    private alertCtrl: AlertController,
    private location: Location,
    private splashScreenService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private profileHandler: ProfileHandler
  ) {
    this.profileSettingsForm = new FormGroup({
      syllabus: new FormControl([]),
      board: new FormControl([]),
      medium: new FormControl([]),
      grade: new FormControl([])
    });
  }

  async ngOnInit() {
    this.handleActiveScanner();

    this.appVersion.getAppName().then((appName) => {
      this.appName = (appName).toUpperCase();
    });

    this.activeSessionProfile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();


    this.supportedProfileAttributes = await this.profileHandler.getSupportedProfileAttributes();
    const subscriptionArray: Array<any> = this.updateAttributeStreamsnSetValidators(this.supportedProfileAttributes);
    this.formControlSubscriptions = combineLatest(subscriptionArray).subscribe();
    await this.fetchSyllabusList();
  }


  ngAfterViewInit() {
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
      .then((packageInfo) => {
        this.formAndFrameworkUtilService.getWebviewConfig().then((webviewVersion) => {
          if (parseInt(packageInfo.versionName.split('.')[0], 10) <= webviewVersion) {
            this.animatedQRImageRef.nativeElement.style.width =
              this.animatedQRImageRef.nativeElement.style.height = 'auto';
            this.animatedQRImageRef.nativeElement.style.minWidth =
              this.animatedQRImageRef.nativeElement.style.minHeight = 0;
          }
        }).catch(() => {
          if (parseInt(packageInfo.versionName.split('.')[0], 10) <= 54) {
            this.animatedQRImageRef.nativeElement.style.width =
              this.animatedQRImageRef.nativeElement.style.height = 'auto';
            this.animatedQRImageRef.nativeElement.style.minWidth =
              this.animatedQRImageRef.nativeElement.style.minHeight = 0;
          }
        });
      });
  }

  private redirectToInitialRoute() {
    const snapshot = this.activatedRoute.snapshot;
    if (snapshot.queryParams && snapshot.queryParams.reOnboard) {
      this.showQRScanner = false;
      const userTypeSelectionRoute = new URL(window.location.origin + `/${RouterLinks.USER_TYPE_SELECTION}`);
      const languageSettingRoute = new URL(window.location.origin + `/${RouterLinks.LANGUAGE_SETTING}`);

      userTypeSelectionRoute.searchParams.set('onReload', 'true');
      languageSettingRoute.searchParams.set('onReload', 'true');

      window.history.pushState({}, '', userTypeSelectionRoute.toString());
      window.history.pushState({}, '', languageSettingRoute.toString());
      this.hideBackButton = false;
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

    if (this.navParams && this.navParams.stopScanner) {
      setTimeout(() => {
        this.scanner.stopScanner();
      }, 500);
    }
  }

  ionViewWillEnter() {
    if (this.router.url === '/' + RouterLinks.PROFILE_SETTINGS) {
      setTimeout(() => {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW, '',
          PageId.ONBOARDING_PROFILE_PREFERENCES,
          Environment.ONBOARDING
        );

        /* New Telemetry */
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.PAGE_REQUEST, '',
          PageId.SCAN_OR_MANUAL,
          Environment.ONBOARDING
        );
      }, 350);
    }

    this.handleDeviceBackButton();
    // after qr scan if bmc is not populated then show only BMC
    if (history.state && history.state.showFrameworkCategoriesMenu) {
      this.showQRScanner = false;
    }
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    if (history.state && history.state.hideBackButton !== undefined) {
      this.hideBackButton = history.state.hideBackButton;
    } else if (this.navParams) {
      this.hideBackButton = Boolean(this.navParams.hideBackButton);
    }

    // should be called everytime when entered to this page
    this.redirectToInitialRoute();
    this.headerService.hideHeader();
  }

  ionViewDidEnter() {
    this.hideOnboardingSplashScreen();
  }

  hideOnboardingSplashScreen() {
    if (this.navParams && this.navParams.forwardMigration) {
      this.splashScreenService.handleSunbirdSplashScreenActions();
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
    } else if (!this.hideBackButton) {
      this.location.back();
    }
  }

  cancelEvent(category?: string) {
    let correlationList: Array<CorrelationData> = [];

    /* New Telemetry */
    switch (category) {
      case 'board':
        correlationList = this.populateCData(this.syllabusControl.value, CorReleationDataType.BOARD);
        break;
      case 'medium':
        correlationList = this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM);
        break;
      case 'grade':
        correlationList = this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS);
        break;
    }
    correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CANCEL, '',
      Environment.ONBOARDING,
      PageId.MANUAL_PROFILE,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  extractProfileForTelemetry(formVal): any {
    const profileReq: any = {};
    profileReq.board = formVal.syllabus;
    profileReq.medium = formVal.medium;
    profileReq.grade = formVal.grades;
    return profileReq;
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ONBOARDING_PROFILE_PREFERENCES, Environment.ONBOARDING, isNavBack);
    /* New Telemetry */
    this.telemetryGeneratorService.generateBackClickedNewTelemetry(
      !isNavBack,
      Environment.ONBOARDING,
      this.showQRScanner ? PageId.SCAN_OR_MANUAL : PageId.MANUAL_PROFILE
    );

    if (this.showQRScanner === false) {
      this.showQRScanner = true;
      this.resetProfileSettingsForm();
    } else {
      this.dismissPopup();
    }
  }

  openQRScanner() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.QRCodeScanClicked,
      Environment.ONBOARDING,
      PageId.ONBOARDING_PROFILE_PREFERENCES,
    );
    /* New Telemetry */
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_QRSCANER, '',
      Environment.ONBOARDING,
      PageId.SCAN_OR_MANUAL
    );
    this.scanner.startScanner(PageId.ONBOARDING_PROFILE_PREFERENCES, true).then((scannedData) => {
      if (scannedData === 'skip') {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW, '',
          PageId.ONBOARDING_PROFILE_PREFERENCES,
          Environment.ONBOARDING
        );
        this.showQRScanner = false;

        this.resetProfileSettingsForm();
      }
    });
  }

  onSubmitAttempt() {
    if (this.profileSettingsForm.valid) {
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForm.value), 'passed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      /* New Telemetry */
      let correlationList: Array<CorrelationData> = [];
      correlationList = this.populateCData(this.syllabusControl.value, CorReleationDataType.BOARD);
      correlationList = correlationList.concat(this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM));
      correlationList = correlationList.concat(this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SELECT_SUBMIT, '',
        Environment.ONBOARDING,
        PageId.MANUAL_PROFILE,
        undefined,
        undefined,
        undefined,
        correlationList
      );
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
          this.telemetryGeneratorService.generateInteractTelemetry(
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
          this.telemetryGeneratorService.generateInteractTelemetry(
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
          this.telemetryGeneratorService.generateInteractTelemetry(
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


        /* New Telemetry */
        const correlationList: Array<CorrelationData> = [];
        correlationList.push({ id: this.syllabusList.length.toString(), type: CorReleationDataType.BOARD_COUNT });
        this.telemetryGeneratorService.generatePageLoadedTelemetry(
          PageId.SCAN_OR_MANUAL,
          Environment.ONBOARDING,
          undefined,
          undefined,
          undefined,
          undefined,
          correlationList
        );
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

          /* New Telemetry */
          this.generateCategorySubmitTelemetry('board');

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

        } catch (e) {
          console.error(e);
        } finally {
          this.mediumControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onMediumChange(): Observable<string[]> {
    return this.mediumControl.valueChanges.pipe(
      tap(async () => {

        /* New Telemetry */
        this.generateCategorySubmitTelemetry('medium');

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

        } catch (e) {
          console.error(e);
        } finally {
          this.gradeControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onGradeChange(): Observable<string[]> {
    return this.gradeControl.valueChanges.pipe(
      tap(async () => {

        /* New Telemetry */
        this.generateCategorySubmitTelemetry('grade');

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
        if (this.commonUtilService.isAccessibleForNonStudentRole(updateProfileRequest.profileType)) {
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
        let correlationlist: Array<CorrelationData> = [{ id: PageId.MANUAL_PROFILE, type: CorReleationDataType.FROM_PAGE }];
        correlationlist = correlationlist.concat(this.populateCData(this.boardControl.value, CorReleationDataType.BOARD));
        correlationlist = correlationlist.concat(this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM));
        correlationlist = correlationlist.concat(this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS));
        correlationlist.push({ id: PageId.MANUAL, type: CorReleationDataType.FILL_MODE });
        this.telemetryGeneratorService.generateAuditTelemetry(
          Environment.ONBOARDING,
          AuditState.AUDIT_UPDATED,
          undefined,
          AuditType.SET_PROFILE,
          undefined,
          undefined,
          undefined,
          correlationlist
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


  private populateCData(formControllerValues, correlationType): Array<CorrelationData> {
    const correlationList: Array<CorrelationData> = [];
    if (formControllerValues) {
      formControllerValues.forEach((value) => {
        correlationList.push({
          id: value,
          type: correlationType
        });
      });
    }
    return correlationList;
  }

  private resetProfileSettingsForm() {
    this.profileSettingsForm.reset({
      syllabus: [],
      board: [],
      medium: [],
      grade: []
    });
  }

  boardClicked(e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    this.showQRScanner = false;

    /* New Telemetry */
    this.telemetryGeneratorService.generatePageLoadedTelemetry(
      PageId.MANUAL_PROFILE,
      Environment.ONBOARDING
    );

    const correlationList: Array<CorrelationData> = [];
    correlationList.push({ id: this.syllabusList.length.toString(), type: CorReleationDataType.BOARD_COUNT });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CATEGORY, '',
      Environment.ONBOARDING,
      PageId.SCAN_OR_MANUAL,
      undefined,
      undefined,
      undefined,
      correlationList
    );

    setTimeout(() => {
      this.boardSelect.open();
    }, 0);
  }

  onCategoryCliked(category: string) {
    const correlationList: Array<CorrelationData> = [];
    const correlationData: CorrelationData = new CorrelationData();
    switch (category) {
      case 'board':
        correlationData.id = this.syllabusList.length.toString();
        correlationData.type = CorReleationDataType.BOARD_COUNT;
        break;
      case 'medium':
        correlationData.id = this.mediumList.length.toString();
        correlationData.type = CorReleationDataType.MEDIUM_COUNT;
        break;
      case 'grade':
        correlationData.id = this.gradeList.length.toString();
        correlationData.type = CorReleationDataType.CLASS_COUNT;
        break;
    }
    correlationList.push(correlationData);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CATEGORY, '',
      Environment.ONBOARDING,
      PageId.MANUAL_PROFILE,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  generateCategorySubmitTelemetry(category: string) {
    let correlationList: Array<CorrelationData> = [];
    switch (category) {
      case 'board':
        if (!this.syllabusControl.value.length) {
          return;
        }
        correlationList = this.populateCData(this.syllabusControl.value, CorReleationDataType.BOARD);
        break;
      case 'medium':
        if (!this.mediumControl.value.length) {
          return;
        }
        correlationList = this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM);
        break;
      case 'grade':
        if (!this.gradeControl.value.length) {
          return;
        }
        correlationList = this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS);
        break;
    }
    correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_SUBMIT, '',
      Environment.ONBOARDING,
      PageId.MANUAL_PROFILE,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  private updateAttributeStreamsnSetValidators(attributes: { [key: string]: string }): Array<any> {
    const subscriptionArray = [];
    console.log('attributes', attributes);
    
    Object.keys(attributes).forEach((attribute) => {
      console.log('attribute', attribute);
      switch (attribute) {
        case 'board':
          subscriptionArray.push(this.onSyllabusChange());
          this.boardControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
          break;
        case 'medium':
          subscriptionArray.push(this.onMediumChange());
          this.mediumControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
          break;
        case 'gradeLevel':
          subscriptionArray.push(this.onGradeChange());
          this.gradeControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
          break;
      }
    });
    subscriptionArray.push(this.profileSettingsForm.valueChanges.pipe(
      delay(250),
      tap(() => {
        this.btnColor = this.profileSettingsForm.valid ? '#006DE5' : '#8FC4FF';
      })
    ));
    return subscriptionArray;
  }

}
