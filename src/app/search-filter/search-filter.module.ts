import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SearchFilterPage } from './search-filter.page';
import {CommonFormElementsModule} from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: SearchFilterPage
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
  declarations: [SearchFilterPage]
})
export class SearchFilterPageModule {}
