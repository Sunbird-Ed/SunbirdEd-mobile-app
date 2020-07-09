import { Component, OnInit, Inject, Input } from '@angular/core';
import { NavParams, Platform, PopoverController, MenuController } from '@ionic/angular';
import { GenerateOtpRequest, ProfileService, VerifyOtpRequest, HttpClientError, Response } from 'sunbird-sdk';

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
  @Input() userId: string;
  @Input() key: string;
  @Input() title: string;
  @Input() description: string;
  @Input() type: string;
  otp = '';
  invalidOtp = false;
  enableResend = true;
  unregisterBackButton: any;
  remainingAttempts: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private navParams: NavParams,
    public popOverCtrl: PopoverController,
    public platform: Platform,
    private commonUtilService: CommonUtilService,
    private menuCtrl: MenuController
  ) {
    this.userId = this.navParams.get('userId');
    this.key = this.navParams.get('key');
    this.title = this.navParams.get('title');
    this.description = this.navParams.get('description');
    this.type = this.navParams.get('type');

  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
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
          if (HttpClientError.isInstance(error)
           && error.response.responseCode === 400) {
            if (typeof error.response.body  === 'object') {
              if (error.response.body.params.err === 'OTP_VERIFICATION_FAILED' &&
              error.response.body.result.remainingAttempt > 0) {
                this.remainingAttempts = error.response.body.result.remainingAttempt;
                this.otp = '';
                this.invalidOtp = true;
              } else {
                this.popOverCtrl.dismiss();
                this.commonUtilService.showToast('OTP_FAILED');
              }
            }
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
      let loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.generateOTP(req).toPromise()
        .then(async () => {
          this.commonUtilService.showToast('OTP_RESENT');
          await loader.dismiss();
          loader = undefined;
        })
        .catch(async (e) => {
          if (loader) {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
            await loader.dismiss();
            loader = undefined;
          }
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  cancel() {
    this.popOverCtrl.dismiss({ OTPSuccess: false });
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
