import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GuestProfilePage } from './guest-profile.page';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/app/components/components.module';
import { RouterLinks } from '@app/app/app.constant';
import { GuestEditPage } from '../guest-edit/guest-edit.page';


const routes: Routes = [
  {
    path: '', component: GuestProfilePage,
   /*  children: [
      {
        path: RouterLinks.GUEST_EDIT,
        children: [
          {
            path: '',
            loadChildren: '../guest-edit/guest-edit.module#GuestEditPageModule'
          }
        ]
      }] */
    /* children: [
      { path: RouterLinks.GUEST_EDIT, loadChildren: '../guest-edit/guest-edit.module#GuestEditPageModule' },
    ] */
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule
  ],
  declarations: [GuestProfilePage]
})
export class GuestProfilePageModule { }
