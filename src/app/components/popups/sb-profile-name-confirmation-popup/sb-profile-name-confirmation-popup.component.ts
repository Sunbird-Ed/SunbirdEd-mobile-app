import { Component, Inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppGlobalService, CommonUtilService, PageId } from '@app/services';
import { PreferenceKey, ProfileConstants } from '@app/app/app.constant';
import {
  CachedItemRequestSourceFrom, ProfileService,
  ServerProfileDetailsRequest,
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';

@Component({
  selector: 'app-profile-name-confirmation-popover',
  templateUrl: './sb-profile-name-confirmation-popup.component.html',
  styleUrls: ['./sb-profile-name-confirmation-popup.component.scss'],
})
export class ProfileNameConfirmationPopoverComponent {

  appName;
  profile;
  doNotShowAgain = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private popoverCtrl: PopoverController,
    private navService: NavigationService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService
  ) { }

  async ionViewWillEnter() {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });

    const userId = await this.appGlobalService.getActiveProfileUid();

    const serverProfileDetailsRequest: ServerProfileDetailsRequest = {
      userId,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    };
    this.profileService.getServerProfilesDetails(serverProfileDetailsRequest).toPromise()
      .then((profileData) => {
        this.profile = profileData;
      })
      .catch(err => {
        console.error('ProfileNameConfirmationPopoverComponent', err);
      });
  }

  onButtonClick() {
    this.preferences.putBoolean(PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP, this.doNotShowAgain).toPromise().then();
    this.closePopover({ buttonClicked: true });
  }

  closePopover(data?) {
    this.popoverCtrl.dismiss(data);
  }

  onProfilePageClick() {
    this.navService.navigateToEditPersonalDetails(this.profile, PageId.PROFILE_NAME_CONFIRMATION_POPUP);
    this.closePopover({ editProfileClicked: true });
  }

}
