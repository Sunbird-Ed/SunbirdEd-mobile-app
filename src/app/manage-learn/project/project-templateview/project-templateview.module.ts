import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjectTemplateviewPageRoutingModule } from './project-templateview-routing.module';

import { ProjectTemplateviewPage } from './project-templateview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectTemplateviewPageRoutingModule
  ],
  declarations: [ProjectTemplateviewPage]
})
export class ProjectTemplateviewPageModule {}
