import { ContentFilterConfig, PreferenceKey } from '@app/app/app.constant';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { ContentService, SharedPreferences, HttpServerError, NetworkError } from 'sunbird-sdk';
import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { ContentType, MimeType, EventTopics, RouterLinks, LaunchType } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, Environment, ID, CorReleationDataType } from '../telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UtilityService } from '../utility-service';

@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  private savedUrlMatch: any;

  private _isDelegateReady = false;
  private isOnboardingCompleted = false;
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
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalServices: AppGlobalService,
    private events: Events,
    private router: Router,
    private appVersion: AppVersion,
    private utilityService: UtilityService
  ) { }

  onAction(payload: any): Observable<undefined> {
    if (payload && payload.url) {
      const quizTypeRegex = new RegExp(/(?:\/(?:resources\/play\/content|play\/quiz)\/(?<quizId>\w+))/);
      const dialTypeRegex = new RegExp(/(?:\/(?:dial|QR)\/(?<dialCode>\w+))/);
      const contentTypeRegex = new RegExp(/(?:\/play\/(?:content|collection)\/(?<contentId>\w+))/);
      const courseTypeRegex = new RegExp(/(?:\/(?:explore-course|learn)\/course\/(?<courseId>\w+))/);

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

    const url = new URL(urlMatch.input);
    // Read version code from deeplink.
    const requiredVersionCode = url.searchParams.get('vCode');
    if (requiredVersionCode && !(await this.isAppCompatible(requiredVersionCode))) {
      this.upgradeAppPopover(requiredVersionCode);
    } else if (this.isOnboardingCompleted) {
      this.handleNavigation(urlMatch);
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

  private handleNavigation(urlMatch: any): void {
    if (this._isDelegateReady) {
      if (urlMatch.groups.dialCode) {
        this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: urlMatch.groups.dialCode, source: PageId.HOME } });
      } else if (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId) {
        this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true);
      }
    } else {
      this.savedUrlMatch = urlMatch;
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

      if (content.contentType === ContentType.COURSE.toLowerCase()) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content } });
      } else if (content.mimeType === MimeType.COLLECTION) {
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content } });
      } else {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
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

}
