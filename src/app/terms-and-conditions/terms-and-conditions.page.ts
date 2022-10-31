import { Component, Inject, Injector, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppGlobalService, FormAndFrameworkUtilService, FrameworkDetailsService } from '@app/services';
import { CommonUtilService } from '@app/services/common-util.service';
import { ConsentService } from '@app/services/consent-service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { LogoutHandlerService } from '@app/services/handlers/logout-handler.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Events } from '@app/util/events';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CachedItemRequestSourceFrom, ProfileService, ProfileType, ServerProfile, SharedPreferences } from 'sunbird-sdk';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { PreferenceKey, ProfileConstants, RouterLinks } from '../app.constant';
import { FieldConfig } from '../components/common-forms/field-config';
import { FormConstants } from '../form.constants';
import onboarding from '../../assets/configurations/config.json';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html'
})
export class TermsAndConditionsPage implements OnInit {
  public tncLatestVersionUrl: SafeResourceUrl;
  public termsAgreed = false;
  private loading?: any;
  private unregisterBackButtonAction: Subscription;
  private userProfileDetails: ServerProfile;
  appName: string;
  disableSubmitButton = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private platform: Platform,
    private logoutHandlerService: LogoutHandlerService,
    private sanitizer: DomSanitizer,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private injector: Injector,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private router: Router,
    private splashScreenService: SplashScreenService,
    private externalIdVerificationService: ExternalIdVerificationService,
    private appGlobalService: AppGlobalService,
    private sbProgressLoader: SbProgressLoader,
    private consentService: ConsentService,
    private frameworkDetailsService: FrameworkDetailsService,
    private events: Events
  ) {
  }

  public async ngOnInit() {
    this.appGlobalService.closeSigninOnboardingLoader();
    this.appName = await this.appVersion.getAppName();
    this.userProfileDetails = (await this.profileService.getActiveSessionProfile(
      { requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()).serverProfile;
    const url = this.sanitizer.sanitize(SecurityContext.URL, this.userProfileDetails.tncLatestVersionUrl.toString());
    this.tncLatestVersionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.TERMS_N_CONDITIONS,
      Environment.HOME
    );
    this.loading = await this.commonUtilService.getLoader();
    await this.loading.present();
  }

  ionViewWillEnter() {
    this.unregisterBackButtonAction = this.platform.backButton.
      subscribeWithPriority(999, async () => this.showToastOnFirstBackNavigation());
  }

  ionViewDidEnter() {
    this.sbProgressLoader.hide({id: 'login'});
  }

  public ionViewWillLeave() {
    if (this.unregisterBackButtonAction) {
      this.unregisterBackButtonAction.unsubscribe();
    }
  }

  public onIFrameLoad() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.TERMS_N_CONDITIONS_STATIC_PAGE,
      Environment.HOME
    );
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  public onConfirmationChange(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACCEPTANCE_CHECKBOX_CLICKED,
      Environment.HOME,
      PageId.TERMS_N_CONDITIONS,
      undefined,
      {isChecked :  event.target.checked }
    );
    this.termsAgreed = event.target.checked;
  }

  public async onAcceptanceClick(): Promise<void> {
    const tncUpdateHandlerService = this.injector.get(TncUpdateHandlerService);
    let loader = await this.commonUtilService.getLoader();
    try {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CONTINUE_CLICKED,
        Environment.HOME,
        PageId.TERMS_N_CONDITIONS
      );
      await loader.present();
      let request = this.userProfileDetails.managedBy ?  {
        userId: this.userProfileDetails.userId,
        version: this.userProfileDetails.tncLatestVersion
      } : {
        version: this.userProfileDetails.tncLatestVersion
      };
      const isTCAccepted = await this.profileService.acceptTermsAndConditions(request)
        .toPromise();

      if (isTCAccepted) {
        await this.getProfileDetailsAndUpdateLoggedInUser(tncUpdateHandlerService, loader);
      } else {
        this.dismissLoader(loader);
        await this.logoutOnSecondBackNavigation();
      }
      await tncUpdateHandlerService.dismissTncPage();
    } catch (e) {
      this.dismissLoader(loader);
      await this.logoutOnSecondBackNavigation();
    }
  }
  
  async getProfileDetailsAndUpdateLoggedInUser(tncUpdateHandlerService, loader) {
    const serverProfile = await this.profileService.getServerProfilesDetails({
      userId: this.userProfileDetails.userId,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    }).toPromise();

    const profile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();
    this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, profile)
      .then(async (value) => {
        this.dismissLoader(loader);
        if (!this.appGlobalService.signinOnboardingLoader) {
          this.appGlobalService.signinOnboardingLoader = await this.commonUtilService.getLoader();
          await this.appGlobalService.signinOnboardingLoader.present();
        }
        const locationMappingConfig: FieldConfig<any>[] =
        await this.formAndFrameworkUtilService.getFormFields(FormConstants.LOCATION_MAPPING);
        this.disableSubmitButton = false;
        const categoriesProfileData = {
          hasFilledLocation: this.commonUtilService.isUserLocationAvalable(profile, locationMappingConfig),
          showOnlyMandatoryFields: true,
          profile: value['profile'],
          isRootPage: true,
          noOfStepsToCourseToc: 1
        };
        let userLocationAvailable = this.commonUtilService.isUserLocationAvalable(profile, locationMappingConfig);
        let isSSoUser = await tncUpdateHandlerService.isSSOUser(profile)
        if (!profile.serverProfile.managedBy && !await tncUpdateHandlerService.isSSOUser(profile) && !profile.serverProfile.dob) {
          this.router.navigate([RouterLinks.SIGNUP_BASIC]);
        } else if (value['status']) {
          if (userLocationAvailable || isSSoUser) {
            await tncUpdateHandlerService.dismissTncPage();
            this.appGlobalService.closeSigninOnboardingLoader();
            categoriesProfileData['status'] = value['status']
            categoriesProfileData['isUserLocationAvalable'] = true;
            await this.handleNavigation(isSSoUser, profile, categoriesProfileData, value);
            this.externalIdVerificationService.showExternalIdVerificationPopup();
            this.splashScreenService.handleSunbirdSplashScreenActions();
          } else {
            if (onboarding.skipOnboardingForLoginUser) {
              await this.updateUserAsGuest();
            } else if (profile.profileType === ProfileType.NONE || profile.profileType === ProfileType.OTHER.toUpperCase()) {
                categoriesProfileData['status'] = value['status']
                categoriesProfileData['isUserLocationAvalable'] = false;
                this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                state: { categoriesProfileData }
            });
            } else {
              this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: categoriesProfileData
              });
            }
          }
        } else {
          // closeSigninOnboardingLoader() is called in CategoryEdit page
          await tncUpdateHandlerService.dismissTncPage();
          this.handleNavigation(isSSoUser, profile, categoriesProfileData, value);
        }
      }).catch(async e => {
        this.dismissLoader(loader);
      });
  }

  async handleNavigation(isSSoUser, profile, categoriesProfileData, value) {
    if (isSSoUser) {
      await this.consentService.getConsent(profile, true);
    }
    if (profile.profileType === ProfileType.NONE || profile.profileType === ProfileType.OTHER.toUpperCase()) {
      if (onboarding.skipOnboardingForLoginUser) {
        await this.updateUserAsGuest();
      } else {
        this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
          state: {categoriesProfileData}
        });
      }
    } else {
      if (value['status'] && !this.appGlobalService.isJoinTraningOnboardingFlow) {
        this.router.navigate(['/', RouterLinks.TABS]);
      } else {
        this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
          state: categoriesProfileData
        });
      }
    }
  }

  private async logoutOnSecondBackNavigation() {
    const tncUpdateHandlerService = this.injector.get(TncUpdateHandlerService);
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.logoutHandlerService.onLogout();
    await tncUpdateHandlerService.dismissTncPage();
  }

  private showToastOnFirstBackNavigation() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.commonUtilService.showToast(this.commonUtilService.translateMessage('TNC_BACK_NAVIGATION_MESSAGE', { app_name: this.appName }));

    if (this.unregisterBackButtonAction) {
      this.unregisterBackButtonAction.unsubscribe();
    }

    this.unregisterBackButtonAction = this.platform.backButton.subscribeWithPriority(999, async () => {
      await this.logoutOnSecondBackNavigation();
    });
  }

  private async dismissLoader(loader: any) {
    if (loader) {
      await loader.dismiss();
    }
  }

  private async updateUserAsGuest() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req = await this.frameworkDetailsService.getFrameworkDetails().then((data) => {
      return data;
    });
    const request = {
      ...req,
      userId: this.appGlobalService.getCurrentUser().uid,
    };
    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, request.profileUserTypes[0].type).toPromise();
    await this.profileService.updateServerProfile(request).toPromise()
      .then(async (data) => {
        await loader.dismiss();
        this.commonUtilService.showToast(
          this.commonUtilService.translateMessage('FRMELEMNTS_MSG_CHANGE_PROFILE', {role: req.profileUserTypes[0].type}));
        this.events.publish('refresh:loggedInProfile');
      }).catch(async (e) => {
        await loader.dismiss();
        console.log('server error for update profile', e);
      });
  }
}
