import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyReportComponent } from './survey-report/survey-report.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
const surveyRoutes: Routes = [
  {
    path: '',
    component: SurveyReportComponent,
  },
];
@NgModule({
  declarations: [SurveyReportComponent],

  imports: [
    CommonModule,
    HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    RouterModule.forChild(surveyRoutes),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class SurveyReportModule {}
