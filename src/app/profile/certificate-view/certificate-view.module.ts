import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { CertificateViewPage } from './certificate-view.page';

const routes: Routes = [
  {
    path: '',
    component: CertificateViewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [CertificateViewPage]
})
export class CertificateViewPageModule {}
