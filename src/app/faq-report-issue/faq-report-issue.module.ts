import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FaqReportIssuePage } from './faq-report-issue.page';

const routes: Routes = [
  {
    path: '',
    component: FaqReportIssuePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FaqReportIssuePage]
})
export class FaqReportIssuePageModule {}
