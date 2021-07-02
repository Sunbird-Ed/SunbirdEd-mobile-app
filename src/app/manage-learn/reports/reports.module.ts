import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsListingComponent } from './reports-listing/reports-listing.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ObservationSolutionListingComponent } from './observation-solution-listing/observation-solution-listing.component';
import { RouterLinks } from '@app/app/app.constant';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ObservationSolutionEntityListingComponent } from './observation-solution-entity-listing/observation-solution-entity-listing.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsListingComponent,
  },
  {
    path: RouterLinks.OBSERVATION_SOLUTION_LISTING,
    component: ObservationSolutionListingComponent
  },
  {
    path: RouterLinks.OBSERVATION_SOLUTION_ENTITY_LISTING,
    component: ObservationSolutionEntityListingComponent
  }
];

@NgModule({
  declarations: [ReportsListingComponent, ObservationSolutionListingComponent, ObservationSolutionEntityListingComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonConsumptionModule,
    HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class ReportsModule { }
