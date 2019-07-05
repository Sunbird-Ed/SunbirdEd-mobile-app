import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddOrRemoveGroupUserPage } from './add-or-remove-group-user.page';
import { TranslateModule } from '@ngx-translate/core';

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
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  entryComponents: [AddOrRemoveGroupUserPage],
  exports: [AddOrRemoveGroupUserPage]
})
export class AddOrRemoveGroupUserPageModule {}
