import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../app/components/components.module';
import { DirectivesModule } from '../../../directives/directives.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { RelevantContentsPage } from './relevant-contents.page';

const routes: Routes = [
  {
    path: '',
    component: RelevantContentsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    ComponentsModule,
    DirectivesModule,
    CommonConsumptionModule
  ],
  declarations: [RelevantContentsPage]
})
export class RelevantContentsPageModule {}
