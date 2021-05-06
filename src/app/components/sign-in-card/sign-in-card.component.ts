import { Component, EventEmitter, Inject, Input, NgZone, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EventTopics, IgnoreTelemetryPatters, PreferenceKey, ProfileConstants } from '@app/app/app.constant';
import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { AppGlobalService } from '@app/services';
import { CommonUtilService } from '@app/services/common-util.service';
import { ContainerService } from '@app/services/container.services';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { NavController } from '@ionic/angular';
import { Events } from '@app/util/events';
import {
  AuthService,
  OAuthSession,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  ServerProfileDetailsRequest,
  SharedPreferences, SignInError,
  TenantInfoRequest,
  WebviewLoginSessionProvider,
  WebviewSessionProviderConfig
} from 'sunbird-sdk';
import { Context as SbProgressLoaderContext, SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { EventParams } from './event-params.interface';

@Component({
  selector: 'app-sign-in-card',
  templateUrl: './sign-in-card.component.html',
  styleUrls: ['./sign-in-card.component.scss'],
})
export class SignInCardComponent {

  @Input() source = '';
  @Input() title = 'OVERLAY_LABEL_COMMON';
  @Input() description = 'OVERLAY_INFO_TEXT_COMMON';
  @Input() fromEnrol: boolean;
  @Output() valueChange = new EventEmitter();
  appName = '';

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public navCtrl: NavController,
    private container: ContainerService,
    private ngZone: NgZone,
    private appVersion: AppVersion,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private router: Router,
    private sbProgressLoader: SbProgressLoader
  ) {

    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  async signIn(skipNavigation?) {
    this.appGlobalService.resetSavedQuizContent();
    // clean the preferences to avoid unnecessary enrolment
    if (!this.fromEnrol) {
      this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
      this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, '').toPromise();
    }

    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.valueChange.emit(true);
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SIGNIN_OVERLAY_CLICKED,
        Environment.HOME,
        this.source, null
      );

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
        this.sbProgressLoader.hide({ id: 'login' });
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

          initTabs(that.container, LOGIN_TEACHER_TABS);
          return that.refreshProfileData();
        })
        .then(value => {
          return that.refreshTenantData(value.slug, value.title);
        })
        .then(async () => {
          if (!this.appGlobalService.signinOnboardingLoader) { }
          that.ngZone.run(() => {
            setTimeout(() => {
              if (that.source === 'courses') {
                that.router.navigateByUrl('tabs/courses');
              } else if (that.source === 'profile') {
                that.router.navigateByUrl('tabs/profile');
              }
              that.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
              // note: Navigating back to Resources is though the below event from App-Components.
              this.events.publish(EventTopics.SIGN_IN_RELOAD, skipNavigation);
            }, 2000);
          });
        })
        .catch(async (err) => {
          this.sbProgressLoader.hide({ id: 'login' });
          if (err instanceof SignInError) {
            this.commonUtilService.showToast(err.message);
          } else {
            this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
          }
        });
    }
  }

  private refreshProfileData() {
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
              .then(async (success: any) => {
                const currentProfileType = (() => {
                  if (
                    (success.userType === ProfileType.OTHER.toUpperCase()) ||
                    (!success.userType)
                  ) {
                    return ProfileType.NONE;
                  }

                  return success.userType.toLowerCase();
                })();
                that.generateLoginInteractTelemetry(InteractType.OTHER, InteractSubtype.LOGIN_SUCCESS, success.id);
                const profile: Profile = {
                  uid: success.id,
                  handle: success.id,
                  profileType: currentProfileType,
                  source: ProfileSource.SERVER,
                  serverProfile: success
                };
                this.profileService.createProfile(profile, ProfileSource.SERVER).toPromise()
                  .then(async () => {
                    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, currentProfileType).toPromise();
                    that.profileService.setActiveSessionForProfile(profile.uid).toPromise()
                      .then(() => {
                        /* Medatory for login flow
                         * eventParams are essential parameters for avoiding duplicate calls to API
                         * skipSession & skipProfile should be false here
                         * until further change
                         */
                        const eventParams: EventParams = {
                          skipSession: false,
                          skipProfile: false
                        };
                        that.formAndFrameworkUtilService.updateLoggedInUser(success, profile, eventParams)
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
                  }).catch((err) => {
                    console.log('err in createProfile --', err);
                  });
              }).catch((err) => {
                console.log('err in getServerProfilesDetails --', err);
                reject(err);
              });
          } else {
            reject('session is null');
          }
        });
    });
  }

  private refreshTenantData(tenantSlug: string, title: string) {
    const tenantInfoRequest: TenantInfoRequest = { slug: tenantSlug };
    return new Promise((resolve, reject) => {
      this.profileService.getTenantInfo(tenantInfoRequest).toPromise()
        .then(async (res) => {
          const isDefaultChannelProfile = await this.profileService.isDefaultChannelProfile().toPromise();
          if (isDefaultChannelProfile) {
            title = await this.appVersion.getAppName();
          }
          this.preferences.putString(PreferenceKey.APP_LOGO, res.logo).toPromise().then();
          this.preferences.putString(PreferenceKey.APP_NAME, title).toPromise().then();
          (window as any).splashscreen.setContent(title, res.appLogo);
          resolve();
        }).catch((err) => {
          console.log('err in getTenantInfo --', err);
          resolve(); // ignore
        });
    });
  }

  private generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
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
