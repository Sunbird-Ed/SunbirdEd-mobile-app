import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AppGlobalService, CommonUtilService } from '@app/services';
import { ProfileService } from 'sunbird-sdk';
import { RouterLinks } from '../../app.constant';

@Component({
  selector: 'app-signup-basic-info',
  templateUrl: './signup-basic-info.page.html',
  styleUrls: ['./signup-basic-info.page.scss'],
})
export class SignupBasicInfoPage implements OnInit {
  birthYearOptions = [];
  date: any = new Date().toISOString();
  currentYear: any = (new Date()).getFullYear();
  personalInfoForm: FormGroup;
  btnColor = '#8FC4FF';
  appName = "";

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService
  ) {
    this.initializeForm();
  }

  async ngOnInit() {
    this.appName = await this.commonUtilService.getAppName();
    this.initiateYearSelecter();
  }

  async continue() {
    const req = {
      userId: this.appGlobalService.getCurrentUser().uid,
      name: this.personalInfoForm.value.name,
      dob: this.personalInfoForm.value.dob
    };
    const navigationExtras: NavigationExtras = {
      state: {
        isGoogleSignIn: true,
        userData: {
          name: this.personalInfoForm.value.name,
          dob: this.personalInfoForm.value.dob,
          isMinor: (new Date().getFullYear() - this.personalInfoForm.value.dob) < 18
        }
      }
    };
    await this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
  }

  initiateYearSelecter() {
    const endYear = new Date().getFullYear();
    for (let year = endYear; year > 1921; year--) {
      this.birthYearOptions.push(year);
    }
  }

  initializeForm() {
    this.personalInfoForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required]
    });
  }

  redirectToLogin() {
    this.router.navigate([RouterLinks.SIGN_IN]);
  }
}
