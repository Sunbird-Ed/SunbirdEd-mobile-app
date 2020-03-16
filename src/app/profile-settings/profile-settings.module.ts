import { DirectivesModule } from './../../directives/directives.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfileSettingsPage } from './profile-settings.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ProfileSettingsPage
  }
];

@NgModule({
  imports: [
    DirectivesModule,
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProfileSettingsPage]
})
export class ProfileSettingsPageModule {}
