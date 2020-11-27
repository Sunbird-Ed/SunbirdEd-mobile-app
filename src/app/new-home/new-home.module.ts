import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

import { IonicModule } from '@ionic/angular';

import { NewHomePage } from './new-home.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: NewHomePage
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
  ],
  declarations: [NewHomePage]
})
export class NewHomePageModule {}
