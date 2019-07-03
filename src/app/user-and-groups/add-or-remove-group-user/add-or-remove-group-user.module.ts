import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddOrRemoveGroupUserPage } from './add-or-remove-group-user.page';

const routes: Routes = [
  {
    path: '',
    component: AddOrRemoveGroupUserPage
  }
];

@NgModule({
  declarations: [AddOrRemoveGroupUserPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [AddOrRemoveGroupUserPage],
  exports: [AddOrRemoveGroupUserPage]
})
export class AddOrRemoveGroupUserPageModule {}
