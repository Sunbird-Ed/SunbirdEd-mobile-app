// Angular dependencies
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// ionic cordova dependencies/plugins
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
// ionic cordova dependencies/plugins
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// 3rd party dependencies
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CsContentType } from '@project-sunbird/client-services/services/content';
// app dependencies like directive, sdk, services etc
import { SunbirdSdk } from 'sunbird-sdk';
import { DirectivesModule } from '../directives/directives.module';
import {
  ActivePageService, AndroidPermissionsService, AppGlobalService,
  AppHeaderService,
  AppRatingService,
  CanvasPlayerService,
  CollectionService, ComingSoonMessageService, CommonUtilService,
  ContainerService,
  ContentAggregatorHandler, CourseUtilService,
  FormAndFrameworkUtilService,
  GroupHandlerService, LoginHandlerService, LogoutHandlerService,
  NotificationService, QRScannerResultHandler,
  SplashScreenService, SunbirdQRScanner, TelemetryGeneratorService,
  UtilityService
} from '../services/index';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { PageFilterOptionsPageModule } from './page-filter/page-filter-options/page-filter-options.module';
import { PageFilterOptionsPage } from './page-filter/page-filter-options/page-filter-options.page';
import { PageFilterPageModule } from './page-filter/page-filter.module';
import { PageFilterPage } from './page-filter/page-filter.page';
import { TermsAndConditionsPageModule } from './terms-and-conditions/terms-and-conditions.module';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import {
  SplashcreenTelemetryActionHandlerDelegate
} from '@app/services/sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplashscreenImportActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { LocalCourseService } from '@app/services/local-course.service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { TextbookTocService } from '@app/app/collection-detail-etb/textbook-toc-service';
import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx';
import { NavigationService } from '@app/services/navigation-handler.service';
import {AliasBoardName} from '../pipes/alias-board-name/alias-board-name';
import { DownloadPdfService } from '@app/services/download-pdf/download-pdf.service';
import {ConsentService} from '@app/services/consent-service';
import { ProfileHandler } from '@app/services/profile-handler';
import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import {configuration} from '@app/configuration/configuration';
import { LocationHandler } from '@app/services/location-handler';
import { CoreModule } from './manage-learn/core/core.module';
import { DiscussionTelemetryService } from '@app/services/discussion/discussion-telemetry.service';
import { UserTypeSelectionPageModule } from './user-type-selection/user-type-selection.module';

// AoT requires an exported function for factories
export function translateHttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export const authService = () => {
  return SunbirdSdk.instance.authService;
};
export const pageAssembleService = () => {
  return SunbirdSdk.instance.pageAssembleService;
};
export const dbService = () => {
  return SunbirdSdk.instance.dbService;
};
export const courseService = () => {
  return SunbirdSdk.instance.courseService;
};
export const sharedPreferences = () => {
  return SunbirdSdk.instance.sharedPreferences;
};
export const apiService = () => {
  return SunbirdSdk.instance.apiService;
};
export const profileService = () => {
  return SunbirdSdk.instance.profileService;
};
export const deviceRegisterService = () => {
  return SunbirdSdk.instance.deviceRegisterService;
};
export const groupService = () => {
  return SunbirdSdk.instance.groupService;
};
export const frameworkService = () => {
  return SunbirdSdk.instance.frameworkService;
};
export const frameworkUtilService = () => {
  return SunbirdSdk.instance.frameworkUtilService;
};
export const systemSettingsService = () => {
  return SunbirdSdk.instance.systemSettingsService;
};
export const telemetryService = () => {
  return SunbirdSdk.instance.telemetryService;
};
export const contentService = () => {
  return SunbirdSdk.instance.contentService;
};
export const contentFeedbackService = () => {
  return SunbirdSdk.instance.contentFeedbackService;
};
export const eventsBusService = () => {
  return SunbirdSdk.instance.eventsBusService;
};
export const deviceInfo = () => {
  return SunbirdSdk.instance.deviceInfo;
};
export const playerService = () => {
  return SunbirdSdk.instance.playerService;
};
export const formService = () => {
  return SunbirdSdk.instance.formService;
};
export const downloadService = () => {
  return SunbirdSdk.instance.downloadService;
};

export function storageService() {
  return SunbirdSdk.instance.storageService;
}
export function notificationService() {
  return SunbirdSdk.instance.notificationService;
}
export function errorLoggerService() {
  return SunbirdSdk.instance.errorLoggerService;
}
export function searchHistoryService() {
  return SunbirdSdk.instance.searchHistoryService;
}
export function networkInfoService() {
  return SunbirdSdk.instance.networkInfoService;
}
export function codePushExperimentService() {
  return SunbirdSdk.instance.codePushExperimentService;
}
export function faqService() {
  return SunbirdSdk.instance.faqService;
}
export function archiveService() {
  return SunbirdSdk.instance.archiveService;
}
export const discussionService = () => {
  return SunbirdSdk.instance.discussionService;
};
export function sdkDriverFactory(): any {
  return [{
    provide: 'SDK_CONFIG',
    useFactory: authService
  }, {
    provide: 'AUTH_SERVICE',
    useFactory: authService
  }, {
    provide: 'DB_SERVICE',
    useFactory: dbService
  }, {
    provide: 'COURSE_SERVICE',
    useFactory: courseService
  }, {
    provide: 'SHARED_PREFERENCES',
    useFactory: sharedPreferences
  }, {
    provide: 'API_SERVICE',
    useFactory: apiService
  }, {
    provide: 'PAGE_ASSEMBLE_SERVICE',
    useFactory: pageAssembleService
  }, {
    provide: 'GROUP_SERVICE',
    useFactory: groupService
  }, {
    provide: 'PROFILE_SERVICE',
    useFactory: profileService
  }, {
    provide: 'DEVICE_REGISTER_SERVICE',
    useFactory: deviceRegisterService
  }, {
    provide: 'DB_SERVICE',
    useFactory: dbService
  }, {
    provide: 'FRAMEWORK_SERVICE',
    useFactory: frameworkService
  }, {
    provide: 'FRAMEWORK_UTIL_SERVICE',
    useFactory: frameworkUtilService
  }, {
    provide: 'PAGE_ASSEMBLE_SERVICE',
    useFactory: pageAssembleService
  }, {
    provide: 'FORM_SERVICE',
    useFactory: formService
  }, {
    provide: 'SYSTEM_SETTINGS_SERVICE',
    useFactory: systemSettingsService
  }, {
    provide: 'TELEMETRY_SERVICE',
    useFactory: telemetryService
  }, {
    provide: 'CONTENT_SERVICE',
    useFactory: contentService
  }, {
    provide: 'CONTENT_FEEDBACK_SERVICE',
    useFactory: contentFeedbackService
  }, {
    provide: 'EVENTS_BUS_SERVICE',
    useFactory: eventsBusService
  }, {
    provide: 'DEVICE_INFO',
    useFactory: deviceInfo
  }, {
    provide: 'PLAYER_SERVICE',
    useFactory: playerService
  }, {
    provide: 'DOWNLOAD_SERVICE',
    useFactory: downloadService
  }, {
    provide: 'STORAGE_SERVICE',
    useFactory: storageService
  }, {
    provide: 'NOTIFICATION_SERVICE',
    useFactory: notificationService
  }, {
    provide: 'ERROR_LOGGER_SERVICE',
    useFactory: errorLoggerService
  }, {
    provide: 'SEARCH_HISTORY_SERVICE',
    useFactory: searchHistoryService
  }, {
    provide: 'CODEPUSH_EXPERIMENT_SERVICE',
    useFactory: codePushExperimentService
  }, {
    provide: 'NETWORK_INFO_SERVICE',
    useFactory: networkInfoService
  }, {
    provide: 'FAQ_SERVICE',
    useFactory: faqService
  }, {
    provide: 'ARCHIVE_SERVICE',
    useFactory: archiveService
  },
  {
    provide: 'DISCUSSION_SERVICE',
    useFactory: discussionService
  }
  ];
}

export const sunbirdSdkServicesProvidersFactory: () => Provider[] = sdkDriverFactory;

export const sunbirdSdkFactory =
  () => {
    return async () => {
      const buildConfigValues = JSON.parse(await new Promise<string>((resolve, reject) => {
        document.addEventListener('deviceready', () => {
          sbutility.getBuildConfigValues('org.sunbird.app', (v) => {
            resolve(v);
          }, (err) => {
            reject(err);
          });
        }, false);

      }));

      await SunbirdSdk.instance.init({
        platform: 'cordova',
        fileConfig: {
        },
        apiConfig: {
          debugMode: configuration.debug,
          host: buildConfigValues['BASE_URL'],
          user_authentication: {
            redirectUrl: buildConfigValues['OAUTH_REDIRECT_URL'],
            authUrl: '/auth/realms/sunbird/protocol/openid-connect',
            mergeUserHost: buildConfigValues['MERGE_ACCOUNT_BASE_URL'],
            autoMergeApiPath: '/migrate/user/account'
          },
          api_authentication: {
            mobileAppKey: buildConfigValues['MOBILE_APP_KEY'],
            mobileAppSecret: buildConfigValues['MOBILE_APP_SECRET'],
            mobileAppConsumer: buildConfigValues['MOBILE_APP_CONSUMER'],
            channelId: buildConfigValues['CHANNEL_ID'],
            producerId: buildConfigValues['PRODUCER_ID'],
            producerUniqueId: 'sunbird.app'
          },
          cached_requests: {
            timeToLive: 2 * 60 * 60 * 1000
          }
        },
        eventsBusConfig: {
          debugMode: true
        },
        dbConfig: {
          dbName: 'GenieServices.db'
        },
        deviceRegisterConfig: {
          apiPath: '/api/v3/device'
        },
        contentServiceConfig: {
          apiPath: '/api/content/v1',
          searchApiPath: '/api/content/v1',
          contentHeirarchyAPIPath: '/api/course/v1'
        },
        courseServiceConfig: {
          apiPath: '/api/course/v1'
        },
        formServiceConfig: {
          apiPath: '/api/data/v1/form',
          formConfigDirPath: '/data/form',
        },
        frameworkServiceConfig: {
          channelApiPath: '/api/channel/v1',
          frameworkApiPath: '/api/framework/v1',
          frameworkConfigDirPath: '/data/framework',
          channelConfigDirPath: '/data/channel',
          searchOrganizationApiPath: '/api/org/v1',
          systemSettingsDefaultChannelIdKey: 'custodianOrgId'
        },
        profileServiceConfig: {
          profileApiPath: '/api/user/v1',
          profileApiPath_V2: '/api/user/v2',
          profileApiPath_V3: '/api/user/v3',
          profileApiPath_V4: '/api/user/v4',
          tenantApiPath: '/v1/tenant',
          otpApiPath: '/api/otp/v1',
          searchLocationApiPath: '/api/data/v1',
          locationDirPath: '/data/location'
        },
        pageServiceConfig: {
          apiPath: '/api/data/v1',
        },
        appConfig: {
          maxCompatibilityLevel: 4,
          minCompatibilityLevel: 1
        },
        systemSettingsConfig: {
          systemSettingsApiPath: '/api/data/v1',
          systemSettingsDirPath: '/data/system',
        },
        telemetryConfig: {
          apiPath: '/api/data/v1',
          telemetrySyncBandwidth: 200,
          telemetrySyncThreshold: 200,
          telemetryLogMinAllowedOffset: 86400000
        },
        sharedPreferencesConfig: {
        },
        playerConfig: {
          showEndPage: false,
          endPage: [{
            template: 'assessment',
            contentType: [CsContentType.SELF_ASSESS]
          }],
          splash: {
            webLink: '',
            text: '',
            icon: '',
            bgImage: 'assets/icons/splacebackground_1.png'
          },
          overlay: {
            enableUserSwitcher: false,
            showUser: false
          },
          plugins: [
            {
              id: 'org.sunbird.player.endpage',
              ver: '1.1',
              type: 'plugin'
            }
          ]
        },
        errorLoggerConfig: {
          errorLoggerApiPath: '/api/data/v1/client/logs'
        },
        faqServiceConfig: {
          faqConfigDirPath: '/data/faq'
        }
      });

      window['sunbird'] = SunbirdSdk.instance;
    };
  };


declare const sbutility;
@NgModule({
  declarations: [AppComponent],
  entryComponents: [PageFilterPage, PageFilterOptionsPage],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (translateHttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      // autoFocusAssist: false
    }),
    DirectivesModule,

    // custom modules=
    UserTypeSelectionPageModule,
    PageFilterPageModule,
    PageFilterOptionsPageModule,
    TermsAndConditionsPageModule,
    IonicStorageModule.forRoot(),
    CoreModule
  ],
  providers: [
    StatusBar,
    AppVersion,
    LocalNotifications,
    SocialSharing,
    WebView,
    File,
    FileTransferObject,
    FileOpener,
    FileTransfer,
    AppGlobalService,
    CourseUtilService,
    TelemetryGeneratorService,
    QRScannerResultHandler,
    SunbirdQRScanner,
    CommonUtilService,
    LogoutHandlerService,
    LoginHandlerService,
    TncUpdateHandlerService,
    ContainerService,
    UtilityService,
    LocalCourseService,
    AppHeaderService,
    AppRatingService,
    FormAndFrameworkUtilService,
    DownloadPdfService,
    CollectionService,
    Device,
    Network,
    AndroidPermissionsService,
    ComingSoonMessageService,
    NotificationService,
    ActivePageService,
    CanvasPlayerService,
    SplashcreenTelemetryActionHandlerDelegate,
    SplashscreenImportActionHandlerDelegate,
    SplaschreenDeeplinkActionHandlerDelegate,
    SplashScreenService,
    ExternalIdVerificationService,
    TextbookTocService,
    GroupHandlerService,
    NativePageTransitions,
    NavigationService,
    ContentAggregatorHandler,
    AliasBoardName,
    ConsentService,
    ProfileHandler,
    LocationHandler,
    DiscussionTelemetryService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...sunbirdSdkServicesProvidersFactory(),
    { provide: ErrorHandler, useClass: CrashAnalyticsErrorLogger },
    { provide: APP_INITIALIZER, useFactory: sunbirdSdkFactory, deps: [], multi: true },
    Camera,
    FilePath,
    Chooser,
    PhotoViewer,
    StreamingMedia,
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
  constructor(
    private translate: TranslateService) {
    this.setDefaultLanguage();
  }

  private setDefaultLanguage() {
    this.translate.setDefaultLang('en');
  }
}
