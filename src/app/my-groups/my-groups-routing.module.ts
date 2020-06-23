import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { MyGroupsPage } from './my-groups.page';

const routes: Routes = [
    { path: '', component: MyGroupsPage },
    {
        path: RouterLinks.CREATE_EDIT_GROUP,
        loadChildren: './create-edit-group/create-edit-group.module#CreateEditGroupPageModule'
    },
    {
        path: RouterLinks.MY_GROUP_DETAILS,
        loadChildren: './group-details/group-details.module#GroupDetailsPageModule'
    },
    {
        path: RouterLinks.ADD_MEMBER_TO_GROUP,
        loadChildren: './add-member-to-group/add-member-to-group.module#AddMemberToGroupPageModule'
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
