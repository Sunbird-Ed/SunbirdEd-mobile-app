import { Component, Inject, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppGlobalService } from '@app/services';
import { CommonUtilService } from '../../services/common-util.service';
import { LogoutHandlerService } from '../../services/handlers/logout-handler.service';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ProfileService, ServerProfile } from 'sunbird-sdk';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { ProfileConstants } from '../app.constant';

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
    private platform: Platform,
    private logoutHandlerService: LogoutHandlerService,
    private sanitizer: DomSanitizer,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private modalCtrl: ModalController,
    private appGlobalService: AppGlobalService,
    private sbProgressLoader: SbProgressLoader,
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
    this.modalCtrl.dismiss({profileDetails: this.userProfileDetails, disableSubmitButton: this.disableSubmitButton})
  }

  private showToastOnFirstBackNavigation() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.commonUtilService.showToast(this.commonUtilService.translateMessage('TNC_BACK_NAVIGATION_MESSAGE', { app_name: this.appName }));

    if (this.unregisterBackButtonAction) {
      this.unregisterBackButtonAction.unsubscribe();
    }

    this.unregisterBackButtonAction = this.platform.backButton.subscribeWithPriority(999, async () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
      this.logoutHandlerService.onLogout();
      this.modalCtrl.dismiss();
    });
  }

}
