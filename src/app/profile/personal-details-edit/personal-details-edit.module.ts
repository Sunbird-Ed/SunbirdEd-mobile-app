import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PersonalDetailsEditPage } from './personal-details-edit.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalDetailsEditPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PersonalDetailsEditPage]
})
export class PersonalDetailsEditPageModule {}
