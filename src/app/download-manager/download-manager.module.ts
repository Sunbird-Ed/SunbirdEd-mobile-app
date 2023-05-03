import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

import { DownloadManagerPage } from './download-manager.page';
import { NoDownloadsComponent } from './no-downloads/no-downloads.component';
import { DownloadsTabComponent } from './downloads-tab/downloads-tab.component';
import { DownloadsHeaderComponent } from './downloads-tab/downloads-header/downloads-header.component';
import { RouterLinks } from '../app.constant';
import { ComponentsModule } from '../components/components.module';



const routes: Routes = [
  {
    path: '',
    component: DownloadManagerPage
  },
  {
    path: RouterLinks.NO_DOWNLOADS,
    component: NoDownloadsComponent
  },
  {
    path: RouterLinks.DOWNLOADS_TAB,
    component: DownloadsTabComponent
  },
  {
    path: RouterLinks.DOWNLOADS_HEADER,
    component: DownloadsHeaderComponent
  },
  { path: RouterLinks.STORAGE_SETTINGS, loadChildren: () => import('../storage-settings/storage-settings.module').then(m => m.StorageSettingsPageModule) }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        PipesModule,
        DirectivesModule,
        ComponentsModule
    ],
    declarations: [DownloadManagerPage,
        NoDownloadsComponent, DownloadsTabComponent, DownloadsHeaderComponent]
})
export class DownloadManagerPageModule { }
