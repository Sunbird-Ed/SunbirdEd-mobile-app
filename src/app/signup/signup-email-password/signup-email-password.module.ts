import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupEmailPasswordPage } from './signup-email-password.page';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonFormElementsModule } from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: SignupEmailPasswordPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CommonFormElementsModule

  ],
  declarations: [SignupEmailPasswordPage]
})
export class SignupEmailPasswordPageModule {}
