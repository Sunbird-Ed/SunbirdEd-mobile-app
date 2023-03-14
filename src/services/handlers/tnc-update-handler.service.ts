import { Inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { PreferenceKey, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { FieldConfig } from '@app/app/components/common-forms/field-config';
import { FormConstants } from '@app/app/form.constants';
import { TermsAndConditionsPage } from '@app/app/terms-and-conditions/terms-and-conditions.page';
import { ModalController } from '@ionic/angular';
import {
  AuthService,
  CachedItemRequestSourceFrom, Profile, ProfileService,
  ProfileType, ServerProfile, ServerProfileDetailsRequest,
  SharedPreferences
} from 'sunbird-sdk';
import { AppGlobalService } from '../app-global-service.service';
import { CommonUtilService } from '../common-util.service';
import { ConsentService } from '../consent-service';
import { ExternalIdVerificationService } from '../externalid-verification.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import onboarding from '../../assets/configurations/config.json';
import { FrameworkDetailsService } from '../framework-details.service';
import { Events } from '@app/util/events';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { Environment, InteractSubtype, InteractType, PageId } from '../telemetry-constants';
import { SplashScreenService } from '../splash-screen.service';
import { LogoutHandlerService } from './logout-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TncUpdateHandlerService {

  modal: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private modalCtrl: ModalController,
    private router: Router,
    private externalIdVerificationService: ExternalIdVerificationService,
    private appGlobalService: AppGlobalService,
    private consentService: ConsentService,
    private frameworkDetailsService: FrameworkDetailsService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private splashScreenService: SplashScreenService,
    private logoutHandlerService: LogoutHandlerService,

  ) { }

  public async checkForTncUpdate() {
    const sessionData = await this.authService.getSession().toPromise();
    if (!sessionData) {
      return;
    }
    const request: ServerProfileDetailsRequest = {
      userId: sessionData.userToken,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    };
    this.profileService.getServerProfilesDetails(request).toPromise()
      .then(async (profile) => {
        if (this.hasProfileTncUpdated(profile)) {
          this.presentTncPage({ profile, tncService: this });
        } else {
          const userDetails = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
          if (!profile.managedBy && !await this.isSSOUser(userDetails) && !profile.dob) {
              this.router.navigate([RouterLinks.SIGNUP_BASIC]);
          } else {
            this.checkBmc(profile);
          }
        }
      }).catch(e => {
        this.appGlobalService.closeSigninOnboardingLoader();
      });
  }

  async presentTncPage(navParams: any) {
    this.modal = await this.modalCtrl.create({
      component: TermsAndConditionsPage,
      componentProps: navParams
    });
    await this.modal.present();

    let result = await this.modal.onDidDismiss();
    if (result && result.data) {
      let loader = await this.commonUtilService.getLoader();
      try {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.CONTINUE_CLICKED,
          Environment.HOME,
          PageId.TERMS_N_CONDITIONS
        );
        await loader.present();
        let request = result.data.profileDetails.managedBy ?  {
          userId: result.data.profileDetails.userId,
          version: result.data.profileDetails.tncLatestVersion
        } : {
          version: result.data.profileDetails.tncLatestVersion
        };
        const isTCAccepted = await this.profileService.acceptTermsAndConditions(request)
          .toPromise();

        if (isTCAccepted) {
          await this.getProfileDetailsAndUpdateLoggedInUser(result.data, loader);
        } else {
          this.dismissLoader(loader);
          await this.logoutOnSecondBackNavigation();
        }
        await this.dismissTncPage();
      } catch (e) {
        this.dismissLoader(loader);
        await this.logoutOnSecondBackNavigation();
      }
    } else {
      await this.dismissTncPage();
    }
  }

  async getProfileDetailsAndUpdateLoggedInUser(data, loader) {
    const serverProfile = await this.profileService.getServerProfilesDetails({
      userId: data.profileDetails.userId,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    }).toPromise();

    const profile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();
    this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, profile)
      .then(async (value) => {
        this.dismissLoader(loader);
        if (!this.appGlobalService.signinOnboardingLoader) {
          this.appGlobalService.signinOnboardingLoader = await this.commonUtilService.getLoader();
          await this.appGlobalService.signinOnboardingLoader.present();
        }
        const locationMappingConfig: FieldConfig<any>[] =
        await this.formAndFrameworkUtilService.getFormFields(FormConstants.LOCATION_MAPPING);
        data.disableSubmitButton = false;
        const categoriesProfileData = {
          hasFilledLocation: this.commonUtilService.isUserLocationAvalable(profile, locationMappingConfig),
          showOnlyMandatoryFields: true,
          profile: value['profile'],
          isRootPage: true,
          noOfStepsToCourseToc: 1
        };
        let userLocationAvailable = this.commonUtilService.isUserLocationAvalable(profile, locationMappingConfig);
        let isSSoUser = await this.isSSOUser(profile)
        if (!profile.serverProfile.managedBy && !await this.isSSOUser(profile) && !profile.serverProfile.dob) {
          this.router.navigate([RouterLinks.SIGNUP_BASIC]);
        } else if (value['status']) {
          if (userLocationAvailable || isSSoUser) {
            await this.dismissTncPage();
            this.appGlobalService.closeSigninOnboardingLoader();
            categoriesProfileData['status'] = value['status']
            categoriesProfileData['isUserLocationAvalable'] = true;
            await this.handleNavigation(isSSoUser, profile, categoriesProfileData, value);
            this.externalIdVerificationService.showExternalIdVerificationPopup();
            this.splashScreenService.handleSunbirdSplashScreenActions();
          } else {
            if (onboarding.skipOnboardingForLoginUser && profile.profileType !== ProfileType.ADMIN) {
              await this.updateUserAsGuest();
            } else if (profile.profileType === ProfileType.NONE || profile.profileType === ProfileType.OTHER.toUpperCase()) {
                categoriesProfileData['status'] = value['status']
                categoriesProfileData['isUserLocationAvalable'] = false;
                this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                state: { categoriesProfileData }
            });
            } else {
              this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: categoriesProfileData
              });
            }
          }
        } else {
          // closeSigninOnboardingLoader() is called in CategoryEdit page
          await this.dismissTncPage();
          this.handleNavigation(isSSoUser, profile, categoriesProfileData, value);
        }
      }).catch(async e => {
        this.dismissLoader(loader);
      });
  }

  async handleNavigation(isSSoUser, profile, categoriesProfileData, value) {
    if (isSSoUser) {
      await this.consentService.getConsent(profile, true);
    }
    if (profile.profileType === ProfileType.NONE || profile.profileType === ProfileType.OTHER.toUpperCase()) {
      if (onboarding.skipOnboardingForLoginUser) {
        await this.updateUserAsGuest();
      } else {
        this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
          state: {categoriesProfileData}
        });
      }
    } else {
      if (value['status'] && !this.appGlobalService.isJoinTraningOnboardingFlow) {
        this.router.navigate(['/', RouterLinks.TABS]);
      } else {
        this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
          state: categoriesProfileData
        });
      }
    }
  }

  private async logoutOnSecondBackNavigation() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.TERMS_N_CONDITIONS, Environment.HOME, false);
    this.logoutHandlerService.onLogout();
    await this.dismissTncPage();
  }

  private async dismissLoader(loader: any) {
    if (loader) {
      await loader.dismiss();
    }
  }

  private hasProfileTncUpdated(user: ServerProfile): boolean {
    return !!(user.promptTnC && user.tncLatestVersion && user.tncLatestVersionUrl);
  }

  public async dismissTncPage() {
    if (this.modal) {
      await this.modal.dismiss();
    }
  }

  private async checkBmc(profile) {
    const locationMappingConfig: FieldConfig<any>[] = await this.formAndFrameworkUtilService.getFormFields(FormConstants.LOCATION_MAPPING);
    const userDetails = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    if (await this.isSSOUser(userDetails)) {
      await this.consentService.getConsent(userDetails, true);
    }
    if ((userDetails && userDetails.grade && userDetails.medium && userDetails.syllabus &&
      !userDetails.grade.length && !userDetails.medium.length && !userDetails.syllabus.length)
      || ((userDetails.profileType === ProfileType.NONE && userDetails.serverProfile.profileUserType.type === ProfileType.NONE) ||
       (userDetails.profileType === ProfileType.OTHER.toUpperCase() &&
        userDetails.serverProfile.profileUserType.type === ProfileType.OTHER.toUpperCase())
        || userDetails.serverProfile.profileUserType.type === ProfileType.OTHER.toUpperCase())) {
          const guestProfile = await this.commonUtilService.getGuestUserConfig().then((profile) => {
            return profile;
        });
      if ( guestProfile.board && guestProfile.board.length && onboarding.skipOnboardingForLoginUser && userDetails.profileType !== ProfileType.ADMIN) {
        await this.updateUserAsGuest(guestProfile);
      } else {
        this.preRequirementToBmcNavigation(profile.userId, locationMappingConfig);
      }
    } else {
      if (!onboarding.skipOnboardingForLoginUser) {
        this.checkDistrictMapping(profile, locationMappingConfig, userDetails);
      }
    }
  }

  private async preRequirementToBmcNavigation(userId, locationMappingConfig) {
    const serverProfile = await this.profileService.getServerProfilesDetails({
      userId,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    }).toPromise();

    const userprofile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();

    this.navigateToBmc(serverProfile, userprofile, locationMappingConfig);
  }

  private async navigateToBmc(serverProfile, userprofile, locationMappingConfig) {
    this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, userprofile)
      .then((value) => {
        const categoriesProfileData = {
          hasFilledLocation: this.commonUtilService.isUserLocationAvalable(userprofile, locationMappingConfig),
          showOnlyMandatoryFields: true,
          profile: value['profile'],
          isRootPage: true,
          noOfStepsToCourseToc: 1
        };
        if (userprofile && userprofile.grade && userprofile.medium && userprofile.syllabus &&
          !userprofile.grade.length && !userprofile.medium.length && !userprofile.syllabus.length &&
          (userprofile.profileType === ProfileType.NONE || userprofile.profileType === ProfileType.OTHER.toUpperCase()
              || serverProfile.userType === ProfileType.OTHER.toUpperCase())) {
              this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                state: { categoriesProfileData }
              });
        } else if (userprofile.profileType === ProfileType.NONE ||
            userprofile.profileType === ProfileType.OTHER.toUpperCase()
            || serverProfile.userType === ProfileType.OTHER.toUpperCase()) {
          categoriesProfileData['status'] = true;
          categoriesProfileData['isUserLocationAvalable'] =
          this.commonUtilService.isUserLocationAvalable(userprofile, locationMappingConfig);
          this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
            state: { categoriesProfileData }
          });
        } else {
          this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
            state: categoriesProfileData
          });
        }
      });
  }

  async isSSOUser(profile: Profile): Promise<boolean> {
    const custodianOrgId = await this.formAndFrameworkUtilService.getCustodianOrgId();
    if (profile.serverProfile && profile.serverProfile.rootOrg &&
      profile.serverProfile.rootOrg.rootOrgId === custodianOrgId) {
      return false;
    } else {
      return true;
    }
  }

  private checkDistrictMapping(profile, locationMappingConfig, userDetails) {
    this.formAndFrameworkUtilService.getCustodianOrgId()
      .then(async (custodianOrgId: string) => {
        const isCustodianOrgId = profile.rootOrg.rootOrgId === custodianOrgId;
        if (isCustodianOrgId && !this.commonUtilService.isUserLocationAvalable(userDetails, locationMappingConfig)) {
          this.navigateToDistrictMapping();
        } else {
          if (!(await this.isSSOUser(userDetails))) {
            this.appGlobalService.showYearOfBirthPopup(userDetails.serverProfile);
          }
          this.externalIdVerificationService.showExternalIdVerificationPopup();
        }
      })
      .catch(() => {
        this.appGlobalService.closeSigninOnboardingLoader();
        this.externalIdVerificationService.showExternalIdVerificationPopup();
      });
  }

  private navigateToDistrictMapping() {
    const navigationExtras: NavigationExtras = {
      state: {
        isShowBackButton: false,
        noOfStepsToCourseToc: 1
      }
    };
    this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
  }

  private async updateUserAsGuest(guestProfile?: any) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req = await this.frameworkDetailsService.getFrameworkDetails(guestProfile).then((data) => {
      return data;
    });
    const request = {
      ...req,
      userId: this.appGlobalService.getCurrentUser().uid,
    };
    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, request.profileUserTypes[0].type).toPromise();
    await this.profileService.updateServerProfile(request).toPromise()
      .then(async (data) => {
        await loader.dismiss();
        this.commonUtilService.showToast(
          this.commonUtilService.translateMessage('FRMELEMNTS_MSG_CHANGE_PROFILE', {role: req.profileUserTypes[0].type}));
        this.events.publish('refresh:loggedInProfile');
      }).catch(async (e) => {
        await loader.dismiss();
        console.log('server error for update profile', e);
      });
  }
}