import { Component, Inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AppGlobalService, CommonUtilService, PageId } from '@app/services';
import { ProfileConstants } from '@app/app/app.constant';
import {
  CachedItemRequestSourceFrom, ProfileService,
  ServerProfileDetailsRequest
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

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private popOverCtrl: PopoverController,
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
    this.closePopover({ buttonClicked: true });
  }

  closePopover(data?) {
    this.popOverCtrl.dismiss(data);
  }

  onProfilePageClick() {
    this.navService.navigateToEditPersonalDetails(this.profile, PageId.PROFILE_NAME_CONFIRMATION_POPUP);
    this.closePopover({ editProfileClicked: true });
  }

//   describe('onEditProfileClicked  test-suites', () => {
//     it('should generate telemetry and navigate to district mapping if network is available', () => {
//         // arrange
//         // act
//         profilePage.onEditProfileClicked();
//         // assert
//         expect(mockNavService.navigateToEditPersonalDetails).toHaveBeenCalledWith(
//             mockProfileData,
//             PageId.PROFILE
//         );
//     });
// });

}
