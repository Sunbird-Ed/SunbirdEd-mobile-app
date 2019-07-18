import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { GroupReportAlertComponent } from './group-report-alert/group-report-alert.component';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ReportsRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ReportsPage,
    UserReportComponent,
    ReportListComponent,
    GroupReportListComponent,
    GroupReportAlertComponent
  ],
  entryComponents: [
    GroupReportAlertComponent
  ],
  exports: [
    GroupReportAlertComponent
  ],
  providers: [
    DatePipe
  ]
})
export class ReportsPageModule {}
