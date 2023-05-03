import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CoursesPage } from './courses.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';
import { ComponentsModule } from '../components/components.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

const routes: Routes = [
  {
    path: '',
    component: CoursesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    DirectivesModule,
    ComponentsModule,
    CommonConsumptionModule
  ],
  declarations: [CoursesPage]
})
export class CoursesPageModule {}
