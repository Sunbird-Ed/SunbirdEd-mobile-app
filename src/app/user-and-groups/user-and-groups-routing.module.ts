import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UserAndGroupsPage } from './user-and-groups.page';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
    { path: '', component: UserAndGroupsPage },
    { path: RouterLinks.USER_AND_GROUPS, component: UserAndGroupsPage },
    { path: RouterLinks.ADD_OR_REMOVE_GROUP_USER, loadChildren: './add-or-remove-group-user/add-or-remove-group-user.module#AddOrRemoveGroupUserPageModule' },
    { path: RouterLinks.GROUP_DETAILS, loadChildren: './group-details/group-details.module#GroupDetailsPageModule' },
    { path: RouterLinks.CREATE_GROUP, loadChildren: './create-group/create-group.module#CreateGroupPageModule' },
    { path: RouterLinks.GROUP_MEMBERS, loadChildren: './group-members/group-members.module#GroupMembersPageModule' },
    { path: RouterLinks.SHARE_USER_AND_GROUPS, loadChildren: './share-user-and-groups/share-user-and-groups.module#ShareUserAndGroupsPageModule' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class UserAndGroupsRoutingModule { }
