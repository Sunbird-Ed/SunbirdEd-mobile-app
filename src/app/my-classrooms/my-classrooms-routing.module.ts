import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RouterLinks } from '../app.constant';
import { MyClassroomsPage } from './my-classrooms.page';

const routes: Routes = [
    { path: '', component: MyClassroomsPage },
    {
        path: RouterLinks.CREATE_EDIT_CLASSROOM,
        loadChildren: './create-edit-classroom/create-edit-classroom.module#CreateEditClassroomPageModule'
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
export class MyClassroomsRoutingModule { }
