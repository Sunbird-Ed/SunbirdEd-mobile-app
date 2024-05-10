import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjectTemplateviewPageRoutingModule } from './project-templateview-routing.module';

import { ProjectTemplateviewPage } from './project-templateview.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectTemplateviewPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [ProjectTemplateviewPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class ProjectTemplateviewPageModule {}
