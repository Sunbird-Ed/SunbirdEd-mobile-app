import { Component, EventEmitter, Inject, Input, NgZone, Output, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
// migration-TODO
// import { initTabs, LOGIN_TEACHER_TABS } from '../../app/module.service';
import { ProfileConstants, PreferenceKey } from '../../app.constant';
import { FormAndFrameworkUtilService, TelemetryGeneratorService, CommonUtilService} from '../../../services';
import {
  ApiService,
  AuthService,
  OAuthSession,
  OAuthSessionProvider,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SdkConfig,
  SignInError,
  ServerProfileDetailsRequest,
  SharedPreferences
} from 'sunbird-sdk';
import {
  Environment,
  InteractSubtype,
  InteractType,
  PageId
} from '../../../services/telemetry-constants';
import { ContainerService } from '../../../services/container.services';

@Component({
  selector: 'app-sign-in-card',
  templateUrl: './sign-in-card.component.html',
  styleUrls: ['./sign-in-card.component.scss'],
})
export class SignInCardComponent implements OnInit {

  private readonly DEFAULT_TEXT = [
    'OVERLAY_LABEL_COMMON',
    'OVERLAY_INFO_TEXT_COMMON'
  ];

  private translateDisplayText;

  appName = '';
  @Input() source = '';
  @Input() title = '';
  @Input() description = '';
  @Output() valueChange = new EventEmitter();

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('API_SERVICE') private apiService: ApiService,
    @Inject('SDK_CONFIG') private sdkConfig: SdkConfig,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public translate: TranslateService,
    public navCtrl: NavController,
    private container: ContainerService,
    private ngZone: NgZone,
    private appVersion: AppVersion,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {

    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
        this.initText();
      });
  }

  ngOnInit() {

  }

  initText() {
    this.translate.get(this.DEFAULT_TEXT, { '%s': this.appName }).subscribe((value) => {
      this.translateDisplayText = value;
      if (this.title.length === 0) {
        this.title = 'OVERLAY_LABEL_COMMON';
      }

      if (this.description.length === 0) {
        this.description = 'OVERLAY_INFO_TEXT_COMMON';
      }
    });
  }

  async signIn() {

    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.valueChange.emit(true);
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SIGNIN_OVERLAY_CLICKED,
        Environment.HOME,
        this.source, null,
        undefined,
        undefined
      );

      this.generateLoginInteractTelemetry(InteractType.TOUCH, InteractSubtype.LOGIN_INITIATE, '');

      const that = this;
      const loader = await this.commonUtilService.getLoader();
      this.authService.setSession(new OAuthSessionProvider(this.sdkConfig.apiConfig, this.apiService))
        .toPromise()
        .then(async () => {
          await loader.present();
          // migration-TODO
          // initTabs(that.container, LOGIN_TEACHER_TABS);
          return that.refreshProfileData();
        })
        .then(value => {
          return that.refreshTenantData(value.slug, value.title);
        })
        .then(async () => {
          await loader.dismiss();
          that.ngZone.run(() => {
            that.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
            window.location.reload();
            // TabsPage.prototype.ionVieit wWillEnter();
          });
        })
        .catch(async (err) => {
          if (err instanceof SignInError) {
            this.commonUtilService.showToast(err.message);
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
      this.profileService.getTenantInfo().toPromise()
        .then((res) => {
          this.preferences.putString(PreferenceKey.APP_LOGO, res.logo).toPromise().then();
          this.preferences.putString(PreferenceKey.APP_NAME, title).toPromise().then();
          (window as any).splashscreen.setContent(title, res.logo);
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
      valuesMap,
      undefined,
      undefined);
  }
}
