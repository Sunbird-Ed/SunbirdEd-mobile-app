import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ActivityDetailsPage } from './activity-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../../pipes/pipes.module';
import { RouterLinks } from '../../../app/app.constant';
import { ActivityTocPage } from './../activity-toc/activity-toc.page';
import { ActivityDashboardPage } from '../activity-dashboard/activity-dashboard.page';
import { ComponentsModule } from '../../../app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ActivityDetailsPage
  },
  {
    path: RouterLinks.ACTIVITY_TOC,
    component: ActivityTocPage
  },
  {
    path: RouterLinks.ACTIVITY_DASHBOARD,
    component: ActivityDashboardPage
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
    PipesModule,
    ComponentsModule
  ],
  declarations: [ActivityDetailsPage, ActivityTocPage, ActivityDashboardPage]
})
export class ActivityDetailsPageModule {}
