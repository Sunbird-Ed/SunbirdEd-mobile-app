import { Inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { FieldConfig } from '@app/app/components/common-forms/field-config';
import { FormConstants } from '@app/app/form.constants';
import { TermsAndConditionsPage } from '@app/app/terms-and-conditions/terms-and-conditions.page';
import { ModalController } from '@ionic/angular';
import {
  AuthService,
  CachedItemRequestSourceFrom, Profile, ProfileService,
  ProfileType, ServerProfile, ServerProfileDetailsRequest
} from 'sunbird-sdk';
import { AppGlobalService } from '../app-global-service.service';
import { CommonUtilService } from '../common-util.service';
import { ConsentService } from '../consent-service';
import { ExternalIdVerificationService } from '../externalid-verification.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';

@Injectable({
  providedIn: 'root'
})
export class TncUpdateHandlerService {

  modal: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private modalCtrl: ModalController,
    private router: Router,
    private externalIdVerificationService: ExternalIdVerificationService,
    private appGlobalService: AppGlobalService,
    private consentService: ConsentService
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
      .then((profile) => {
        if (this.hasProfileTncUpdated(profile)) {
          this.presentTncPage({ profile });
        } else {
          this.checkBmc(profile);
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
        || (userDetails.profileType === ProfileType.NONE || userDetails.profileType === ProfileType.OTHER.toUpperCase()
            || userDetails.serverProfile.profileUserType.type === ProfileType.OTHER.toUpperCase())) {
        this.preRequirementToBmcNavigation(profile.userId, locationMappingConfig);
      } else {
        this.checkDistrictMapping(profile, locationMappingConfig, userDetails);
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
          isRootPage: true
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
        isShowBackButton: false
      }
    };
    this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
  }
}
