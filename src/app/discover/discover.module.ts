import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';

import { IonicModule } from '@ionic/angular';

import { DiscoverPage } from './discover.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { DiscoverOnePage } from './discover-one/discover-one.page';
import { SearchResultsPage } from './search-results/search-results.page';
import { ComponentsModule } from '../components/components.module';
import { SearchEventsService } from './search-events-service';

const routes: Routes = [
  {
    path: '',
    component: DiscoverPage,
    children: [
      {
        path: 'discover-one',
        component: DiscoverOnePage
      },
      {
        path: 'search-results',
        component: SearchResultsPage
      },
      {
        path: '',
        redirectTo: 'discover-one',
        pathMatch: 'full'
      }
    ],
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonConsumptionModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    ComponentsModule
  ],
  declarations: [
    DiscoverPage,
    DiscoverOnePage,
    SearchResultsPage
  ],
  providers: [
    SearchEventsService
  ]
})
export class DiscoverPageModule {}
