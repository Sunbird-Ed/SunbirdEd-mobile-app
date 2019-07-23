import { AddOrRemoveGroupUserPageModule } from './add-or-remove-group-user/add-or-remove-group-user.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UserAndGroupsPage } from './user-and-groups.page';
import { TranslateModule } from '@ngx-translate/core';
import { UserAndGroupsRoutingModule } from './user-and-groups-routing.module';
import { CreateGroupPageModule } from './create-group/create-group.module';
import { GroupDetailsPageModule } from './group-details/group-details.module';
import { GroupMembersPageModule } from './group-members/group-members.module';
import { ShareUserAndGroupsPageModule } from './share-user-and-groups/share-user-and-groups.module';
import { EditDeletePopoverComponent } from './edit-delete-popover/edit-delete-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    // AddOrRemoveGroupUserPageModule,
    // CreateGroupPageModule,
    // GroupDetailsPageModule,
    // GroupMembersPageModule,
    // ShareUserAndGroupsPageModule,
    UserAndGroupsRoutingModule
  ],
  exports: [
    EditDeletePopoverComponent
  ],
  declarations: [
    UserAndGroupsPage,
    EditDeletePopoverComponent
  ],
  entryComponents: [
    EditDeletePopoverComponent
  ]
})
export class UserAndGroupsPageModule { }
