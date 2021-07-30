import { Component, Inject, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  ContentRequest, ContentService, DeviceInfo, GetAllProfileRequest, ProfileService, SharedPreferences
} from 'sunbird-sdk';
import {
  TelemetryGeneratorService,
  CommonUtilService,
  UtilityService,
  AppHeaderService,
  InteractType,
  InteractSubtype,
  PageId,
  Environment,
  ImpressionType
} from '../../../services';
import { AudienceFilter, RouterLinks, GenericAppConfig, PrimaryCategory } from '../../app.constant';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { map } from 'rxjs/operators';
const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {

  deviceId: string;
  version: string;
  fileUrl: string;
  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };
  backButtonFunc: Subscription;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private socialSharing: SocialSharing,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private appVersion: AppVersion,
    private platform: Platform,
  ) {
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  ngOnInit() {
    this.version = 'app version will be shown here';

    this.deviceId = this.deviceInfo.getDeviceID();

    this.appVersion.getAppName()
      .then((appName: any) => {
        return appName;
      })
      .then(val => {
        this.getVersionName(val);
      });
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  ionViewDidLeave() {
    (<any>window).sbutility.removeFile(() => {
    }, (error) => {
      console.error('error', error);
    });
  }

  async shareInformation() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_CLICKED);
    const allUserProfileRequest: GetAllProfileRequest = {
      local: true,
      server: true
    };
    const contentRequest: ContentRequest = {
      primaryCategories: PrimaryCategory.FOR_DOWNLOADED_TAB,
      audience: AudienceFilter.GUEST_TEACHER
    };
    const getUserCount = await this.profileService.getAllProfiles(allUserProfileRequest).pipe(
      map((profile) => profile.length)
    ).toPromise();
    const getLocalContentCount = await this.contentService.getContents(contentRequest).pipe(
      map((contentCount) => contentCount.length)
    ).toPromise();
    let loader = await this.commonUtilService.getLoader();
    (<any>window).sbutility.shareSunbirdConfigurations(getUserCount, getLocalContentCount, async (result) => {
      await loader.present();
      this.preferences.putString(KEY_SUNBIRD_CONFIG_FILE_PATH, result).toPromise()
        .then((res) => {
          this.preferences.getString(KEY_SUNBIRD_CONFIG_FILE_PATH).toPromise()
            .then(async val => {
              await loader.dismiss();
              loader = undefined;
              if (Boolean(val)) {
                this.fileUrl = 'file://' + val;

                // Share via email
                this.socialSharing.share('', '', this.fileUrl).then(() => {
                }).catch(error => {
                  console.error('Sharing Data is not possible', error);
                });
              }
            });
        });
    }, async (error) => {
      if (loader) {
        await loader.dismiss();
        loader = undefined;
      }
      console.error('ERROR - ' + error);
    });
  }

  generateInteractTelemetry(interactionType, interactSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactionType, interactSubtype,
      PageId.SETTINGS,
      Environment.SETTINGS, null
    );
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SETTINGS_ABOUT_US,
      Environment.SETTINGS, '', '', ''
    );
  }

  getVersionName(appName): any {
    this.utilityService.getBuildConfigValue(GenericAppConfig.VERSION_NAME)
      .then(response => {
        this.getVersionCode(appName, response);
        return response;
      })
      .catch(error => {
        console.log('Error--', error);
      });
  }

  getVersionCode(appName, versionName): any {
    this.utilityService.getBuildConfigValue(GenericAppConfig.VERSION_CODE)
      .then(response => {
        this.version = appName + ' v' + versionName + '.' + response;
        return response;
      })
      .catch(error => {
        console.log('Error--', error);
      });
  }

  goBack() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, true);
    this.location.back();
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, false);
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  async openTermsOfUse() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.TERMS_OF_USE_CLICKED);
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE;
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }
}
