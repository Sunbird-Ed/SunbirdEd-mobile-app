import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MentorDetailsPageRoutingModule } from './mentor-details-routing.module';

import { MentorDetailsPage } from './mentor-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MentorDetailsPageRoutingModule
  ],
  declarations: [MentorDetailsPage]
})
export class MentorDetailsPageModule {}
