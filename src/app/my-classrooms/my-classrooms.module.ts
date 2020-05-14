import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { MyClassroomsPage } from './my-classrooms.page';
import { MyClassroomsRoutingModule } from './my-classrooms-routing.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    MyClassroomsRoutingModule,
    CommonConsumptionModule
  ],
  declarations: [
    MyClassroomsPage,
  ]
})
export class MyClassroomsPageModule { }
