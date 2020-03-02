import { ContentFilterConfig, PreferenceKey } from '@app/app/app.constant';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Events, PopoverController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { ContentService, SharedPreferences, HttpServerError, NetworkError, AuthService, ProfileType, Content } from 'sunbird-sdk';
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

@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  private savedUrlMatch: any;

  private _isDelegateReady = false;
  private isOnboardingCompleted = false;
  private loginPopup: any;
  private currentAppVersionCode: number;
  // should delay the deeplinks until tabs is loaded
  set isDelegateReady(val: boolean) {
    this._isDelegateReady = val;
    if (val && this.savedUrlMatch) {
      this.checkIfOnboardingComplete(this.savedUrlMatch);
      this.savedUrlMatch = null;
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
    public translateService: TranslateService
  ) {
    this.eventToSetDefaultOnboardingData();
   }

  onAction(payload: any): Observable<undefined> {
    if (payload && payload.url) {
      const quizTypeRegex = new RegExp(String.raw`(?:\/(?:resources\/play\/content|play\/quiz)\/(?<quizId>\w+))`);
      const dialTypeRegex = new RegExp(String.raw`(?:\/(?:dial|QR)\/(?<dialCode>\w+))`);
      const contentTypeRegex = new RegExp(String.raw`(?:\/play\/(?:content|collection)\/(?<contentId>\w+))`);
      const courseTypeRegex = new RegExp(String.raw`(?:\/(?:explore-course|learn)\/course\/(?<courseId>\w+))`);

      const urlRegex = new RegExp(quizTypeRegex.source + '|' + dialTypeRegex.source + '|' +
        contentTypeRegex.source + '|' + courseTypeRegex.source);
      const urlMatch = payload.url.match(urlRegex.source);

      if (urlMatch && urlMatch.groups) {
        this.checkIfOnboardingComplete(urlMatch);
      }
    }
    return of(undefined);
  }

  private async checkIfOnboardingComplete(urlMatch) {
    if (!this.isOnboardingCompleted) {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
    }
    const session = await this.authService.getSession().toPromise();

    const url = new URL(urlMatch.input);
    // Read version code from deeplink.
    const requiredVersionCode = url.searchParams.get('vCode');
    let content = null;
    if (urlMatch.groups.quizId || urlMatch.groups.contentId) {
      content = await this.contentService.getContentDetails({
        contentId: urlMatch.groups.quizId || urlMatch.groups.contentId
      }).toPromise();
    }
    if (requiredVersionCode && !(await this.isAppCompatible(requiredVersionCode))) {
      this.upgradeAppPopover(requiredVersionCode);
    } else if (this.isOnboardingCompleted || session) {
      this.handleNavigation(urlMatch, content);
    } else {
      this.checkForQuizWithoutOnboarding(urlMatch, content);
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

  async checkForQuizWithoutOnboarding(urlMatch: any, content: Content|null): Promise<void> {
    this.savedUrlMatch = null;
    if (this.loginPopup) {
      await this.loginPopup.dismiss();
    }
    if (content && content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
      this.showLoginWithoutOnboardingPopup(urlMatch.groups.quizId || urlMatch.groups.contentId);
    } else {
      this.savedUrlMatch = urlMatch;
    }
  }

  private handleNavigation(urlMatch: any, content?: Content|null): void {
    if (this._isDelegateReady) {
      if (urlMatch.groups.dialCode) {
        this.appGlobalServices.skipCoachScreenForDeeplink = true;
        this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: urlMatch.groups.dialCode, source: PageId.HOME } });
      } else if (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId) {
        this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true, content);
      }
    } else {
      this.savedUrlMatch = urlMatch;
    }
  }

  async navigateContent(identifier, isFromLink = false, content?: Content|null) {
    try {
      this.appGlobalServices.resetSavedQuizContent();
      if (!content) {
        content = await this.contentService.getContentDetails({
          contentId: identifier
        }).toPromise();
      }

      if (isFromLink) {
        this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK);
      }

      this.appGlobalServices.skipCoachScreenForDeeplink = true;
      if (content.contentType === ContentType.COURSE.toLowerCase()) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content } });
      } else if (content.mimeType === MimeType.COLLECTION) {
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content } });
      } else {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
          this.appGlobalServices.skipCoachScreenForDeeplink = false;
          return;
        }
        if (content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
          this.navigateQuizContent(identifier, content, isFromLink);
        } else {
          await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content } });
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
    await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content, autoPlayQuizContent: true } });
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

  checkUtmContent(utmVal: string): void {
    const utmRegex = new RegExp(String.raw`(?:utm_content=(?<utm_content>[^&]*))`);
    const res = utmRegex.exec(utmVal);
    if (res && res.groups && res.groups.utm_content && res.groups.utm_content.length) {
      const payload = { url: res.groups.utm_content};
      this.onAction(payload);
    }
  }

  async showLoginWithoutOnboardingPopup(quizId) {
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

  eventToSetDefaultOnboardingData(): void {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async () => {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
      if (!this.isOnboardingCompleted) {
        this.setDefaultLanguage();
        this.setDefaultUserType();
      }
    });
  }

  async setDefaultLanguage() {
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

  async setDefaultUserType(): Promise<void> {
    const userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    if (!userType) {
      await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
    }
  }

}