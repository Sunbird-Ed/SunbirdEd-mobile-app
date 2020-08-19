import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserAndGroupsPage } from './user-and-groups.page';
import { TranslateModule } from '@ngx-translate/core';
import { UserAndGroupsRoutingModule } from './user-and-groups-routing.module';
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
