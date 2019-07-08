import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { RouterLinks } from './app.constant';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  {
    path: 'user-type-selection',
    loadChildren: './user-type-selection/user-type-selection.module#UserTypeSelectionPageModule'
  },
  { path: RouterLinks.USER_AND_GROUPS, loadChildren: './user-and-groups/user-and-groups.module#UserAndGroupsPageModule' },
  {
    path: 'resources',
    loadChildren: './resources/resources.module#ResourcesModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'view-more-activity', loadChildren: './view-more-activity/view-more-activity.module#ViewMoreActivityModule'
  },
  {
    path: 'tabs',
    loadChildren: './tabs/tabs.module#TabsPageModule'
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsPageModule'
  },
  // migration-TODO to be deleted
  { path: 'download-manager', loadChildren: './download-manager/download-manager.module#DownloadManagerPageModule' },
  { path: 'storage-settings', loadChildren: './storage-settings/storage-settings.module#StorageSettingsPageModule' },
  { path: 'courses', loadChildren: './courses/courses.module#CoursesPageModule' },
  { path: 'search', loadChildren: './search/search.module#SearchPageModule' },
  { path: RouterLinks.PROFILE, loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'active-downloads', loadChildren: './active-downloads/active-downloads.module#ActiveDownloadsPageModule' },
  { path: 'course-batches', loadChildren: './course-batches/course-batches.module#CourseBatchesPageModule' },
  { path: 'enrolled-course-details-page', loadChildren:
   './enrolled-course-details-page/enrolled-course-details-page.module#EnrolledCourseDetailsPagePageModule' },
  { path: 'profile-settings', loadChildren: './profile-settings/profile-settings.module#ProfileSettingsPageModule' },
  { path: 'qrscanner-alert', loadChildren: './qrscanner-alert/qrscanner-alert.module#QrscannerAlertPageModule' },
  { path: 'course-batches', loadChildren: './course-batches/course-batches.module#CourseBatchesPageModule' },
  { path: 'collection-detail-etb', loadChildren: './collection-detail-etb/collection-detail-etb.module#CollectionDetailEtbPageModule' },
  { path: 'enrollment-details-page', loadChildren:
   './enrolled-course-details-page/enrollment-details-page/enrollment-details-page.module#EnrollmentDetailsPagePageModule' },
  { path: 'collection-details', loadChildren: './collection-details/collection-details.module#CollectionDetailsPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [AuthGuardService],
})
export class AppRoutingModule { }
