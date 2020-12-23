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
import { SyncPage } from './sync/sync.page';
import { TaskViewPage } from './task-view/task-view.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectListingComponent
  },
  {
    path: 'listing',
    component: ProjectListingComponent
  },
  {
    path: 'details',
    component: ProjectDetailPage
  },
  {
    path: "task-view/:id/:taskId",
    component: TaskViewPage
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
    path: "sync",
    component: SyncPage
  }
];

@NgModule({
  declarations: [ProjectDetailPage, ProjectListingComponent, LearningResourcesPage, SyncPage, TaskViewPage],
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
