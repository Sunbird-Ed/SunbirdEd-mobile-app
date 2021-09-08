import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { SbAppSharePopupComponent, SbPopoverComponent } from '@app/app/components/popups';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { catchError, finalize, map, mergeMap, tap } from 'rxjs/operators';
import { AppHeaderService, CommonUtilService, FormAndFrameworkUtilService, TelemetryGeneratorService, UtilityService } from 'services';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from 'services/telemetry-constants';
import {
  ApiService, AuthService,
  DebuggingService,
  MergeServerProfilesRequest, ProfileService,
  SdkConfig, SharedPreferences,
  TelemetryImpressionRequest,
  WebviewManualMergeSessionProvider,
  WebviewSessionProviderConfig
} from 'sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { Events } from '@app/util/events';

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
  backButtonFunc: Subscription;
  debugmode: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SDK_CONFIG') private sdkConfig: SdkConfig,
    @Inject('API_SERVICE') private apiService: ApiService,
    @Inject('DEBUGGING_SERVICE') private debugginService: DebuggingService,
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
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private platform: Platform,
    private location: Location,
    private events: Events
  ) {
    this.isUserLoggedIn$ = this.authService.getSession().pipe(
      map((session) => !!session)
    );

    this.isNotDefaultChannelProfile$ = this.profileService.isDefaultChannelProfile().pipe(
      map((isDefaultChannelProfile) => !isDefaultChannelProfile)
    );
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
        this.shareAppLabel = this.commonUtilService.translateMessage('SHARE_APP', appName);
      });
    this.handleBackButton();
    this.debugmode = this.debugginService.isDebugOn();
    this.events.subscribe('debug_mode', (debugMode) => this.debugmode = debugMode);
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
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

  dataSync() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.DATA_SYNC_CLICKED);
    this.router.navigate(['settings/data-sync']);
  }

  aboutUs() {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.ABOUT_APP_CLICKED);
    this.router.navigate([`/${RouterLinks.SETTINGS}/about-us`]);
  }

  async shareApp() {
    const popover = await this.popoverCtrl.create({
      component: SbAppSharePopupComponent,
      componentProps: {
        pageId: PageId.SETTINGS
      },
      cssClass: 'sb-popover',
    });
    await popover.present();
  }

  generateInteractTelemetry(interactionType, interactSubtype) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactionType, interactSubtype,
      PageId.SETTINGS,
      Environment.SETTINGS, null
    );
  }

  showPermissionPage() {
    const navigationExtras: NavigationExtras = { state: { changePermissionAccess: true } };
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
    await confirm.present();
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

    this.authService.getSession().pipe(
      map((session) => session!),
      mergeMap(async (mergeToProfileSession) => {
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
      }),
      tap(async () => {
        loader = await this.commonUtilService.getLoader();
        await loader.present();
      }),
      mergeMap((mergeServerProfilesRequest) => {
        return this.profileService.mergeServerProfiles(mergeServerProfilesRequest);
      }),
      catchError(async (e) => {
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
      }),
      tap(async () => {
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
      }),
      finalize(() => {
        if (loader) {
          loader.dismiss();
        }
      })
    ).subscribe();
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SETTINGS, Environment.SETTINGS, false);
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  async debugModeToggle() {
      console.log('this.debugmode', this.debugmode);
      if (this.debugmode) {
        const confirm = await this.popoverCtrl.create({
          component: SbPopoverComponent,
          componentProps: {
            sbPopoverHeading: this.commonUtilService.translateMessage('DEBUG_MODE'),
            sbPopoverMainTitle: this.commonUtilService.translateMessage('DEBUG_ENABLE', { '%appName': this.appName }),
            actionsButtons: [
              {
                btntext: this.commonUtilService.translateMessage('DISMISS'),
                btnClass: 'popover-color popover-button-cancel'
              },
              {
                btntext: this.commonUtilService.translateMessage('DEBUG_ON'),
                btnClass: 'popover-color popover-button-allow'
              },
            ],
            icon: null,
            handler: (selectedButton: string) => {
              console.log(selectedButton);
              if (selectedButton === this.commonUtilService.translateMessage('DISMISS')) {
                this.debugmode = false;
              } else if (selectedButton === this.commonUtilService.translateMessage('DEBUG_ON')) {
                this.preferences.putString('debug_started_at', new Date().getTime().toString()).toPromise();
                this.observeDebugging();
                this.commonUtilService.showToast('DEBUG_ON_MESSAGE');
              }
            }
            // metaInfo: this.content.contentData.name,
          },
          cssClass: 'sb-popover dw-active-downloads-popover',
        });

        await confirm.present();
      } else {
        const confirm = await this.popoverCtrl.create({
          component: SbPopoverComponent,
          componentProps: {
            sbPopoverHeading: this.commonUtilService.translateMessage('DEBUG_MODE'),
            sbPopoverMainTitle: this.commonUtilService.translateMessage('DEBUG_DISABLE'),
            actionsButtons: [
              {
                btntext: this.commonUtilService.translateMessage('DISMISS'),
                btnClass: 'popover-color popover-button-cancel'
              },
              {
                btntext: this.commonUtilService.translateMessage('DEBUG_OFF'),
                btnClass: 'popover-color popover-button-allow'
              },
            ],
            icon: null,
            handler: (selectedButton: string) => {
              console.log(selectedButton);
              if (selectedButton === this.commonUtilService.translateMessage('DISMISS')) {
                this.debugmode = true;
              } else if (selectedButton === this.commonUtilService.translateMessage('DEBUG_OFF')) {
                this.debugginService.disableDebugging().subscribe((response) => {
                  if (response) {
                    this.commonUtilService.showToast('DEBUG_OFF_MESSAGE');
                    this.debugmode = false;
                  }
                });
              }
            }
          },
          cssClass: 'sb-popover dw-active-downloads-popover',
        });
        await confirm.present();
      }
  }

  async observeDebugging() {
    this.debugginService.enableDebugging().subscribe((isDebugMode) => {
      console.log('Debug Mode', isDebugMode);
      if (isDebugMode) {
        this.debugmode = true;
      } else if (!isDebugMode) {
        this.debugmode = false;
      }
    });
  }
}
