import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FaqReportIssuePage } from './faq-report-issue.page';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@app/directives/directives.module';
import { CommonFormElementsModule } from 'common-form-elements-v8';
import { ComponentsModule } from '../components/components.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';

const routes: Routes = [
  {
    path: '',
    component: FaqReportIssuePage
  }
];

@NgModule({
  imports: [
    DirectivesModule,
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    ComponentsModule,
    CommonFormElementsModule,
    CommonConsumptionModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FaqReportIssuePage]
})
export class FaqReportIssuePageModule {}
