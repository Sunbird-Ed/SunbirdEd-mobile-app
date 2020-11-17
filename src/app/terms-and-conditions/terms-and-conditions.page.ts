import { Component, Inject, OnInit, Injector } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';
import { ProfileService, ServerProfile, CachedItemRequestSourceFrom } from 'sunbird-sdk';
import { Subscription } from 'rxjs';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { LogoutHandlerService } from '@app/services/handlers/logout-handler.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ProfileConstants, RouterLinks } from '../app.constant';
import { FormAndFrameworkUtilService, AppGlobalService } from '@app/services';
import { Router, NavigationExtras } from '@angular/router';
import { SplashScreenService } from '@app/services/splash-screen.service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import { ConsentService } from '@app/services/consent-service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html'
})
export class TermsAndConditionsPage implements OnInit {
  public tncLatestVersionUrl: SafeUrl;
  public termsAgreed = false;
  private loading?: any;
  private unregisterBackButtonAction: Subscription;
  private userProfileDetails: ServerProfile;
  appName: string;
  disableSubmitButton = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
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
    private consentService: ConsentService
  ) {
  }

  public async ngOnInit() {
    this.appGlobalService.closeSigninOnboardingLoader();
    this.appName = await this.appVersion.getAppName();
    this.userProfileDetails = (await this.profileService.getActiveSessionProfile(
      { requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()).serverProfile;

    this.tncLatestVersionUrl = this.sanitizer
      .bypassSecurityTrustResourceUrl(this.userProfileDetails.tncLatestVersionUrl);

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
      // await tncUpdateHandlerService.onAcceptTnc(this.userProfileDetails);
      let request;
      if (this.userProfileDetails.managedBy) {
        request = {
          userId: this.userProfileDetails.userId,
          version: this.userProfileDetails.tncLatestVersion
        };
      } else {
        request = {
          version: this.userProfileDetails.tncLatestVersion
        };
      }
      const isTCAccepted = await this.profileService.acceptTermsAndConditions(request)
        .toPromise();

      if (isTCAccepted) {
        const serverProfile = await this.profileService.getServerProfilesDetails({
          userId: this.userProfileDetails.userId,
          requiredFields: ProfileConstants.REQUIRED_FIELDS,
          from: CachedItemRequestSourceFrom.SERVER
        }).toPromise();

        // TODO:
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
            this.disableSubmitButton = false;
            if (value['status']) {
              if (this.commonUtilService.isUserLocationAvalable(serverProfile)
              ||  await tncUpdateHandlerService.isSSOUser(profile)) {
                await tncUpdateHandlerService.dismissTncPage();
                this.appGlobalService.closeSigninOnboardingLoader();
                if (await tncUpdateHandlerService.isSSOUser(profile)) {
                  await this.consentService.getConsent(profile, true);
                }
                this.router.navigate(['/', RouterLinks.TABS]);
                this.externalIdVerificationService.showExternalIdVerificationPopup();
                this.splashScreenService.handleSunbirdSplashScreenActions();
              } else {
                // closeSigninOnboardingLoader() is called in District-Mapping page
                const navigationExtras: NavigationExtras = {
                  state: {
                    isShowBackButton: false
                  }
                };
                this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING] , navigationExtras);
              }
            } else {
              // closeSigninOnboardingLoader() is called in CategoryEdit page
              await tncUpdateHandlerService.dismissTncPage();
              if (await tncUpdateHandlerService.isSSOUser(profile)) {
                await this.consentService.getConsent(profile, true);
              }
              this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: {
                  hasFilledLocation: this.commonUtilService.isUserLocationAvalable(serverProfile),
                  showOnlyMandatoryFields: true,
                  profile: value['profile'],
                  isRootPage: true
                }
              });
            }
          }).catch(async e => {
            this.dismissLoader(loader);
          });
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
      loader = undefined;
    }
  }
}
