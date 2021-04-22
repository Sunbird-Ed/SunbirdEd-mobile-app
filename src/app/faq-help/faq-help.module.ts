import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FaqHelpPage } from './faq-help.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';

const routes: Routes = [
  {
    path: '',
    component: FaqHelpPage
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
  declarations: [FaqHelpPage]
})
export class FaqHelpPageModule {}
