import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
    { path: '', component: ProfilePage, },
    { path: RouterLinks.GUEST_PROFILE, loadChildren: () => import('./guest-profile/guest-profile.module').then(m => m.GuestProfilePageModule) },
    { path: RouterLinks.GUEST_EDIT, loadChildren: () => import('./guest-edit/guest-edit.module').then(m => m.GuestEditPageModule) },
    { path: RouterLinks.PERSONAL_DETAILS_EDIT, loadChildren: () => import('./personal-details-edit/personal-details-edit.module').then(m => m.PersonalDetailsEditPageModule) },
    { path: RouterLinks.CATEGORIES_EDIT, loadChildren: () => import('./categories-edit/categories-edit.module').then(m => m.CategoriesEditPageModule) },
    { path: RouterLinks.SUB_PROFILE_EDIT, loadChildren: () => import('./sub-profile-edit/sub-profile-edit.module').then(m => m.SubProfileEditPageModule) },
    { path: RouterLinks.MANAGE_USER_PROFILES, loadChildren: () => import('./manage-user-profiles/manage-user-profiles.module').then(m => m.ManageUserProfilesPageModule) },
    {
        path: RouterLinks.SELF_DECLARED_TEACHER_EDIT + '/:mode' ,
        loadChildren: () => import('./self-declared-teacher-edit/self-declared-teacher-edit.module').then(m => m.SelfDeclaredTeacherEditPageModule)
    },
    {
        path: RouterLinks.FRAMEWORK_SELECTION,
        loadChildren: () => import('./framework-selection/framework-selection.module').then(m => m.FrameworkSelectionPageModule)
    },
    {
        path: RouterLinks.CERTIFICATE_VIEW,
        loadChildren: () => import('./certificate-view/certificate-view.module').then(m => m.CertificateViewPageModule)
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)

    ],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
