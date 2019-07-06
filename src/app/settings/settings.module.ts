import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsPage } from './settings.page';
import { DataSyncComponent } from './data-sync/data-sync.component';
import { LanguageSettingsPage } from './language-settings/language-settings';
import { PermissionComponent } from './permission/permission.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AboutAppComponent } from './about-app/about-app.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';

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
  },
  {
    path: 'permission',
    component: PermissionComponent
  },
  {
    path: 'about-us',
    component: AboutUsComponent
  },
  {
    path: 'about-app',
    component: AboutAppComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-of-service',
    component: TermsOfServiceComponent
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
    LanguageSettingsPage,
    PermissionComponent,
    AboutUsComponent,
    AboutAppComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent
  ]
})
export class SettingsPageModule {}
