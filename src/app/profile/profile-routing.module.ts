import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
    { path: '', component: ProfilePage },
    { path: RouterLinks.USER_AND_GROUPS, component: ProfilePage },
    { path: RouterLinks.GUEST_PROFILE, loadChildren: './guest-profile/guest-profile.module#GuestProfilePageModule' },
    { path: RouterLinks.GUEST_EDIT, loadChildren: './guest-edit/guest-edit.module#GuestEditPageModule' },
    { path: RouterLinks.PERSONAL_DETAILS_EDIT, loadChildren: './personal-details-edit/personal-details-edit.module#PersonalDetailsEditPageModule' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
