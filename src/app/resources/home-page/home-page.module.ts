import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePagePage } from './home-page.page';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '@app/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: HomePagePage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CommonConsumptionModule,
        TranslateModule,
        ComponentsModule
    ],
  declarations: [HomePagePage]
})
export class HomePagePageModule {}
