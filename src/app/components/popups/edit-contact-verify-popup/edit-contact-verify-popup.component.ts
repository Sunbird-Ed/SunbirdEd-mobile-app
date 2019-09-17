import { Component, OnInit, Inject, Input } from '@angular/core';
import { NavParams, Platform, PopoverController, MenuController } from '@ionic/angular';
import { GenerateOtpRequest, ProfileService, VerifyOtpRequest } from 'sunbird-sdk';

import { ProfileConstants } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';

@Component({
  selector: 'app-edit-contact-verify-popup',
  templateUrl: './edit-contact-verify-popup.component.html',
  styleUrls: ['./edit-contact-verify-popup.component.scss'],
})
export class EditContactVerifyPopupComponent implements OnInit {
  /**
   * Key may be phone or email depending on the verification flow from which it is called
   */
  @Input() key: string;
  @Input() title: string;
  @Input() description: string;
  @Input() type: string;
  otp;
  invalidOtp = false;
  enableResend = true;
  unregisterBackButton: any;
  loader: any;

  constructor(
    private navParams: NavParams,
    public popOverCtrl: PopoverController,
    public platform: Platform,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private menuCtrl: MenuController
  ) {
    this.key = this.navParams.get('key');
    this.title = this.navParams.get('title');
    this.description = this.navParams.get('description');
    this.type = this.navParams.get('type');

  }

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  ionViewWillEnter() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.unregisterBackButton.unsubscribe();
    });
  }

  verify() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let req: VerifyOtpRequest;
      if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.key,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
          otp: this.otp
        };
      } else {
        req = {
          key: this.key,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
          otp: this.otp
        };
      }
      this.profileService.verifyOTP(req).toPromise()
        .then(() => {
          this.popOverCtrl.dismiss({ OTPSuccess: true, value: this.key });
        })
        .catch(error => {
          if (error.response.body.params.err === 'ERROR_INVALID_OTP') {
            this.invalidOtp = true;
          }
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }



  async resendOTP() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.enableResend = !this.enableResend;
      let req: GenerateOtpRequest;
      if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.key,
          type: ProfileConstants.CONTACT_TYPE_PHONE
        };
      } else {
        req = {
          key: this.key,
          type: ProfileConstants.CONTACT_TYPE_EMAIL
        };
      }
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      this.profileService.generateOTP(req).toPromise()
        .then(async () => {
          this.description = this.commonUtilService.translateMessage('OTP_RESENT');
          await this.loader.dismiss();
        })
        .catch(async () => {
          await this.loader.dismiss();
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  cancel() {
    this.popOverCtrl.dismiss({ OTPSuccess: false });
  }

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
