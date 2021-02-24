import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CategoryListPage } from './category-list-page';
import {CommonConsumptionModule} from '@project-sunbird/common-consumption';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '@app/app/components/components.module';
import {CommonFormElementsModule} from 'common-form-elements';
import { PipesModule } from '@app/pipes/pipes.module';

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
        ComponentsModule,
        CommonFormElementsModule,
        PipesModule
    ],
  declarations: [CategoryListPage]
})
export class CategoryListPageModule {}
