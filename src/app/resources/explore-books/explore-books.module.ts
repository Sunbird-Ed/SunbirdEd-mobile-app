import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../../../app/components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ExploreBooksPage } from './explore-books.page';

const routes: Routes = [
  {
    path: '',
    component: ExploreBooksPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    ComponentsModule,
    DirectivesModule,
    CommonConsumptionModule
  ],
  declarations: [ExploreBooksPage]
})
export class ExploreBooksPageModule {}
