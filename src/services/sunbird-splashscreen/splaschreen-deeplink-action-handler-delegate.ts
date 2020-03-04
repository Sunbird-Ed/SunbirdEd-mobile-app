import { ContentFilterConfig, PreferenceKey } from '@app/app/app.constant';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Events, PopoverController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { ContentService, SharedPreferences, HttpServerError, NetworkError,
   AuthService, ProfileType, CorrelationData, TelemetryObject } from 'sunbird-sdk';
import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { ContentType, MimeType, EventTopics, RouterLinks, LaunchType } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, Environment, ID, CorReleationDataType } from '../telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UtilityService } from '../utility-service';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { LoginHandlerService } from '../login-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { QRScannerResultHandler } from '../qrscanresulthandler.service';

@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  private savedUrl: any;

  private _isDelegateReady = false;
  private isOnboardingCompleted = false;
  private loginPopup: any;
  private currentAppVersionCode: number;

  // should delay the deeplinks until tabs is loaded- gets triggered from Resource components
  set isDelegateReady(val: boolean) {
    this._isDelegateReady = val;
    if (val && this.savedUrl) {
      this.checkDeeplinkMatch(this.savedUrl);
      this.savedUrl = null;
    }
  }

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalServices: AppGlobalService,
    private events: Events,
    private router: Router,
    private appVersion: AppVersion,
    private utilityService: UtilityService,
    private popoverCtrl: PopoverController,
    private loginHandlerService: LoginHandlerService,
    public translateService: TranslateService,
    private formFrameWorkUtilService: FormAndFrameworkUtilService,
    private qrScannerResultHandler: QRScannerResultHandler,
  ) {
    this.eventToSetDefaultOnboardingData();
   }

  onAction(payload: any): Observable<undefined> {
    if (payload && payload.url) {
      this.checkDeeplinkMatch(payload.url);
    }
    return of(undefined);
  }

  private async checkDeeplinkMatch(url: string) {
    const dialCode = await this.qrScannerResultHandler.parseDialCode(url);
    const urlRegex = new RegExp(await this.formFrameWorkUtilService.getDeeplinkRegexFormApi());
    const urlMatch = url.match(urlRegex);

    if ((urlMatch && urlMatch.groups) || dialCode) {
      let identifier;
      if (urlMatch && urlMatch.groups) {
        identifier = urlMatch.groups.contentId ? urlMatch.groups.contentId : urlMatch.groups.courseId;
      }
      this.checkIfOnboardingComplete(urlMatch, dialCode, url);
      const telemetryObject = new TelemetryObject(identifier ? identifier : dialCode, identifier ? 'Content' : 'qr', undefined);
      this.generateUTMInfoTelemetry(url, telemetryObject);
    }
  }

  private async checkIfOnboardingComplete(urlMatch, dialCode, inputUrl) {
    if (!this.isOnboardingCompleted) {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
    }
    const session = await this.authService.getSession().toPromise();

    const url = new URL(inputUrl);
    // Read version code from deeplink.
    const requiredVersionCode = url.searchParams.get('vCode');
    if (requiredVersionCode && !(await this.isAppCompatible(requiredVersionCode))) {
      this.upgradeAppPopover(requiredVersionCode);
    } else if (this.isOnboardingCompleted || session) {
      this.handleNavigation(urlMatch, dialCode, inputUrl);
    } else {
      this.checkForDeeplinkWithoutOnboarding(urlMatch, inputUrl);
    }
  }

  private async isAppCompatible(requiredVersionCode) {
    this.currentAppVersionCode = await this.utilityService.getAppVersionCode();

    // If requiredVersionCode is available then should display upgrade popup is installed version is less than the expected appVesion.
    return (this.currentAppVersionCode
      && requiredVersionCode
      && this.currentAppVersionCode >= requiredVersionCode);
  }

  private async upgradeAppPopover(requiredVersionCode) {
    const packageName = await this.appVersion.getPackageName();
    const playStoreLink = `https://play.google.com/store/apps/details?id=${packageName}`;
    const result: any = {
      type: 'optional',
      title: 'UPDATE_APP_SUPPORT_TITLE',
      isOnboardingCompleted: this.isOnboardingCompleted,
      requiredVersionCode,
      currentAppVersionCode: (this.currentAppVersionCode).toString(),
      isFromDeeplink: true,
      actionButtons: [
        {
          action: 'yes',
          label: 'UPDATE_APP_BTN_ACTION_YES',
          link: playStoreLink
        }
      ]
    };
    await this.appGlobalServices.openPopover(result);
  }

  private async checkForDeeplinkWithoutOnboarding(urlMatch: any, inputUrl: string): Promise<void> {
    this.savedUrl = null;
    if (this.loginPopup) {
      await this.loginPopup.dismiss();
    }
    if (urlMatch && urlMatch.groups.quizId) {
      this.showLoginWithoutOnboardingPopup(urlMatch.groups.quizId);
    } else {
      this.savedUrl = inputUrl;
    }
  }

  private handleNavigation(urlMatch: any, dialCode, inputUrl): void {
    if (this._isDelegateReady) {
      if (dialCode) {
        this.appGlobalServices.skipCoachScreenForDeeplink = true;
        this.router.navigate([RouterLinks.SEARCH], { state: { dialCode, source: PageId.HOME, corRelation: this.getCorRelationList()} });
      } else if (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId) {
        this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true);
      }
    } else {
      this.savedUrl = inputUrl;
    }
  }

  async navigateContent(identifier, isFromLink = false) {
    try {
      this.appGlobalServices.resetSavedQuizContent();
      const content = await this.contentService.getContentDetails({
        contentId: identifier
      }).toPromise();

      if (isFromLink) {
        this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK);
      }

      this.appGlobalServices.skipCoachScreenForDeeplink = true;
      if (content.contentType === ContentType.COURSE.toLowerCase()) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content, corRelation: this.getCorRelationList() } });
      } else if (content.mimeType === MimeType.COLLECTION) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1) {
          this.events.publish(EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN, { content });
          return;
        }
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content, corRelation: this.getCorRelationList() } });
      } else {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
          this.appGlobalServices.skipCoachScreenForDeeplink = false;
          return;
        }
        if (content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
          this.navigateQuizContent(identifier, content, isFromLink);
        } else {
          await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content, corRelation: this.getCorRelationList() } });
        }
      }
    } catch (err) {
      if (err instanceof HttpServerError) {
        this.commonUtilService.showToast('ERROR_FETCHING_DATA');
      } else if (err instanceof NetworkError) {
        this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
      } else {
        this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
      }
    }
  }

  private async navigateQuizContent(identifier, content, isFromLink) {
    this.appGlobalServices.limitedShareQuizContent = identifier;
    if (isFromLink) {
      this.limitedSharingContentLinkClickedTelemery();
    }
    if (!this.appGlobalServices.isSignInOnboardingCompleted && this.appGlobalServices.isUserLoggedIn()) {
      return;
    }
    if (this.router.url && this.router.url.indexOf(RouterLinks.CONTENT_DETAILS) !== -1) {
      this.events.publish(EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, { content, autoPlayQuizContent: true });
      return;
    }
    await this.router.navigate([RouterLinks.CONTENT_DETAILS],
       { state: { content, autoPlayQuizContent: true, corRelation: this.getCorRelationList() } });
  }

  private limitedSharingContentLinkClickedTelemery(): void {
    const corRelationList = [];
    corRelationList.push({ id: ID.QUIZ, type: CorReleationDataType.DEEPLINK });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.QUIZ_DEEPLINK,
      '',
      Environment.HOME,
      undefined,
      undefined,
      undefined,
      undefined,
      corRelationList,
      ID.DEEPLINK_CLICKED
    );
  }

  // This method is called only when the user redirects directly from the Playstore
  checkUtmContent(utmVal: string): void {
    const utmRegex = new RegExp(String.raw`(?:utm_content=(?<utm_content>[^&]*))`);
    const res = utmRegex.exec(utmVal);
    if (res && res.groups && res.groups.utm_content && res.groups.utm_content.length) {
      const payload = { url: res.groups.utm_content};
      this.onAction(payload);
    }
  }

  private async showLoginWithoutOnboardingPopup(quizId) {
    this.appGlobalServices.resetSavedQuizContent();
    this.loginPopup = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT'),
        metaInfo: this.commonUtilService.translateMessage('QUIZ_CONTENTS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color',
            isInternetNeededMessage: 'NEED_INTERNET_FOR_DEEPLINK_CONTENT'
          }
        ]
      },
      cssClass: 'sb-popover info',
    });
    await this.loginPopup.present();

    const { data } = await this.loginPopup.onDidDismiss();
    if (data && data.canDelete) {
      this.loginHandlerService.signIn();
      this.appGlobalServices.limitedShareQuizContent = quizId;
    }
    this.loginPopup = null;
  }

  // This method is called only when a deeplink is clicked before Onboarding is not completed
  private eventToSetDefaultOnboardingData(): void {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async () => {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
      if (!this.isOnboardingCompleted) {
        this.setDefaultLanguage();
        this.setDefaultUserType();
      }
    });
  }

  // This method is called only when a deeplink is clicked before Onboarding is not completed
  private async setDefaultLanguage() {
    const langCode = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (!langCode) {
      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en').toPromise();
      this.translateService.use('en');
    }
    const langLabel = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise();
    if (!langLabel) {
      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, 'English').toPromise();
    }
  }

  // This method is called only when a deeplink is clicked before Onboarding is not completed
  private async setDefaultUserType(): Promise<void> {
    const userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    if (!userType) {
      await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
    }
  }

  generateUTMInfoTelemetry(deeplinkUrl, telemetryObject) {
    const utmHashes = deeplinkUrl.slice(deeplinkUrl.indexOf('?') + 1).split('&');
    const utmParams = {};
    utmHashes.map(hash => {
        const [key, val] = hash.split('=');
        utmParams[key] = decodeURIComponent(val);
    });
    const cData: CorrelationData[] = [{
      id: CorReleationDataType.DEEPLINK,
      type: CorReleationDataType.ACCESS_TYPE
    }];
    this.telemetryGeneratorService.generateUtmInfoTelemetry(utmParams, PageId.HOME, cData, telemetryObject);
   }

   getCorRelationList() {
    const corRelationList: Array<CorrelationData> = new Array<CorrelationData>();
    corRelationList.push({
      id: CorReleationDataType.DEEPLINK,
      type: CorReleationDataType.ACCESS_TYPE
    });
    return corRelationList;
   }

}
