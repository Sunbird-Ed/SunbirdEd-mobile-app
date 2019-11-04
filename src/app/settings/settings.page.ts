import { Component, Inject, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
  ContentService,
  DeviceInfo,
  ProfileService,
  SharedPreferences,
  TelemetryImpressionRequest,
  AuthService,
  SdkConfig,
  ApiService,
  MergeServerProfilesRequest,
  WebviewManualMergeSessionProvider,
  WebviewSessionProviderConfig
} from 'sunbird-sdk';
import {AppHeaderService, CommonUtilService, FormAndFrameworkUtilService, TelemetryGeneratorService, UtilityService} from 'services';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from 'services/telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { SbPopoverComponent } from '@app/app/components/popups';
import { PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  chosenLanguageString: string;
  selectedLanguage: string;
  fileUrl: string;
  deviceId: string;
  subjectDetails: string;
  shareAppLabel: string;
  appName: any;

  public isUserLoggedIn$: Observable<boolean>;
  public isNotDefaultChannelProfile$: Observable<boolean>;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SDK_CONFIG') private sdkConfig: SdkConfig,
    @Inject('API_SERVICE') private apiService: ApiService,
    private appVersion: AppVersion,
    private socialSharing: SocialSharing,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private utilityService: UtilityService,
    private headerService: AppHeaderService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private popoverCtrl: PopoverController,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService
  ) {
    this.isUserLoggedIn$ = this.authService.getSession()
      .map((session) => !!session) as any;

    this.isNotDefaultChannelProfile$ = this.profileService.isDefaultChannelProfile()
      .map((isDefaultChannelProfile) => !isDefaultChannelProfile) as any;
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
        this.shareAppLabel = this.commonUtilService.translateMessage('SHARE_APP', appName);
      });
  }


  ngOnInit() {
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

  async showMergeAccountConfirmationPopup() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        isNotShowCloseIcon: false,
        sbPopoverHeading: this.commonUtilService.translateMessage('ACCOUNT_MERGE_CONFIRMATION_HEADING'),
        sbPopoverHtmlContent: '<div class="text-left font-weight-normal padding-left-10 padding-right-10">'
            + this.commonUtilService.translateMessage('ACCOUNT_MERGE_CONFIRMATION_CONTENT', await this.appVersion.getAppName()) + '</div>',
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('CANCEL'),
            btnClass: 'popover-color popover-button-cancel',
          },
          {
            btntext: this.commonUtilService.translateMessage('ACCOUNT_MERGE_CONFIRMATION_BTN_MERGE'),
            btnClass: 'popover-color popover-button-allow',
          }
        ],
        handler: (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('CANCEL')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.CANCEL_CLICKED,
              Environment.SETTINGS,
              PageId.MERGE_ACCOUNT_POPUP
          );
            confirm.dismiss();
          } else if (selectedButton === this.commonUtilService.translateMessage('ACCOUNT_MERGE_CONFIRMATION_BTN_MERGE')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.MERGE_CLICKED,
              Environment.SETTINGS,
              PageId.MERGE_ACCOUNT_POPUP
          );
            confirm.dismiss();
            this.mergeAccount();
          }
        },
      },
      cssClass: 'sb-popover primary',
    });

    confirm.present();
  }

  private async mergeAccount() {
    let loader: any | undefined;

    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.MERGE_ACCOUNT_INITIATED,
        Environment.SETTINGS,
        PageId.SETTINGS
    );

    const webviewSessionProviderConfigloader = await this.commonUtilService.getLoader();
    let webviewMergeSessionProviderConfig: WebviewSessionProviderConfig;

    await webviewSessionProviderConfigloader.present();
    try {
      webviewMergeSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('merge');
      await webviewSessionProviderConfigloader.dismiss();
    } catch (e) {
      await webviewSessionProviderConfigloader.dismiss();
      this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
      return;
    }

    this.authService.getSession()
        .map((session) => session!)
        .mergeMap(async (mergeToProfileSession) => {
          const mergeFromProfileSessionProvider = new WebviewManualMergeSessionProvider(
              webviewMergeSessionProviderConfig
          );
          const mergeFromProfileSession = await mergeFromProfileSessionProvider.provide();

          return {
            from: {
              userId: mergeFromProfileSession.userToken,
              accessToken: mergeFromProfileSession.access_token
            },
            to: {
              userId: mergeToProfileSession.userToken,
              accessToken: mergeToProfileSession.access_token
            }
          } as MergeServerProfilesRequest;
        })
        .do(async () => {
          loader = await (this.commonUtilService.getLoader() as Promise<any>);
          loader.present();
        })
        .mergeMap((mergeServerProfilesRequest) => {
          return this.profileService.mergeServerProfiles(mergeServerProfilesRequest);
        })
        .catch(async (e) => {
          console.error(e);

          if (e instanceof Error && e['code'] === 'INTERRUPT_ERROR') {
            throw e;
          }

          this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.MERGE_ACCOUNT_FAILED,
              Environment.SETTINGS,
              PageId.SETTINGS
          );

          const toast = await this.toastCtrl.create({
            message: await this.translate.get('ACCOUNT_MERGE_FAILED').toPromise(),
            duration: 2000,
            position: 'bottom'
          });

          await toast.present();

          throw e;
        })
        .do(async () => {
          this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.MERGE_ACCOUNT_SUCCESS,
              Environment.SETTINGS,
              PageId.SETTINGS
          );

          const successPopover = await this.popoverCtrl.create({
            component: SbPopoverComponent,
            componentProps: {
              sbPopoverHeading: this.commonUtilService.translateMessage('ACCOUNT_MERGE_SUCCESS_POPOVER_HEADING'),
              icon: null,
              actionsButtons: [
                {
                  btntext: this.commonUtilService.translateMessage('OKAY'),
                  btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
                },
              ],
              sbPopoverContent: this.commonUtilService.translateMessage('ACCOUNT_MERGE_SUCCESS_POPOVER_CONTENT'),
            },
            cssClass: 'sb-popover'
          });

          await successPopover.present();
        })
        .finally(() => {
          if (loader) {
            loader.dismiss();
          }
        })
        .subscribe();
  }
}
