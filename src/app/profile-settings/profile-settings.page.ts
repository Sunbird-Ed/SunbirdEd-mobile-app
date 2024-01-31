import { FormAndFrameworkUtilService } from './../../services/formandframeworkutil.service';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OnboardingScreenType, ProfileConstants, RouterLinks } from '../../app/app.constant';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '../../app/module.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
  CorReleationDataType,
  AuditType
} from '../../services/telemetry-constants';
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
  AuditState,
  CachedItemRequestSourceFrom} from '@project-sunbird/sunbird-sdk';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { AppGlobalService } from '../../services/app-global-service.service';
import { SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import { CommonUtilService } from '../../services/common-util.service';
import { ContainerService } from '../../services/container.services';
import { AppHeaderService } from '../../services/app-header.service';
import { OnboardingConfigurationService } from '../../services/onboarding-configuration.service';
import { AlertController, Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { Location } from '@angular/common';
import { SplashScreenService } from '../../services/splash-screen.service';
import { SegmentationTagService } from '../../services/segmentation-tag/segmentation-tag.service';

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
  categories = [];

 // public profileSettingsForm: FormGroup;
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

  isInitialScreen = false;
  profileSettingsForms: FormGroup;
  group: any = {};
  isCategoryLabelLoded = false;
  defaultFrameworkID: string;
  isDisable = true;
  defaultRootOrgId : any;
  
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
    public platform: Platform,
    private commonUtilService: CommonUtilService,
    private container: ContainerService,
    private headerService: AppHeaderService,
    private router: Router,
    private appVersion: AppVersion,
    private alertCtrl: AlertController,
    private location: Location,
    private splashScreenService: SplashScreenService,
    private activatedRoute: ActivatedRoute,
    private segmentationTagService: SegmentationTagService,
    private onboardingConfigurationService: OnboardingConfigurationService
  ) {
    this.defaultFrameworkID = window.history.state.defaultFrameworkID;
    this.defaultRootOrgId = window.history.state.rootOrgId || '*';
  }

  async ngOnInit() {
    if (this.defaultFrameworkID) {
      await this.getCategoriesAndUpdateAttributes();
    } else {
      this.getFrameworkID()
    }
    this.handleActiveScanner();
    await this.appVersion.getAppName().then((appName) => {
      this.appName = (appName).toUpperCase();
    });

    this.activeSessionProfile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();
    this.showQRScanner = !!(this.onboardingConfigurationService.getOnboardingConfig('profile-settings'));
  }


  ngAfterViewInit() {
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
      .then((packageInfo) => {
        this.formAndFrameworkUtilService.getWebviewConfig().then((webviewVersion) => {
          let ver = webviewVersion as any;
          if (parseInt(packageInfo.versionName.split('.')[0], 10) <= ver) {
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

    if(this.onboardingConfigurationService.initialOnboardingScreenName === OnboardingScreenType.PROFILE_SETTINGS) {
      this.isInitialScreen = true;
    }
  }

  ngOnDestroy() {
  //  this.formControlSubscriptions.unsubscribe();
  }

  handleActiveScanner() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }

    if (this.navParams && this.navParams.stopScanner) {
      setTimeout(async () => {
        await this.scanner.stopScanner();
      }, 500);
    }
  }

  async ionViewWillEnter() {
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
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async eventName => {
      await this.handleHeaderEvents(eventName);
    });

    if (history.state && history.state.hideBackButton !== undefined) {
      this.hideBackButton = history.state.hideBackButton;
    } else if (this.navParams) {
      this.hideBackButton = Boolean(this.navParams.hideBackButton);
    }

    // should be called everytime when entered to this page
    this.redirectToInitialRoute();
    await this.headerService.hideHeader();
  }

  async ionViewDidEnter() {
    await this.hideOnboardingSplashScreen();
  }

  async hideOnboardingSplashScreen() {
    if (this.navParams && this.navParams.forwardMigration) {
      await this.splashScreenService.handleSunbirdSplashScreenActions();
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
      await activePortal.dismiss();
    } else if (this.isInitialScreen && this.showQRScanner) {
      await this.commonUtilService.showExitPopUp(PageId.PROFILE_SETTINGS, Environment.ONBOARDING, false);
    } else {
      this.location.back();
    }
  }

  cancelEvent(category?: any, event?: any) {
    let correlationList: Array<CorrelationData> = [];
    correlationList = this.populateCData(event.target.value, category.label);
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
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, async () => {
      await this.handleBackButton(false);
    });
  }

  async handleHeaderEvents($event) {
    if($event.name === 'back')
    {
      await this.handleBackButton(true);
    }
  }

  async handleBackButton(isNavBack) {
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
      this.resetCategoriesValues();
    } else {
      await this.dismissPopup();
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
    }).catch(e => console.error(e));
  }

  async onSubmitAttempt() {
    if (this.profileSettingsForms.valid) {
      this.appGlobalService.generateSaveClickedTelemetry(this.extractProfileForTelemetry(this.profileSettingsForms.value), 'passed',
        PageId.ONBOARDING_PROFILE_PREFERENCES, InteractSubtype.FINISH_CLICKED);
      /* New Telemetry */
      let correlationList: Array<CorrelationData> = [];
      // correlationList = this.populateCData(this.syllabusControl.value, CorReleationDataType.BOARD);
      // correlationList = correlationList.concat(this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM));
      // correlationList = correlationList.concat(this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SELECT_SUBMIT, '',
        Environment.ONBOARDING,
        PageId.MANUAL_PROFILE,
        undefined,
        undefined,
        undefined,
        correlationList
      );
      await this.submitProfileSettingsForm();
      return;
    }
  }

  async fetchSyllabusList() {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      language: this.translate.currentLang,
      requiredCategories: this.appGlobalService.getRequiredCategories()
    };

    await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (frameworks: Framework[]) => {

        if (!frameworks || !frameworks.length) {
          await this.loader.dismiss();
          this.commonUtilService.showToast('NO_DATA_FOUND');
          return;
        }
        this.syllabusList = frameworks.map(r => ({ name: r.name, code: r.identifier }));
        this.categories[0]['itemList'] = this.syllabusList;


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
      }).catch(e => console.error(e));
  }

  // private onSyllabusChange(): Observable<string[]> {
  //   return this.syllabusControl.valueChanges.pipe(
  //     tap(async (value) => {
  //       if (!Array.isArray(value)) {
  //         this.syllabusControl.patchValue([value]);
  //         return;
  //       }

  //       if (!value.length) {
  //         return;
  //       }

  //       await this.commonUtilService.getLoader().then((loader) => {
  //         this.loader = loader;
  //         this.loader.present();
  //       });

  //       try {
  //         this.framework = await this.frameworkService.getFrameworkDetails({
  //           from: CachedItemRequestSourceFrom.SERVER,
  //           frameworkId: value[0],
  //           requiredCategories: []
  //         }).toPromise();

  //         /* New Telemetry */
  //         this.generateCategorySubmitTelemetry('board');

  //         const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
  //           frameworkId: this.framework.identifier,
  //           requiredCategories: [this.categories[0].code],
  //           currentCategoryCode: this.categories[0].code,
  //           language: this.translate.currentLang
  //         };

  //         const boardTerm = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
  //           .find(b => b.name === (this.syllabusList.find((s) => s.code === value[0]).name));

  //         this.boardControl.patchValue([boardTerm.code]);

  //         const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
  //           frameworkId: this.framework.identifier,
  //           requiredCategories: [this.categories[1].code],
  //           prevCategoryCode: this.categories[0].code,
  //           currentCategoryCode: this.categories[1].code,
  //           language: this.translate.currentLang,
  //           selectedTermsCodes: this.boardControl.value
  //         };

  //         this.mediumList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
  //           .map(t => ({ name: t.name, code: t.code }));

  //       } catch (e) {
  //         console.error(e);
  //       } finally {
  //         this.mediumControl.patchValue([]);
  //         this.loader.dismiss();
  //       }
  //     })
  //   );
  // }

  // private onMediumChange(): Observable<string[]> {
  //   return this.mediumControl.valueChanges.pipe(
  //     tap(async () => {

  //       /* New Telemetry */
  //       this.generateCategorySubmitTelemetry('medium');

  //       await this.commonUtilService.getLoader().then((loader) => {
  //         this.loader = loader;
  //         this.loader.present();
  //       });

  //       try {
  //         const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
  //           frameworkId: this.framework.identifier,
  //           requiredCategories: [this.categories[2].code],
  //           prevCategoryCode: this.categories[1].code,
  //           currentCategoryCode: this.categories[2].code,
  //           language: this.translate.currentLang,
  //           selectedTermsCodes: this.mediumControl.value
  //         };

  //         this.gradeList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
  //           .map(t => ({ name: t.name, code: t.code }));

  //       } catch (e) {
  //         console.error(e);
  //       } finally {
  //         this.gradeControl.patchValue([]);
  //         this.loader.dismiss();
  //       }
  //     })
  //   );
  // }

  // private onGradeChange(): Observable<string[]> {
  //   return this.gradeControl.valueChanges.pipe(
  //     tap(async () => {

  //       /* New Telemetry */
  //       this.generateCategorySubmitTelemetry('grade');

  //     })
  //   );
  // }

  private async submitProfileSettingsForm() {
    await this.commonUtilService.getLoader().then((loader) => {
      this.loader = loader;
    });
    const updateProfileRequest: Profile = {
      ...this.activeSessionProfile,
      syllabus: [this.framework.identifier],
      profileType: (this.navParams && this.navParams.selectedUserType) || this.activeSessionProfile.profileType,
      categories: this.profileSettingsForms.value
    };

    this.profileService.updateProfile(updateProfileRequest).toPromise()
      .then(async (profile: Profile) => {
        await this.segmentationTagService.refreshSegmentTags(profile);
        if (this.commonUtilService.isAccessibleForNonStudentRole(updateProfileRequest.profileType)) {
          initTabs(this.container, GUEST_TEACHER_TABS);
        } else if (updateProfileRequest.profileType === ProfileType.STUDENT) {
          initTabs(this.container, GUEST_STUDENT_TABS);
        }
        await this.segmentationTagService.createSegmentTags(profile);
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = profile;
        await this.commonUtilService.handleToTopicBasedNotification();
        setTimeout(async () => {
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
          if (await this.commonUtilService.isDeviceLocationAvailable()) {
            await this.appGlobalService.setOnBoardingCompleted();
            await this.router.navigate([`/${RouterLinks.TABS}`]);
          } else {
            const navigationExtras: NavigationExtras = {
              state: {
                isShowBackButton: true
              }
            };
            await this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
          }
        }, 2000);
        this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
        this.events.publish('refresh:profile');
        this.appGlobalService.guestUserProfile = profile;

        this.telemetryGeneratorService.generateProfilePopulatedTelemetry(
          PageId.ONBOARDING_PROFILE_PREFERENCES, profile, 'manual', Environment.ONBOARDING
        );
        let correlationlist: Array<CorrelationData> = [{ id: PageId.MANUAL_PROFILE, type: CorReleationDataType.FROM_PAGE }];
        // correlationlist = correlationlist.concat(this.populateCData(this.boardControl.value, CorReleationDataType.BOARD));
        // correlationlist = correlationlist.concat(this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM));
        // correlationlist = correlationlist.concat(this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS));
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
      .catch(async (e) => {
        console.log('errorrrrrrrrrr', e)
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
    this.profileSettingsForms.reset();
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
      this.setAriaLabel();
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

  // generateCategorySubmitTelemetry(category: string) {
  //   let correlationList: Array<CorrelationData> = [];
  //   switch (category) {
  //     case 'board':
  //       if (!this.syllabusControl.value.length) {
  //         return;
  //       }
  //       correlationList = this.populateCData(this.syllabusControl.value, CorReleationDataType.BOARD);
  //       break;
  //     case 'medium':
  //       if (!this.mediumControl.value.length) {
  //         return;
  //       }
  //       correlationList = this.populateCData(this.mediumControl.value, CorReleationDataType.MEDIUM);
  //       break;
  //     case 'grade':
  //       if (!this.gradeControl.value.length) {
  //         return;
  //       }
  //       correlationList = this.populateCData(this.gradeControl.value, CorReleationDataType.CLASS);
  //       break;
  //   }
  //   correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
  //   this.telemetryGeneratorService.generateInteractTelemetry(
  //     InteractType.SELECT_SUBMIT, '',
  //     Environment.ONBOARDING,
  //     PageId.MANUAL_PROFILE,
  //     undefined,
  //     undefined,
  //     undefined,
  //     correlationList
  //   );
  // }

  // private updateAttributeStreamsnSetValidators(attributes: { [key: string]: string }): Array<any> {
  //   const subscriptionArray = [];
  //   Object.keys(attributes).forEach((attribute) => {
  //     console.log('attribute', attribute);
  //     switch (attribute) {
  //       case 'board':
  //         subscriptionArray.push(this.onSyllabusChange());
  //         this.boardControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
  //         break;
  //       case 'medium':
  //         subscriptionArray.push(this.onMediumChange());
  //         this.mediumControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
  //         break;
  //       case 'gradeLevel':
  //         subscriptionArray.push(this.onGradeChange());
  //         this.gradeControl.setValidators((c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
  //         break;
  //     }
  //   });
  //   // subscriptionArray.push(this.profileSettingsForm.valueChanges.pipe(
  //   //   delay(250),
  //   //   tap(() => {
  //   //     this.btnColor = this.profileSettingsForm.valid ? '#006DE5' : '#8FC4FF';
  //   //   })
  //   // ));
  //   return subscriptionArray;
  // }

  public setAriaLabel() {
    const selectDomTag = document.getElementsByTagName('ion-select');
    Object.values(selectDomTag).forEach(element => {
      if(element.multiple === false)
      {
        element.setAttribute('aria-label',   'single select');
      }
      else{
      element.setAttribute('aria-label',   'multiple select');
      }
      element.setAttribute('tabindex', '0');
    });
}

// private addAttributeSubscription() {
//   const subscriptionArray: Array<any> = this.updateAttributeStreamsnSetValidators(this.supportedProfileAttributes);
//   this.formControlSubscriptions = combineLatest(subscriptionArray).subscribe();
// }

  async getCategoriesAndUpdateAttributes(change = false) {
    await this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(this.defaultFrameworkID, this.defaultRootOrgId).then((categories) => {
      this.fetchSyllabusList();
      if (categories) {
        this.categories = categories.sort((a, b) => a.index - b.index)
        this.categories[0]['itemList'] = change ? this.syllabusList : [];
  
        this.categories.forEach((ele: any, index) => {
          this.group[ele.identifier] = new FormControl([], ele.required ? Validators.required : []);
        });
        if (Object.keys(this.group).length) {
          this.isCategoryLabelLoded = true;
        }
        this.profileSettingsForms = new FormGroup(this.group);
        this.group = {};
        if (change) {
          this.profileSettingsForms.get(this.categories[0].identifier).patchValue([this.defaultFrameworkID]);
        }
        this.isCategoryLabelLoded = true;
      }
    }).catch(e => console.error(e));
  }


  // async getNewFrameworkLabel() {
  //   await this.frameworkService.getFrameworkConfig('agriculture_framework').toPromise()
  //   .then((data) => {
  //     console.log('.............../////', data)
  //   })
  //   .catch((error) => console.log('error....', error))
  // }

  async getCategoriesDetails(event, data, index) {
    if (index !== this.categories.length - 1) {
      console.log('.............................', event, data);
      if (this.syllabusList.find(e => e.name === event) || index === 0) {
        if (this.defaultFrameworkID !== event) {
          this.defaultFrameworkID = event;
          this.appGlobalService.setFramewokCategory('');
         // this.profileSettingsForms.reset();
          await this.getCategoriesAndUpdateAttributes(true)
        }
        let categories = this.appGlobalService.getRequiredCategories()
        this.framework = await this.frameworkService.getFrameworkDetails({
          from: CachedItemRequestSourceFrom.SERVER,
          frameworkId: event,
          requiredCategories: categories
        }).toPromise();
      }
      if (index <= this.categories.length && this.profileSettingsForms.get(this.categories[index + 1].identifier).value.length > 0) {
        for (let i = index + 1; i < this.categories.length; i++) {
          this.profileSettingsForms.get(this.categories[i].identifier).patchValue([]);
          //  this.profileSettingsForms.get(this.categories[i].identifier).disable()
        }
      }
    const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
      frameworkId: this.framework.identifier,
      requiredCategories: [this.categories[index + 1].code],
      // prevCategoryCode: this.categories[index].code,
      currentCategoryCode: this.categories[index + 1].code,
      language: this.translate.currentLang
    };
    const categoryTerms = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
      .map(t => ({ name: t.name, code: t.code }))

    this.categories[index + 1]['itemList'] = categoryTerms;
    this.categories[index + 1]['isDisable'] = true;
  }
}

  isMultipleVales(category) {
    return category.identifier === 'fwCategory1' ? "false" : "true";
  }

  resetCategoriesValues() {
   // this.categories.map((e) => e.itemList = [])
  }

  async getFrameworkID() {
    await this.frameworkService.getDefaultChannelDetails().toPromise()
      .then(async (data) => {
        this.defaultFrameworkID = data.defaultFramework;
        await this.getCategoriesAndUpdateAttributes();
      })
  }

}
