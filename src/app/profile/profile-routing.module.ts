import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
    { path: '', component: ProfilePage, },
    { path: RouterLinks.GUEST_PROFILE, loadChildren: './guest-profile/guest-profile.module#GuestProfilePageModule' },
    { path: RouterLinks.GUEST_EDIT, loadChildren: './guest-edit/guest-edit.module#GuestEditPageModule' },
    { path: RouterLinks.PERSONAL_DETAILS_EDIT, loadChildren: './personal-details-edit/personal-details-edit.module#PersonalDetailsEditPageModule' },
    { path: RouterLinks.CATEGORIES_EDIT, loadChildren: './categories-edit/categories-edit.module#CategoriesEditPageModule' },
    { path: RouterLinks.SUB_PROFILE_EDIT, loadChildren: './sub-profile-edit/sub-profile-edit.module#SubProfileEditPageModule' },
    { path: RouterLinks.MANAGE_USER_PROFILES, loadChildren: './manage-user-profiles/manage-user-profiles.module#ManageUserProfilesPageModule' },
    {
        path: RouterLinks.SELF_DECLARED_TEACHER_EDIT + '/:mode' ,
        loadChildren: './self-declared-teacher-edit/self-declared-teacher-edit.module#SelfDeclaredTeacherEditPageModule'
    },
    {
        path: RouterLinks.FRAMEWORK_SELECTION,
        loadChildren: './framework-selection/framework-selection.module#FrameworkSelectionPageModule'
    },
    {
        path: RouterLinks.CERTIFICATE_VIEW,
        loadChildren: './certificate-view/certificate-view.module#CertificateViewPageModule'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
