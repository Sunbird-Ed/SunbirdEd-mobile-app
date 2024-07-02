import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ManageUserProfilesPage } from './manage-user-profiles.page';
import { TranslateModule } from '@ngx-translate/core';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { PipesModule } from '../../../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ManageUserProfilesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CommonConsumptionModule,
    PipesModule
  ],
  declarations: [ManageUserProfilesPage]
})
export class ManageUserProfilesPageModule {}
