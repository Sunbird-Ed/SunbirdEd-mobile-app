import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AastrikaHomePage } from './aastrika-home.page';

const routes: Routes = [
  {
    path: '',
    component: AastrikaHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AastrikaHomePageRoutingModule {}
