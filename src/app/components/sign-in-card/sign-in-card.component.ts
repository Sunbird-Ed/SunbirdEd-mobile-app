import { Component, EventEmitter, Inject, Input, NgZone, Output, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
  AuthService,
  OAuthSession,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SignInError,
  ServerProfileDetailsRequest,
  SharedPreferences,
  GroupService,
  TenantInfoRequest,
  WebviewLoginSessionProvider,
  WebviewSessionProviderConfig
} from 'sunbird-sdk';

import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { ProfileConstants, PreferenceKey, EventTopics } from '@app/app/app.constant';
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
import { AppGlobalService } from '@app/services';

@Component({
  selector: 'app-sign-in-card',
  templateUrl: './sign-in-card.component.html',
  styleUrls: ['./sign-in-card.component.scss'],
})
export class SignInCardComponent implements OnInit {

  @Input() source = '';
  @Input() title = 'OVERLAY_LABEL_COMMON';
  @Input() description = 'OVERLAY_INFO_TEXT_COMMON';
  @Input() fromEnrol: boolean;
  @Output() valueChange = new EventEmitter();
  appName = '';

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE') private groupService: GroupService,
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
    private appGlobalService: AppGlobalService
  ) {

    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  ngOnInit() {

  }

  async signIn() {
    this.appGlobalService.resetSavedQuizContent();
    // clean the prefernces to avoid unnecessary enrolment
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
      const loader = await this.commonUtilService.getLoader();
      const webviewSessionProviderConfigloader = await this.commonUtilService.getLoader();

      let webviewLoginSessionProviderConfig: WebviewSessionProviderConfig;
      let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;

      await webviewSessionProviderConfigloader.present();
      try {
        webviewLoginSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('login');
        webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
        await webviewSessionProviderConfigloader.dismiss();
      } catch (e) {
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
          await loader.present();
          initTabs(that.container, LOGIN_TEACHER_TABS);
          return that.refreshProfileData();
        })
        .then(value => {
          return that.refreshTenantData(value.slug, value.title);
        })
        .then(async () => {
          await loader.dismiss();
          if (!this.appGlobalService.signinOnboardingLoader) {
            this.appGlobalService.signinOnboardingLoader = await this.commonUtilService.getLoader();
            await this.appGlobalService.signinOnboardingLoader.present();
          }
          that.ngZone.run(() => {
            that.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();

            // note: Navigating back to Resourses is though the below event from App-Components.
            this.events.publish(EventTopics.SIGN_IN_RELOAD);
          });
        })
        .catch(async (err) => {
          console.error(err);

          if (err instanceof SignInError) {
            this.commonUtilService.showToast(err.message);
          } else {
            this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
          }

          return await loader.dismiss();
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
                    that.groupService.removeActiveGroupSession()
                    .subscribe(() => {
                    },
                      () => {
                      });
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

  refreshTenantData(tenantSlug: string, title: string) {
    const tenantInfoRequest: TenantInfoRequest = {slug: tenantSlug};
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

}
