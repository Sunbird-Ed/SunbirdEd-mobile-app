import { Inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  AuthService, ProfileService,
  ServerProfile, ServerProfileDetailsRequest, CachedItemRequestSourceFrom, Profile
} from 'sunbird-sdk';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { TermsAndConditionsPage } from '@app/app/terms-and-conditions/terms-and-conditions.page';
import { Router, NavigationExtras } from '@angular/router';
import { CommonUtilService } from '../common-util.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { ExternalIdVerificationService } from '../externalid-verification.service';
import { AppGlobalService } from '../app-global-service.service';
import { ConsentService } from '../consent-service';

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
    const userDetails = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    if (await this.isSSOUser(userDetails) || (userDetails.serverProfile.declarations && userDetails.serverProfile.declarations.length)) {
      await this.consentService.getConsent(userDetails, true);
    }
    if (userDetails && userDetails.grade && userDetails.medium && userDetails.syllabus &&
      !userDetails.grade.length && !userDetails.medium.length && !userDetails.syllabus.length) {
      this.preRequirementToBmcNavigation(profile.userId);
    } else {
      this.checkDistrictMapping(profile);
    }
  }

  private async preRequirementToBmcNavigation(userId) {
    const serverProfile = await this.profileService.getServerProfilesDetails({
      userId,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    }).toPromise();

    const userprofile = await this.profileService.getActiveSessionProfile({
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    }).toPromise();

    this.navigateToBmc(serverProfile, userprofile);
  }

  private async navigateToBmc(serverProfile, userprofile) {
    this.formAndFrameworkUtilService.updateLoggedInUser(serverProfile, userprofile)
      .then((value) => {
        const categoriesProfileData = {
          hasFilledLocation: this.commonUtilService.isUserLocationAvalable(serverProfile),
          showOnlyMandatoryFields: true,
          profile: value['profile'],
          isRootPage: true
        };
        this.router.navigate([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
          state: {categoriesProfileData}
        });
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

  private checkDistrictMapping(profile) {
    this.formAndFrameworkUtilService.getCustodianOrgId()
      .then((custodianOrgId: string) => {
        const isCustodianOrgId = profile.rootOrg.rootOrgId === custodianOrgId;
        if (isCustodianOrgId
          && !this.commonUtilService.isUserLocationAvalable(profile)) {
          this.navigateToDistrictMapping();
        } else {
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
