import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLinks } from '../app.constant';
import { UserTypeSpecificTabGuard } from './usertype-specific-tab.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: RouterLinks.HOME,
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: RouterLinks.SEARCH,
        children: [
          {
            path: '',
            loadChildren: () => import('../search/search.module').then(m => m.SearchPageModule)
          }
        ]
      },
      {
        path: RouterLinks.RESOURCES,
        canActivate: [UserTypeSpecificTabGuard],
        children: [
          {
            path: '',
            loadChildren: () => import('../resources/resources.module').then(m => m.ResourcesModule)
          }
        ]
      },
      {
        path: RouterLinks.COURSES,
        children: [
          {
            path: '',
            loadChildren: () => import('../courses/courses.module').then(m => m.CoursesPageModule)
          }
        ]
      },
      {
        path: RouterLinks.GUEST_PROFILE,
        children: [
          {
            path: '',
            loadChildren: () => import('../profile/guest-profile/guest-profile.module').then(m => m.GuestProfilePageModule)
          }
        ]
      },
      {
        path: RouterLinks.PROFILE,
        children: [
          {
            path: '',
            loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: RouterLinks.DOWNLOAD_MANAGER,
        children: [
          {
            path: '',
            loadChildren: () => import('../download-manager/download-manager.module').then(m => m.DownloadManagerPageModule)
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [TabsPage],
  providers: [UserTypeSpecificTabGuard]
})
export class TabsPageModule { }
