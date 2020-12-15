import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CategoryListPage } from './category-list-page.component';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '@app/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CategoryListPage
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
  declarations: [CategoryListPage]
})
export class CategoryListPageModule {}
