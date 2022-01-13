import { TextBookTocPage } from './textbook-toc/textbook-toc';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

import { CollectionDetailEtbPage } from './collection-detail-etb.page';
import { RouterLinks } from '../app.constant';

const routes: Routes = [
  {
    path: '',
    component: CollectionDetailEtbPage
  },
  {
    path: RouterLinks.TEXTBOOK_TOC,
    component: TextBookTocPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    ComponentsModule,
    CommonConsumptionModule,
    DirectivesModule,
    PipesModule
  ],
  providers: [],
  declarations: [CollectionDetailEtbPage, TextBookTocPage],
  exports: [
    CollectionDetailEtbPage,
    TextBookTocPage
  ]
})
export class CollectionDetailEtbPageModule {}
