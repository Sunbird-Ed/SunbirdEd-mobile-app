import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservationHomeComponent } from './observation-home/observation-home.component';

const routes: Routes = [
  {
    path: "",
    component: ObservationHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObservationRoutingModule { }
