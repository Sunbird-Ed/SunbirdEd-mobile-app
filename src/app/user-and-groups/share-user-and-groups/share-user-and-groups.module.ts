import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ShareUserAndGroupsPage } from './share-user-and-groups.page';

const routes: Routes = [
  {
    path: '',
    component: ShareUserAndGroupsPage
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
  declarations: [ShareUserAndGroupsPage],
  entryComponents: [ShareUserAndGroupsPage],
  exports: [ShareUserAndGroupsPage]
})
export class ShareUserAndGroupsPageModule { }
