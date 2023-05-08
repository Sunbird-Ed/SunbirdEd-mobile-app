import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { SelfDeclaredTeacherEditPage } from './self-declared-teacher-edit.page';
import { ComponentsModule } from '../../../app/components/components.module';
import { CommonFormElementsModule } from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: SelfDeclaredTeacherEditPage
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
    ComponentsModule,
    CommonFormElementsModule
  ],
  declarations: [SelfDeclaredTeacherEditPage]
})
export class SelfDeclaredTeacherEditPageModule {}
