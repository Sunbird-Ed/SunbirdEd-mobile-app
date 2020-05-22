import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FaqReportIssuePage } from './faq-report-issue.page';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@app/directives/directives.module';

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
    RouterModule.forChild(routes)
  ],
  declarations: [FaqReportIssuePage]
})
export class FaqReportIssuePageModule {}
