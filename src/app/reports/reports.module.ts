import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportsPage } from './reports.page';
import { ReportsRoutingModule } from './reports-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { UserReportComponent } from './user-report/user-report.component';
import { ReportListComponent } from './report-list/report-list.component';
import { GroupReportListComponent } from './group-report-list/group-report-list.component';
import { ReportAlertComponent } from './report-alert/report-alert.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReportsRoutingModule
  ],
  declarations: [
    ReportsPage,
    UserReportComponent,
    ReportListComponent,
    GroupReportListComponent,
  ]
})
export class ReportsPageModule {}
