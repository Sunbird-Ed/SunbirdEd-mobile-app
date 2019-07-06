import { Component, OnInit, Inject } from '@angular/core';
import { LoadingController, NavParams, Platform, ModalController } from '@ionic/angular';
import { ProfileConstants } from '../../app.constant';
import { CommonUtilService } from '../../../services';
import { GenerateOtpRequest, ProfileService, VerifyOtpRequest } from 'sunbird-sdk';

@Component({
  selector: 'app-edit-contact-verify-popup',
  templateUrl: './edit-contact-verify-popup.component.html',
  styleUrls: ['./edit-contact-verify-popup.component.scss'],
})
export class EditContactVerifyPopupComponent implements OnInit {
  /**
   * Key may be phone or email depending on the verification flow from which it is called
   */
  key;
  otp;
  title: string;
  description: string;
  type: string;
  invalidOtp = false;
  enableResend = true;

  constructor(
    private navParams: NavParams,
    public modalCtrl: ModalController,
    public platform: Platform,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private loadingCtrl: LoadingController,
    private commonUtilService: CommonUtilService
  ) {
    this.key = this.navParams.get('key');
    this.title = this.navParams.get('title');
    this.description = this.navParams.get('description');
    this.type = this.navParams.get('type');

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.modalCtrl.dismiss();
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
          this.modalCtrl.dismiss(true, this.key);
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
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.generateOTP(req).toPromise()
        .then(async () => {
          this.description = this.commonUtilService.translateMessage('OTP_RESENT');
          await loader.dismiss();
        })
        .catch(async () => {
          await loader.dismiss();
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  cancel() {
    this.modalCtrl.dismiss(false);
  }

}
