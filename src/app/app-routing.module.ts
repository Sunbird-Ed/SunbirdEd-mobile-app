import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/services/auth-guard.service';
import { RouterLinks } from './app.constant';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
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
    path: 'language-settings/:isFromSettings',
    loadChildren: './language-settings/language-settings.module#LanguageSettingsPageModule'
  },
  {
    path: 'user-type-selection/:isChangeRoleRequest',
    loadChildren: './user-type-selection/user-type-selection.module#UserTypeSelectionPageModule'
  },
  {
    path: 'user-type-selection/:isChangeRoleRequest',
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
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  // migration-TODO to be deleted
  { path: 'download-manager', loadChildren: './download-manager/download-manager.module#DownloadManagerPageModule' },
  { path: 'storage-settings', loadChildren: './storage-settings/storage-settings.module#StorageSettingsPageModule' },
  { path: RouterLinks.PROFILE, loadChildren: './profile/profile.module#ProfilePageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [AuthGuardService],
})
export class AppRoutingModule { }
