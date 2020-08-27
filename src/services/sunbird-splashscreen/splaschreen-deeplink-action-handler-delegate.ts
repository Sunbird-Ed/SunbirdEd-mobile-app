import {
  ContentFilterConfig,
  PreferenceKey,
  ProfileConstants,
  appLanguages,
  ProgressPopupContext,
  IgnoreTelemetryPatters
} from '@app/app/app.constant';
import { Inject, Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Events } from '@ionic/angular';
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
  TelemetryObject,
  TelemetryService,
  ContentDetailRequest,
  ChildContentRequest,
  ContentImportRequest,
  StorageService,
  ContentImport,
  Rollup,
  FetchEnrolledCourseRequest,
  CourseService
} from 'sunbird-sdk';
import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { ContentType, MimeType, EventTopics, RouterLinks, LaunchType } from '../../app/app.constant';
import { AppGlobalService } from '../app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PageId, InteractType, Environment, ID, CorReleationDataType } from '../telemetry-constants';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UtilityService } from '../utility-service';
import { LoginHandlerService } from '../login-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { QRScannerResultHandler } from '../qrscanresulthandler.service';
import { ContentUtil } from '@app/util/content-util';
import * as qs from 'qs';
import { SbProgressLoader, Context as SbProgressLoaderContext } from '../sb-progress-loader.service';
import { Location } from '@angular/common';

@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  private savedPayloadUrl: any;

  private isOnboardingCompleted = false;
  private currentAppVersionCode: number;
  private progressLoaderId: string;
  private childContent;
  private isChildContentFound;
  private enableRootNavigation = false;

  // should delay the deeplinks until tabs is loaded- gets triggered from Resource components
  set isDelegateReady(val: boolean) {
    if (val && this.savedPayloadUrl) {
      this.handleDeeplink(this.savedPayloadUrl);
      this.savedPayloadUrl = null;
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
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalServices: AppGlobalService,
    private events: Events,
    private router: Router,
    private appVersion: AppVersion,
    private utilityService: UtilityService,
    private loginHandlerService: LoginHandlerService,
    public translateService: TranslateService,
    private formFrameWorkUtilService: FormAndFrameworkUtilService,
    private qrScannerResultHandler: QRScannerResultHandler,
    private sbProgressLoader: SbProgressLoader,
    private location: Location
  ) {
    this.eventToSetDefaultOnboardingData();
  }

  onAction(payload: any): Observable<undefined> {
    if (payload && payload.url) {
      this.handleDeeplink(payload.url);
    }
    return of(undefined);
  }

  // This method is called only when the user redirects directly from the Playstore
  checkUtmContent(utmVal: string): void {
    const utmRegex = new RegExp(String.raw`(?:utm_content=(?<utm_content>[^&]*))`);
    const res = utmRegex.exec(utmVal);
    if (res && res.groups && res.groups.utm_content && res.groups.utm_content.length) {
      const payload = { url: res.groups.utm_content };
      this.onAction(payload);
    }
  }

  private async handleDeeplink(payloadUrl: string) {
    const dialCode = await this.qrScannerResultHandler.parseDialCode(payloadUrl);

    // const urlRegex = new RegExp(await this.formFrameWorkUtilService.getDeeplinkRegexFormApi());
    // const urlMatch = payloadUrl.match(urlRegex);

    // TODO: Is supported URL or not.
    // Assumptions priority cannot have value as 0 and two simiar urls should not have same priority level;

    const deepLinkUrlConfig: { name: string, code: string, values: string, route: string, priority?: number }[] = [
      {
        name: 'Dialcode parser',
        code: 'dialcode',
        values: '(\\/dial\\/(?<sunbird>[a-zA-Z0-9]+)|(\\/QR\\/\\?id=(?<epathshala>[a-zA-Z0-9]+)))',
        route: 'search'
      },
      {
        name: 'content deatil',
        code: 'contentDetail',
        values: '(?:\\/(?:resources\\/play\\/content|play\\/content|play\\/quiz)\\/(?<quizId>\\w+))',
        route: 'content-details'
      },
      {
        name: 'Textbook detail',
        code: 'textbookDetail',
        values: '(?:\\/play\\/(?:collection)\\/(?<content_id>\\w+))',
        route: 'collection-detail-etb',
        priority: 2
      },
      {
        name: 'Textbook content detail',
        code: 'textbookContentDetail',
        values: '(?:\\/play\\/(?:collection)\\/(?<content_id>\\w+)\\?(?=.*\\bcontentId\\b=(?<contentId>([^&]*)).*))',
        route: 'collection-detail-etb',
        priority: 1
      },
      {
        name: 'Course Detail',
        code: 'courseDetail',
        values: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+))',
        route: 'enrolled-course-details',
        priority: 3
      },
      {
        name: 'Module Detail',
        code: 'moduleDetail',
        values: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+)\\?(?=.*\\bmoduleId\\b=(?<moduleId>([^&]*)).*))',
        route: 'module-details',
        priority: 1
      },
      {
        name: 'Course Content Detail',
        code: 'courseContentDetail',
        values: '(?:\\/(?:explore-course|learn)\\/course\\/(?<course_id>\\w+)\\?(?=.*\\bcontentId\\b=(?<contentId>([^&]*)).*))',
        route: 'course-content-details',
        priority: 2
      },
      {
        name: 'Course tab',
        code: 'courseTab',
        values: '^.*explore-course(\\?.*|$)',
        route: 'tabs/courses',
        priority: 4
      },
      {
        name: 'Library',
        code: 'library',
        values: '\\/(resources|explore)$',
        route: 'tabs/resources'
      }
    ];

    let matchedDeeplinkConfig: { name: string, code: string, values: string, route: string, priority?: number } = null;
    let urlMatch;

    deepLinkUrlConfig.forEach(config => {
      const urlRegexMatch = payloadUrl.match(new RegExp(config.values));
      if (!!urlRegexMatch) {
        if (!matchedDeeplinkConfig ||
          (matchedDeeplinkConfig && !matchedDeeplinkConfig.priority && config.priority) ||
          (matchedDeeplinkConfig && matchedDeeplinkConfig.priority
            && config.priority && matchedDeeplinkConfig.priority > config.priority)) {
          matchedDeeplinkConfig = config;
          urlMatch = urlRegexMatch;
        }
      }
    });

    if (!matchedDeeplinkConfig) {
      // TODO, toast message
      return;
    }

    let identifier;
    if (urlMatch && urlMatch.groups && Object.keys(urlMatch.groups).length) {
      identifier = urlMatch.groups.quizId || urlMatch.groups.content_id || urlMatch.groups.course_id;
    }

    await this.sbProgressLoader.show(this.generateProgressLoaderContext(payloadUrl, identifier, dialCode));

    this.generateUtmTelemetryEvent(identifier, dialCode, payloadUrl);

    // Read version code from deeplink.
    const requiredVersionCode = this.getQueryParamValue(payloadUrl, 'vCode');
    // Check if deelink is compatible with the current app.
    if (requiredVersionCode && !(await this.isAppCompatible(requiredVersionCode))) {
      this.closeProgressLoader();
      this.upgradeAppPopover(requiredVersionCode);
    } else {
      this.isOnboardingCompleted =
        (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true') ? true : false;

      // const session = await this.authService.getSession().toPromise();

      // If onboarding not completed
      if (!this.isOnboardingCompleted) {  // && !session
        // skip info popup
        this.appGlobalServices.skipCoachScreenForDeeplink = true;
        this.enableRootNavigation = true;

        // Set onboarding data if available in query params. e.g. channel, role, lang
        await this.setOnboradingData(payloadUrl);
      }

      this.handleNavigation(payloadUrl, identifier, dialCode, matchedDeeplinkConfig.route);
    }
  }

  private generateProgressLoaderContext(url, identifier, dialCode): SbProgressLoaderContext {
    if (this.progressLoaderId) {
      this.closeProgressLoader();
    }
    this.progressLoaderId = dialCode || identifier || ProgressPopupContext.DEEPLINK;
    const deeplinkUrl: URL = new URL(url);
    const channelSlug = deeplinkUrl.searchParams.get('channel');
    if (channelSlug) {
      return {
        id: this.progressLoaderId,
        ignoreTelemetry: {
          when: {
            interact: IgnoreTelemetryPatters.IGNORE_DEEPLINK_PAGE_ID_EVENTS,
            impression: IgnoreTelemetryPatters.IGNORE_CHANNEL_IMPRESSION_EVENTS
          }
        }
      };
    } else if (dialCode) {
      return {
        id: this.progressLoaderId,
        ignoreTelemetry: {
          when: {
            interact: IgnoreTelemetryPatters.IGNORE_DIAL_CODE_PAGE_ID_EVENTS,
            impression: IgnoreTelemetryPatters.IGNORE_DEEPLINK_PAGE_ID_EVENTS
          }
        }
      };
    } else if (identifier) {
      return {
        id: this.progressLoaderId,
        ignoreTelemetry: {
          when: {
            interact: IgnoreTelemetryPatters.IGNORE_DEEPLINK_PAGE_ID_EVENTS,
            impression: IgnoreTelemetryPatters.IGNORE_DEEPLINK_PAGE_ID_EVENTS
          }
        }
      };
    }
    return {
      id: this.progressLoaderId
    };
  }

  private closeProgressLoader() {
    this.sbProgressLoader.hide({
      id: this.progressLoaderId
    });
    this.progressLoaderId = undefined;
  }

  private generateUtmTelemetryEvent(identifier, dialCode, url) {
    // TODO: Here identifier and dialcode both could be undefined.
    // TODO: What needs to pass if deeplink in not having neither identifier nor dialcode.
    const telemetryObject = new TelemetryObject(identifier ? identifier : dialCode, identifier ? 'Content' : 'qr', undefined);
    const utmUrl = url.slice(url.indexOf('?') + 1);
    const params: { [param: string]: string } = qs.parse(utmUrl);
    const utmcData: CorrelationData[] = [];

    if (utmUrl !== url) {
      ContentUtil.genrateUTMCData(params).forEach((element) => {
        utmcData.push(element);
      });
    }

    const corRelationData: CorrelationData[] = [{
      id: CorReleationDataType.DEEPLINK,
      type: CorReleationDataType.ACCESS_TYPE
    }];
    if (utmcData && utmcData.length) {
      this.telemetryService.updateCampaignParameters(utmcData);
      this.telemetryGeneratorService.generateUtmInfoTelemetry(params, PageId.HOME, telemetryObject, corRelationData);
    }

    return utmcData;
  }

  private getQueryParamValue(payloadUrl: string, queryParam: string): string {
    const url = new URL(payloadUrl);
    return url.searchParams.get(queryParam);
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

  private async setOnboradingData(payloadUrl) {
    const lang = this.getQueryParamValue(payloadUrl, 'lang');
    this.setAppLanguage(lang);

    const userType = this.getQueryParamValue(payloadUrl, 'role');
    this.setUserType(userType);

    const channelSlug = this.getQueryParamValue(payloadUrl, 'channel');
    if (channelSlug) {
      const orgSearchRequest = {
        filters: {
          slug: channelSlug,
          isRootOrg: true
        }
      };

      try {
        const result = await this.frameworkService.searchOrganization(orgSearchRequest).toPromise();
        const org: any = result.content && result.content[0];
        if (org) {
          const channelId = org.identifier;
          this.setProfileData(channelId, payloadUrl);

          // Set the channel for page assemble and load the channel specifc course page is available.
          this.pageAssembleService.setPageAssembleChannel({ channelId });

          setTimeout(() => {
            this.events.publish(EventTopics.COURSE_PAGE_ASSEMBLE_CHANNEL_CHANGE);
          }, 500);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // initTabs(this.container, GUEST_TEACHER_TABS);
    // this.events.publish('refresh:profile');
  }

  private async setAppLanguage(langCode: string) {
    const selctedLangCode = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    const selectedLangLabel = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise();
    if (!selctedLangCode && !selectedLangLabel) {
      let languageDetail;
      if (!langCode) {
        // Set the default to english if not available.
        langCode = 'en';
      }
      const LangList = appLanguages;
      languageDetail = LangList.find(i => i.code === langCode);

      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, languageDetail.code).toPromise();
      this.translateService.use(languageDetail.code);

      await this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, languageDetail.name).toPromise();
    }
  }

  private async setUserType(userType) {
    if (!(userType && Object.values(ProfileType).includes(userType))) {
      userType = ProfileType.TEACHER;
    }
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    if (!selectedUserType) {
      await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, userType).toPromise();
    }
  }

  private async setProfileData(channelId: string, payloadUrl) {
    try {
      const channelDetails: Channel = await this.frameworkService.getChannelDetails({ channelId }).toPromise();
      const frameworkId = channelDetails.defaultFramework;

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
        const terms = await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise();
        categoryData[category.code] = terms[0].code;
      }

      // Get the active profile
      const activeSessionProfile = await this.profileService.getActiveSessionProfile({
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      }).toPromise();

      const userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
      const updateProfileRequest: Profile = {
        ...activeSessionProfile,
        syllabus: [frameworkId],
        board: [categoryData[FrameworkCategoryCode.BOARD]],
        medium: [categoryData[FrameworkCategoryCode.MEDIUM]],
        grade: [categoryData[FrameworkCategoryCode.GRADE_LEVEL]],
        handle: 'Guest1',
        profileType: userType as any,
        source: ProfileSource.LOCAL
      };
      const profile: Profile = await this.profileService.updateProfile(updateProfileRequest).toPromise();

      // TODO: need to revisit below section
      // initTabs(this.container, GUEST_TEACHER_TABS);
      // this.events.publish('refresh:profile');
      this.appGlobalServices.guestUserProfile = profile;

      this.commonUtilService.handleToTopicBasedNotification();

      setTimeout(async () => {
        this.appGlobalServices.setOnBoardingCompleted();
        // this.navigateToCourse(payload.courseId, payloadUrl);
        this.loginHandlerService.setDefaultProfileDetails();
      }, 1000);

      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
      this.events.publish('refresh:profile');
      this.appGlobalServices.guestUserProfile = profile;
      this.telemetryGeneratorService.generateProfilePopulatedTelemetry(
        PageId.HOME, profile, 'auto', Environment.ONBOARDING, ContentUtil.extractBaseUrl(payloadUrl)
      );

      this.isOnboardingCompleted = true;
    } catch (e) {
      this.closeProgressLoader();
    }
  }

  private async handleNavigation(payloadUrl, identifier, dialCode, route) {
    if (dialCode) {
      this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK, payloadUrl);
      this.setTabsRoot();
      this.router.navigate([route],
        {
          state: {
            dialCode,
            source: PageId.HOME,
            corRelation: this.getCorrelationList(payloadUrl)
          }
        });
    } else if (identifier) {
      const content = await this.getContentData(identifier);
      if (!content) {
        this.closeProgressLoader();
      } else {
        this.navigateContent(identifier, true, content, payloadUrl, route);
      }
    } else {
      this.setTabsRoot();
      this.router.navigate([route]);
      this.closeProgressLoader();
    }
  }

  /////////////////////////////////////////////////

  async navigateContent(identifier, isFromLink = false, content?: Content | null, payloadUrl?: string, route?: string) {
    try {
      // TODO not required resetSavedQuizContent
      this.appGlobalServices.resetSavedQuizContent();
      if (!content) {
        content = await this.getContentData(identifier);
      }

      if (isFromLink) {
        this.telemetryGeneratorService.generateAppLaunchTelemetry(LaunchType.DEEPLINK, payloadUrl);
      }

      // this.appGlobalServices.skipCoachScreenForDeeplink = true;
      if (content && content.contentData &&
        content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED) {
        this.navigateQuizContent(identifier, content, isFromLink, payloadUrl);
      } else if (content) {
        if (content.mimeType === MimeType.COLLECTION) {
          this.navigateToCollection(identifier, content, payloadUrl, route);
        } else {
          this.setTabsRoot();
          await this.router.navigate([route],
            {
              state: {
                content,
                corRelation: this.getCorrelationList(payloadUrl)
              }
            });
        }
      } else {
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_FOR_DEEPLINK_CONTENT');
          this.appGlobalServices.skipCoachScreenForDeeplink = false;
          this.closeProgressLoader();
          return;
        }
      }
    } catch (err) {
      this.closeProgressLoader();
      console.log(err);
    }
  }

  private async navigateQuizContent(identifier, content, isFromLink, payloadUrl) {
    this.appGlobalServices.limitedShareQuizContent = identifier;
    if (isFromLink) {
      this.limitedSharingContentLinkClickedTelemery();
    }
    if (this.router.url && this.router.url.indexOf(RouterLinks.CONTENT_DETAILS) !== -1) {
      this.events.publish(EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, { content, autoPlayQuizContent: true });
      this.closeProgressLoader();
      return;
    }
    this.setTabsRoot();
    await this.router.navigate([RouterLinks.CONTENT_DETAILS],
      {
        state: {
          content, autoPlayQuizContent: true,
          corRelation: this.getCorrelationList(payloadUrl)
        }
      });
  }

  private getContentData(contentId): Promise<Content | null> {
    return new Promise(async resolve => {
      const content = await this.contentService.getContentDetails({ contentId }).toPromise()
        .catch(e => {
          if (HttpServerError.isInstance(e)) {
            this.commonUtilService.showToast('ERROR_FETCHING_DATA');
          } else if (NetworkError.isInstance(e)) {
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

  // This method is called only when a deeplink is clicked before Onboarding is not completed
  eventToSetDefaultOnboardingData(): void {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, () => {
      if (!this.isOnboardingCompleted) {
        this.setAppLanguage(undefined);
        this.setUserType(undefined);
      }
    });
  }

  async navigateToCollection(
    identifier, content: Content | null, payloadUrl: string, route?: string,
    isOnboardingSkipped = false, isFromChannelDeeplink = false
  ) {
    let childContentId;
    if (payloadUrl) {
      childContentId = this.getQueryParamValue(payloadUrl, 'moduleId');
    }
    if (!childContentId && payloadUrl) {
      childContentId = this.getQueryParamValue(payloadUrl, 'contentId');
    }

    this.isChildContentFound = false;
    this.childContent = undefined;

    if (childContentId) {
      try {
        if (content && content.isAvailableLocally) {
          this.childContent = await this.getChildContents(childContentId);
        } else {
          this.importContent([identifier], false);
          content = await this.getContentHeirarchy(identifier);
          await this.getChildContent(content, childContentId);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (this.childContent) {
      if (this.childContent.mimeType === MimeType.COLLECTION) {
        if (content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase()) {
          const chapterParams: NavigationExtras = {
            state: {
              courseContent: content,
              chapterData: this.childContent,
              isOnboardingSkipped,
              isFromDeeplink: true,
            }
          };
          this.closeProgressLoader();
          this.setTabsRoot();
          this.router.navigate([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CHAPTER_DETAILS}`],
            chapterParams);
        } else {
          this.setTabsRoot();
          this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB],
            {
              state: {
                content,
                corRelation: this.getCorrelationList(payloadUrl)
              }
            });
        }
      } else {
        if (content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase()) {
          if (this.appGlobalServices.isGuestUser) {
            this.setTabsRoot();
            this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
              {
                state: {
                  content,
                  isFromChannelDeeplink,
                  corRelation: this.getCorrelationList(payloadUrl)
                }
              });
          } else {
            const fetchEnrolledCourseRequest: FetchEnrolledCourseRequest = {
              userId: this.appGlobalServices.getUserId(),
            };
            const enrolledCourses = await this.courseService.getEnrolledCourses(fetchEnrolledCourseRequest).toPromise();
            let isCourseEnrolled;
            if (enrolledCourses && enrolledCourses.length > 0) {
              isCourseEnrolled = enrolledCourses.find(course => {
                return course.contentId === childContentId;
              });
            }
            if (isCourseEnrolled) {
              this.setTabsRoot();
              this.router.navigate([RouterLinks.CONTENT_DETAILS], {
                state: {
                  content: this.childContent,
                  depth: 1,
                  isChildContent: true,
                  corRelation: undefined,
                  isCourse: content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase(),
                  isOnboardingSkipped
                }
              });
            } else {
              this.setTabsRoot();
              this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
                {
                  state: {
                    content,
                    isFromChannelDeeplink,
                    corRelation: this.getCorrelationList(payloadUrl)
                  }
                });
            }
          }
        } else {
          this.setTabsRoot();
          this.router.navigate([RouterLinks.CONTENT_DETAILS], {
            state: {
              content: this.childContent,
              depth: 1,
              isChildContent: true,
              corRelation: this.getCorrelationList(payloadUrl),
              isCourse: content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase(),
              isOnboardingSkipped
            }
          });
        }
      }
    } else {
      if (content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase()) {
        this.setTabsRoot();
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS],
          {
            state: {
              content,
              isOnboardingSkipped,
              isFromChannelDeeplink,
              corRelation: this.getCorrelationList(payloadUrl)
            }
          });
      } else {
        this.setTabsRoot();
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB],
          {
            state: {
              content,
              corRelation: this.getCorrelationList(payloadUrl)
            }
          });
      }
    }
  }

  private getCorrelationList(payloadUrl): Array<CorrelationData> {
    const corRelationList: Array<CorrelationData> = [{
      id: ContentUtil.extractBaseUrl(payloadUrl),
      type: CorReleationDataType.SOURCE
    }];
    return corRelationList;
  }

  async getChildContents(identifier) {
    const childContentRequest: ChildContentRequest = {
      contentId: identifier,
      hierarchyInfo: null
    };
    return this.contentService.getChildContents(childContentRequest).toPromise();
  }

  async getContentHeirarchy(identifier: string) {
    const request: ContentDetailRequest = {
      contentId: identifier
    };

    return this.contentService.getContentHeirarchy(request).toPromise();
  }

  async getChildContent(content, childContentId) {
    if (content.identifier === childContentId) {
      this.childContent = content;
      this.isChildContentFound = true;
    } else if (!this.isChildContentFound && content && content.children) {
      content.children.forEach((ele) => {
        if (!this.isChildContentFound) {
          this.getChildContent(ele, childContentId);
        }
      });
    }
    return (this.childContent);
  }

  private importContent(identifiers: Array<string>, isChild: boolean) {
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel'],
    };
    // // Call content service
    this.contentService.importContent(contentImportRequest).toPromise();
  }

  private getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const rollUpMap: { [key: string]: Rollup } = {};
    const requestParams: ContentImport[] = [];
    identifiers.forEach((value) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath(),
        contentId: value,
        correlationData: [],
        rollUp: rollUpMap[value]
      });
    });

    return requestParams;
  }

  // this only sets the Root for the Tabs.
  private setTabsRoot() {
    if (this.enableRootNavigation) {
      try {
        this.location.replaceState(this.router.serializeUrl(this.router.createUrlTree([RouterLinks.TABS])));
      } catch (e) {
        console.log(e);
      }
      this.enableRootNavigation = false;
    }
  }

}
