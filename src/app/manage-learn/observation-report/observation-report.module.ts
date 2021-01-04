import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ObservationReportsComponent } from './observation-reports/observation-reports.component';
import { RouterModule, Routes } from '@angular/router';
const reportRoutes: Routes = [
  {
    path: '',
    component: ObservationReportsComponent,
  },
];
@NgModule({
  declarations: [ObservationReportsComponent],
  imports: [
    CommonModule,
    HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    RouterModule.forChild(reportRoutes),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class ObservationReportModule {}
