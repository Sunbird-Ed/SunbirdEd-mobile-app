import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QrcoderesultPage } from './qrcoderesult.page';
import { DirectivesModule } from '@app/directives/directives.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { TextbookTocService } from '../collection-detail-etb/textbook-toc-service';

const routes: Routes = [
  {
    path: '',
    component: QrcoderesultPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    ComponentsModule,
    DirectivesModule
  ],
  providers: [],
  declarations: [QrcoderesultPage],
  exports: [
    QrcoderesultPage
  ]
})
export class QrcoderesultPageModule {}
