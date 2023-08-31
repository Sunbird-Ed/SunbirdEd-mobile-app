import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorDetailsPage } from './mentor-details.page';

const routes: Routes = [
  {
    path: '',
    component: MentorDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorDetailsPageRoutingModule {}
