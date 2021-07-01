import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { IonicModule } from '@ionic/angular';
import { UserHomePage } from './user-home/user-home.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { AdminHomePage } from './admin-home/admin-home.page';
import { CoreModule } from '../manage-learn/core/core.module';
import { UserTypeGuard } from './user-type.guard';
import { ComponentsModule } from '@app/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    children: [],
    pathMatch: 'full',
    canActivate: [UserTypeGuard]
  },
  {
    path: 'user',
    component: UserHomePage
  },
  {
    path: 'admin',
    component: AdminHomePage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    CoreModule
  ],
  declarations: [UserHomePage, AdminHomePage],
  providers: [UserTypeGuard]
})
export class HomePageModule {}
