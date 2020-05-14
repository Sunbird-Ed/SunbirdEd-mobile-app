import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CurriculumCourseDetailsPage } from './curriculum-course-details.page';

const routes: Routes = [
  {
    path: '',
    component: CurriculumCourseDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CurriculumCourseDetailsPage]
})
export class CurriculumCourseDetailsPageModule {}
