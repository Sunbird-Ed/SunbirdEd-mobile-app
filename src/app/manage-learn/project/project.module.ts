import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectDetailPage } from './project-detail/project-detail.page';
import { ProjectListingComponent } from '../project/project-listing/project-listing.component';
import { LearningResourcesPage } from './learning-resources/learning-resources.page';
import { ProjectEditPage } from './project-edit/project-edit.page';
import { ProjectOperationPage } from './project-operation/project-operation.page';
import { SyncPage } from './sync/sync.page';
import { TaskViewPage } from './task-view/task-view.page';
import { RouterLinks } from '@app/app/app.constant';
import { LinkLearningResourcesComponent } from './link-learning-resources/link-learning-resources.component';
import { AddEntityComponent } from './add-entity/add-entity.component';
import { AddProgramsComponent } from './add-programs/add-programs.component';
import { CreateProjectPage } from './create-project/create-project.page';
import { CategorySelectComponent } from './category-select/category-select.component';
import { AttachmentListPage } from './attachment-list/attachment-list.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';
import { PipesModule } from '@app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectListingComponent
  },
  {
    path: `${RouterLinks.DETAILS}`,
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
  },
  {
    path: `${RouterLinks.CREATE_PROJECT}`,
    component: CreateProjectPage
  }, {
    path: RouterLinks.SYNC,
    component: SyncPage
  },
  {
    path: `${RouterLinks.ATTACHMENTS}/:id`,
    component: AttachmentListPage
  }
];

@NgModule({
  declarations: [ProjectDetailPage, ProjectListingComponent, ProjectEditPage, 
    ProjectOperationPage, LearningResourcesPage, SyncPage, TaskViewPage, AttachmentListPage, 
    LinkLearningResourcesComponent, AddEntityComponent, AddProgramsComponent, CreateProjectPage, 
    CategorySelectComponent],
  entryComponents: [LinkLearningResourcesComponent, AddEntityComponent, 
    AddProgramsComponent, CategorySelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CoreModule,
    SharedModule,
    TranslateModule.forChild(), 
    RouterModule.forChild(routes),
    CommonConsumptionModule,
    PipesModule
  ]
})
export class ProjectModule { }
