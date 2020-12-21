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

const routes: Routes = [
  {
    path: '',
    component: ProjectDetailPage
  },
  {
    path: 'listing',
    component: ProjectListingComponent
  },
  {
    path: "learning-resources/:id/:taskId",
    component: LearningResourcesPage
  },
  {
    path: "learning-resources/:id",
    component: LearningResourcesPage
  }
];

@NgModule({
  declarations: [ProjectDetailPage, ProjectListingComponent, LearningResourcesPage],
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
