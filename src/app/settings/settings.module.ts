import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsPage } from './settings.page';
import { DataSyncComponent } from './data-sync/data-sync.component';
import { LanguageSettingsPage } from './language-settings/language-settings';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },
  {
    path: 'data-sync',
    component: DataSyncComponent
  },
  {
    path: 'language-setting/:isFromSettings',
    component: LanguageSettingsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    SettingsPage,
    DataSyncComponent,
    LanguageSettingsPage
  ]
})
export class SettingsPageModule {}
