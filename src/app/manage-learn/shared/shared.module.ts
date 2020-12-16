import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { UtilsService } from '../core/services/utils.service';
import { CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonListCardComponent } from './components';
import { ProjectListCardComponent } from './components/project-list-card/project-list-card.component';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';

@NgModule({
  
  declarations: [CamelToTitlePipe, CommonListCardComponent, ProjectListCardComponent, ProjectHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CamelToTitlePipe, CommonListCardComponent, ProjectListCardComponent, ProjectHeaderComponent ]
})
export class SharedModule { }
