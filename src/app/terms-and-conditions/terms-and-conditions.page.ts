import { Component, Inject, OnInit, Injector } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform, LoadingController } from '@ionic/angular';
import { ProfileService, ServerProfile } from 'sunbird-sdk';
import { Subscription } from 'rxjs';

import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import { LogoutHandlerService } from '@app/services/logout-handler.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { ProfileConstants, RouterLinks } from '../app.constant';
import { FormAndFrameworkUtilService } from '@app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html',
  styleUrls: ['./terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage implements OnInit {
  public tncLatestVersionUrl: SafeUrl;
  public termsAgreed = false;
  private loading?: any;
  private unregisterBackButtonAction: Subscription;
  private userProfileDetails: ServerProfile;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private logoutHandlerService: LogoutHandlerService,
    private sanitizer: DomSanitizer,
    private commonUtilService: CommonUtilService,
    private translateService: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private appVersion: AppVersion,
    private injector: Injector,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private router: Router
  ) {
  }

  public async ngOnInit() {
    this.headerService.hideHeader();
    this.userProfileDetails = (await this.profileService.getActiveSessionProfile(
      { requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()).serverProfile;

    this.tncLatestVersionUrl = this.sanitizer
      .bypassSecurityTrustResourceUrl(this.userProfileDetails.tncLatestVersionUrl);

    this.unregisterBackButtonAction = this.platform.backButton.
      subscribeWithPriority(10, async () => await this.showToastOnFirstBackNavigation());

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.TERMS_N_CONDITIONS,
      Environment.HOME
    );
    await this.createAndPresentLoadingSpinner();
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
    const valuesMap = new Map();
    valuesMap['isChecked'] = event.target.checked;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACCEPTANCE_CHECKBOX_CLICKED,
      Environment.HOME,
      PageId.TERMS_N_CONDITIONS,
      undefined,
      valuesMap
    );

    this.termsAgreed = event.target.checked;
  }

  public async onAcceptanceClick(): Promise<void> {
    const tncUpdateHandlerService = this.injector.get(TncUpdateHandlerService);
    try {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CONTINUE_CLICKED,
        Environment.HOME,
        PageId.TERMS_N_CONDITIONS
      );
      // await tncUpdateHandlerService.onAcceptTnc(this.userProfileDetails);
      const isTCAccepted = await this.profileService.acceptTermsAndConditions({ version: this.userProfileDetails.tncLatestVersion })
        .toPromise();

      if (isTCAccepted) {
        const serverProfile = await this.profileService.getServerProfilesDetails({
          userId: this.userProfileDetails.userId,
          requiredFields: ProfileConstants.REQUIRED_FIELDS,
        }).toPromise();

        const profile = await this.profileService.getActiveSessionProfile({
          requiredFields: ProfileConstants.REQUIRED_FIELDS
        }).toPromise();

        this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, profile)
          .then(async (value) => {
            if (value['status']) {
              await tncUpdateHandlerService.dismissTncPage();
              this.router.navigate(['/', 'tabs']);
              splashscreen.hide();
            } else {
              await tncUpdateHandlerService.dismissTncPage();
              this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: {
                  showOnlyMandatoryFields: true,
                  profile: value['profile'],
                  isRootPage: true
                }
              });
            }
            console.log("inside can load");
          });
      } else {
        await this.logoutOnSecondBackNavigation();
      }
      await tncUpdateHandlerService.dismissTncPage();
    } catch (e) {
      await this.logoutOnSecondBackNavigation();
    }
  }

  private async createAndPresentLoadingSpinner() {
    this.loading = await this.loadingCtrl.create({
      showBackdrop: true,
      spinner: 'crescent'
    });

    await this.loading.present();
  }

  private async logoutOnSecondBackNavigation() {
    const tncUpdateHandlerService = this.injector.get(TncUpdateHandlerService);
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.logoutHandlerService.onLogout();
    await tncUpdateHandlerService.dismissTncPage();
  }

  private async showToastOnFirstBackNavigation() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.commonUtilService.showToast(await this.translateService
      .get('TNC_BACK_NAVIGATION_MESSAGE',
        {
          app_name: await this.appVersion.getAppName()
        }
      ).toPromise<string>());
  }
}
