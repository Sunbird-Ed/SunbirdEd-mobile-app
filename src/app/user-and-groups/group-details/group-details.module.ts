import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GroupDetailsPage } from './group-details.page';
import { TranslateModule } from '@ngx-translate/core';
import { EditDeletePopoverComponent } from '../edit-delete-popover/edit-delete-popover.component';
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
  declarations: [GroupDetailsPage, EditDeletePopoverComponent, GroupDetailNavPopover],
  entryComponents: [GroupDetailsPage, EditDeletePopoverComponent, GroupDetailNavPopover],
  exports: [GroupDetailsPage]
})
export class GroupDetailsPageModule { }
