import { Component, ContentChild, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { IonInput } from '@ionic/angular';
import { LanguageDialogComponent } from '../language-dialog/language-dialog.component';
import { mustMatch } from '../password-validator';
import { SignupService } from '../signup/signup.service';

@Component({
  selector: 'ws-aastrika-signup',
  templateUrl: './aastrika-signup.page.html',
  styleUrls: ['./aastrika-signup.page.scss'],
})
export class AastrikaSignupPage implements OnInit {
  uploadSaveData = false
  showPassword1 = false;
  showPassword2 = false;
  eyeoff = "assets/imgs/eye-off.svg";
  languageIcon = '../../../fusion-assets/images/lang-icon.png'
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  emailOrMobile: any
  phone = false
  email: any
  showAllFields = true
  isMobile = false
  isOtpValid = false
  emailPhoneType: any
  otpPage = false
  languageDialog = false
  createAccountForm: FormGroup
  otpCodeForm: FormGroup
  hide1 = true
  hide2 = true
  iconChange1 = 'fa fa-eye-slash'
  iconChange2 = 'fa fa-eye-slash'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  constructor(
    private spherFormBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
    public dialog: MatDialog
  ) {
    // this.spherFormBuilder = spherFormBuilder
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
    localStorage.removeItem(`userUUID`)
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.router.navigate([`/${RouterLinks.HOME}/user`]);
    //window.location.href = '/public/home'
  }
  toggleShow1() {
    this.hide1 = !this.hide1;
    this.showPassword1 = !this.showPassword1;
  }
  toggleShow2() {
    this.hide2 = !this.hide2
    this.showPassword2 = !this.showPassword2;
  }

  
  initializeFormFields() {
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new FormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
      password: new FormControl('', [Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') })

    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new FormControl('', [Validators.required]),
    })
  }

  showParentForm(event: any) {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  ngOnInit() {
  }

  onSubmit(form: any) {
    sessionStorage.setItem('login-btn', 'clicked')
    let phone = this.createAccountForm.controls.emailOrMobile.value
    // const validphone = /^[6-9]\d{9}$/.test(phone)
    phone = phone.replace(/[^0-9+#]/g, '')
    if (phone.length >= 10) {
      // this.otpPage = true
      this.isMobile = true
      this.emailPhoneType = 'phone'
      this.email = false
      // Call OTP Api, show resend Button true
    } else {
      // this.otpPage = true
      this.email = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
        this.createAccountForm.controls.emailOrMobile.value
      )
      this.emailPhoneType = 'email'
    }
    this.uploadSaveData = true
    let reqObj
    if (this.email) {
      reqObj = {
        firstName: form.value.firstname.trim(),
        lastName: form.value.lastname.trim(),
        email: form.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      this.signupService.signup(reqObj).subscribe(res => {
        if (res.status) {
          this.openSnackbar(res.msg)
          // this.generateOtp('email', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          // form.reset()
          localStorage.setItem(`preferedLanguage`, this.preferedLanguage.id)
          localStorage.setItem(`userUUID`, res.userUUId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
        err => {
          this.openSnackbar(err.error.msg)
          this.uploadSaveData = false
          // form.reset()
        }
      )
    } else {
      const requestBody = {
        firstName: form.value.firstname.trim(),
        lastName: form.value.lastname.trim(),
        phone: form.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      this.signupService.registerWithMobile(requestBody).subscribe((res: any) => {
        if (res.status === 'success') {
          this.openSnackbar(res.msg)
          // this.generateOtp('phone', form.value.emailOrMobile)
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          // form.reset()
          localStorage.setItem(`preferedLanguage`, this.preferedLanguage.id)
          localStorage.setItem(`userUUID`, res.userUUId)
        } else if (res.status === 'error') {
          this.openSnackbar(res.msg)
        }
      },
        err => {
          this.openSnackbar(err.error.msg)
          this.uploadSaveData = false
        }
      )
    }
  }
  eventTrigger(p1: string, p2: string) {
    let obj = {
      EventDetails: {
        EventName: p1,
        Name: p2
      }
    }
    // @ts-ignore: Unreachable code error
    const userdata = Object.assign(MainVisitorDetails, obj)
    this.signupService.plumb5SendEvent(userdata).subscribe((res: any) => {
      // @ts-ignore: Unreachable code error
      console.log(res)
    })
  }

  gotoHome() {
    /* this.router.navigate(['/page/home'])
      .then(() => {
        window.location.reload()
      }) */
      this.router.navigate([`/${RouterLinks.HOME}/user`]);
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  changeLanguage() {
    this.langDialog = this.dialog.open(LanguageDialogComponent, {
      panelClass: 'language-modal',
      data: {
        selected: this.preferedLanguage,
      },
    })
    this.langDialog.afterClosed().subscribe((result: any) => {
      this.preferedLanguage = result
    })
  }
}