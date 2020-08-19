import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { MyGroupsPage } from './my-groups.page';
import { MyGroupsRoutingModule } from './my-groups-routing.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    MyGroupsRoutingModule,
    CommonConsumptionModule,
    ComponentsModule
  ],
  declarations: [
    MyGroupsPage,
  ]
})
export class MyGroupsPageModule { }
