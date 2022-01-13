import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectFullReportComponent } from './project-full-report/project-full-report.component';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
const routes: Routes = [
  {
    path: '',
    component: ProjectFullReportComponent,
  },
];

@NgModule({
  declarations: [ProjectFullReportComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule, 
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
  providers: [ScreenOrientation],
})
export class ProjectFullReportModule {}
