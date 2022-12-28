import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material';
import { LoginOtpComponent } from './login-otp.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ],
  declarations: [LoginOtpComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [LoginOtpComponent]   
})
export class LoginOtpComponentModule {}
