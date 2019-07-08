import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CollectionDetailsPage } from './collection-details.page';
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '@app/directives/directives.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: CollectionDetailsPage
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
    DirectivesModule,
    ComponentsModule
  ],
  declarations: [CollectionDetailsPage]
})
export class CollectionDetailsPageModule {}
