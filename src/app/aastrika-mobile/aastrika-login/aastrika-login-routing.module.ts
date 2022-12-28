import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AastrikaLoginPage } from './aastrika-login.page';

const routes: Routes = [
  {
    path: '',
    component: AastrikaLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AastrikaLoginPageRoutingModule {}
