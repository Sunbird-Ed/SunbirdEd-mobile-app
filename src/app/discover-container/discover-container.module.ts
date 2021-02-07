import { RouterLinks } from './../app.constant';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';

import { IonicModule } from '@ionic/angular';

import { DiscoverContainerPage } from './discover-container.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/pipes/pipes.module';
import { DiscoverPage } from './discover/discover.page';
import { DiscoverSearchPage } from './discover-search/discover-search.page';
import { ComponentsModule } from '../components/components.module';
import { SearchEventsService } from './search-events-service';

const routes: Routes = [
  {
    path: '',
    component: DiscoverContainerPage,
    children: [
      {
        path: RouterLinks.DISCOVER,
        component: DiscoverPage
      },
      {
        path: RouterLinks.DISCOVER_SEARCH,
        component: DiscoverSearchPage
      },
      {
        path: '',
        redirectTo: 'discover',
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
    DiscoverContainerPage,
    DiscoverPage,
    DiscoverSearchPage
  ],
  providers: [
    SearchEventsService
  ]
})
export class DiscoverContainerPageModule {}
