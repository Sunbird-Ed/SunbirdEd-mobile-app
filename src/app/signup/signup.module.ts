import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SignUpRoutingModule } from './signup-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SignupPage } from './components/signup/signup.page';
import { SignupBasicInfoComponent } from './components/signup-basic-info/signup-basic-info.component';
import { SignupOnboardingInfoPage } from './components/signup-onboarding-info/signup-onboarding-info.page';
// import { SignupEmailPasswordComponent } from './components/signup-email-password-old/signup-email-password.component';
import { CommonFormElementsModule } from 'common-form-elements-v9';
import { SignUpEmailPasswordPage } from './components/signup-email-password/signup-email-password.page';
import { OtpPage } from './components/otp/otp.page';
import { DistrictMappingPage } from '../district-mapping/district-mapping.page';
import { DistrictMappingPageModule } from '../district-mapping/district-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignUpRoutingModule,
    TranslateModule,
    CommonFormElementsModule,
    DistrictMappingPageModule
  ],
  declarations: [SignupPage, SignupBasicInfoComponent, SignupOnboardingInfoPage, SignUpEmailPasswordPage, OtpPage]
})
export class SignUpModule { }
