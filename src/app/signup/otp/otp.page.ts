import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileConstants, OTPTemplates, RouterLinks, PreferenceKey } from '../../../app/app.constant';
import { CommonUtilService } from '../../../services/common-util.service';
import { VerifyOtpRequest, HttpClientError, GenerateOtpRequest, ProfileService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  btnColor = '#8FC4FF';
  public otpInfoForm: FormGroup;
  userData: any;
  appName = '';
  enableResend = true;
  contactNumber = '';
  acceptAgreement = false;
  invalidOtp = false;
  remainingAttempts: any;
  loader: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
    private _fb: FormBuilder,
    private commonUtilService: CommonUtilService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private location: Location,
    public router: Router) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.userData = extrasState.userData;
    if (this.userData?.contactInfo?.phone) {
      this.contactNumber = (this.userData.contactInfo.phone).replace(/\d(?=\d{4})/g, '*')
    } else {
      this.contactNumber = this.userData?.contactInfo?.email;
    }
  }

  goBack() {
    this.location.back();
  }

  async ngOnInit() {
    this.otpInfoForm =
      this._fb.group({
        otp: ['', Validators.required],
      });

    this.appName = await this.commonUtilService.getAppName();
  }

  async continue() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      let req: VerifyOtpRequest;
      if (this.userData.contactInfo.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.userData.contactInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
          otp: this.otpInfoForm.value.otp,
          ...(this.userData.contactInfo.phone &&
            this.userData.contactInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId })
        };
      } else {
        req = {
          key: this.userData.contactInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
          otp: this.otpInfoForm.value.otp,
          ...(this.userData.contactInfo &&
            this.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId })
        };
      }
      this.profileService.verifyOTP(req).toPromise()
        .then(() => {
          const locationCodes = [];
          for(const acc in this.userData.location) {
            if (this.userData.location[acc]) {
              const location: SbLocation = this.userData.location[acc] as SbLocation;
              if (location.type) {
                locationCodes.push({
                  type: location.type,
                  code: location.code
                });
              }
            }
          };
          const profileReq = {
            userId: this.userData.userId,
            profileLocation: locationCodes,
            firstName: this.userData.name,
            lastName: '',
            dob: this.userData.dob,
            profileUserTypes: this.userData.profileUserTypes
          };
          this.profileService.updateServerProfile(profileReq).toPromise()
            .then(async (data) => {
              if (this.userData.profileUserTypes.length && this.userData.profileUserTypes[0].type) {
                await this.preference.putString(PreferenceKey.SELECTED_USER_TYPE, this.userData.profileUserTypes[0].type).toPromise();
              }
              await this.loader.dismiss();
              const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
              };
              await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                state: categoriesProfileData
              });
            }).catch(async (error) => {
              console.error(error);
              await this.loader.dismiss();
              if (error.response.body.params.err === 'UOS_USRUPD0003') {
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
              }
            });
        })
        .catch(error => {
          this.loader.dismiss();
          if (HttpClientError.isInstance(error)
            && error.response.responseCode === 400) {
            if (typeof error.response.body === 'object') {
              if (error.response.body.params.err === 'UOS_OTPVERFY0063' &&
                error.response.body.result.remainingAttempt > 0) {
                this.remainingAttempts = error.response.body.result.remainingAttempt;
                this.otpInfoForm.value.otp = '';
                this.invalidOtp = true;
              } else {
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('OTP_FAILED'));
              }
            }
          }
        });
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('INTERNET_CONNECTIVITY_NEEDED'));
    }
  }

  async resendOTP() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.enableResend = !this.enableResend;
      let req: GenerateOtpRequest;
      if (this.userData.contactInfo.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.userData.contactInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
          ...(this.userData.contactInfo &&
            this.userData.contactInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId, templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
        };
      } else {
        req = {
          key: this.userData.contactInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
          ...(this.userData.contactInfo.email &&
            this.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId, templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
        };
      }
      let loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.generateOTP(req).toPromise()
        .then(async () => {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('OTP_RESENT'));
          await loader.dismiss();
          loader = undefined;
        })
        .catch(async (e) => {
          if (loader) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
            await loader.dismiss();
            loader = undefined;
          }
        });
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('INTERNET_CONNECTIVITY_NEEDED'));
    }
  }

  async redirectToLogin() {
    await this.router.navigate([RouterLinks.SIGN_IN]);
  }

  changeEvent(event) {
    this.acceptAgreement = event.target.checked;
  }
}
