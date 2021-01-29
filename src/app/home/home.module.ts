import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';

import { IonicModule } from '@ionic/angular';

import { UserHomePage } from './user-home/user-home.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { AdminHomePage } from './admin-home/admin-home.page';
import {UserTypeGuard} from './user-type.guard';
import { CoreModule } from '../manage-learn/core/core.module';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'user',
        component: UserHomePage
      },
      {
        path: 'admin',
        component: AdminHomePage
      }
    ],
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
    PipesModule,
    CoreModule
  ],
  declarations: [HomePage, UserHomePage, AdminHomePage],
})
export class HomePageModule {}
