import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

export enum SignUpStage {
  BASIC_INFO = 'basic_info',
  ONBOARDING_INFO = 'onboarding_info',
  EMAIL_PASSWORD = 'email_password',
  OTP = 'otp'
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  Stage: SignUpStage;
  signUpStage = SignUpStage;
  signUpForm;
  datapass = 'google';
  constructor(private router: Router) { }

  ngOnInit() {
    this.Stage = SignUpStage.BASIC_INFO;
    this.formInit();
  }
  formInit() {
    this.signUpForm = {
      basicInfo: null,
      onboardInfo: null,
      emailPassInfo: null,
      otp: null
    }
  }
  submitForm(name: string, data: object) {
    this.signUpForm[name] = data;
    console.log(this.signUpForm)

  }
  nextStage() {
    switch (this.Stage) {
      case this.signUpStage.BASIC_INFO:
        this.Stage = this.signUpStage.ONBOARDING_INFO;
        break;
      case this.signUpStage.ONBOARDING_INFO:
        this.Stage = this.signUpStage.EMAIL_PASSWORD;
        break;
      case this.signUpStage.EMAIL_PASSWORD:
        this.Stage = this.signUpStage.OTP;
        break;
      case this.signUpStage.OTP:
        this.formCompleted();
        break;
      default:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
    }
  }
  formCompleted() {
    console.log('form completed ', this.signUpForm);

  }
  prevStage() {
    switch (this.Stage) {
      case this.signUpStage.ONBOARDING_INFO:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
      case this.signUpStage.EMAIL_PASSWORD:
        this.Stage = this.signUpStage.ONBOARDING_INFO;
        break;
      case this.signUpStage.OTP:
        this.Stage = this.signUpStage.EMAIL_PASSWORD;
        break;
      default:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
    }
  }
  gotoLogin() {
    this.router.navigateByUrl(RouterLinks.LOGIN);
  }
}
