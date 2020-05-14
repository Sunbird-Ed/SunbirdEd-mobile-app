import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ClassDetailsPage } from './class-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../../components/components.module';
import { OverflowMenuComponent } from '../../profile/overflow-menu/overflow-menu.component';

const routes: Routes = [
  {
    path: '',
    component: ClassDetailsPage
  }
];

@NgModule({
  declarations: [ClassDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    CommonConsumptionModule,
    ComponentsModule
  ],
  exports: [ClassDetailsPage],
  entryComponents: [OverflowMenuComponent]
})
export class ClassDetailsPageModule {}
