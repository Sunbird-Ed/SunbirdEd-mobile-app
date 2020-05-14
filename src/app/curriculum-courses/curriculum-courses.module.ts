import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CurriculumCoursesPage } from './curriculum-courses.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

const routes: Routes = [
  {
    path: '',
    component: CurriculumCoursesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CurriculumCoursesPage]
})
export class CurriculumCoursesPageModule {}
