import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingPopupPage } from './booking-popup.page';

const routes: Routes = [
  {
    path: '',
    component: BookingPopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingPopupPageRoutingModule {}
