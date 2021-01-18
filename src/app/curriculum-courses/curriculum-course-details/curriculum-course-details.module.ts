import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CurriculumCourseDetailsPage } from './curriculum-course-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/app/components/components.module';

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
    CommonConsumptionModule,
    ComponentsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
  ],
  declarations: [CurriculumCourseDetailsPage]
})
export class CurriculumCourseDetailsPageModule {}
