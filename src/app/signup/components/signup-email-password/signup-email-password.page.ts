import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FieldConfigValidationType } from '@app/app/components/common-forms/field-config';
import { CommonUtilService } from '@app/services';
import { FieldConfig } from 'common-form-elements-v9';
@Component({
  selector: 'app-signup-email-password',
  templateUrl: './signup-email-password.page.html',
  styleUrls: ['./signup-email-password.page.scss'],
})
export class SignUpEmailPasswordPage implements OnInit {

  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerPrev: EventEmitter<boolean> = new EventEmitter<boolean>();
  userData: any;
  contactType: string = 'phone';
  appName = "";
  emailPasswordConfig: FieldConfig<any>[] = [];
  isFormValid: boolean = false;
  errorConfirmPassword: boolean = false;
  constructor(private commonUtilService: CommonUtilService) { }

  ngOnInit() {
    this.contactType = 'phone';
    this.emailPasswordConfig = [
      {
        code: "phone",
        type: "input",
        templateOptions: {
          type: "tel",
          label: "",
          placeHolder: "Enter Mobile Number",
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
        },
        ]
      },
      {
        code: "password",
        type: "input",
        templateOptions: {
          type: "password",
          label: "Password",
          placeHolder: "Enter Password"
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter password'
        },
        // {
        //   type: FieldConfigValidationType.PATTERN,
        //   value: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~.,)(}{\\[!"#$%&\'()*+,-./:;<=>?@[^_`{|}~\\]])(?=\\S+$).{8,}',
        //   message: 'Please enter password'
        // },
        {
          type: FieldConfigValidationType.MINLENGTH,
          value: 8,
          message: 'Your password must contain a minimum of 8 characters.'
        }]
      },
      {
        code: "confirmPassword",
        type: "input",
        templateOptions: {
          type: "password",
          label: "Confirm Password",
          placeHolder: "Re-enter the password",
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
    if (this.contactType == 'email') {
      this.emailPasswordConfig[0] = {
        code: "email",
        type: "input",
        templateOptions: {
          type: "email",
          label: "",
          placeHolder: "Enter Email Address",
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter email address'
        }]
      }
    } else if (this.contactType == 'phone') {

      this.emailPasswordConfig[0] = {
        code: "phone",
        type: "input",
        templateOptions: {
          type: "tel",
          label: "",
          placeHolder: "Enter Mobile Number",
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
    this.triggerPrev.emit();
  }
  continue() {

    console.log(this.emailPasswordConfig);
    this.userData.contactType = this.contactType
    this.subformInitialized.emit(this.userData);
    this.triggerNext.emit();
  }
  onFormEmailPasswordChange(value: any) {
    console.log('onFormEmailPasswordChange')
    this.errorConfirmPassword = false;
    this.userData = value;
    if (value.confirmPassword && value.confirmPassword != value.password) this.errorConfirmPassword = true;

    console.log(value)
  }
  statusChanges(event) {
    this.isFormValid = event.isValid;
  }

}
