import {Component, Inject, OnInit} from '@angular/core';
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
  ServerProfileDetailsRequest,
  SharedPreferences
} from 'sunbird-sdk';
import { Events, LoadingController, Platform } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { ContainerService } from '@app/services/container.services';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ImpressionType, PageId, Environment, InteractType, InteractSubtype } from '@app/services/telemetry-constants';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks, PreferenceKey, ProfileConstants } from '../app.constant';
import { initTabs, LOGIN_TEACHER_TABS, GUEST_STUDENT_TABS, GUEST_TEACHER_TABS } from '../module.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {

  slides: any[];
  appDir: string;
  appName = '';
  orgName: string;
  headerObservable: any;
  backButtonFunc: any = undefined;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('API_SERVICE') private apiService: ApiService,
    @Inject('SDK_CONFIG') private sdkConfig: SdkConfig,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private container: ContainerService,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private headerService: AppHeaderService,
    private appVersion: AppVersion,
    private router: Router,
  ) {

    this.slides = [
      {
        'title': 'ONBOARD_SLIDE_TITLE_2',
        'imageUri': 'assets/imgs/ic_onboard_2.png',
        'desc': 'ONBOARD_SLIDE_DESC_2'
      },
      {
        'title': 'ONBOARD_SLIDE_TITLE_1',
        'imageUri': 'assets/imgs/ic_onboard_1.png',
        'desc': 'ONBOARD_SLIDE_DESC_1'
      }
      /*{
        'title': 'ONBOARD_SLIDE_TITLE_3',
        'imageUri': 'assets/imgs/ic_onboard_3.png',
        'desc': 'ONBOARD_SLIDE_DESC_3'
      }*/
    ];
  }

  ngOnInit() {

    this.appVersion.getAppName().then((appName: any) => {
      this.appName = appName;
    });

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.ONBOARDING,
      Environment.HOME);
  }

  ionViewWillEnter() {
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ONBOARDING, Environment.HOME, false);
      this.router.navigate([`/${RouterLinks.MENU_LANGUAGE_SETTING}`, 'false']);
      this.backButtonFunc.unsubscribe();
    })

    this.appDir = this.commonUtilService.getAppDirection();
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if(this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async signIn() {
    const that = this;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.generateLoginInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.LOGIN_INITIATE, '');
    this.authService.setSession(new OAuthSessionProvider(this.sdkConfig.apiConfig, this.apiService))
      .toPromise()
      .then(() => {
        // initTabs(that.container, LOGIN_TEACHER_TABS);
        return that.refreshProfileData();
      })
      .then(() => {
        this.events.publish(AppGlobalService.USER_INFO_UPDATED);
        return that.refreshTenantData();
      })
      .then(async () => {
        await loader.dismiss();
        this.router.navigate([`/${RouterLinks.TABS}`]);
      })
      .catch(async error => {
        await loader.dismiss();
        if (error) {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_WHILE_LOGIN'));
        }
        console.log(error);
      });
  }

  refreshTenantData() {
    const that = this;
    return new Promise((resolve, reject) => {
      this.profileService.getTenantInfo().toPromise()
      .then((res) => {
          this.preferences.putString(PreferenceKey.APP_LOGO, res.logo).toPromise().then();
          this.preferences.putString(PreferenceKey.APP_NAME, that.orgName).toPromise().then();
          (<any>window).splashscreen.setContent(that.orgName, res.logo);
          resolve();
        }).catch(() => {
        resolve(); // ignore
      });
    });
  }

  refreshProfileData() {
    const that = this;
    return new Promise<string>((resolve, reject) => {
      that.authService.getSession().toPromise().then((session: OAuthSession) => {
        if (session === undefined || session == null) {
          reject('session is null');
        } else {
          const req: ServerProfileDetailsRequest = {
            userId: session.userToken,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
          };
          that.profileService.getServerProfilesDetails(req).toPromise()
            .then((success) => {
              setTimeout(() => {
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('WELCOME_BACK', success.firstName));
              }, 800);
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
                      this.formAndFrameworkUtilService.updateLoggedInUser(success, profile)
                        .then((value) => {
                          that.orgName = success.rootOrg.orgName;
                          if (value['status']) {
                            initTabs(that.container, LOGIN_TEACHER_TABS);
                            resolve(success.rootOrg.slug);
                          } else {
                            const navigationExtrasReports: NavigationExtras = {
                              state: { showOnlyMandatoryFields: true, profile: value['profile'] }
                            };
                            this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], navigationExtrasReports);
                            reject();
                          }
                          // that.orgName = r.rootOrg.orgName;
                          // resolve(r.rootOrg.slug);
                        }).catch(() => {
                        that.orgName = success.rootOrg.orgName;
                        resolve(success.rootOrg.slug);
                      });
                    }).catch((e) => {
                    reject(e);
                  });
                });
            }).catch((e) => {
            reject(e);
          });
        }
      });
    });
  }

  browseAsGuest() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.BROWSE_AS_GUEST_CLICKED,
      Environment.HOME,
      PageId.ONBOARDING);
    this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
      .then(val => {
        if (val === ProfileType.STUDENT) {
          initTabs(this.container, GUEST_STUDENT_TABS);
        } else if (val === ProfileType.TEACHER) {
          initTabs(this.container, GUEST_TEACHER_TABS);
        }
      });
    this.preferences.getString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN).toPromise()
      .then(val => {
        if (val !== '') {
          const profile: Profile = {
            uid: val,
            handle: 'Guest1',
            profileType: ProfileType.TEACHER,
            source: ProfileSource.LOCAL
          };
          this.profileService.setActiveSessionForProfile(profile.uid).toPromise()
            .then(() => {
              this.events.publish(AppGlobalService.USER_INFO_UPDATED);

              if (this.appGlobalService.isProfileSettingsCompleted) {
                const navigationExtrasReports: NavigationExtras = { state: { loginMode: 'guest' } };
                this.router.navigate([`/${RouterLinks.TABS}`], navigationExtrasReports);
              } else {
                this.router.navigate([`/${RouterLinks.USER_TYPE_SELECTION}`]);
              }
            }).catch(err => {
            this.router.navigate([`/${RouterLinks.USER_TYPE_SELECTION}`]);
          });
        } else {
          this.router.navigate([`/${RouterLinks.USER_TYPE_SELECTION}`]);
        }
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
  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back': this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ONBOARDING, Environment.HOME, true);
                   this.router.navigate([`/${RouterLinks.MENU_LANGUAGE_SETTING}`, 'false']);
                   break;
    }
  }

}
