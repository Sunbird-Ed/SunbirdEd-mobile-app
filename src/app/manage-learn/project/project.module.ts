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
import { SyncPage } from './sync/sync.page';
import { TaskViewPage } from './task-view/task-view.page';
import { RouterLinks } from '@app/app/app.constant';

const routes: Routes = [
  {
    path: '',
    component: ProjectListingComponent
  },
  {
    path: RouterLinks.DETAILS,
    component: ProjectDetailPage
  },
  {
    path: `${RouterLinks.TASK_VIEW}/:id/:taskId`,
    component: TaskViewPage
  },
  {
    path: `${RouterLinks.LEARNING_RESOURCES}/:id/:taskId`,
    component: LearningResourcesPage
  },
  {
    path: `${RouterLinks.LEARNING_RESOURCES}/:id`,
    component: LearningResourcesPage
  },
  {
    path: `${RouterLinks.PROJECT_EDIT}/:id`,
    component: ProjectEditPage
  },
  {
    path: `${RouterLinks.PROJECT_OPERATION}/:id`,
    component: ProjectOperationPage
  }, {
    path: RouterLinks.SYNC,
    component: SyncPage
  }

];

@NgModule({
  declarations: [ProjectDetailPage, ProjectListingComponent, ProjectEditPage, ProjectOperationPage, LearningResourcesPage, SyncPage, TaskViewPage],
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
