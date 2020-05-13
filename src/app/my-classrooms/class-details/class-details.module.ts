import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ClassDetailsPage } from './class-details.page';

const routes: Routes = [
  {
    path: '',
    component: ClassDetailsPage
  }
];

@NgModule({
  declarations: [ClassDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  exports: [ClassDetailsPage]
})
export class ClassDetailsPageModule {}
