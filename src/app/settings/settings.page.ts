import { Component, Inject } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
  SharedPreferences,
  TelemetryImpressionRequest,
} from 'sunbird-sdk';
import { AppHeaderService, CommonUtilService, TelemetryGeneratorService, UtilityService } from 'services';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from 'services/telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})

export class SettingsPage {
  chosenLanguageString: string;
  selectedLanguage: string;
  fileUrl: string;
  deviceId: string;
  subjectDetails: string;
  shareAppLabel: string;
  appName: any;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appVersion: AppVersion,
    private socialSharing: SocialSharing,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private router: Router
  ) {
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
        this.shareAppLabel = this.commonUtilService.translateMessage('SHARE_APP', appName);
      });
  }


  ionViewDidLoad() {
    const telemetryImpressionRequest = new TelemetryImpressionRequest();
    telemetryImpressionRequest.type = ImpressionType.VIEW;
    telemetryImpressionRequest.pageId = PageId.SETTINGS;
    telemetryImpressionRequest.env = Environment.SETTINGS;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SETTINGS,
      Environment.SETTINGS, '', '', '',
      undefined,
      undefined
    );
  }

  ionViewDidEnter() {
    this.chosenLanguageString = this.commonUtilService.translateMessage('CURRENT_LANGUAGE');
    this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise()
      .then(value => {
        this.selectedLanguage = `${this.chosenLanguageString} : ${value}`;
      });
  }

  goToLanguageSetting() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.LANGUAGE_CLICKED);
    this.router.navigate(['settings/language-setting', true]);
  }

  dataSync() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.DATA_SYNC_CLICKED);
    this.router.navigate(['settings/data-sync']);
  }

  aboutUs() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.ABOUT_APP_CLICKED);
    this.router.navigate([`/${RouterLinks.SETTINGS}/about-us`]);
  }

  async shareApp() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();

    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_CLICKED);
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_INITIATED);


    this.utilityService.exportApk()
      .then(async (filepath) => {
        this.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.SHARE_APP_SUCCESS);
        await loader.dismiss();
        this.socialSharing.share('', '', 'file://' + filepath, '');
      }).catch(async (error) => {
        await loader.dismiss();
        console.log(error);
      });
  }

  generateInteractTelemetry(interactionType, interactSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactionType, interactSubtype,
      PageId.SETTINGS,
      Environment.SETTINGS, null,
      undefined,
      undefined
    );
  }

  showPermissionPage() {
    const navigationExtras: NavigationExtras = { state: { changePermissionAccess: true }};
    this.router.navigate([`/${RouterLinks.SETTINGS}/permission`], navigationExtras);
  }
}
