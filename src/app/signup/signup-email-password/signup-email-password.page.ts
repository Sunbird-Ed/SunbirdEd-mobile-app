import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services';
import { Platform, } from '@ionic/angular';
import { IsProfileAlreadyInUseRequest, GenerateOtpRequest, ProfileService } from 'sunbird-sdk';
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
  passwordConfig: FieldConfig<any>[] = [];
  emailPasswordConfig: FieldConfig<any>[] = [];
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

  ngOnInit() {
    this.contactType = 'phone';
    this.passwordConfig = [{
      code: 'password',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: this.commonUtilService.translateMessage('PASSWORD_PLACEHOLDER'),
        placeHolder: this.commonUtilService.translateMessage('ENTER_PASSWORD'),
        showIcon: {
          show: true,
          image: {
              active: 'assets/imgs/eye.svg',
              inactive: 'assets/imgs/eye-off.svg'
          },
          direction: 'right'
        },
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: 'Your password must contain a minimum of 8 characters. It must include numerals, lower and upper case alphabets and special characters, without any spaces.'
      }]
    },
    {
      code: 'confirmPassword',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: this.commonUtilService.translateMessage('CONFIRM_PASSWORD_PLACEHOLDER'),
        placeHolder: this.commonUtilService.translateMessage('RE_ENTER_PASSWORD'),
        showIcon: {
          show: true,
          image: {
              active: 'assets/imgs/eye.svg',
              inactive: 'assets/imgs/eye-off.svg'
          },
          direction: 'right'
        },
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: this.commonUtilService.translateMessage('CONFIRM_PASSWORD_VALIDATION')
      }]
    }];
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
        message: this.commonUtilService.translateMessage('CONFIRM_CONTACT_VALIDATION')
      },
      {
        type: FieldConfigValidationType.PATTERN,
        value: /^[6-9]\d{9}$/,
        message: this.commonUtilService.translateMessage('CONTACT_PATTERN_VALIDATION')
      }]
    }];
    this.emailPasswordConfig = (this.mobileNumberConfig.concat(this.passwordConfig));
    this.setappname()
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
          placeHolder: this.commonUtilService.translateMessage('ENTER_EMAIL'),
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: this.commonUtilService.translateMessage('CONFIRM_EMAIL_VALIDATION')
        }]
      }];
      this.emailPasswordConfig = this.emailConfig.concat(this.passwordConfig);
    } else if (this.contactType === 'phone') {
      this.emailPasswordConfig = this.mobileNumberConfig.concat(this.passwordConfig);
    }
    console.log(this.emailPasswordConfig);
  }

  back() {
   this.location.back()
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

      this.profileService.isProfileAlreadyInUse(req).subscribe(async (success: any) => {
        await this.loader.dismiss();
        this.loader = undefined;
        if (success && success.response) {
          if (success.response.id === this.userId) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_SAME_EMAIL_UPDATED'));
          } else {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_EMAIL_EXISTS'));
          }
        }
      }, async (error) => {
        if (error.response && error.response.body.params.err === 'UOS_USRRED0013' || error.response.body.params.err === 'UOS_USRRED009') {
          this.generateOTP();
        } else if (error.response && error.response.body.params.err === 'USER_NOT_FOUND') {
          // this.blockedAccount = true;
          if (this.loader) {
            await this.loader.dismiss();
            this.loader = undefined;
          }
        } else {
          if (this.loader) {
            await this.loader.dismiss();
            this.loader = undefined;
          }
        }
      });
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
        this.router.navigate([RouterLinks.OTP], navigationExtras);
      })
      .catch(async (err) => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        if (err.response && err.response.body.params.err === 'UOS_OTPCRT0059') {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('OTP_ATTEMPT_LIMIT'));
        }
      });
  }

  onFormEmailPasswordChange(value: any) {
    this.userData['contactInfo'] = value;
    this.userData['contactInfo']['type'] = this.contactType;
    this.errorConfirmPassword = value.confirmPassword && (value.confirmPassword !== value.password);
  }

  statusChanges(event) {
    this.isFormValid = event.isValid;
  }

  redirectToLogin() {
    this.router.navigate([RouterLinks.SIGN_IN]);
  }

}
