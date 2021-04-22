import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { FrameworkSelectionPage } from './framework-selection.page';
import { CommonFormElementsModule } from 'common-form-elements';

const routes: Routes = [
  {
    path: '',
    component: FrameworkSelectionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CommonFormElementsModule
  ],
  declarations: [FrameworkSelectionPage]
})
export class FrameworkSelectionPageModule {}
