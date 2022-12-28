
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { SignupService } from '../signup/signup.service'
import { v4 as uuid } from 'uuid'
@Component({
  selector: 'ws-login-otp',
  templateUrl: './login-otp.component.html',
  styleUrls: ['./login-otp.component.scss'],
})
export class LoginOtpComponent implements OnInit {
  [x: string]: any
  loginOtpForm: FormGroup
  @Input() signUpdata: any
  @Input() loginData: any
  @Output() redirectToParent = new EventEmitter()
  emailPhoneType: any = 'phone'
  loginVerification = false
  redirectUrl = ''
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService
  ) {
    this.loginOtpForm = this.fb.group({
      code: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    if (this.signUpdata || this.loginData) {
      let phone = this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username
      phone = phone.replace(/[^0-9+#]/g, '')
      if (phone.length >= 10) {
        this.emailPhoneType = 'phone'
      } else {
        this.emailPhoneType = 'email'
      }
    }
    if (window.location.href.includes('email-otp')) {
      this.emailPhoneType = 'email'
    }
    if (this.loginData) {
      this.loginVerification = true
    }

  }

  redirectToSignUp() {
    this.redirectToParent.emit('true')
  }

  redirectToMobileLogin() {
    this.redirectToParent.emit('true')
  }

  async verifyOtp() {
    let request: any = []
    let phone = this.signUpdata.value.emailOrMobile
    phone = phone.replace(/[^0-9+#]/g, '')
    // at least 10 in number
    if (phone.length >= 10) {
      request = {
        mobileNumber: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }

    } else if (/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
      this.signUpdata.value.emailOrMobile)) {
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }
    }
    this.signupService.validateOtp(request).subscribe(
      async (res: any) => {
        this.redirectUrl = document.baseURI + 'openid/keycloak'
        //   await this.signupService.fetchStartUpDetails()
        this.openSnackbar(res.message)
        // this.router.navigate(['app/login'], { queryParams: { source: 'register' } })
        const state = uuid()
        const nonce = uuid()
        sessionStorage.setItem('login-btn', 'clicked')
        const Keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(this.redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
        window.location.href = Keycloakurl
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.message)
      })
  }

  async loginVerifyOtp() {
    let request: any = []
    const username = this.loginData.value.username
    if (!username.includes('@')) {
      request = {
        mobileNumber: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }

    } else {
      request = {
        email: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userUUID: localStorage.getItem(`userUUID`),
      }
    }
    this.signupService.validateOtp(request).subscribe(
      async (res: any) => {
        this.openSnackbar(res.message)
        location.href = '/page/home'
        return res
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.message)
      })

  }

  resendOTP(emailPhoneType: string) {
    let requestBody
    if (emailPhoneType === 'email') {
      requestBody = {
        email: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    } else {
      requestBody = {
        mobileNumber: this.signUpdata ? this.signUpdata.value.emailOrMobile : this.loginData.value.username,
      }
    }
    this.signupService.generateOtp(requestBody).subscribe(
      (res: any) => {
        this.openSnackbar(res.message)
      },
      (err: any) => {
        this.openSnackbar(`OTP Error`, + err.error.message)
      }
    )
  }

  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
