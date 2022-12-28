import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AastrikaSignupPage } from './aastrika-signup.page';

const routes: Routes = [
  {
    path: '',
    component: AastrikaSignupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AastrikaSignupPageRoutingModule {}
