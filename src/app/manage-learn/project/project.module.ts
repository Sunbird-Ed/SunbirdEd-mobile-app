import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectDetailPage } from './project-detail/project-detail.page';
import { ProjectListingComponent } from './project-listing/project-listing.component';
import { LearningResourcesPage } from './learning-resources/learning-resources.page';
import { ProjectEditPage } from './project-edit/project-edit.page';
import { ProjectOperationPage } from './project-operation/project-operation.page';
const routes: Routes = [
  {
    path: 'details',
    component: ProjectDetailPage
  },
  {
    path: '',
    component: ProjectListingComponent
  },
  {
    path: "learning-resources/:id/:taskId",
    component: LearningResourcesPage
  },
  {
    path: "learning-resources/:id",
    component: LearningResourcesPage
  },
  {
    path: "project-edit/:id",
    component: ProjectEditPage
  },
  {
    path: 'project-operation/:id',
    component: ProjectOperationPage
  }

];

@NgModule({
  declarations: [ProjectDetailPage, ProjectListingComponent, ProjectEditPage, ProjectOperationPage, LearningResourcesPage],
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
