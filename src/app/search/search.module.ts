import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SearchPage } from './search.page';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { EnrollmentDetailsPage } from '../enrolled-course-details-page/enrollment-details-page/enrollment-details-page';


const routes: Routes = [
  {
    path: '',
    component: SearchPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    DirectivesModule,
    ComponentsModule,
  ],
  entryComponents:[EnrollmentDetailsPage],
  declarations: [SearchPage , EnrollmentDetailsPage],

})
export class SearchPageModule {}
