import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProfileConstants, RouterLinks } from '../../../app/app.constant';
import { CommonUtilService } from '../../../services/common-util.service';
import { Platform, } from '@ionic/angular';
import { IsProfileAlreadyInUseRequest, GenerateOtpRequest, ProfileService } from '@project-sunbird/sunbird-sdk';
import { FieldConfig, FieldConfigValidationType } from 'common-form-elements';
import { Location } from '@angular/common';
@Component({
  selector: 'app-signup-email-password',
  templateUrl: './signup-email-password.page.html',
  styleUrls: ['./signup-email-password.page.scss'],
})
export class SignupEmailPasswordPage implements OnInit {
  contactType = 'phone';
  appName = '';
  mobileNumberConfig: FieldConfig<any>[] = [];
  emailConfig: FieldConfig<any>[] = [];
  // passwordConfig: FieldConfig<any>[] = [];
  contactConfig: FieldConfig<any>[] = [];
  isFormValid = false;
  errorConfirmPassword = false;
  loader: any;
  userId: string;
  userData: any;
  btnColor = '#8FC4FF';
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public platform: Platform,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private location: Location
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.userData = extrasState.userData;
  }
  async ngOnInit() {
    this.contactType = 'phone';
    this.mobileNumberConfig = [{
      code: 'phone',
      type: 'input',
      templateOptions: {
        type: 'tel',
        label: '',
        placeHolder: this.commonUtilService.translateMessage('ENTER_PHONE_POPUP_TITLE'),
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_CONFIRM_CONTACT_VALIDATION')
      },
      {
        type: FieldConfigValidationType.PATTERN,
        value: /^[6-9]\d{9}$/,
        message: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_CONTACT_PATTERN_VALIDATION')
      }]
    }];
    this.contactConfig = this.mobileNumberConfig;
    await this.setappname()
  }
  async setappname() {
    this.appName = await this.commonUtilService.getAppName();
  }
  contactTypeChange() {
    if (this.contactType === 'email') {
      this.emailConfig = [{
        code: 'email',
        type: 'input',
        templateOptions: {
          type: 'email',
          label: '',
          placeHolder: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_ENTER_EMAIL'),
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_CONFIRM_EMAIL_VALIDATION')
        },
        {
          type: FieldConfigValidationType.PATTERN,
          value: /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,
          message: this.commonUtilService.translateMessage('FRMELEMNTS_LBL_CONFIRM_EMAIL_PATTERN_VALIDATION')
        }]
      }];
      this.contactConfig = this.emailConfig;
    } else if (this.contactType === 'phone') {
      this.contactConfig = this.mobileNumberConfig;
    }
  }

  async continue() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      let req: IsProfileAlreadyInUseRequest;
      if (this.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.userData.contactInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE
        };
      } else {
        req = {
          key: this.userData.contactInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL
        };
      }
      await this.generateOTP();
      if (this.loader) {
        await this.loader.dismiss();
        this.loader = undefined;
      }
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('INTERNET_CONNECTIVITY_NEEDED'));
    }
  }
  async generateOTP() {
    let req: GenerateOtpRequest;
    if (this.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
      req = {
        key: this.userData.contactInfo.phone,
        type: ProfileConstants.CONTACT_TYPE_PHONE
      };
    } else {
      req = {
        key: this.userData.contactInfo.email,
        type: ProfileConstants.CONTACT_TYPE_EMAIL
      };
    }
    this.profileService.generateOTP(req).toPromise()
      .then(async () => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        const navigationExtras: NavigationExtras = {
          state: {
            userData: this.userData
          }
        };
        await this.router.navigate([RouterLinks.OTP], navigationExtras);
      })
      .catch(async (err) => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        if (err.response && err.response.body.params.err === 'UOS_OTPCRT0059') {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('FRMELEMNTS_MSG_OTP_ATTEMPT_LIMIT'));
        }
      });
  }
  onFormEmailPasswordChange(value: any) {
    this.userData['contactInfo'] = value;
    this.userData['contactInfo']['type'] = this.contactType;
  }
  statusChanges(event) {
    this.isFormValid = event.isValid;
  }
  async redirectToLogin() {
    await this.router.navigate([RouterLinks.SIGN_IN]);
  }

  goBack() {
    this.location.back();
  }
}
