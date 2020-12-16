import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObservationRoutingModule } from './observation-routing.module';
import { ObservationHomeComponent } from './observation-home/observation-home.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ObservationHomeComponent],
  imports: [
    CommonModule,
    ObservationRoutingModule,
    SharedModule,
    HttpClientModule // remove after api integration
  ]
})
export class ObservationModule { }
