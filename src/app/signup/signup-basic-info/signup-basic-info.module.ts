import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupBasicInfoPage } from './signup-basic-info.page';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonFormElementsModule } from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: SignupBasicInfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PipesModule,
    CommonFormElementsModule
  ],
  declarations: [SignupBasicInfoPage]
})
export class SignupBasicInfoPageModule {}
