import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPage } from './settings.page';
import { DataSyncComponent } from './data-sync/data-sync.component';
import { PermissionComponent } from './permission/permission.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
  { path: '', component: SettingsPage },
  { path: RouterLinks.DATA_SYNC, component: DataSyncComponent },
  { path: RouterLinks.PERMISSION, component: PermissionComponent },
  { path: RouterLinks.ABOUT_US, component: AboutUsComponent }
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
    PermissionComponent,
    AboutUsComponent
  ]
})
export class SettingsPageModule { }
