import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'profile-settings',
    component: ProfileSettingsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild()
  ],
  declarations: [
    ProfilePage,
    ProfileSettingsComponent
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePageModule {}
