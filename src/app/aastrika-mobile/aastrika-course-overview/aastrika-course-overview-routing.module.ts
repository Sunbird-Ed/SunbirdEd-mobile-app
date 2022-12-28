import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AastrikaCourseOverviewPage } from './aastrika-course-overview.page';

const routes: Routes = [
  {
    path: '',
    component: AastrikaCourseOverviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AastrikaCourseOverviewPageRoutingModule {}
