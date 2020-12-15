import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectDetailPage } from './project-detail/project-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectDetailPage
  }
];

@NgModule({
  declarations: [ProjectDetailPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    SharedModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
  ]
})
export class ProjectModule { }
