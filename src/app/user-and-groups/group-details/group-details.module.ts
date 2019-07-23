import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GroupDetailsPage } from './group-details.page';
import { TranslateModule } from '@ngx-translate/core';
import { GroupDetailNavPopover } from '../group-detail-nav-popover/group-detail-nav-popover';

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
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [GroupDetailsPage, GroupDetailNavPopover],
  entryComponents: [GroupDetailsPage, GroupDetailNavPopover],
  exports: [GroupDetailsPage]
})
export class GroupDetailsPageModule { }
