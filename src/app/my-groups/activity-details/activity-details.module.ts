import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ActivityDetailsPage } from './activity-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { RouterLinks } from '@app/app/app.constant';
import { ActivityTocPage } from './../activity-toc/activity-toc.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityDetailsPage
  },
  {
    path: RouterLinks.ACTIVITY_TOC,
    component: ActivityTocPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    PipesModule
  ],
  declarations: [ActivityDetailsPage, ActivityTocPage]
})
export class ActivityDetailsPageModule {}
