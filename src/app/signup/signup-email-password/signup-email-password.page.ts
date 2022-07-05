import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ProfileConstants } from '@app/app/app.constant';
import { AppGlobalService, CommonUtilService } from '@app/services';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NavParams, Platform, PopoverController, MenuController } from '@ionic/angular';
import { IsProfileAlreadyInUseRequest, GenerateOtpRequest, ProfileService } from 'sunbird-sdk';
import { FieldConfig, FieldConfigValidationType } from 'common-form-elements-v9';
import { async } from 'rxjs';

@Component({
  selector: 'app-signup-email-password',
  templateUrl: './signup-email-password.page.html',
  styleUrls: ['./signup-email-password.page.scss'],
})
export class SignupEmailPasswordPage implements OnInit {
  contactType: string = 'phone';
  appName = '';
  emailPasswordConfig: FieldConfig<any>[] = [];
  isFormValid: boolean = false;
  errorConfirmPassword: boolean = false;
  loader: any;
  userId: string;
  userData: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public platform: Platform,
    private commonUtilService: CommonUtilService,
    private router: Router
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    this.userData = extrasState.userData;
    console.log('............', extrasState);
  }

  ngOnInit() {
    this.contactType = 'phone';
    this.emailPasswordConfig = [
      {
        code: 'phone',
        type: 'input',
        templateOptions: {
          type: 'tel',
          label: '',
          placeHolder: 'Enter Mobile Number',
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter mobile number'
        },
        {
          type: FieldConfigValidationType.PATTERN,
          value: /^[6-9]\d{9}$/,
          message: 'Please enter valid mobile number'
        }]
      },
      {
        code: 'password',
        type: 'input',
        templateOptions: {
          type: 'password',
          label: 'Password',
          placeHolder: 'Enter Password'
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter password'
        }]
      },
      {
        code: 'confirmPassword',
        type: 'input',
        templateOptions: {
          type: 'password',
          label: 'Confirm Password',
          placeHolder: 'Re-enter the password',
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter confirm password'
        }]
      }
    ]
    this.setappname()
  }
  async setappname() {
    this.appName = await this.commonUtilService.getAppName();
  }

  contactTypeChange() {
    if (this.contactType === 'email') {
      this.emailPasswordConfig[0] = {
        code: 'email',
        type: 'input',
        templateOptions: {
          type: 'email',
          label: '',
          placeHolder: 'Enter Email Address',
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter email address'
        }]
      }
    } else if (this.contactType === 'phone') {

      this.emailPasswordConfig[0] = {
        code: 'phone',
        type: 'input',
        templateOptions: {
          type: 'tel',
          label: '',
          placeHolder: 'Enter Mobile Number',
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter mobile number'
        },
        {
          type: FieldConfigValidationType.PATTERN,
          value: /^[6-9]\d{9}$/,
          message: 'Please enter valid mobile number'
        }]
      }
    }
    console.log(this.emailPasswordConfig);

  }
  back() {
   // this.triggerPrev.emit();
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
            // if (success.response.id === this.userId) {
            //   this.updateErr = true;
            // } else {
            //   this.err = true;
            // }   
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
        this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
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
          this.router.navigate(['otp'], navigationExtras);
          // if (this.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
          //   this.popOverCtrl.dismiss({ isEdited: true, value: this.userData.phone });
          // } else {
          //   this.popOverCtrl.dismiss({ isEdited: true, value: this.userData.email });
          // }
        })
        .catch(async (err) => {
          if (this.loader) {
            await this.loader.dismiss();
            this.loader = undefined;
          }
          if (err.hasOwnProperty(err) === 'UOS_OTPCRT0059') {
            this.commonUtilService.showToast('You have exceeded the maximum limit for OTP, Please try after some time');
          }
        });
    }
   // this.triggerNext.emit();

  onFormEmailPasswordChange(value: any) {
    console.log('onFormEmailPasswordChange')
    this.errorConfirmPassword = false;
    this.userData['contactInfo'] = value;
    this.userData['contactInfo']['type'] = this.contactType;
    if (value.confirmPassword && value.confirmPassword !== value.password) {this.errorConfirmPassword = true;}
    console.log(value)
  }
  statusChanges(event) {
    this.isFormValid = event.isValid;
  }

  redirectToLogin() {}

}
