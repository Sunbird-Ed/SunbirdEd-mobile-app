import { Inject, Injectable } from "@angular/core";
import { ProfileConstants, RouterLinks } from "@app/app/app.constant";
import { AppGlobalService, CommonUtilService, ContainerService, FormAndFrameworkUtilService } from "@app/services";
import { TncUpdateHandlerService } from "@app/services/handlers/tnc-update-handler.service";
import { SegmentationTagService, TagPrefixConstants } from "@app/services/segmentation-tag/segmentation-tag.service";
import { Events } from "@app/util/events";
import { CachedItemRequestSourceFrom, ProfileService, ServerProfileDetailsRequest } from "sunbird-sdk";
import { Location } from '@angular/common';
import { initTabs, LOGIN_TEACHER_TABS } from "@app/app/module.service";
import { NavigationExtras, Router } from "@angular/router";
import { ExternalIdVerificationService } from "@app/services/externalid-verification.service";

@Injectable({
  providedIn: 'root'
})
export class CategoriesEditService {

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private segmentationTagService: SegmentationTagService,
    private events: Events,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    public location: Location,
    private container: ContainerService,
    private appGlobalService: AppGlobalService,
    private router: Router,
    private externalIdVerificationService: ExternalIdVerificationService
  ) {

  }

  async updateServerProfile(profile, req, showOnlyMandatoryFields, shouldUpdatePreference, hasFilledLocation) {
    this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
    this.events.publish('loggedInProfile:update', req.framework);
    const isSSOUser = await this.tncUpdateHandlerService.isSSOUser(profile);
    await this.refreshSegmentTags(profile);
    if (showOnlyMandatoryFields || shouldUpdatePreference) {
      const reqObj: ServerProfileDetailsRequest = {
        userId: profile.uid,
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };
      let updatedProfile;
      try {
        updatedProfile = await this.profileService.getServerProfilesDetails(reqObj).toPromise()
      } catch {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        if (hasFilledLocation) {
          this.executeUserPostOnboardingSteps(isSSOUser, updatedProfile)
        } else {
          this.navigateToDistrictMapping();
        }
      }

      await this.formAndFrameworkUtilService.updateLoggedInUser(updatedProfile, profile);
      if (shouldUpdatePreference) {
        this.location.back();
      } else {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        if (hasFilledLocation || isSSOUser) {
          this.executeUserPostOnboardingSteps(isSSOUser, updatedProfile)
        } else {
          this.navigateToDistrictMapping();
        }
      }
    } else {
      this.location.back();
    }
  }

  async refreshSegmentTags(profile) {
    const reqObj: ServerProfileDetailsRequest = {
      userId: profile.uid,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    };
    try {
      const updatedProfile = await this.profileService.getServerProfilesDetails(reqObj).toPromise();
      let segmentDetails = JSON.parse(JSON.stringify(updatedProfile.framework));
      Object.keys(segmentDetails).forEach((key) => {
        if (key !== 'id' && Array.isArray(segmentDetails[key])) {
          segmentDetails[key] = segmentDetails[key].map(x => x.replace(/\s/g, '').toLowerCase());
        }
      });
      window['segmentation'].SBTagService.pushTag(segmentDetails, TagPrefixConstants.USER_ATRIBUTE, true);
      let userLocation = [];
      (updatedProfile['userLocations'] || []).forEach(element => {
        userLocation.push({ name: element.name, code: element.code });
      });
      window['segmentation'].SBTagService.pushTag({ location: userLocation }, TagPrefixConstants.USER_LOCATION, true);
      window['segmentation'].SBTagService.pushTag(updatedProfile.profileUserType.type, TagPrefixConstants.USER_LOCATION, true);
      this.segmentationTagService.evalCriteria();
    } catch (e) {
      console.log(e);
    }
  }

  private executeUserPostOnboardingSteps(isSSOUser, updatedProfile) {
    if (!isSSOUser) {
      this.appGlobalService.showYearOfBirthPopup(updatedProfile);
    }
    this.router.navigate([RouterLinks.TABS]);
    this.events.publish('update_header');
    this.externalIdVerificationService.showExternalIdVerificationPopup();
  }

  private navigateToDistrictMapping() {
    const navigationExtras: NavigationExtras = {
      state: {
        isShowBackButton: false
      }
    };
    this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
  }
}
