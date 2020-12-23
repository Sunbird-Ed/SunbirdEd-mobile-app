import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { SectionListingComponent } from '../shared/components/section-listing/section-listing.component';
import { ObservationDetailComponent } from './observation-detail/observation-detail.component';
import { ObservationHomeComponent } from './observation-home/observation-home.component';
import { ObservationSubmissionComponent } from './observation-submission/observation-submission.component';

const routes: Routes = [
  {
    path: '',
    component: ObservationHomeComponent,
  },
  {
    path: RouterLinks.OBSERVATION_DETAILS,
    component: ObservationDetailComponent,
  },
  {
    path: RouterLinks.OBSERVATION_SUBMISSION,
    component: ObservationSubmissionComponent,
  },
  {
    path: RouterLinks.SECTION_LISTING,
    component: SectionListingComponent,
  },
  {
    path: RouterLinks.ECM_LISTING,
    component: SectionListingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObservationRoutingModule { }
