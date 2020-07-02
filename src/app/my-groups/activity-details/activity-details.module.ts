import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ActivityDetailsPage } from './activity-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ActivityDetailsPage
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
  declarations: [ActivityDetailsPage]
})
export class ActivityDetailsPageModule {}
