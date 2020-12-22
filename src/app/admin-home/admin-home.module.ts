import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

import { IonicModule } from '@ionic/angular';

import { AdminHomePage } from './admin-home.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: AdminHomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [AdminHomePage]
})
export class AdminHomePageModule {}
