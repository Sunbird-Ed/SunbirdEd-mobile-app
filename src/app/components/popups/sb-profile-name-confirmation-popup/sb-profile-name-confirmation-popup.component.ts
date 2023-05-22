import {Component, Inject, Input} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppGlobalService } from '../../../../services/app-global-service.service';
import { PageId } from '../../../../services/telemetry-constants';
import { CommonUtilService } from '../../../../services/common-util.service';
import { PreferenceKey, ProfileConstants } from '../../../../app/app.constant';
import {
  CachedItemRequestSourceFrom, ProfileService,
  ServerProfileDetailsRequest,
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { NavigationService } from '../../../../services/navigation-handler.service';

@Component({
  selector: 'app-profile-name-confirmation-popover',
  templateUrl: './sb-profile-name-confirmation-popup.component.html',
  styleUrls: ['./sb-profile-name-confirmation-popup.component.scss'],
})
export class ProfileNameConfirmationPopoverComponent {
  @Input() content;
  @Input() projectContent;
  appName;
  profile;
  doNotShowAgain = false;
  buttonLabel ="START_LEARNING";

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private popoverCtrl: PopoverController,
    private navService: NavigationService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService
  ) { }

  async ionViewWillEnter() {
    this.buttonLabel = this.projectContent ? "FRMELEMNTS_LBL_START_IMPROVEMENT" : "START_LEARNING";
    this.appName = await this.commonUtilService.getAppName();

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

  async onSubmitClick() {
    const key = PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-' + this.profile.userId;
    await this.preferences.putBoolean(key, this.doNotShowAgain).toPromise().then();
    await this.closePopover({ buttonClicked: true });
  }

  async closePopover(data?) {
    await this.popoverCtrl.dismiss(data);
  }

  async onProfilePageClick() {
    let payload = this.projectContent ? {code:'name',children:[]} : ''
    await this.navService.navigateToEditPersonalDetails(this.profile, PageId.PROFILE_NAME_CONFIRMATION_POPUP,payload);
    await this.closePopover({ editProfileClicked: true });
  }

}
