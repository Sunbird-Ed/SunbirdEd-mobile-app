import { ContentFilterConfig } from '@app/app/app.constant';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Observable, of } from 'rxjs';
import {
  ContentService,
  OAuthSession,
  AuthService,
} from 'sunbird-sdk';

import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { ContentType, MimeType, EventTopics, RouterLinks, LaunchType } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, Environment, ID, CorReleationDataType } from '../telemetry-constants';


@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  identifier: any;
  isGuestUser: any;
  userId: string;
  enrolledCourses: any;
  appLabel: any;
  externalUrl: any;
  appId: any;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalServices: AppGlobalService,
    private events: Events,
    private zone: NgZone,
    private router: Router,
    private appVersion: AppVersion,
  ) {
    this.getUserId();
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appLabel = appName;
      });
  }

  onAction(payload: any): Observable<undefined> {
      if (payload && payload.url) {
        const quizTypeRegex = new RegExp(/(?:\/resources\/play\/content\/(?<quizId>\w+))/);
        const dialTypeRegex = new RegExp(/(?:\/get\/dial\/(?<dialCode>\w+))/);
        const contentTypeRegex = new RegExp(/(?:\/play\/(?:content|collection)\/(?<contentId>\w+))/);
        const courseTypeRegex = new RegExp(/(?:\/(?:explore-course|learn)\/course\/(?<courseId>\w+))/);

        const urlRegex = new RegExp(quizTypeRegex.source + '|' + dialTypeRegex.source + '|' +
          contentTypeRegex.source + '|' + courseTypeRegex.source);
        const urlMatch = payload.url.match(urlRegex.source);

        if (urlMatch && urlMatch.groups) {
          if (urlMatch.groups.dialCode) {
            this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: urlMatch.groups.dialCode, source: PageId.HOME } });
          } else if (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId) {
            this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true);
          }
        }
        return of(undefined);
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
          this.quizContentNavigator(identifier, content, isFromLink);
        } else {
          await this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content } });
        }
      }
    } catch (err) {}
  }

  async quizContentNavigator(identifier, content, isFromLink) {
    this.appGlobalServices.limitedShareQuizContent = identifier;
    if (isFromLink) {
      this.limitedSharingContentLinkClickedTelemery();
    }
    if (!this.appGlobalServices.isUserLoggedIn() && !this.appGlobalServices.isProfileSettingsCompleted) {
      return;
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

  /**
   * Get logged-user id. User id is needed to enroll user into batch.
   */
  getUserId() {
    this.authService.getSession().subscribe((session: OAuthSession) => {
      if (!session) {
        this.zone.run(() => {
          this.isGuestUser = true;
        });
      } else {
        this.zone.run(() => {
          this.isGuestUser = false;
          this.userId = session.userToken;
        });
      }
    }, () => {
    });
  }

  limitedSharingContentLinkClickedTelemery() {
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
