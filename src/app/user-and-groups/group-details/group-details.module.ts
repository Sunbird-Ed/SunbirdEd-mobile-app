import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GroupDetailsPage } from './group-details.page';

const routes: Routes = [
  {
    path: '',
    component: GroupDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GroupDetailsPage],
  entryComponents: [GroupDetailsPage],
  exports: [GroupDetailsPage]
})
export class GroupDetailsPageModule { }
