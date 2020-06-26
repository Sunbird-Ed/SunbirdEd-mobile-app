import { Inject, NgZone, Injectable } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
  ApiService,
  AuthService,
  OAuthSession,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SdkConfig,
  SignInError,
  ServerProfileDetailsRequest,
  SharedPreferences,
  WebviewLoginSessionProvider,
  WebviewSessionProviderConfig
} from 'sunbird-sdk';

import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import {ProfileConstants, PreferenceKey, RouterLinks, EventTopics, IgnoreTelemetryPatters} from '@app/app/app.constant';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { ContainerService } from '@app/services/container.services';
import { Router } from '@angular/router';
import { AppGlobalService } from './app-global-service.service';
import {Context as SbProgressLoaderContext, SbProgressLoader} from '@app/services/sb-progress-loader.service';

@Injectable()
export class LoginHandlerService {

//   appName = '';
//   @Input() source = '';
//   @Input() title = 'OVERLAY_LABEL_COMMON';
//   @Input() description = 'OVERLAY_INFO_TEXT_COMMON';
//   @Output() valueChange = new EventEmitter();

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('API_SERVICE') private apiService: ApiService,
    @Inject('SDK_CONFIG') private sdkConfig: SdkConfig,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public navCtrl: NavController,
    private container: ContainerService,
    private ngZone: NgZone,
    private appVersion: AppVersion,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private sbProgressLoader: SbProgressLoader
  ) {

    this.appVersion.getAppName()
      .then((appName: any) => {
        // this.appName = appName;
      });
  }

  async signIn(skipNavigation?) {

    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
    //   this.valueChange.emit(true);
    } else {
    //   this.telemetryGeneratorService.generateInteractTelemetry(
    //     InteractType.TOUCH,
    //     InteractSubtype.SIGNIN_OVERLAY_CLICKED,
    //     Environment.HOME,
    //     this.source, null
    //   );

      this.generateLoginInteractTelemetry(InteractType.TOUCH, InteractSubtype.LOGIN_INITIATE, '');

      const that = this;
      const webviewSessionProviderConfigloader = await this.commonUtilService.getLoader();

      let webviewLoginSessionProviderConfig: WebviewSessionProviderConfig;
      let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;

      await webviewSessionProviderConfigloader.present();
      try {
        webviewLoginSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('login');
        webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
        await webviewSessionProviderConfigloader.dismiss();
      } catch (e) {
        this.sbProgressLoader.hide({id: 'login'});
        await webviewSessionProviderConfigloader.dismiss();
        this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
        return;
      }

      this.authService.setSession(
          new WebviewLoginSessionProvider(
              webviewLoginSessionProviderConfig,
              webviewMigrateSessionProviderConfig
          )
      )
        .toPromise()
        .then(async () => {
          await this.sbProgressLoader.show(this.generateIgnoreTelemetryContext());
          // set default guest user for Quiz deeplink
          const isOnboardingCompleted = (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true');
          if (!isOnboardingCompleted) {
            await this.setDefaultProfileDetails();

            // To avoid race condition
            if (this.appGlobalService.limitedShareQuizContent) {
              this.appGlobalService.skipCoachScreenForDeeplink = true;
            }
          }

          this.appGlobalService.preSignInData = (skipNavigation && skipNavigation.componentData) || null;
          initTabs(that.container, LOGIN_TEACHER_TABS);
          return that.refreshProfileData();
        })
        .then(value => {
          return that.refreshTenantData(value.slug, value.title);
        })
        .then(async () => {
          that.ngZone.run(() => {
            that.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
            this.events.publish(EventTopics.SIGN_IN_RELOAD, skipNavigation);
          });
        })
        .catch(async (err) => {
          console.error(err);
          this.sbProgressLoader.hide({id: 'login'});
          if (err instanceof SignInError) {
            this.commonUtilService.showToast(err.message);
          } else {
            this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
          }
        });
    }
  }

  refreshProfileData() {
    const that = this;

    return new Promise<any>((resolve, reject) => {
      that.authService.getSession().toPromise()
        .then((session: OAuthSession) => {
          if (session) {
            const req: ServerProfileDetailsRequest = {
              userId: session.userToken,
              requiredFields: ProfileConstants.REQUIRED_FIELDS
            };
            that.profileService.getServerProfilesDetails(req).toPromise()
              .then((success) => {
                that.generateLoginInteractTelemetry(InteractType.OTHER, InteractSubtype.LOGIN_SUCCESS, success.id);
                const profile: Profile = {
                  uid: success.id,
                  handle: success.id,
                  profileType: ProfileType.TEACHER,
                  source: ProfileSource.SERVER,
                  serverProfile: success
                };
                this.profileService.createProfile(profile, ProfileSource.SERVER)
                  .toPromise()
                  .then(() => {
                    that.profileService.setActiveSessionForProfile(profile.uid).toPromise()
                      .then(() => {
                        that.formAndFrameworkUtilService.updateLoggedInUser(success, profile)
                          .then(() => {
                            resolve({ slug: success.rootOrg.slug, title: success.rootOrg.orgName });
                          }).catch(() => {
                            resolve({ slug: success.rootOrg.slug, title: success.rootOrg.orgName });
                          }).catch((err) => {
                            reject(err);
                          });
                      }).catch((err) => {
                        console.log('err in setActiveSessionProfile in sign-in card --', err);
                      });
                  }).catch(() => {

                  });
              }).catch((err) => {
                reject(err);
              });
          } else {
            reject('session is null');
          }
        });
    });
  }

  refreshTenantData(slug: string, title: string) {
    return new Promise((resolve, reject) => {
      this.profileService.getTenantInfo({ slug: '' }).toPromise()
        .then(async (res) => {
          const isDefaultChannelProfile = await this.profileService.isDefaultChannelProfile().toPromise();
          if (isDefaultChannelProfile) {
            title = await this.appVersion.getAppName();
          }
          this.preferences.putString(PreferenceKey.APP_LOGO, res.logo).toPromise().then();
          this.preferences.putString(PreferenceKey.APP_NAME, title).toPromise().then();
          (window as any).splashscreen.setContent(title, res.appLogo);
          resolve();
        }).catch(() => {
          resolve(); // ignore
        });
    });
  }

  generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
    const valuesMap = new Map();
    valuesMap['UID'] = uid;
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType,
      interactSubtype,
      Environment.HOME,
      PageId.LOGIN,
      undefined,
      valuesMap);
  }

  setDefaultProfileDetails(): Promise<string | void> {
    const profileRequest = this.getDefaultProfileRequest();
    return this.profileService.updateProfile(profileRequest).toPromise().then(() => {
      return this.profileService.setActiveSessionForProfile(profileRequest.uid).toPromise().then(() => {
        return this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
          .then((success: any) => {
            const userId = success.uid;
            this.events.publish(AppGlobalService.USER_INFO_UPDATED);
            if (userId !== 'null') {
              this.preferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, userId).toPromise().then();
            }
          }).catch(() => {
            return 'null';
          });
      });
    });
  }

  getDefaultProfileRequest() {
    const profile = this.appGlobalService.getCurrentUser();
    const profileRequest: Profile = {
      uid: profile.uid,
      handle: profile.handle || 'Guest1',
      medium: profile.medium || [],
      board: profile.board || [],
      subject: profile.subject || [],
      profileType: profile.profileType || ProfileType.TEACHER,
      grade: profile.grade || [],
      syllabus: profile.syllabus || [],
      source: profile.source || ProfileSource.LOCAL
    };
    return profileRequest;
  }

  private generateIgnoreTelemetryContext(): SbProgressLoaderContext {
    return {
      id: 'login',
      ignoreTelemetry: {
        when: {
          interact: IgnoreTelemetryPatters.IGNORE_SIGN_IN_PAGE_ID_EVENTS,
          impression: IgnoreTelemetryPatters.IGNORE_CHANNEL_IMPRESSION_EVENTS
        }
      }
    };
  }
}
