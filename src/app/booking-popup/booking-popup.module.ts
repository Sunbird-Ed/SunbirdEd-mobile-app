import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingPopupPageRoutingModule } from './booking-popup-routing.module';

import { BookingPopupPage } from './booking-popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingPopupPageRoutingModule
  ],
  declarations: [BookingPopupPage]
})
export class BookingPopupPageModule {}
