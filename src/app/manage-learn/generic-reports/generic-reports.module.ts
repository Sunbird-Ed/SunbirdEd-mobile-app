import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AssessmentReportComponent } from '../assessment-report/assessment-report/assessment-report.component';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ReportsComponent } from './reports/reports.component';



const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
  },
];

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class GenericReportsModule {}
