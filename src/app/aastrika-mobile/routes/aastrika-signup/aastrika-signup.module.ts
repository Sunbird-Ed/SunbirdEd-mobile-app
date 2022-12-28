import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AastrikaSignupPageRoutingModule } from './aastrika-signup-routing.module';

import { AastrikaSignupPage } from './aastrika-signup.page';
import { MatDialogModule, MatDialogRef, MatFormFieldModule } from '@angular/material';
import { LoginOtpComponentModule } from '../login-otp/login-otp.module';
import { HeaderComponentModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AastrikaSignupPageRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    LoginOtpComponentModule,
    HeaderComponentModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {}
    }
 ],
  declarations: [AastrikaSignupPage]
})
export class AastrikaSignupPageModule {}
