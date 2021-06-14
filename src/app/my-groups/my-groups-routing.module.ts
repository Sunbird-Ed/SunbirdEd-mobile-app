import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { MyGroupsPage } from './my-groups.page';

const routes: Routes = [
    { path: '', component: MyGroupsPage },
    {
        path: RouterLinks.CREATE_EDIT_GROUP,
        loadChildren: () => import('./create-edit-group/create-edit-group.module').then(m => m.CreateEditGroupPageModule)
    },
    {
        path: RouterLinks.MY_GROUP_DETAILS,
        loadChildren: () => import('./group-details/group-details.module').then(m => m.GroupDetailsPageModule)
    },
    {
        path: RouterLinks.ADD_MEMBER_TO_GROUP,
        loadChildren: () => import('./add-member-to-group/add-member-to-group.module').then(m => m.AddMemberToGroupPageModule)
    },
    {
        path: RouterLinks.ACTIVITY_DETAILS,
        loadChildren: () => import('./activity-details/activity-details.module').then(m => m.ActivityDetailsPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class MyGroupsRoutingModule { }
