import { Inject, Injectable } from "@angular/core";
import { ProfileConstants, RouterLinks } from "../../../app/app.constant";
import { AppGlobalService } from "../../../services/app-global-service.service";
import { FormAndFrameworkUtilService } from "../../../services/formandframeworkutil.service";
import { TncUpdateHandlerService } from "../../../services/handlers/tnc-update-handler.service";
import { SegmentationTagService, TagPrefixConstants } from "../../../services/segmentation-tag/segmentation-tag.service";
import { Events } from "../../../util/events";
import { CachedItemRequestSourceFrom, ProfileService, ServerProfileDetailsRequest } from "sunbird-sdk";
import { Location } from '@angular/common';
import { initTabs, LOGIN_TEACHER_TABS } from "../../../app/module.service";
import { NavigationExtras, Router } from "@angular/router";
import { ExternalIdVerificationService } from "../../../services/externalid-verification.service";
import { CommonUtilService } from "../../../services/common-util.service";
import { ContainerService } from "../../../services/container.services";

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

  async updateServerProfile(profile, req, showOnlyMandatoryFields, shouldUpdatePreference, hasFilledLocation, noOfStepsToCourseToc) {
    this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
    this.events.publish('loggedInProfile:update', req.framework);
    const isSSOUser = await this.tncUpdateHandlerService.isSSOUser(profile);
    await this.refreshSegmentTags(profile);
    if (showOnlyMandatoryFields || shouldUpdatePreference) {
      const reqObj: ServerProfileDetailsRequest = {
        userId: profile.userId || profile.uid,
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };
      let updatedProfile;
      try {
        updatedProfile = await this.profileService.getServerProfilesDetails(reqObj).toPromise();
      } catch {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        if (hasFilledLocation) {
          await this.executeUserPostOnboardingSteps(isSSOUser, updatedProfile, noOfStepsToCourseToc);
        } else {
          await this.navigateToDistrictMapping(noOfStepsToCourseToc);
        }
      }

      await this.formAndFrameworkUtilService.updateLoggedInUser(updatedProfile, profile);
      if (shouldUpdatePreference) {
        this.location.back();
      } else {
        initTabs(this.container, LOGIN_TEACHER_TABS);
        if (hasFilledLocation || isSSOUser) {
          await this.executeUserPostOnboardingSteps(isSSOUser, updatedProfile)
        } else {
          await this.navigateToDistrictMapping();
        }
      }
    } else {
      this.location.back();
    }
  }

  async refreshSegmentTags(profile) {
    const reqObj: ServerProfileDetailsRequest = {
      userId: profile.userId || profile.uid,
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
      await this.segmentationTagService.evalCriteria();
    } catch (e) {
      console.log(e);
    }
  }

  private async executeUserPostOnboardingSteps(isSSOUser, updatedProfile, navigateToCourse?) {
    if (!isSSOUser) {
      await this.appGlobalService.showYearOfBirthPopup(updatedProfile);
    }
    if (this.appGlobalService.isJoinTraningOnboardingFlow) {
      window.history.go(-navigateToCourse);
    } else {
      await this.router.navigate([RouterLinks.TABS]);
    }
    this.events.publish('update_header');
    await this.externalIdVerificationService.showExternalIdVerificationPopup();
  }

  private async navigateToDistrictMapping(navigateToCourse?) {
    const navigationExtras: NavigationExtras = {
      state: {
        isShowBackButton: false,
        noOfStepsToCourseToc: navigateToCourse + 1
      }
    };
    await this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
  }
}
