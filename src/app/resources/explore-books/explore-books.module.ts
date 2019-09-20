import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExploreBooksPage } from './explore-books.page';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/app/components/components.module';
import { ExploreBooksSortComponent } from '../explore-books-sort/explore-books-sort.component';

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
  ],
  declarations: [ExploreBooksPage, ExploreBooksSortComponent],
  entryComponents: [ExploreBooksSortComponent],
})
export class ExploreBooksPageModule {}
