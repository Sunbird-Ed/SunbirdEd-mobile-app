import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GroupMembersPage } from './group-members.page';

const routes: Routes = [
  {
    path: '',
    component: GroupMembersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GroupMembersPage],
  entryComponents: [GroupMembersPage],
  exports: [GroupMembersPage]
})
export class GroupMembersPageModule {}
