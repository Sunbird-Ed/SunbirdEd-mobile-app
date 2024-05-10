import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectReportComponent } from './project-report/project-report.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
const routes: Routes = [
  {
    path: '',
    component: ProjectReportComponent,
  },
];
@NgModule({
  declarations: [ProjectReportComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class ProjectReportModule {}
