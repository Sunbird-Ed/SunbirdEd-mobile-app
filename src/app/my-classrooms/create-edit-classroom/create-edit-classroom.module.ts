import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { CreateEditClassroomPage } from './create-edit-classroom.page';

const routes: Routes = [
  {
    path: '',
    component: CreateEditClassroomPage
  }
];

@NgModule({
  declarations: [CreateEditClassroomPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  exports: [CreateEditClassroomPage]
})
export class CreateEditClassroomPageModule {}
