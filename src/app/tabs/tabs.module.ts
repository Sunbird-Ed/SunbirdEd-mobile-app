import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: RouterLinks.RESOURCES,
        children: [
          {
            path: '',
            loadChildren: '../resources/resources.module#ResourcesModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'resources',
        pathMatch: 'full'
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
  declarations: [TabsPage]
})
export class TabsPageModule {}
