import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FilterFormPagePage } from './filter-form-page.page';
import {CommonFormElementsModule} from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: FilterFormPagePage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CommonFormElementsModule
    ],
  declarations: [FilterFormPagePage]
})
export class FilterFormPagePageModule {}
