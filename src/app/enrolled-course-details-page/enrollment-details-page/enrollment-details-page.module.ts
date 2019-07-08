import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EnrollmentDetailsPage } from './enrollment-details-page';

const routes: Routes = [
  {
    path: '',
    component: EnrollmentDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EnrollmentDetailsPage]
})
export class EnrollmentDetailsPagePageModule {}
