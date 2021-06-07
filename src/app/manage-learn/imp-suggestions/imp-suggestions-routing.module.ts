import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImpSuggestionsPage } from './imp-suggestions.page';

const routes: Routes = [
  {
    path: '',
    component: ImpSuggestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImpSuggestionsPageRoutingModule {}
