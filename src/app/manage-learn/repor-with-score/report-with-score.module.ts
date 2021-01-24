import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReportWithScoreComponent } from './report-with-score/report-with-score.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

const reportRoutes: Routes = [
  {
    path: '',
    component: ReportWithScoreComponent,
  },
];

@NgModule({
  declarations: [ReportWithScoreComponent],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    RouterModule.forChild(reportRoutes),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class ReportWithScoreModule {}
