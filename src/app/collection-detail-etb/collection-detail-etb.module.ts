import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageLoader } from 'ionic-image-loader';
import { IonicRatingModule } from 'ionic4-rating';

import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';

import { CollectionDetailEtbPage } from './collection-detail-etb.page';




const routes: Routes = [
  {
    path: '',
    component: CollectionDetailEtbPage
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
    IonicImageLoader,
    DirectivesModule,
    IonicRatingModule,
    PipesModule
  ],
  declarations: [CollectionDetailEtbPage],
  exports: [
    CollectionDetailEtbPage
  ]
})
export class CollectionDetailEtbPageModule {}
