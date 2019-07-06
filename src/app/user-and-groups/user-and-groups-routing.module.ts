import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UserAndGroupsPage } from './user-and-groups.page';

const routes: Routes = [
    { path: '', component: UserAndGroupsPage },
    { path: 'user-and-groups', component: UserAndGroupsPage },
    { path: 'add-or-remove-group-user', loadChildren: './add-or-remove-group-user/add-or-remove-group-user.module#AddOrRemoveGroupUserPageModule' },
    { path: 'group-details.', loadChildren: './group-details/group-details.module#GroupDetailsPageModule' },
    { path: 'group-details', loadChildren: './group-details/group-details.module#GroupDetailsPageModule' },
    { path: 'create-group', loadChildren: './create-group/create-group.module#CreateGroupPageModule' },
    { path: 'group-members', loadChildren: './group-members/group-members.module#GroupMembersPageModule' },
    { path: 'share-user-and-groups', loadChildren: './share-user-and-groups/share-user-and-groups.module#ShareUserAndGroupsPageModule' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class UserAndGroupsRoutingModule { }
