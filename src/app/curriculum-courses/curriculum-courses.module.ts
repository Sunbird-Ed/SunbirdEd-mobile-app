import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CurriculumCoursesPage } from './curriculum-courses.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [CurriculumCoursesPage]
})
export class CurriculumCoursesPageModule {}
