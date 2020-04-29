import { ContentFilterConfig, PreferenceKey, ProfileConstants, appLanguages } from '@app/app/app.constant';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Events, PopoverController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { 
  PageAssembleService,
  FrameworkService,
  ContentService,
  SharedPreferences,
  HttpServerError,
  NetworkError,
  AuthService, ProfileType, Content,
  ProfileService, Channel,
  GetFrameworkCategoryTermsRequest,
  CachedItemRequestSourceFrom,
  FrameworkCategoryCode,
  FrameworkUtilService,
  Profile,
  FrameworkCategoryCodesGroup,
  ProfileSource,
  CorrelationData,
  TelemetryObject
 } from 'sunbird-sdk';
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
import { ExternalChannelOverrideListener } from './external-channel-override-interface';
import { initTabs, GUEST_TEACHER_TABS } from '@app/app/module.service';
import { ContainerService } from '../container.services';
import { ContentUtil } from '@app/util/content-util';

@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate, ExternalChannelOverrideListener {
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
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('PAGE_ASSEMBLE_SERVICE') private pageAssembleService: PageAssembleService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
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
    private container: ContainerService
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

    const payload = { url };

    this.generateUtmTelemetryEvent(urlMatch, dialCode, url);

    // checks if the channel slug is present, else the normal deeplink flow executes
    if (await this.checkCourseChannelSlug(payload, urlMatch)) {
      return;
    }

    if ((urlMatch && urlMatch.groups) || dialCode) {
      this.checkIfOnboardingComplete(urlMatch, dialCode, url);
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
    let content = null;

    // checking only for quizId or content Id, since only contents can be considered as quiz.
    if (urlMatch && urlMatch.groups && (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId)) {
      content = await this.getContentData(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId);
      if (!content && !dialCode) { return; }
    }
    if (requiredVersionCode && !(await this.isAppCompatible(requiredVersionCode))) {
      this.upgradeAppPopover(requiredVersionCode);
    } else if (this.isOnboardingCompleted || session) {
      this.handleNavigation(urlMatch, content, dialCode, inputUrl);
    } else if (content && content.contentType === ContentType.COURSE.toLowerCase()) {
      const params = {
        userType: ProfileType.OTHER
      };
      this.setDefaultOnboardingData(params);
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
        {
          state: {
            content,
            isOnboardingSkipped: true,
            corRelation: this.getCorrelationList(urlMatch.input)
          }
        });
    } else {
      this.checkForDeeplinkWithoutOnboarding(content, inputUrl);
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

  private async checkForDeeplinkWithoutOnboarding(content: any, inputUrl: string): Promise<void> {
    this.savedUrl = null;
    if (this.loginPopup) {
      await this.loginPopup.dismiss();
    }
    if (content && content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED &&
      content.contentType !== ContentType.COURSE.toLowerCase() && content.mimeType !== MimeType.COLLECTION) {
        this.showLoginWithoutOnboardingPopup(content.identifier || content.contentId);
    } else {
      this.savedUrl = inputUrl;
    }
  }

  private handleNavigation(urlMatch: any, content?: Content | null, dialCode?, inputUrl?): void {
    if (this._isDelegateReady) {
      if (dialCode) {
        this.appGlobalServices.skipCoachScreenForDeeplink = true;
        // TODO check urlMatch.input
        this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK, inputUrl);
        this.router.navigate([RouterLinks.SEARCH],
          {
            state: {
              dialCode,
              source: PageId.HOME,
              corRelation: this.getCorrelationList(inputUrl)
            }
          });
      } else if (urlMatch && urlMatch.groups && (urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId)) {
        this.navigateContent(urlMatch.groups.quizId || urlMatch.groups.contentId || urlMatch.groups.courseId, true,
          content, inputUrl);
      }
    } else {
      this.savedUrl = inputUrl;
    }
  }

  async navigateContent(identifier, isFromLink = false, content?: Content | null, source?: string) {
    try {
      this.appGlobalServices.resetSavedQuizContent();
      if (!content) {
        content = await this.getContentData(identifier);
      }

      if (isFromLink) {
        this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK, source);
      }

      this.appGlobalServices.skipCoachScreenForDeeplink = true;
      if (content.contentType === ContentType.COURSE.toLowerCase()) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
          {
            state: {
              content,
              corRelation: this.getCorrelationList(source)
            }
          });
      } else if (content.mimeType === MimeType.COLLECTION) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1) {
          this.events.publish(EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN, { content });
          return;
        }
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB],
          {
            state: {
              content,
              corRelation: this.getCorrelationList(source)
            }
          });
      } else {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
          this.appGlobalServices.skipCoachScreenForDeeplink = false;
          return;
        }
        if (content && content.contentData && content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
          this.navigateQuizContent(identifier, content, isFromLink, source);
        } else {
          await this.router.navigate([RouterLinks.CONTENT_DETAILS],
            {
              state: {
                content,
                corRelation: this.getCorrelationList(source)
              }
            });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  private async navigateQuizContent(identifier, content, isFromLink, source) {
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
      {
        state: {
          content, autoPlayQuizContent: true,
          corRelation: this.getCorrelationList(source)
        }
      });
  }

  private getContentData(contentId): Promise<Content | null> {
    return new Promise(async resolve => {
      const content = await this.contentService.getContentDetails({ contentId }).toPromise()
        .catch(e => {
          if (e instanceof HttpServerError) {
            this.commonUtilService.showToast('ERROR_FETCHING_DATA');
          } else if (e instanceof NetworkError) {
            this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
          } else {
            this.commonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE');
          }
          return null;
        });
      resolve(content);
    });
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
  eventToSetDefaultOnboardingData(): void {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, () => {
      this.setDefaultOnboardingData();
    });
  }

  private async setDefaultOnboardingData(params?) {
    this.isOnboardingCompleted =
      (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
    if (!this.isOnboardingCompleted) {
      this.setDefaultLanguageAndUserType(params);
    }
  }

  private async setDefaultLanguageAndUserType(params?) {
    let selectedLanguage;
    if (params && params.langCode) {
      const LangList = appLanguages;
      selectedLanguage = LangList.find(i => i.code === params.langCode);
    }

    const langCode = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (!langCode) {
      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE,
        (selectedLanguage && selectedLanguage.code) || 'en').toPromise();
      this.translateService.use('en');
    }

    const langLabel = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise();
    if (!langLabel) {
      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE,
        (selectedLanguage && selectedLanguage.name) || 'English').toPromise();
    }

    // usertyoe == "TEACHER" for Quiz-link | "OTHER" for course link
    const userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    if (!userType) {
      await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, (params && params.userType) || ProfileType.TEACHER).toPromise();
    }
  }

  private generateUtmTelemetryEvent(urlMatch, dialCode, url) {
    let identifier;
    if (urlMatch && urlMatch.groups) {
      identifier = urlMatch.groups.contentId ? urlMatch.groups.contentId : urlMatch.groups.courseId;
    }

    const telemetryObject = new TelemetryObject(identifier ? identifier : dialCode, identifier ? 'Content' : 'qr', undefined);
    const cData: CorrelationData[] = [{
      id: CorReleationDataType.DEEPLINK,
      type: CorReleationDataType.ACCESS_TYPE
    }];
    this.commonUtilService.generateUTMInfoTelemetry(url, cData, telemetryObject);
  }

  private async checkCourseChannelSlug(payload, urlMatch) {
    if (!this.isOnboardingCompleted) {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
    }

    try {
      const url: URL = new URL(payload.url);
      const overrideChannelSlug = url.searchParams.get('channel');

      if (overrideChannelSlug) {
        const filters = {
          slug: overrideChannelSlug,
          isRootOrg: true
        };
        const result = await this.frameworkService.searchOrganization({ filters }).toPromise();
        const org: any = result.content && result.content[0];
        if (org) {
          this.pageAssembleService.setPageAssembleChannel({
            channelId: org.identifier
          });

          setTimeout(() => {
            this.events.publish(EventTopics.COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE);
          }, 500);
          let courseId;
          if (urlMatch && urlMatch.groups && urlMatch.groups.courseId) {
            courseId = urlMatch.groups.courseId;
          }
          const event = {
            url: payload.url,
            courseId,
            avb: '',
            channelId: org.identifier,
            extras: {
              profile: {
                userType: url.searchParams.get('role'),
                langCode: url.searchParams.get('lang')
              }
            }
          };
          const isUrlTypeCourse = (new RegExp(String.raw`explore-course`)).test(event.url);
          if (isUrlTypeCourse) {
            const loader = await this.commonUtilService.getLoader(null, 'Initilizing profile...');
            await loader.present();
            const isChannelDetected = await this.onChannelDetected(event);
            await loader.dismiss();
            if (isChannelDetected) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async onChannelDetected(event): Promise<boolean> {
    if (!this.isOnboardingCompleted) {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;
    }
    if (this.isOnboardingCompleted) {
      this.navigateToCourse(event.courseId, event.url);
      return true;
    }

    const params = {
      userType: (Object.values(ProfileType).includes(event.extras.profile.userType)) ? event.extras.profile.userType : undefined,
      langCode: event.extras.profile.langCode || undefined
    };
    this.setDefaultLanguageAndUserType(params);

    if (await this.setCourseOnboardingFlow(event)) {
      this.appGlobalServices.skipCoachScreenForDeeplink = true;
      return true;
    }
    return false;
  }

  async navigateToCourse(courseId, payloadUrl) {
    if (courseId) {
      const content: any = await this.getContentData(courseId);
      if (content && content.contentType === ContentType.COURSE.toLowerCase()) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
          {
            state: {
              content, isFromChannelDeeplink: true,
              corRelation: this.getCorrelationList(payloadUrl)
            }
          });
      }
    } else {
      this.router.navigateByUrl(RouterLinks.TABS_COURSE);
    }
  }

  setCourseOnboardingFlow(event) {

    return new Promise(async resolve => {
      try {
        const channelDetails: Channel = await this.frameworkService.getChannelDetails({ channelId: event.channelId }).toPromise();
        const frameworkId = channelDetails.defaultFramework;
        const syllabus = frameworkId;

        const categories = [
          { code: FrameworkCategoryCode.BOARD, prevCode: null },
          { code: FrameworkCategoryCode.MEDIUM, prevCode: FrameworkCategoryCode.BOARD },
          { code: FrameworkCategoryCode.GRADE_LEVEL, prevCode: FrameworkCategoryCode.MEDIUM }
        ];
        const categoryData: any = {};
        for (const category of categories) {
          const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            from: category.code === FrameworkCategoryCode.BOARD ? CachedItemRequestSourceFrom.SERVER : null,
            frameworkId,
            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
            currentCategoryCode: category.code,
            language: this.translateService.currentLang,
            selectedTermsCodes: category.prevCode ? [category.prevCode] : null
          };
          const terms = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise());
          categoryData[category.code] = terms[0].code;
        }

        const payload = {
          syllabus,
          board: categoryData[FrameworkCategoryCode.BOARD],
          medium: categoryData[FrameworkCategoryCode.MEDIUM],
          grade: categoryData[FrameworkCategoryCode.GRADE_LEVEL],
          courseId: event.courseId
        };
        await this.submitProfileSettings(payload, event.url);
        resolve(true);
      } catch (e) {
        resolve(false);
        console.log(e);
      }
    });
  }

  private async submitProfileSettings(payload, payloadUrl) {
    try {
      const activeSessionProfile = await this.profileService.getActiveSessionProfile({
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      }).toPromise();
      const userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();

      const updateProfileRequest: Profile = {
        ...activeSessionProfile,
        syllabus: [payload.syllabus],
        board: [payload.board],
        medium: [payload.medium],
        grade: [payload.grade],
        handle: 'Guest1',
        profileType: userType as any,
        source: ProfileSource.LOCAL
      };

      const profile: Profile = await this.profileService.updateProfile(updateProfileRequest).toPromise();
      initTabs(this.container, GUEST_TEACHER_TABS);
      this.events.publish('refresh:profile');
      this.appGlobalServices.guestUserProfile = profile;

      this.commonUtilService.handleToTopicBasedNotification();

      setTimeout(async () => {
        this.appGlobalServices.setOnBoardingCompleted();
        this.navigateToCourse(payload.courseId, payloadUrl);
        this.loginHandlerService.setDefaultProfileDetails();
      }, 1000);

      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
      this.events.publish('refresh:profile');
      this.appGlobalServices.guestUserProfile = profile;
      this.telemetryGeneratorService.generateProfilePopulatedTelemetry(
          PageId.HOME, profile, 'auto', Environment.ONBOARDING, ContentUtil.extractBaseUrl(payloadUrl)
      );

    } catch (e) {
      console.log(e);
    }
    return;
  }

  private getCorrelationList(source): Array<CorrelationData> {
    const corRelationList: Array<CorrelationData> = [{
      id: ContentUtil.extractBaseUrl(source),
      type: CorReleationDataType.SOURCE
    }];
    return corRelationList;
  }

}
